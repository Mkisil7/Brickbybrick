// Data layer. window.SUBJECT/COMPS/RENT_COMPS/REPAIRS are the contract every
// component reads from. On load we seed with mock Tallahassee data so the app
// renders something on first run, then if a real address + Gemini key are
// configured we replace the globals with live data and fire a bbb:datachanged
// event for components to re-render.

// --- Mock seed (preserves the original first-run UX) ---

const MOCK_SUBJECT = {
  id: 'subject',
  address: '1247 Lakewood Dr',
  city: 'Tallahassee, FL 32311',
  beds: 3,
  baths: 2,
  sqft: 1580,
  lot: 8276,
  yearBuilt: 1978,
  parcel: 'LAKEWOOD UNIT 2 S 40 FT OF LOT 4 & N 25 FT OF LOT 5 BLOCK C',
  apn: '11-30-20-201-0040',
  hoaFee: 'Unknown',
  hoaFreq: 'Unknown',
  zoning: 'R-3',
  reno: 'as-is',
  lat: 30.4383, lng: -84.2807,
  photos: ['kitchen', 'living', 'exterior', 'bath'],
};

const MOCK_COMPS = [
  { id: 'c1', address: '3212 Jim Lee Rd', city: 'Tallahassee, FL', distance: 0.69, beds: 3, baths: 2, sqft: 1617, lot: 8276, yearBuilt: 1976, price: 255000, ppsf: 158, soldDate: '2025-09-12', dom: 14, status: 'Sold', saleType: 'MLS', source: 'MLS', reno: 'renovated', scores: { curb: 82, exterior: 85, interior: 88, kitchen: 90, bath: 84 }, lat: 30.443, lng: -84.275, note: 'Updated kitchen, new flooring, similar lot.', selected: true },
  { id: 'c2', address: '421 E Jennings St', city: 'Tallahassee, FL', distance: 1.12, beds: 2, baths: 2, sqft: 1402, lot: 6900, yearBuilt: 1981, price: 215000, ppsf: 153, soldDate: '2025-08-30', dom: 21, status: 'Sold', saleType: 'Cash', source: 'Public', reno: 'light', scores: { curb: 64, exterior: 60, interior: 70, kitchen: 65, bath: 68 }, lat: 30.430, lng: -84.290, selected: true },
  { id: 'c3', address: '522 Terrace St', city: 'Tallahassee, FL', distance: 0.91, beds: 4, baths: 2, sqft: 1782, lot: 5663, yearBuilt: 1971, price: 200000, ppsf: 112, soldDate: '2025-07-22', dom: 47, status: 'Sold', saleType: 'Cash', source: 'Public', reno: 'as-is', scores: { curb: 48, exterior: 52, interior: 45, kitchen: 38, bath: 50 }, lat: 30.448, lng: -84.292, selected: false },
  { id: 'c4', address: '2243 S Meridian', city: 'Tallahassee, FL', distance: 2.17, beds: 4, baths: 2, sqft: 1820, lot: 9100, yearBuilt: 2008, price: 312000, ppsf: 171, soldDate: '2025-10-04', dom: 9, status: 'Sold', saleType: 'MLS', source: 'MLS', reno: 'renovated', scores: { curb: 88, exterior: 90, interior: 92, kitchen: 95, bath: 90 }, lat: 30.420, lng: -84.301, selected: false },
  { id: 'c5', address: '1108 Atkamire Dr', city: 'Tallahassee, FL', distance: 0.42, beds: 3, baths: 2, sqft: 1540, lot: 8400, yearBuilt: 1980, price: 232500, ppsf: 151, soldDate: '2025-06-18', dom: 28, status: 'Sold', saleType: 'MLS', source: 'MLS', reno: 'light', scores: { curb: 70, exterior: 72, interior: 65, kitchen: 60, bath: 70 }, lat: 30.441, lng: -84.283, selected: true },
  { id: 'c6', address: '847 Camellia Ln', city: 'Tallahassee, FL', distance: 1.45, beds: 3, baths: 1.5, sqft: 1488, lot: 7200, yearBuilt: 1969, price: 178000, ppsf: 120, soldDate: '2025-05-02', dom: 62, status: 'Sold', saleType: 'Cash', source: 'County', reno: 'as-is', scores: { curb: 42, exterior: 38, interior: 50, kitchen: 30, bath: 45 }, lat: 30.451, lng: -84.270, selected: false },
  { id: 'c7', address: '655 Brookwood Cir', city: 'Tallahassee, FL', distance: 0.78, beds: 3, baths: 2, sqft: 1602, lot: 8800, yearBuilt: 1977, price: 248000, ppsf: 155, soldDate: '2025-09-29', dom: 18, status: 'Active', saleType: 'MLS', source: 'MLS', reno: 'light', scores: { curb: 72, exterior: 70, interior: 68, kitchen: 65, bath: 70 }, lat: 30.435, lng: -84.276, selected: false },
  { id: 'c8', address: '309 Magnolia Trce', city: 'Tallahassee, FL', distance: 1.83, beds: 3, baths: 2, sqft: 1655, lot: 7500, yearBuilt: 1985, price: 268000, ppsf: 162, soldDate: '2025-08-11', dom: 11, status: 'Sold', saleType: 'MLS', source: 'MLS', reno: 'medium', scores: { curb: 78, exterior: 80, interior: 76, kitchen: 78, bath: 75 }, lat: 30.448, lng: -84.260, selected: false },
];

const MOCK_RENT_COMPS = [
  { id: 'r1', address: '3210 Jim Lee Rd', rent: 1850, beds: 3, baths: 2, sqft: 1600, distance: 0.71, source: 'MLS' },
  { id: 'r2', address: '218 Mabry St',    rent: 1725, beds: 3, baths: 2, sqft: 1520, distance: 1.04, source: 'Public' },
  { id: 'r3', address: '904 Tanglewood',  rent: 1995, beds: 4, baths: 2, sqft: 1740, distance: 1.62, source: 'MLS' },
  { id: 'r4', address: '1145 Lakewood',   rent: 1800, beds: 3, baths: 2, sqft: 1580, distance: 0.10, source: 'County' },
];

const MOCK_REPAIRS = [
  { id: 'rp1', label: 'Tree removal',                qty: 1,   unit: 'ea',  unitCost: 1100,  total: 1100,  category: 'Exterior',  source: 'HomeAdvisor + local',  note: 'Removal of one medium tree (up to 60 ft) including disposal in Tallahassee.' },
  { id: 'rp2', label: 'Driveway replacement',        qty: 540, unit: 'sqft',unitCost: 12.96, total: 7000,  category: 'Exterior',  source: 'AngiList + supplier',  note: '540 sqft concrete driveway tear-out and replacement.' },
  { id: 'rp3', label: 'Interior painting',           qty: 1580,unit: 'sqft',unitCost: 2.20,  total: 3476,  category: 'Interior',  source: 'Sherwin-Williams labor avg',note: 'Two coats, walls + ceilings, prep included.' },
  { id: 'rp4', label: 'Vinyl plank flooring',        qty: 1100,unit: 'sqft',unitCost: 9.03,  total: 9930,  category: 'Interior',  source: 'Home Depot Pro',       note: '7mm LVP installed, includes underlayment.' },
  { id: 'rp5', label: 'Subfloor replacement',        qty: 420, unit: 'sqft',unitCost: 30.72, total: 12902, category: 'Structural',source: 'Local contractor avg', note: '3/4" plywood, partial subfloor where moisture damage detected.' },
  { id: 'rp6', label: 'Kitchen cabinet refresh',     qty: 1,   unit: 'set', unitCost: 4200,  total: 4200,  category: 'Kitchen',   source: 'IKEA + install',       note: 'Reface uppers, replace lowers, new hardware.' },
  { id: 'rp7', label: 'Bathroom vanity & fixtures',  qty: 2,   unit: 'ea',  unitCost: 950,   total: 1900,  category: 'Bathroom',  source: 'Lowe’s + plumber',   note: 'Two 30" vanities with chrome fixtures.' },
];

// Initial seed so the page renders something before any async loads complete.
window.SUBJECT = MOCK_SUBJECT;
window.COMPS = MOCK_COMPS;
window.RENT_COMPS = MOCK_RENT_COMPS;
window.REPAIRS = MOCK_REPAIRS;
window.DATA_STATUS = {
  loading: false,
  source: 'mock',
  error: null,
  phase: 'idle',
  lastUpdated: null,
  nextRefreshAt: null,
  refreshMs: 15 * 60 * 1000,
};

// --- formatters (used everywhere) ---
window.fmtMoney = (n, opts = {}) => {
  if (n == null || isNaN(n)) return '—';
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(Math.round(n));
  return sign + '$' + abs.toLocaleString('en-US');
};
window.fmtMoneyDecimal = (n) => {
  if (n == null || isNaN(n)) return '—';
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
window.fmtNum = (n) => (n == null || isNaN(n)) ? '—' : Math.round(n).toLocaleString('en-US');

// --- live load orchestration ---

const announceData = () => {
  window.dispatchEvent(new CustomEvent('bbb:datachanged', {
    detail: { status: window.DATA_STATUS },
  }));
};

const setStatus = (patch) => {
  window.DATA_STATUS = { ...window.DATA_STATUS, ...patch };
  announceData();
};

window.loadRealData = async (opts = {}) => {
  const cfg = window.BBB_CONFIG?.get?.() || {};
  const address = (cfg.address || '').trim();
  if (!address) {
    setStatus({ loading: false, source: 'mock', error: null, phase: 'idle', nextRefreshAt: null });
    return;
  }

  const refreshMs = opts.refreshMs || window.DATA_STATUS.refreshMs || (15 * 60 * 1000);
  setStatus({ loading: true, source: 'live', error: null, phase: 'subject', refreshMs });

  // Subject: required for everything else.
  let subject;
  try {
    subject = await window.fetchSubjectAI(address, opts);
    if (!subject?.lat || !subject?.lng) throw new Error('Subject missing coordinates');
    window.SUBJECT = subject;
    announceData();
  } catch (err) {
    console.warn('[bbb] subject fetch failed:', err);
    setStatus({ loading: false, source: 'mock', error: String(err.message || err), phase: 'error' });
    return;
  }

  // Comps + rent + repairs in parallel. Each falls back independently.
  setStatus({ phase: 'market' });
  const [compsRes, rentRes, repairsRes] = await Promise.allSettled([
    window.fetchCompsAI(subject, 2, 12, opts),
    window.fetchRentCompsAI(subject, 2, opts),
    window.fetchRepairsAI(subject, '', opts),
  ]);

  if (compsRes.status === 'fulfilled' && compsRes.value.length > 0) {
    window.COMPS = compsRes.value;
  } else {
    console.warn('[bbb] comps fallback to mock:', compsRes.reason);
  }

  if (rentRes.status === 'fulfilled' && rentRes.value.length > 0) {
    window.RENT_COMPS = rentRes.value;
  } else {
    console.warn('[bbb] rent comps fallback to mock:', rentRes.reason);
  }

  if (repairsRes.status === 'fulfilled' && repairsRes.value.length > 0) {
    window.REPAIRS = repairsRes.value;
  } else {
    console.warn('[bbb] repairs fallback to RSMeans rate sheet:', repairsRes.reason);
    if (window.buildFallbackRepairs) {
      window.REPAIRS = window.buildFallbackRepairs(subject);
    }
  }

  setStatus({
    loading: false,
    source: 'live',
    error: null,
    phase: 'ready',
    lastUpdated: Date.now(),
    nextRefreshAt: Date.now() + refreshMs,
  });
};

window.refreshMarketData = (opts = {}) => window.loadRealData({ ...opts, force: true });

window.startMarketUpdates = (refreshMs = 15 * 60 * 1000) => {
  if (window.__bbbMarketTimer) clearInterval(window.__bbbMarketTimer);
  window.DATA_STATUS = { ...window.DATA_STATUS, refreshMs };
  window.__bbbMarketTimer = setInterval(() => {
    const cfg = window.BBB_CONFIG?.get?.() || {};
    if (document.visibilityState === 'visible' && cfg.address && cfg.geminiKey) {
      window.refreshMarketData({ refreshMs });
    }
  }, refreshMs);
  setStatus({ refreshMs, nextRefreshAt: Date.now() + refreshMs });
};

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  const status = window.DATA_STATUS || {};
  const cfg = window.BBB_CONFIG?.get?.() || {};
  if (cfg.address && cfg.geminiKey && status.nextRefreshAt && Date.now() > status.nextRefreshAt) {
    window.refreshMarketData({ refreshMs: status.refreshMs });
  }
});

// Re-load when settings change. (App.jsx triggers the initial auto-load on
// mount so it runs after React + listeners are ready.)
window.addEventListener('bbb:configchanged', () => {
  window.refreshMarketData();
});
