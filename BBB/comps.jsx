// Comp list (left rail) + table view + grid view

const renoColorMap = {
  'as-is': '#ef4444', 'light': '#fb923c', 'medium': '#eab308', 'renovated': '#10b981',
};

const CompCard = ({ comp, onToggle, onHover, onSelect, hovered, focused, scoreStyle, density }) => {
  const compact = density === 'compact';
  return (
    <div
      onMouseEnter={() => onHover && onHover(comp.id)}
      onMouseLeave={() => onHover && onHover(null)}
      onClick={() => onSelect && onSelect(comp.id)}
      style={{
        background: '#fff', border: `1px solid ${focused ? 'var(--ink-900)' : hovered ? '#bccae0' : 'var(--ink-100)'}`,
        borderRadius: 12, padding: compact ? 10 : 12,
        boxShadow: focused ? '0 4px 14px rgba(15,30,50,.10)' : 'var(--shadow-sm)',
        cursor: 'pointer', display: 'flex', gap: compact ? 10 : 12, transition: 'all .12s ease',
      }}
    >
      <label style={{display: 'flex', alignItems: 'flex-start', paddingTop: 2}} onClick={e => e.stopPropagation()}>
        <input type="checkbox" checked={comp.selected} onChange={() => onToggle(comp.id)}
               style={{ width: 16, height: 16, accentColor: 'var(--ink-900)', cursor: 'pointer' }}/>
      </label>
      <div style={{ width: compact ? 72 : 96, flexShrink: 0 }}>
        <PhotoStub label={`comp ${comp.address.split(' ')[0]}`} height={compact ? 60 : 72} hue={150 + (comp.id.charCodeAt(1) % 5) * 20}/>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap: 8}}>
          <div style={{minWidth: 0}}>
            <div style={{fontWeight: 600, fontSize: compact ? 13 : 14, color:'var(--ink-900)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{comp.address}</div>
            <div style={{display:'flex', alignItems:'center', gap: 8, fontSize: 11.5, color:'var(--ink-500)', marginTop: 2}}>
              <span style={{display:'inline-flex', alignItems:'center', gap: 3}}>
                <Icon name="pin" size={11}/>{comp.distance} mi
              </span>
              <SourceBadge source={comp.source}/>
              {comp.status === 'Active' && <span style={{
                fontSize: 10.5, fontWeight: 600, color: '#0369a1', background:'#e0f2fe',
                padding: '1px 6px', borderRadius: 99, border: '1px solid #bae6fd',
              }}>Active</span>}
            </div>
          </div>
          <div style={{textAlign:'right'}}>
            <div className="serif" style={{fontSize: compact ? 18 : 22, color:'var(--ink-900)', lineHeight: 1, fontWeight: 500}}>
              ${(comp.price/1000).toFixed(0)}k
            </div>
            <div style={{fontSize: 10.5, color:'var(--ink-400)', marginTop: 2}}>${comp.ppsf}/sqft</div>
          </div>
        </div>
        <div style={{display:'flex', alignItems:'center', gap: 10, fontSize: 11.5, color:'var(--ink-500)', flexWrap:'wrap'}}>
          <span style={{display:'inline-flex', alignItems:'center', gap: 3}}><Icon name="bed" size={11}/>{comp.beds}bd</span>
          <span style={{display:'inline-flex', alignItems:'center', gap: 3}}><Icon name="bath" size={11}/>{comp.baths}ba</span>
          <span style={{display:'inline-flex', alignItems:'center', gap: 3}}><Icon name="ruler" size={11}/>{comp.sqft.toLocaleString()} sqft</span>
          <span style={{display:'inline-flex', alignItems:'center', gap: 3}}><Icon name="calendar" size={11}/>{new Date(comp.soldDate).toLocaleDateString('en-US',{month:'short', year:'numeric'})}</span>
        </div>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginTop: 2}}>
          <RenoChip level={comp.reno} style={scoreStyle}/>
          <span style={{fontSize: 10.5, color:'var(--ink-400)'}}>{comp.dom}d on market</span>
        </div>
      </div>
    </div>
  );
};

const CompTable = ({ comps, onToggle, onHover, hoveredId, focusedId, onSelect, scoreStyle }) => (
  <div style={{background:'#fff', borderRadius: 12, border: '1px solid var(--ink-100)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)'}}>
    <table style={{width: '100%', borderCollapse: 'collapse', fontSize: 13}}>
      <thead>
        <tr style={{background: 'var(--ink-50)', textAlign: 'left', color: 'var(--ink-500)'}}>
          {['', 'Address', 'Reno', 'Dist', 'Bd/Ba', 'Sqft', 'Lot', 'Yr', 'Sold', 'Days', 'Source', 'Price', '$/sqft'].map((h, i) => (
            <th key={i} style={{padding: '10px 10px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, borderBottom: '1px solid var(--ink-100)', whiteSpace: 'nowrap'}}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {comps.map(c => (
          <tr key={c.id}
              onMouseEnter={() => onHover && onHover(c.id)}
              onMouseLeave={() => onHover && onHover(null)}
              onClick={() => onSelect && onSelect(c.id)}
              style={{
                background: focusedId === c.id ? 'var(--blue-50)' : hoveredId === c.id ? 'var(--ink-50)' : '#fff',
                cursor: 'pointer', borderBottom: '1px solid var(--ink-100)',
              }}>
            <td style={{padding: '8px 10px'}} onClick={e => e.stopPropagation()}>
              <input type="checkbox" checked={c.selected} onChange={() => onToggle(c.id)} style={{accentColor: 'var(--ink-900)', cursor:'pointer'}}/>
            </td>
            <td style={{padding: '8px 10px', fontWeight: 600, color:'var(--ink-900)'}}>{c.address}</td>
            <td style={{padding: '8px 10px'}}><RenoChip level={c.reno} style={scoreStyle}/></td>
            <td style={{padding: '8px 10px', color:'var(--ink-500)'}} className="num">{c.distance} mi</td>
            <td style={{padding: '8px 10px'}} className="num">{c.beds}/{c.baths}</td>
            <td style={{padding: '8px 10px'}} className="num">{c.sqft.toLocaleString()}</td>
            <td style={{padding: '8px 10px'}} className="num">{c.lot.toLocaleString()}</td>
            <td style={{padding: '8px 10px'}} className="num">{c.yearBuilt}</td>
            <td style={{padding: '8px 10px', color:'var(--ink-500)'}} className="num">{new Date(c.soldDate).toLocaleDateString('en-US',{month:'short', day:'numeric'})}</td>
            <td style={{padding: '8px 10px'}} className="num">{c.dom}</td>
            <td style={{padding: '8px 10px'}}><SourceBadge source={c.source}/></td>
            <td style={{padding: '8px 10px', textAlign: 'right', fontWeight: 700, color:'var(--ink-900)'}} className="num">${(c.price/1000).toFixed(0)}k</td>
            <td style={{padding: '8px 10px', textAlign: 'right', color:'var(--ink-500)'}} className="num">${c.ppsf}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CompGrid = ({ comps, onToggle, onHover, hoveredId, focusedId, onSelect, scoreStyle }) => (
  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12}}>
    {comps.map(c => (
      <div key={c.id}
           onMouseEnter={() => onHover && onHover(c.id)}
           onMouseLeave={() => onHover && onHover(null)}
           onClick={() => onSelect && onSelect(c.id)}
           style={{
             background: '#fff', border: `1px solid ${focusedId === c.id ? 'var(--ink-900)' : 'var(--ink-100)'}`,
             borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
             cursor: 'pointer', transition: 'all .12s ease',
             transform: hoveredId === c.id ? 'translateY(-2px)' : 'none',
           }}>
        <div style={{position: 'relative'}}>
          <PhotoStub label={`exterior · ${c.address.split(' ')[0]}`} height={140} hue={140 + (c.id.charCodeAt(1) % 6) * 20}/>
          <label style={{position: 'absolute', top: 8, left: 8, background: 'rgba(255,255,255,0.95)', borderRadius: 6, padding: '4px 6px'}} onClick={e=>e.stopPropagation()}>
            <input type="checkbox" checked={c.selected} onChange={() => onToggle(c.id)} style={{accentColor: 'var(--ink-900)', cursor:'pointer', display:'block'}}/>
          </label>
          <div style={{position:'absolute', top: 8, right: 8, display:'flex', gap: 4}}>
            <SourceBadge source={c.source}/>
            {c.status === 'Active' && <span style={{
              fontSize: 10.5, fontWeight: 600, color: '#0369a1', background:'#e0f2fe',
              padding: '2px 7px', borderRadius: 99, border: '1px solid #bae6fd',
            }}>Active</span>}
          </div>
          <div style={{position:'absolute', bottom: 8, left: 8}}>
            <RenoChip level={c.reno} style={scoreStyle}/>
          </div>
        </div>
        <div style={{padding: 12}}>
          <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap: 8}}>
            <div style={{minWidth:0}}>
              <div style={{fontWeight: 600, fontSize: 14, color:'var(--ink-900)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.address}</div>
              <div style={{fontSize: 11.5, color:'var(--ink-500)', marginTop: 2}}>{c.distance} mi away</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div className="serif" style={{fontSize: 22, lineHeight: 1, color:'var(--ink-900)', fontWeight: 500}}>${(c.price/1000).toFixed(0)}k</div>
              <div style={{fontSize: 10.5, color:'var(--ink-400)', marginTop: 2}}>${c.ppsf}/sqft</div>
            </div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap: 12, fontSize: 12, color:'var(--ink-500)', marginTop: 8}}>
            <span><Icon name="bed" size={12} style={{verticalAlign:-2, marginRight: 3}}/>{c.beds}</span>
            <span><Icon name="bath" size={12} style={{verticalAlign:-2, marginRight: 3}}/>{c.baths}</span>
            <span><Icon name="ruler" size={12} style={{verticalAlign:-2, marginRight: 3}}/>{c.sqft.toLocaleString()}</span>
            <span style={{marginLeft:'auto', color:'var(--ink-400)', fontSize:11}}>{new Date(c.soldDate).toLocaleDateString('en-US',{month:'short', year:'numeric'})}</span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

window.CompCard = CompCard;
window.CompTable = CompTable;
window.CompGrid = CompGrid;
