// Gemini 2.5 Flash with Google Search grounding. Single helper that handles
// the call, retries once on 429, and pulls grounded source URLs back into
// each result row.
//
// Note: Gemini's structured-output mode (responseSchema) is incompatible with
// the google_search tool. To get grounded data with a stable shape we ask for
// JSON in the prompt, then parse + validate client-side.

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const stripFence = (text) => {
  if (!text) return '';
  let t = String(text).trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  }
  return t.trim();
};

const tryParseJson = (text) => {
  const t = stripFence(text);
  try { return JSON.parse(t); } catch {}
  // Last-ditch: pull the largest {...} or [...] substring.
  const m = t.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
};

const callGemini = async ({ key, prompt, temperature = 0.2 }) => {
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    tools: [{ google_search: {} }],
    generationConfig: { temperature, maxOutputTokens: 4096 },
  };
  const url = GEMINI_URL + '?key=' + encodeURIComponent(key);

  const doFetch = async () => fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let res = await doFetch();
  if (res.status === 429) {
    await sleep(1500);
    res = await doFetch();
  }
  if (!res.ok) {
    const errTxt = await res.text().catch(() => '');
    throw new Error(`Gemini ${res.status}: ${errTxt.slice(0, 200)}`);
  }
  const json = await res.json();
  const cand = json.candidates?.[0];
  const text = cand?.content?.parts?.map(p => p.text).filter(Boolean).join('\n') || '';
  const groundingChunks = cand?.groundingMetadata?.groundingChunks || [];
  const sources = groundingChunks
    .map(c => c.web?.uri)
    .filter(Boolean);
  return { text, sources };
};

const SUBJECT_PROMPT = (address) => `You are a real-estate research assistant. Look up factual details about the property at:

  ${address}

Use Google Search to find authoritative county assessor / Zillow / Redfin / Realtor.com data. Then return ONLY a JSON object (no prose, no markdown fences) with these exact fields:

{
  "address": string,         // street only, no city/state
  "city": string,            // "City, ST ZIP"
  "beds": number,
  "baths": number,
  "sqft": number,            // gross living area
  "lot": number,             // lot sqft
  "yearBuilt": number,
  "parcel": string,          // legal description if available, else ""
  "apn": string,             // parcel/APN, else ""
  "hoaFee": string,          // dollar amount or "Unknown"
  "hoaFreq": string,         // "Monthly"|"Annual"|"None"|"Unknown"
  "zoning": string,          // e.g. "R-3" or "Unknown"
  "lat": number,
  "lng": number
}

If a field is unknown, use "Unknown" for strings and a best-estimate number for numerics. Return only the JSON object.`;

const COMPS_PROMPT = (subject, radiusMi, monthsBack) => `You are a real-estate comp researcher. The subject property is:

  ${subject.address}, ${subject.city}
  ${subject.beds}bd/${subject.baths}ba, ${subject.sqft} sqft, built ${subject.yearBuilt}
  Coordinates: ${subject.lat}, ${subject.lng}

Use Google Search to find 6-10 RECENTLY SOLD comparable single-family homes within ${radiusMi} miles, sold in the last ${monthsBack} months. Prefer Redfin / Zillow / Realtor.com listings with confirmed sale prices. Filter to comps with similar bed count and within ~30% of the subject's sqft.

Return ONLY a JSON array (no prose, no markdown fences) where each element is:

{
  "id": string,              // unique slug, e.g. "c1"
  "address": string,
  "city": string,            // "City, ST"
  "distance": number,        // miles from subject (1 decimal)
  "beds": number,
  "baths": number,
  "sqft": number,
  "lot": number,
  "yearBuilt": number,
  "price": number,           // sold price USD
  "ppsf": number,            // price / sqft, rounded
  "soldDate": string,        // YYYY-MM-DD
  "dom": number,             // days on market, best estimate
  "status": string,          // "Sold"|"Active"
  "saleType": string,        // "MLS"|"Cash"|"Other"
  "source": string,          // domain only, e.g. "Redfin"
  "reno": string,            // "as-is"|"light"|"medium"|"renovated" - your judgment from photos/desc
  "scores": {
    "curb": number, "exterior": number, "interior": number, "kitchen": number, "bath": number
  },                         // 0-100 each, your best estimate from listing photos / descriptions
  "lat": number,
  "lng": number,
  "note": string,            // 1 short sentence on why this is a comp
  "selected": boolean,        // true for top 3 most similar
  "url": string              // listing URL
}

Return ONLY the JSON array.`;

const RENT_PROMPT = (subject, radiusMi) => `Find 4-6 active rental listings within ${radiusMi} miles of:

  ${subject.address}, ${subject.city}
  ${subject.beds}bd/${subject.baths}ba, ${subject.sqft} sqft

Use Zillow Rentals / Realtor.com / Apartments.com / local MLS. Match bed count and approximate sqft.

Return ONLY a JSON array (no prose, no fences):

[
  {
    "id": string,            // "r1", "r2", ...
    "address": string,
    "rent": number,          // monthly USD
    "beds": number,
    "baths": number,
    "sqft": number,
    "distance": number,      // miles, 1 decimal
    "source": string,        // "Zillow"|"Realtor"|"MLS"|...
    "url": string
  }
]`;

const REPAIRS_PROMPT = (subject, scopeNotes) => `Estimate a realistic renovation scope and line-item costs for:

  ${subject.address}, ${subject.city}
  ${subject.beds}bd/${subject.baths}ba, ${subject.sqft} sqft, built ${subject.yearBuilt}
  Condition / scope notes: ${scopeNotes || 'as-is, full cosmetic + age-appropriate mechanical refresh'}

Use Google Search for CURRENT, LOCAL costs. Pull from HomeAdvisor true-cost guides, Angi, Bob Vila, RSMeans, and local contractor pages for the property's ZIP code. Build a realistic scope based on the home's age and assumed condition. Include a roof line item if age > 25, HVAC if age > 20, kitchen + bath refresh, flooring, paint, and any others you judge necessary.

Return ONLY a JSON array (no prose, no fences):

[
  {
    "id": string,            // "rp1", "rp2", ...
    "label": string,         // e.g. "Asphalt shingle reroof"
    "qty": number,
    "unit": string,          // "sqft"|"lf"|"ea"|"set"
    "unitCost": number,      // USD per unit
    "total": number,         // qty * unitCost, rounded
    "category": string,      // "Exterior"|"Interior"|"Structural"|"Mechanical"|"Kitchen"|"Bathroom"|"Other"
    "source": string,        // citation domain, e.g. "HomeAdvisor"
    "note": string           // one-sentence scope detail
  }
]`;

const ensureArray = (v) => Array.isArray(v) ? v : [];

window.fetchSubjectAI = async (address, opts = {}) => {
  const { geminiKey } = window.BBB_CONFIG.get();
  if (!geminiKey) throw new Error('No Gemini key');
  const cacheKey = `subject:${window.normalizeAddress(address)}`;
  const cached = opts.force ? null : window.getCached(cacheKey);
  if (cached) return cached;

  const { text, sources } = await callGemini({ key: geminiKey, prompt: SUBJECT_PROMPT(address) });
  const parsed = tryParseJson(text);
  if (!parsed) throw new Error('Could not parse subject JSON');
  const out = {
    id: 'subject',
    address: parsed.address || address,
    city: parsed.city || '',
    beds: +parsed.beds || 0,
    baths: +parsed.baths || 0,
    sqft: +parsed.sqft || 0,
    lot: +parsed.lot || 0,
    yearBuilt: +parsed.yearBuilt || 0,
    parcel: parsed.parcel || '',
    apn: parsed.apn || '',
    hoaFee: parsed.hoaFee || 'Unknown',
    hoaFreq: parsed.hoaFreq || 'Unknown',
    zoning: parsed.zoning || 'Unknown',
    reno: 'as-is',
    lat: +parsed.lat || 0,
    lng: +parsed.lng || 0,
    photos: ['kitchen', 'living', 'exterior', 'bath'],
    sources,
  };
  window.setCached(cacheKey, out);
  return out;
};

window.fetchCompsAI = async (subject, radiusMi = 2, monthsBack = 12, opts = {}) => {
  const { geminiKey } = window.BBB_CONFIG.get();
  if (!geminiKey) throw new Error('No Gemini key');
  const cacheKey = `comps:${window.normalizeAddress(subject.address + '|' + subject.city)}:${radiusMi}:${monthsBack}`;
  const cached = opts.force ? null : window.getCached(cacheKey, 15 * 60 * 1000);
  if (cached) return cached;

  const { text, sources } = await callGemini({ key: geminiKey, prompt: COMPS_PROMPT(subject, radiusMi, monthsBack) });
  const parsed = tryParseJson(text);
  const arr = ensureArray(parsed).map((c, i) => ({
    id: c.id || ('c' + (i + 1)),
    address: c.address || '',
    city: c.city || '',
    distance: +c.distance || 0,
    beds: +c.beds || 0,
    baths: +c.baths || 0,
    sqft: +c.sqft || 0,
    lot: +c.lot || 0,
    yearBuilt: +c.yearBuilt || 0,
    price: +c.price || 0,
    ppsf: +c.ppsf || (c.price && c.sqft ? Math.round(c.price / c.sqft) : 0),
    soldDate: c.soldDate || '',
    dom: +c.dom || 0,
    status: c.status || 'Sold',
    saleType: c.saleType || 'MLS',
    source: c.source || (sources[0] ? new URL(sources[0]).hostname.replace('www.', '') : 'Web'),
    reno: ['as-is','light','medium','renovated'].includes(c.reno) ? c.reno : 'as-is',
    scores: {
      curb: +c.scores?.curb || 60,
      exterior: +c.scores?.exterior || 60,
      interior: +c.scores?.interior || 60,
      kitchen: +c.scores?.kitchen || 60,
      bath: +c.scores?.bath || 60,
    },
    lat: +c.lat || subject.lat,
    lng: +c.lng || subject.lng,
    note: c.note || '',
    selected: !!c.selected || i < 3,
    url: c.url || '',
  })).filter(c => c.price > 0);
  window.setCached(cacheKey, arr);
  return arr;
};

window.fetchRentCompsAI = async (subject, radiusMi = 2, opts = {}) => {
  const { geminiKey } = window.BBB_CONFIG.get();
  if (!geminiKey) throw new Error('No Gemini key');
  const cacheKey = `rent:${window.normalizeAddress(subject.address + '|' + subject.city)}:${radiusMi}`;
  const cached = opts.force ? null : window.getCached(cacheKey, 15 * 60 * 1000);
  if (cached) return cached;

  const { text, sources } = await callGemini({ key: geminiKey, prompt: RENT_PROMPT(subject, radiusMi) });
  const parsed = tryParseJson(text);
  const arr = ensureArray(parsed).map((r, i) => ({
    id: r.id || ('r' + (i + 1)),
    address: r.address || '',
    rent: +r.rent || 0,
    beds: +r.beds || 0,
    baths: +r.baths || 0,
    sqft: +r.sqft || 0,
    distance: +r.distance || 0,
    source: r.source || (sources[0] ? new URL(sources[0]).hostname.replace('www.', '') : 'Web'),
    url: r.url || '',
  })).filter(r => r.rent > 0);
  window.setCached(cacheKey, arr);
  return arr;
};

window.fetchRepairsAI = async (subject, scopeNotes = '', opts = {}) => {
  const { geminiKey } = window.BBB_CONFIG.get();
  if (!geminiKey) throw new Error('No Gemini key');
  const cacheKey = `repairs:${window.normalizeAddress(subject.address + '|' + subject.city)}`;
  const cached = opts.force ? null : window.getCached(cacheKey, 60 * 60 * 1000);
  if (cached) return cached;

  const { text, sources } = await callGemini({ key: geminiKey, prompt: REPAIRS_PROMPT(subject, scopeNotes), temperature: 0.3 });
  const parsed = tryParseJson(text);
  const arr = ensureArray(parsed).map((r, i) => {
    const qty = +r.qty || 1;
    const unitCost = +r.unitCost || 0;
    const total = +r.total || Math.round(qty * unitCost);
    return {
      id: r.id || ('rp' + (i + 1)),
      label: r.label || 'Line item',
      qty, unit: r.unit || 'ea',
      unitCost, total,
      category: r.category || 'Other',
      source: r.source || (sources[0] ? new URL(sources[0]).hostname.replace('www.', '') : 'AI estimate'),
      note: r.note || '',
    };
  }).filter(r => r.total > 0);
  window.setCached(cacheKey, arr);
  return arr;
};
