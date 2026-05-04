// Deal analysis sidebar + offer config modal + ARV/CMV/Rent toggle

const DealPanel = ({ arv, repairs, offer, onEditOffer, onMode, mode, rentEstimate, selectedComps, anchorId, onAnchor, subjectSqft }) => {
  return (
    <Card style={{padding: 16}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div style={{display:'flex', alignItems:'center', gap: 8, fontSize: 11, color: 'var(--ink-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5}}>
          <Icon name="dollar" size={12}/>
          Deal Analysis
        </div>
        <div style={{display:'flex', gap: 4}}>
          <button style={iconBtn} data-tip="Looks good"><Icon name="thumbUp" size={14}/></button>
          <button style={iconBtn} data-tip="Needs work"><Icon name="thumbDown" size={14}/></button>
        </div>
      </div>

      <div style={{display:'inline-flex', marginTop: 10, padding: 3, background: 'var(--ink-100)', borderRadius: 8, gap: 2}}>
        {[
          { v: 'arv', l: 'ARV', tip: 'After-repair value' },
          { v: 'cmv', l: 'CMV', tip: 'Current as-is value' },
          { v: 'rent', l: 'Rent', tip: 'Rental analysis' },
        ].map(o => (
          <button key={o.v} onClick={() => onMode(o.v)} data-tip={o.tip} style={{
            padding: '5px 12px', fontSize: 12, fontWeight: 600,
            background: mode === o.v ? '#fff' : 'transparent',
            color: mode === o.v ? 'var(--ink-900)' : 'var(--ink-500)',
            border: 'none', borderRadius: 6, cursor: 'pointer',
            boxShadow: mode === o.v ? 'var(--shadow-sm)' : 'none',
          }}>{o.l}</button>
        ))}
      </div>

      <div style={{marginTop: 14, display:'flex', flexDirection: 'column', gap: 10}}>
        {mode === 'rent' ? (
          <>
            <Row icon="home" label="Estimated Rent" value={`${window.fmtMoney(rentEstimate.rent)}/mo`} valueColor="var(--green-700)" big/>
            <Row icon="dollar" label="Rent / sqft" value={`$${rentEstimate.psf}/mo`}/>
            <Row icon="ruler" label="Gross Yield" value={`${rentEstimate.yield}%`}/>
            <Row icon="calendar" label="DSCR (est)" value={rentEstimate.dscr.toFixed(2)}/>
            <Divider/>
            <div style={{fontSize: 11, color:'var(--ink-500)'}}>Based on 4 active rentals within 1.6 mi · 3bd/2ba · 1,520-1,740 sqft</div>
          </>
        ) : mode === 'cmv' ? (
          <>
            <Row icon="home" label="Current Market Value" value={window.fmtMoney(193500)} valueColor="var(--ink-900)" big/>
            <Row icon="ruler" label="As-is comp range" value="$178k – $215k"/>
            <Row icon="info" label="Confidence" value="High · 4 comps"/>
          </>
        ) : (
          <>
            <Row icon="home" label="After Repair Value" value={window.fmtMoney(arv)} valueColor="var(--green-700)" big/>
            {selectedComps && selectedComps.length > 1 && (
              <div style={{padding: '8px 10px', background: 'var(--blue-50)', border: '1px solid #cfe1ff', borderRadius: 8}}>
                <div style={{fontSize: 11, fontWeight: 600, color: 'var(--blue-700)', textTransform: 'uppercase', letterSpacing: .4, marginBottom: 6, display:'flex', alignItems:'center', gap: 5}}>
                  <Icon name="info" size={11}/>
                  Pick anchor comp — ARV uses one comp at a time
                </div>
                <div style={{display:'flex', flexDirection:'column', gap: 3}}>
                  {selectedComps.map(c => {
                    const implied = Math.round(c.ppsf * subjectSqft / 500) * 500;
                    const active = c.id === anchorId;
                    return (
                      <button key={c.id} onClick={() => onAnchor(c.id)} style={{
                        display:'flex', alignItems:'center', justifyContent:'space-between',
                        padding: '5px 8px', borderRadius: 6, border: '1px solid ' + (active ? 'var(--blue-600)' : 'transparent'),
                        background: active ? '#fff' : 'transparent', cursor:'pointer',
                        textAlign:'left',
                      }}>
                        <span style={{display:'inline-flex', alignItems:'center', gap: 6, fontSize: 12, color: active ? 'var(--ink-900)' : 'var(--ink-700)', fontWeight: active ? 600 : 500, minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                          <span style={{width: 10, height: 10, borderRadius: 99, border: '2px solid ' + (active ? 'var(--blue-600)' : 'var(--ink-300)'), background: active ? 'var(--blue-600)' : '#fff', flexShrink: 0}}/>
                          {c.address}
                        </span>
                        <span className="num" style={{fontSize: 12, fontWeight: 600, color: active ? 'var(--ink-900)' : 'var(--ink-500)'}}>{window.fmtMoney(implied)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <Row icon="dollar" label="Offer Price" value={window.fmtMoney(offer.offerPrice)}
                 action={<button onClick={onEditOffer} style={editBadge}><Icon name="edit" size={11}/>Edit</button>}/>
            <Row icon="tag" label="Repair Cost" value={window.fmtMoney(repairs)} valueColor="var(--red-600)"/>
            <Divider/>
            <Row label={`Holding (${offer.holdingPct}%)`} value={window.fmtMoney(-offer.holding)} subtle/>
            <Row label={`Closing (${offer.closingPct}%)`} value={window.fmtMoney(-offer.closing)} subtle/>
            <Row label="Wholesale Fee" value={window.fmtMoney(-offer.wholesale)} subtle/>
            <Row label={`Profit (${offer.profitPct}%)`} value={window.fmtMoney(-offer.profit)} subtle/>
          </>
        )}
      </div>
    </Card>
  );
};

const Row = ({ icon, label, value, valueColor, big, subtle, action }) => (
  <div style={{display:'flex', alignItems: 'center', justifyContent:'space-between', gap: 12}}>
    <div style={{display:'flex', alignItems:'center', gap: 8, color: subtle ? 'var(--ink-500)' : 'var(--ink-700)', fontSize: subtle ? 12.5 : 13}}>
      {icon && <Icon name={icon} size={14} color={subtle ? 'var(--ink-400)' : 'var(--ink-500)'}/>}
      {label}
      {action}
    </div>
    <div className="num serif" style={{
      fontSize: big ? 22 : (subtle ? 13 : 15),
      fontWeight: big ? 500 : 600,
      color: valueColor || 'var(--ink-900)',
      letterSpacing: -0.01,
    }}>{value}</div>
  </div>
);

const iconBtn = {
  width: 28, height: 28, border: '1px solid var(--ink-100)', borderRadius: 8,
  background: '#fff', color: 'var(--ink-500)', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};
const editBadge = {
  display: 'inline-flex', alignItems: 'center', gap: 3,
  padding: '1px 6px', borderRadius: 99, background: 'var(--blue-50)',
  color: 'var(--blue-700)', border: '1px solid #cfe1ff', fontSize: 11, fontWeight: 600,
  cursor: 'pointer', marginLeft: 4,
};

// Offer config modal
const OfferModal = ({ open, onClose, offer, setOffer, arv, repairs }) => {
  if (!open) return null;
  const holding = offer.holdingPct / 100 * arv;
  const closing = offer.closingPct / 100 * arv;
  const profit  = offer.profitPct / 100 * arv;
  const wholesale = offer.wholesale;
  const offerPrice = arv - repairs - holding - closing - wholesale - profit;

  React.useEffect(() => {
    setOffer(o => ({ ...o, holding, closing, profit, offerPrice }));
  }, [offer.holdingPct, offer.closingPct, offer.profitPct, offer.wholesale]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(11,26,43,0.45)', backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn .15s ease',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 14, width: 'min(720px, 92vw)',
        boxShadow: '0 24px 60px rgba(15,30,50,.3)', padding: 0, overflow: 'hidden',
      }}>
        <div style={{padding: '18px 22px', borderBottom: '1px solid var(--ink-100)', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div>
            <h3 style={{margin: 0, fontSize: 17, fontWeight: 700, color:'var(--ink-900)'}}>Offer Price Configuration</h3>
            <div style={{fontSize: 12.5, color:'var(--ink-500)', marginTop: 2}}>Adjust parameters to calculate your custom offer</div>
          </div>
          <button onClick={onClose} style={{...iconBtn, width: 32, height: 32}}><Icon name="x" size={16}/></button>
        </div>

        <div style={{display:'grid', gridTemplateColumns: '1fr 1fr', gap: 22, padding: 22}}>
          <div style={{display:'flex', flexDirection:'column', gap: 14}}>
            <Slider label="Holding Costs" tip="Cost to carry the property during the rehab period" computed={window.fmtMoneyDecimal(holding)} unit="%" value={offer.holdingPct} onChange={v => setOffer(o => ({...o, holdingPct: v}))} max={15}/>
            <Slider label="Closing Costs" tip="Title, escrow, transfer taxes, etc." computed={window.fmtMoneyDecimal(closing)} unit="%" value={offer.closingPct} onChange={v => setOffer(o => ({...o, closingPct: v}))} max={15}/>
            <Slider label="Wholesale Fee" tip="Assignment fee paid out to a wholesaler" computed="" unit="$" value={offer.wholesale} onChange={v => setOffer(o => ({...o, wholesale: v}))} max={50000} step={500} type="dollar"/>
            <Slider label="Profit Percentage" tip="Target profit margin for this deal" computed={window.fmtMoneyDecimal(profit)} unit="%" value={offer.profitPct} onChange={v => setOffer(o => ({...o, profitPct: v}))} max={30}/>

            <div>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 6}}>
                <label style={{fontSize: 12, fontWeight: 600, color:'var(--ink-700)', display:'inline-flex', alignItems:'center', gap: 4}}>
                  Offer Price <Icon name="info" size={11} color="var(--ink-400)"/>
                </label>
              </div>
              <div style={{position: 'relative'}}>
                <input
                  value={Math.round(offerPrice).toLocaleString()}
                  readOnly
                  style={{
                    width: '100%', padding: '10px 30px 10px 12px',
                    border: '1px solid var(--ink-200)', borderRadius: 8, fontSize: 14,
                    background: 'var(--ink-50)', color: 'var(--ink-900)', fontWeight: 600,
                  }}/>
                <span style={{position:'absolute', right: 12, top: '50%', transform:'translateY(-50%)', color:'var(--ink-400)'}}>$</span>
              </div>
            </div>
          </div>

          <div style={{background: 'var(--ink-50)', borderRadius: 10, padding: 18, display:'flex', flexDirection:'column', gap: 12, height: 'fit-content'}}>
            <div style={{fontWeight: 700, color: 'var(--ink-900)', fontSize: 14}}>Deal Summary</div>
            <SummaryRow label="ARV" value={window.fmtMoney(arv)} bold/>
            <SummaryRow label="Repair Cost" value={`-${window.fmtMoney(repairs)}`} negative/>
            <SummaryRow label={`Holding (${offer.holdingPct}%)`} value={`-${window.fmtMoney(holding)}`} negative/>
            <SummaryRow label={`Closing (${offer.closingPct}%)`} value={`-${window.fmtMoney(closing)}`} negative/>
            <SummaryRow label="Wholesale Fee" value={`-${window.fmtMoney(wholesale)}`} negative/>
            <SummaryRow label={`Profit (${offer.profitPct}%)`} value={`-${window.fmtMoney(profit)}`} negative/>
            <Divider/>
            <SummaryRow label="Offer Price" value={window.fmtMoney(offerPrice)} highlight/>
          </div>
        </div>

        <div style={{padding: '16px 22px', background: '#fff', borderTop: '1px solid var(--ink-100)', display:'flex', justifyContent: 'flex-end', gap: 8}}>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={onClose}>Save Configuration</Btn>
        </div>
      </div>
    </div>
  );
};

const Slider = ({ label, tip, computed, value, onChange, unit, max, step = 1, type = 'percent' }) => (
  <div>
    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 6}}>
      <label style={{fontSize: 12, fontWeight: 600, color:'var(--ink-700)', display:'inline-flex', alignItems:'center', gap: 4}} data-tip={tip}>
        {label} <Icon name="info" size={11} color="var(--ink-400)"/>
      </label>
      {computed && <span style={{fontSize: 11, color:'var(--ink-400)'}} className="num">{computed}</span>}
    </div>
    <div style={{position: 'relative'}}>
      <input
        type="number" value={value} step={step} max={max} min={0}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        style={{
          width: '100%', padding: '10px 30px 10px 12px',
          border: '1px solid var(--ink-200)', borderRadius: 8, fontSize: 14,
          color: 'var(--ink-900)', fontWeight: 600,
        }}/>
      <span style={{position:'absolute', right: 12, top: '50%', transform:'translateY(-50%)', color:'var(--ink-400)', fontSize: 13}}>{unit}</span>
    </div>
  </div>
);

const SummaryRow = ({ label, value, bold, negative, highlight }) => (
  <div style={{display:'flex', alignItems:'center', justifyContent: 'space-between', fontSize: highlight ? 15 : 13}}>
    <span style={{color: highlight ? 'var(--ink-900)' : 'var(--ink-700)', fontWeight: highlight || bold ? 600 : 400}}>{label}</span>
    <span className="num" style={{
      color: highlight ? 'var(--ink-900)' : negative ? 'var(--red-600)' : 'var(--ink-900)',
      fontWeight: highlight ? 700 : 600,
      background: highlight ? '#dbf2e2' : 'transparent',
      padding: highlight ? '3px 8px' : 0,
      borderRadius: 6,
    }}>{value}</span>
  </div>
);

window.DealPanel = DealPanel;
window.OfferModal = OfferModal;
