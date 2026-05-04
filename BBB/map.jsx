// Stylized vector "map" — Tallahassee neighborhood feel.
// Hand-drawn streets + parcels. Subject is a star, comps are circle pins.

const MapView = ({ subject, comps, selectedId, onHover, onSelect, hoveredId }) => {
  // Project lat/lng -> percentage. Center on subject.
  const cx0 = subject.lng, cy0 = subject.lat;
  const spread = 0.04; // viewport ~5km
  const proj = (lat, lng) => {
    const x = 50 + ((lng - cx0) / spread) * 100;
    const y = 50 - ((lat - cy0) / spread) * 100;
    return { x: Math.max(4, Math.min(96, x)), y: Math.max(6, Math.min(94, y)) };
  };

  const subjectPos = proj(subject.lat, subject.lng);

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      borderRadius: 12, overflow: 'hidden',
      background: 'linear-gradient(180deg, #eaf3ee 0%, #e3eef0 100%)',
      border: '1px solid var(--ink-100)',
    }}>
      {/* Map tiles - vector */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{position:'absolute', inset: 0, width:'100%', height:'100%'}}>
        <defs>
          <pattern id="parcels" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="none" />
            <path d="M0 6 L6 0" stroke="rgba(120,140,130,.12)" strokeWidth="0.15"/>
          </pattern>
        </defs>
        {/* Land tones */}
        <rect width="100" height="100" fill="#e9efe6"/>
        <rect width="100" height="100" fill="url(#parcels)"/>

        {/* Park / lake shapes */}
        <path d="M 65 12 Q 80 10 84 26 Q 86 38 72 42 Q 58 44 56 28 Q 56 14 65 12 Z" fill="#cfe5d5" opacity="0.7"/>
        <path d="M 8 70 Q 16 62 28 66 Q 40 72 36 84 Q 28 92 14 88 Q 4 82 8 70 Z" fill="#c8dde6" opacity="0.7"/>

        {/* Roads — major */}
        <g stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round">
          <path d="M -2 50 Q 30 48 50 52 T 102 50"/>
          <path d="M 50 -2 Q 52 30 48 50 T 50 102"/>
          <path d="M -2 22 Q 30 24 60 18 T 102 30"/>
          <path d="M -2 78 Q 28 72 60 80 T 102 76"/>
        </g>
        <g stroke="#cfd8d3" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeDasharray="0.6 1.2" opacity="0.7">
          <path d="M -2 50 Q 30 48 50 52 T 102 50"/>
          <path d="M 50 -2 Q 52 30 48 50 T 50 102"/>
        </g>
        {/* Roads — minor */}
        <g stroke="#fff" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.9">
          <path d="M 14 -2 L 16 102"/>
          <path d="M 28 -2 L 30 102"/>
          <path d="M 70 -2 L 68 102"/>
          <path d="M 86 -2 L 88 102"/>
          <path d="M -2 36 L 102 38"/>
          <path d="M -2 64 L 102 62"/>
        </g>

        {/* Parcel rectangles - very subtle */}
        <g stroke="rgba(90,110,100,.18)" strokeWidth="0.12" fill="none">
          {Array.from({length: 14}).map((_, i) => Array.from({length: 14}).map((_, j) => (
            <rect key={`${i}-${j}`} x={4 + i * 7} y={4 + j * 6.5} width="6" height="5" />
          )))}
        </g>

        {/* Neighborhood label */}
        <text x="20" y="14" fontSize="2.4" fill="#7a8a85" letterSpacing="0.4" fontFamily="Inter, sans-serif" fontWeight="600">LAKEWOOD</text>
        <text x="68" y="92" fontSize="2.0" fill="#7a8a85" letterSpacing="0.3" fontFamily="Inter, sans-serif" fontWeight="500">CAPITAL CIR S</text>
        <text x="58" y="22" fontSize="1.8" fill="#6b8a7a" fontStyle="italic" fontFamily="Inter, sans-serif">Lake Lafayette</text>

        {/* radius rings */}
        <circle cx={subjectPos.x} cy={subjectPos.y} r="12" fill="none" stroke="#1f3349" strokeWidth="0.15" strokeDasharray="0.6 0.8" opacity="0.4"/>
        <circle cx={subjectPos.x} cy={subjectPos.y} r="22" fill="none" stroke="#1f3349" strokeWidth="0.15" strokeDasharray="0.6 0.8" opacity="0.25"/>
      </svg>

      {/* Subject star */}
      <div style={{
        position: 'absolute',
        left: `${subjectPos.x}%`, top: `${subjectPos.y}%`,
        transform: 'translate(-50%, -100%)', zIndex: 6,
      }}>
        <div style={{
          padding: '6px 10px', borderRadius: 10,
          background: 'var(--ink-900)', color: '#fff',
          fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
          boxShadow: '0 6px 16px rgba(15,30,50,.25)',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          transform: 'translateY(-6px)',
        }}>
          <Icon name="target" size={12}/>
          Subject · {subject.address}
        </div>
        <div style={{
          width: 0, height: 0, margin: '-6px auto 0',
          borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
          borderTop: '6px solid var(--ink-900)',
        }}/>
      </div>

      {/* Comp pins */}
      {comps.map((c, i) => {
        const pos = proj(c.lat, c.lng);
        const isSelected = c.selected;
        const isHovered = hoveredId === c.id;
        const isFocus = selectedId === c.id;
        const renoColor = {
          'as-is': '#ef4444',
          'light': '#fb923c',
          'medium': '#eab308',
          'renovated': '#10b981',
        }[c.reno];
        return (
          <div key={c.id}
               onMouseEnter={() => onHover && onHover(c.id)}
               onMouseLeave={() => onHover && onHover(null)}
               onClick={() => onSelect && onSelect(c.id)}
               style={{
            position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`,
            transform: 'translate(-50%, -50%)',
            cursor: 'pointer', zIndex: isHovered || isFocus ? 10 : 5,
          }}>
            <div style={{
              minWidth: 56, padding: '4px 8px', borderRadius: 999,
              background: isSelected ? '#fff' : 'rgba(255,255,255,0.85)',
              color: 'var(--ink-900)',
              border: `1.5px solid ${isFocus ? 'var(--ink-900)' : isSelected ? renoColor : '#cdd6df'}`,
              boxShadow: (isHovered || isFocus) ? '0 8px 20px rgba(15,30,50,.18)' : 'var(--shadow-sm)',
              fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
              display: 'inline-flex', alignItems: 'center', gap: 5,
              transition: 'all .15s ease',
              transform: (isHovered || isFocus) ? 'scale(1.06)' : 'scale(1)',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: 99,
                background: renoColor,
              }}/>
              {window.fmtMoney(c.price/1000).replace('$','$')}k
            </div>
          </div>
        );
      })}

      {/* Map controls — top right */}
      <div style={{
        position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 4,
        background: '#fff', borderRadius: 8, boxShadow: 'var(--shadow-md)', padding: 4,
      }}>
        <button style={mapBtn} data-tip="Zoom in"><Icon name="plus" size={16}/></button>
        <button style={mapBtn} data-tip="Zoom out"><Icon name="chevDown" size={16}/></button>
        <div style={{height: 1, background: 'var(--ink-100)', margin: '2px 4px'}}/>
        <button style={mapBtn} data-tip="Layers"><Icon name="layers" size={16}/></button>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 12, left: 12,
        background: '#fff', borderRadius: 8, boxShadow: 'var(--shadow-md)',
        padding: '8px 10px', fontSize: 11, color: 'var(--ink-700)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{fontWeight: 700, color: 'var(--ink-900)', fontSize: 10.5, letterSpacing: .5, textTransform:'uppercase'}}>Reno level</span>
        {[['as-is','#ef4444','As-is'], ['light','#fb923c','Light'], ['medium','#eab308','Medium'], ['renovated','#10b981','Renovated']].map(([k,c,l]) => (
          <span key={k} style={{display:'inline-flex', alignItems:'center', gap:4}}>
            <span style={{width:8, height:8, borderRadius:99, background:c}}/>
            {l}
          </span>
        ))}
      </div>

      {/* Scale bar */}
      <div style={{
        position: 'absolute', bottom: 12, right: 12,
        background: 'rgba(255,255,255,0.9)', borderRadius: 6,
        padding: '4px 8px', fontSize: 10, color: 'var(--ink-500)', fontWeight: 600,
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}>
        <div style={{width: 40, height: 3, background: 'var(--ink-700)'}}/>
        0.5 mi
      </div>
    </div>
  );
};

const mapBtn = {
  width: 28, height: 28, border: 'none', background: 'transparent',
  borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  color: 'var(--ink-700)',
};

window.MapView = MapView;
