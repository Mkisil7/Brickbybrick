// Main app — orchestration

const { useState, useMemo, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "view": "split",
  "density": "compact",
  "scoreStyle": "pill"
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = window.useTweaks ? window.useTweaks(TWEAK_DEFAULTS) : [TWEAK_DEFAULTS, () => {}];
  const [tweaksOpen, setTweaksOpen] = useState(false);

  const [comps, setComps] = useState(window.COMPS);
  const [subject, setSubject] = useState(window.SUBJECT);
  const [hoveredId, setHoveredId] = useState(null);
  const [focusedId, setFocusedId] = useState('c1');
  const [view, setView] = useState('split'); // split | grid | table
  const [search, setSearch] = useState('');
  const [filterReno, setFilterReno] = useState('all');
  const [filterRadius, setFilterRadius] = useState(2);
  const [repairs, setRepairsState] = useState(window.REPAIRS);
  const [analysisMode, setAnalysisMode] = useState('arv'); // arv | cmv | rent
  const [offerOpen, setOfferOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dataStatus, setDataStatus] = useState(window.DATA_STATUS || { loading: false, source: 'mock', error: null });

  // Re-pull from window globals whenever data.jsx fires bbb:datachanged.
  useEffect(() => {
    const handler = () => {
      setSubject(window.SUBJECT);
      setComps(window.COMPS);
      setRepairsState(window.REPAIRS);
      setDataStatus(window.DATA_STATUS || { loading: false, source: 'mock', error: null });
    };
    window.addEventListener('bbb:datachanged', handler);
    return () => window.removeEventListener('bbb:datachanged', handler);
  }, []);

  // Initial auto-load if a saved address exists in localStorage.
  useEffect(() => {
    const cfg = window.BBB_CONFIG?.get?.() || {};
    if (cfg.address && window.loadRealData) window.loadRealData();
  }, []);

  // density from tweaks -> body
  useEffect(() => {
    document.body.dataset.density = tweaks.density;
  }, [tweaks.density]);

  // Tweaks panel handlers
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({type: '__edit_mode_available'}, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const filtered = useMemo(() => {
    return comps.filter(c => {
      if (filterReno !== 'all' && c.reno !== filterReno) return false;
      if (c.distance > filterRadius) return false;
      if (search && !c.address.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [comps, filterReno, filterRadius, search]);

  const selected = filtered.filter(c => c.selected);
  // Each selected comp implies its own ARV — user picks one as the "anchor"
  // rather than blending them. Default to the first selected if none chosen yet.
  const [anchorId, setAnchorId] = useState(null);
  useEffect(() => {
    if (selected.length === 0) { if (anchorId) setAnchorId(null); return; }
    if (!selected.find(c => c.id === anchorId)) setAnchorId(selected[0].id);
  }, [selected.map(c => c.id).join(',')]);
  const anchorComp = selected.find(c => c.id === anchorId);
  const arv = useMemo(() => {
    if (!anchorComp) return 0;
    return Math.round(anchorComp.ppsf * subject.sqft / 500) * 500;
  }, [anchorComp, subject.sqft]);
  const repairTotal = useMemo(() => repairs.reduce((s, i) => s + i.total, 0), [repairs]);

  const [offer, setOffer] = useState({
    holdingPct: 5, closingPct: 7, profitPct: 15, wholesale: 10000,
    holding: 0, closing: 0, profit: 0, offerPrice: 0,
  });

  // Recompute offer derived numbers
  useEffect(() => {
    const holding = offer.holdingPct / 100 * arv;
    const closing = offer.closingPct / 100 * arv;
    const profit  = offer.profitPct / 100 * arv;
    const offerPrice = arv - repairTotal - holding - closing - offer.wholesale - profit;
    setOffer(o => ({ ...o, holding, closing, profit, offerPrice }));
  }, [arv, repairTotal, offer.holdingPct, offer.closingPct, offer.profitPct, offer.wholesale]);

  const rentEstimate = useMemo(() => {
    const list = window.RENT_COMPS || [];
    if (list.length === 0) return { rent: 0, psf: '0.00', yield: '0.0', dscr: 0 };
    const avg = list.reduce((s, r) => s + r.rent, 0) / list.length;
    const psf = (avg / Math.max(subject.sqft, 1)).toFixed(2);
    const yieldPct = ((avg * 12) / Math.max(offer.offerPrice + repairTotal, 1) * 100).toFixed(1);
    const dscr = avg / 1180; // assumed PITI
    return { rent: Math.round(avg / 25) * 25, psf, yield: yieldPct, dscr };
  }, [offer.offerPrice, repairTotal, subject.sqft, dataStatus]);

  const toggleSel = (id) => setComps(cs => cs.map(c => c.id === id ? {...c, selected: !c.selected} : c));
  const removeRepair = (id) => setRepairsState(r => r.filter(x => x.id !== id));
  const addRepair = () => setRepairsState(r => [...r, {
    id: 'rp' + Date.now(), label: 'New line item', qty: 1, unit: 'ea',
    unitCost: 0, total: 0, category: 'Other', source: 'Manual', note: 'Custom line item',
  }]);

  return (
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--ink-100)',
      }}>
        <div style={{padding: '10px 20px', display:'flex', alignItems:'center', gap: 12}}>
          {/* Logo */}
          <div style={{display:'flex', alignItems:'center', gap: 8, fontWeight: 700, fontSize: 16, letterSpacing: -0.2}}>
            <div style={{
              width: 26, height: 26, borderRadius: 7,
              background: 'linear-gradient(135deg, #1f3349 0%, #4b6478 100%)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="home" size={14} color="#fff"/>
            </div>
            Parcel
          </div>
          <span style={{color:'var(--ink-300)'}}>/</span>
          <span style={{fontSize: 13, color:'var(--ink-500)'}}>Deals</span>
          <span style={{color:'var(--ink-300)'}}>/</span>
          <span style={{fontSize: 13, color:'var(--ink-900)', fontWeight: 600}}>{subject.address}</span>
          {dataStatus.loading && (
            <span style={{fontSize: 11, color: 'var(--ink-500)', display:'inline-flex', alignItems:'center', gap:4}}>
              <span className="mono">·</span> loading live data…
            </span>
          )}
          {dataStatus.error && (
            <span style={{fontSize: 11, color: 'var(--red-600)'}} title={dataStatus.error}>
              · live data failed (using mock)
            </span>
          )}

          {/* Search */}
          <div style={{flex: 1, maxWidth: 520, marginLeft: 16, position: 'relative'}}>
            <Icon name="search" size={15} style={{position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-400)'}}/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search address, neighborhood, or APN — try '3212 Jim Lee'"
              style={{
                width: '100%', padding: '8px 12px 8px 36px',
                border: '1px solid var(--ink-200)', borderRadius: 8, fontSize: 13,
                background: '#fff',
              }}/>
          </div>

          <div style={{flex: 1}}/>

          <span style={{fontSize: 12, color: 'var(--ink-400)'}}>Created Nov 20, 2025</span>
          <Btn icon="sliders" size="sm" variant="default" onClick={() => setSettingsOpen(true)}>Settings</Btn>
          <Btn icon="share" size="sm" variant="default">Share</Btn>
          <Btn icon="sparkle" size="sm" variant="primary"
               onClick={() => window.loadRealData && window.loadRealData()}>
            {dataStatus.loading ? 'Loading…' : 'Run AI Underwrite'}
          </Btn>
        </div>

        {/* Filter row */}
        <div style={{padding: '0 20px 10px', display:'flex', alignItems:'center', gap: 12, flexWrap: 'wrap'}}>
          <Segmented
            options={[
              { value: 'split', label: 'Map + List', icon: 'map' },
              { value: 'grid',  label: 'Grid',       icon: 'grid' },
              { value: 'table', label: 'Table',      icon: 'table' },
            ]}
            value={view}
            onChange={setView}
            size="sm"
          />
          <Divider vertical style={{height: 22}}/>
          <FilterPill icon="filter" label="Reno level" options={[
            {v: 'all', l: 'Any'}, {v: 'as-is', l: 'As-is'}, {v: 'light', l: 'Light'}, {v: 'medium', l: 'Medium'}, {v: 'renovated', l: 'Renovated'}
          ]} value={filterReno} onChange={setFilterReno}/>
          <FilterPill icon="pin" label="Radius" options={[
            {v: 1, l: '1 mi'}, {v: 2, l: '2 mi'}, {v: 5, l: '5 mi'}, {v: 100, l: 'Any'}
          ]} value={filterRadius} onChange={setFilterRadius}/>
          <FilterPill icon="bed" label="Beds" options={[{v:'any', l:'Any'},{v:3, l:'3+'},{v:4, l:'4+'}]} value="any" onChange={()=>{}}/>
          <FilterPill icon="calendar" label="Sold within" options={[{v:6, l:'6 mo'},{v:12, l:'12 mo'}]} value={6} onChange={()=>{}}/>
          <span style={{fontSize: 12, color: 'var(--ink-500)', marginLeft: 'auto'}}>
            {filtered.length} comps · <span style={{color:'var(--ink-900)', fontWeight:600}}>{selected.length} selected</span> for analysis
          </span>
        </div>
      </header>

      {/* Body */}
      <main style={{flex: 1, padding: 16, display: 'grid', gridTemplateColumns: '1fr 460px', gap: 16, minHeight: 0}}>
        <div style={{minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16}}>
          {view === 'split' && (
            <div style={{display:'grid', gridTemplateColumns: '1fr 380px', gap: 12, height: 'calc(100vh - 168px)', minHeight: 600}}>
              <MapView
                subject={subject}
                comps={filtered}
                hoveredId={hoveredId}
                selectedId={focusedId}
                onHover={setHoveredId}
                onSelect={setFocusedId}
              />
              <div style={{
                background: 'rgba(255,255,255,0.6)', borderRadius: 12,
                padding: 10, display: 'flex', flexDirection: 'column', gap: 8,
                border: '1px solid var(--ink-100)', overflow: 'auto',
              }}>
                <div style={{display:'flex', alignItems: 'center', justifyContent:'space-between', padding: '4px 4px 6px'}}>
                  <div style={{fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, color: 'var(--ink-500)'}}>
                    Comparable Properties
                  </div>
                  <button style={{...iconBtnSmall}} data-tip="Refresh from MLS"><Icon name="refresh" size={13}/></button>
                </div>
                {filtered.map(c => (
                  <CompCard key={c.id} comp={c} onToggle={toggleSel}
                            onHover={setHoveredId} onSelect={setFocusedId}
                            hovered={hoveredId === c.id} focused={focusedId === c.id}
                            scoreStyle={tweaks.scoreStyle} density={tweaks.density}/>
                ))}
              </div>
            </div>
          )}
          {view === 'grid' && (
            <CompGrid comps={filtered} onToggle={toggleSel} onHover={setHoveredId}
                      hoveredId={hoveredId} focusedId={focusedId} onSelect={setFocusedId}
                      scoreStyle={tweaks.scoreStyle}/>
          )}
          {view === 'table' && (
            <CompTable comps={filtered} onToggle={toggleSel} onHover={setHoveredId}
                       hoveredId={hoveredId} focusedId={focusedId} onSelect={setFocusedId}
                       scoreStyle={tweaks.scoreStyle}/>
          )}
        </div>

        {/* Right column */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0,
                     maxHeight: 'calc(100vh - 152px)', overflow: 'auto', paddingRight: 4}}>
          <SubjectPanel subject={subject}/>
          <DealPanel
            arv={arv} repairs={repairTotal}
            offer={offer}
            onEditOffer={() => setOfferOpen(true)}
            mode={analysisMode}
            onMode={setAnalysisMode}
            rentEstimate={rentEstimate}
            selectedComps={selected}
            anchorId={anchorId}
            onAnchor={setAnchorId}
            subjectSqft={subject.sqft}
          />
          <RepairsPanel items={repairs} onUpdate={()=>{}} onRemove={removeRepair} onAdd={addRepair} density={tweaks.density}/>
        </div>
      </main>

      {/* Offer modal */}
      <OfferModal open={offerOpen} onClose={() => setOfferOpen(false)}
                  offer={offer} setOffer={setOffer}
                  arv={arv} repairs={repairTotal}/>

      {/* Settings modal */}
      {window.SettingsModal && (
        <window.SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)}/>
      )}

      {/* Tweaks */}
      {tweaksOpen && window.TweaksPanel && (
        <window.TweaksPanel onClose={() => setTweaksOpen(false)} title="Tweaks">
          <window.TweakSection title="Layout">
            <window.TweakRadio label="Density" value={tweaks.density}
              onChange={v => setTweak('density', v)}
              options={[{value:'compact', label:'Compact'},{value:'comfortable', label:'Comfortable'}]}/>
          </window.TweakSection>
          <window.TweakSection title="Comp display">
            <window.TweakRadio label="View mode" value={view}
              onChange={setView}
              options={[{value:'split', label:'Map'},{value:'grid', label:'Grid'},{value:'table', label:'Table'}]}/>
          </window.TweakSection>
          <window.TweakSection title="Renovation score style">
            <window.TweakRadio label="Style" value={tweaks.scoreStyle}
              onChange={v => setTweak('scoreStyle', v)}
              options={[{value:'pill', label:'Pill'},{value:'dot', label:'Dot'},{value:'bar', label:'Bar'}]}/>
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </div>
  );
}

const FilterPill = ({ icon, label, options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const current = options.find(o => o.v === value)?.l || 'Any';
  return (
    <div style={{position: 'relative'}}>
      <button onClick={() => setOpen(!open)} style={{
        display:'inline-flex', alignItems:'center', gap: 6,
        padding: '5px 10px', border: '1px solid var(--ink-200)', borderRadius: 999,
        background: '#fff', fontSize: 12, fontWeight: 600, color:'var(--ink-700)', cursor:'pointer',
      }}>
        {icon && <Icon name={icon} size={12}/>}
        <span style={{color:'var(--ink-400)', fontWeight: 500}}>{label}:</span>
        {current}
        <Icon name="chevDown" size={12} color="var(--ink-400)"/>
      </button>
      {open && (
        <>
          <div style={{position: 'fixed', inset: 0, zIndex: 10}} onClick={() => setOpen(false)}/>
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 20,
            background: '#fff', borderRadius: 8, boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--ink-100)', padding: 4, minWidth: 140,
          }}>
            {options.map(o => (
              <button key={o.v} onClick={() => { onChange(o.v); setOpen(false); }} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '6px 10px', border: 'none', background: value === o.v ? 'var(--ink-50)' : 'transparent',
                borderRadius: 6, fontSize: 12.5, color: 'var(--ink-700)', cursor: 'pointer', textAlign: 'left',
              }}>
                {o.l}
                {value === o.v && <Icon name="check" size={12} color="var(--green-600)"/>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const iconBtnSmall = {
  width: 24, height: 24, border: '1px solid var(--ink-100)', borderRadius: 6,
  background: '#fff', color: 'var(--ink-500)', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
