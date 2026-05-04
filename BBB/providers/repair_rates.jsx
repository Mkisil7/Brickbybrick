// Built-in fallback rate sheet. RSMeans / HomeAdvisor / Angi national averages
// (mid-2024 figures, adjust as the market drifts). Used when no Gemini key is
// configured or when grounded calls fail.

const RATES = [
  { id: 'paint_int',   label: 'Interior painting',         unit: 'sqft', rate: 2.20,  category: 'Interior',  note: 'Two coats walls + ceilings, prep included.' },
  { id: 'paint_ext',   label: 'Exterior painting',         unit: 'sqft', rate: 3.10,  category: 'Exterior',  note: 'Power wash, primer, two coats.' },
  { id: 'lvp',         label: 'Vinyl plank flooring',      unit: 'sqft', rate: 9.00,  category: 'Interior',  note: '7mm LVP installed with underlayment.' },
  { id: 'carpet',      label: 'Carpet replacement',        unit: 'sqft', rate: 5.50,  category: 'Interior',  note: 'Mid-grade carpet + pad, installed.' },
  { id: 'subfloor',    label: 'Subfloor replacement',      unit: 'sqft', rate: 30.00, category: 'Structural',note: '3/4" plywood, partial replacement.' },
  { id: 'reroof',      label: 'Asphalt shingle reroof',    unit: 'sqft', rate: 5.50,  category: 'Exterior',  note: 'Tear-off + 30yr architectural shingles.' },
  { id: 'hvac',        label: 'HVAC replacement (3-ton)',  unit: 'ea',   rate: 7800,  category: 'Mechanical',note: 'Heat pump split system, installed.' },
  { id: 'water_heater',label: 'Water heater replacement',  unit: 'ea',   rate: 1650,  category: 'Mechanical',note: '50-gal electric, installed.' },
  { id: 'kitchen_mid', label: 'Kitchen remodel (midrange)',unit: 'set',  rate: 25000, category: 'Kitchen',   note: 'Cabinets, counters, appliances, sink.' },
  { id: 'kitchen_ref', label: 'Kitchen cabinet refresh',   unit: 'set',  rate: 4500,  category: 'Kitchen',   note: 'Reface uppers, paint lowers, hardware.' },
  { id: 'bath_mid',    label: 'Bathroom remodel (midrange)',unit: 'ea',  rate: 12000, category: 'Bathroom',  note: 'Vanity, tile, tub/shower, fixtures.' },
  { id: 'vanity',      label: 'Bathroom vanity & fixtures',unit: 'ea',   rate: 950,   category: 'Bathroom',  note: '30" vanity with chrome fixtures.' },
  { id: 'driveway',    label: 'Driveway replacement',      unit: 'sqft', rate: 13.00, category: 'Exterior',  note: 'Concrete tear-out + replace.' },
  { id: 'tree',        label: 'Tree removal (medium)',     unit: 'ea',   rate: 1100,  category: 'Exterior',  note: 'Up to 60ft, includes disposal.' },
  { id: 'windows',     label: 'Window replacement',        unit: 'ea',   rate: 700,   category: 'Exterior',  note: 'Mid-grade vinyl double-hung, installed.' },
  { id: 'electrical',  label: 'Electrical panel upgrade',  unit: 'ea',   rate: 2400,  category: 'Mechanical',note: '200A panel, includes permit.' },
];

// Regional cost-of-construction multipliers. Approximate, RSMeans-derived.
// Default 1.0 for unmatched ZIPs.
const ZIP3_MULT = {
  // High-cost coastal / metro
  '100': 1.30, '101': 1.30, '102': 1.30, '103': 1.30, '104': 1.30, // NYC
  '900': 1.28, '901': 1.28, '902': 1.28, '940': 1.30, '941': 1.32, // LA / Bay Area
  '980': 1.18, '981': 1.18, // Seattle
  '021': 1.22, '022': 1.22, // Boston
  '606': 1.15, // Chicago
  '200': 1.18, '201': 1.18, '202': 1.18, // DC
  // Sun Belt mid
  '331': 1.05, '332': 1.05, '333': 1.05, // Miami / FL SE
  '323': 0.92, '326': 0.92, // Tallahassee / Gainesville
  '300': 1.00, '301': 1.00, '303': 1.00, // Atlanta
  '750': 0.98, '751': 0.98, '752': 0.98, // Dallas
  '770': 0.96, '772': 0.96, // Houston
  '850': 0.96, // Phoenix
  // Lower cost
  '380': 0.88, '381': 0.88, // Memphis
  '370': 0.90, '372': 0.90, // Nashville
  '630': 0.92, '631': 0.92, // St Louis
  '441': 0.92, // Cleveland
};

const regionalMult = (zip) => {
  if (!zip) return 1.0;
  const z3 = String(zip).slice(0, 3);
  return ZIP3_MULT[z3] || 1.0;
};

// Build a default scope of work from subject characteristics. Used when no
// AI-generated scope is available.
window.buildFallbackRepairs = (subject) => {
  const sqft = Math.max(1, subject?.sqft || 1500);
  const yearBuilt = subject?.yearBuilt || 2000;
  const age = Math.max(0, new Date().getFullYear() - yearBuilt);
  const zip = (subject?.city || '').match(/\b\d{5}\b/)?.[0] || '';
  const mult = regionalMult(zip);

  const pick = (id, qty, overrides = {}) => {
    const r = RATES.find(x => x.id === id);
    if (!r) return null;
    const unitCost = +(r.rate * mult).toFixed(2);
    const total = Math.round(unitCost * qty);
    return {
      id: 'rp_' + id + '_' + Math.random().toString(36).slice(2, 6),
      label: r.label, qty, unit: r.unit, unitCost, total,
      category: r.category, source: 'RSMeans + regional avg (fallback)', note: r.note,
      ...overrides,
    };
  };

  const items = [];

  // Always: cosmetic refresh
  items.push(pick('paint_int', sqft));
  items.push(pick('lvp', Math.round(sqft * 0.7)));

  // Age-driven
  if (age >= 25) items.push(pick('reroof', Math.round(sqft * 1.05)));
  if (age >= 20) items.push(pick('hvac', 1));
  if (age >= 15) items.push(pick('water_heater', 1));
  if (age >= 30) items.push(pick('electrical', 1));

  // Always assume one bath needs work, plus kitchen refresh
  items.push(pick('kitchen_ref', 1));
  items.push(pick('vanity', 2));

  // Light exterior
  if (age >= 20) items.push(pick('paint_ext', Math.round(sqft * 1.1)));

  return items.filter(Boolean);
};

window.RSMEANS_RATES = RATES;
window.regionalMult = regionalMult;
