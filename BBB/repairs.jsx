// Repair estimator — itemized line items with editable totals + sources

const RepairsPanel = ({ items, onUpdate, onRemove, onAdd, density }) => {
  const total = items.reduce((s, i) => s + (i.total || 0), 0);
  const compact = density === 'compact';
  const [expanded, setExpanded] = React.useState(null);

  return (
    <Card style={{padding: 0, overflow:'hidden'}}>
      <div style={{padding: '14px 16px 10px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom: '1px solid var(--ink-100)'}}>
        <div>
          <div style={{display:'flex', alignItems:'center', gap: 8, fontSize: 11, color: 'var(--ink-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5}}>
            <Icon name="tag" size={12}/>
            Repair Estimate
          </div>
          <div style={{display:'flex', alignItems:'baseline', gap: 8, marginTop: 4}}>
            <div className="serif" style={{fontSize: 28, color:'var(--red-600)', fontWeight: 500, lineHeight: 1}}>
              {window.fmtMoney(total)}
            </div>
            <div style={{fontSize: 12, color:'var(--ink-400)'}}>{items.length} items · ${(total / 1580).toFixed(2)}/sqft</div>
          </div>
        </div>
        <Btn size="sm" icon="plus" onClick={onAdd}>Add line</Btn>
      </div>

      <div style={{padding: compact ? '4px 0' : '6px 0'}}>
        {items.map((item, idx) => (
          <div key={item.id}>
            <div style={{
              display: 'grid', gridTemplateColumns: '20px 1fr auto auto',
              gap: 10, alignItems: 'center',
              padding: compact ? '8px 16px' : '11px 16px',
              borderTop: idx > 0 ? '1px solid var(--ink-100)' : 'none',
            }}>
              <button onClick={() => onRemove(item.id)} style={{
                width: 18, height: 18, border: 'none', background: 'transparent',
                color: 'var(--ink-400)', cursor: 'pointer', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center', borderRadius: 4,
              }} data-tip="Remove">
                <Icon name="x" size={14}/>
              </button>
              <div style={{minWidth: 0}}>
                <div style={{display:'flex', alignItems:'center', gap: 6}}>
                  <span style={{fontSize: 13, color:'var(--ink-900)', fontWeight: 500}}>{item.label}</span>
                  <button data-tip={item.note} onClick={() => setExpanded(expanded === item.id ? null : item.id)} style={{
                    background: 'transparent', border:'none', color:'var(--ink-400)', cursor:'pointer', padding: 2,
                    display:'inline-flex', alignItems:'center',
                  }}>
                    <Icon name="info" size={12}/>
                  </button>
                </div>
                <div style={{fontSize: 11, color:'var(--ink-400)', marginTop: 2, display:'flex', alignItems:'center', gap: 8}}>
                  <span>{item.qty} {item.unit} × {window.fmtMoneyDecimal(item.unitCost)}</span>
                  <span style={{display:'inline-flex', alignItems:'center', gap: 4, color:'var(--ink-500)'}}>
                    <span style={{width: 3, height: 3, borderRadius: 99, background: 'var(--ink-300)'}}/>
                    {item.category}
                  </span>
                </div>
              </div>
              <div style={{display:'flex', alignItems:'center', gap: 8}}>
                <span style={{fontSize: 14, fontWeight: 700, color:'var(--ink-900)', minWidth: 76, textAlign: 'right'}} className="num">
                  {window.fmtMoney(item.total)}
                </span>
                <button style={{
                  background: 'transparent', border:'none', color:'var(--ink-400)', cursor:'pointer', padding: 4,
                  display:'inline-flex', alignItems:'center', borderRadius: 4,
                }} data-tip="Edit">
                  <Icon name="edit" size={13}/>
                </button>
              </div>
              <div/>
            </div>
            {expanded === item.id && (
              <div style={{padding: '8px 16px 12px 46px', background: 'var(--ink-50)', borderTop: '1px solid var(--ink-100)'}}>
                <div style={{display:'flex', gap: 16, fontSize: 12, color:'var(--ink-700)'}}>
                  <div style={{flex: 1}}>
                    <div style={{fontSize: 10.5, fontWeight:600, textTransform:'uppercase', letterSpacing: .4, color:'var(--ink-400)', marginBottom: 4}}>Detail</div>
                    {item.note}
                  </div>
                  <div>
                    <div style={{fontSize: 10.5, fontWeight:600, textTransform:'uppercase', letterSpacing: .4, color:'var(--ink-400)', marginBottom: 4}}>Source</div>
                    <span className="mono" style={{fontSize: 11, color:'var(--ink-700)'}}>{item.source}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI suggestions footer */}
      <div style={{padding: '12px 16px', background: 'var(--ink-50)', borderTop: '1px solid var(--ink-100)'}}>
        <div style={{fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .4, color: 'var(--ink-500)', marginBottom: 6, display:'flex', alignItems:'center', gap: 5}}>
          <Icon name="sparkle" size={11}/>
          Suggestions
        </div>
        <div style={{display:'flex', flexDirection:'column', gap: 4, fontSize: 12, color:'var(--ink-700)'}}>
          <div>· Repairs are <span style={{fontWeight:600}}>$60/sqft</span>, $4 below median for similar Tallahassee flips.</div>
          <div>· Add new roof? Imagery shows shingles &gt;20 years old. <button style={linkBtn}>Estimate</button></div>
          <div>· Set the total repair budget cap. <button style={linkBtn}>Configure</button></div>
        </div>
      </div>
    </Card>
  );
};

const linkBtn = {
  background: 'transparent', border: 'none', color: 'var(--blue-600)',
  fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: 12, textDecoration: 'underline',
};

window.RepairsPanel = RepairsPanel;
