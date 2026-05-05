// Shared UI primitives — icons, badges, chips, controls

const Icon = ({ name, size = 16, stroke = 1.75, color = 'currentColor', className = '', style = {} }) => {
  const s = size, sw = stroke;
  const common = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round', className, style };
  const paths = {
    search:    <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    map:       <><path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2Z"/><path d="M9 3v16M15 5v16"/></>,
    grid:      <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    table:     <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16M15 4v16"/></>,
    home:      <><path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10"/></>,
    bed:       <><path d="M3 18v-7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v7"/><path d="M3 14h18"/><path d="M3 21v-3M21 21v-3"/></>,
    bath:      <><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z"/><path d="M6 12V6a2 2 0 0 1 2-2h2"/><path d="M10 6h2"/><path d="M5 21l1-2M19 21l-1-2"/></>,
    ruler:     <><path d="M3 17 17 3l4 4L7 21l-4-4Z"/><path d="m7.5 12.5 2 2M11 9l2 2M14.5 5.5l2 2"/></>,
    calendar:  <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></>,
    pin:       <><path d="M12 22s7-7.5 7-12a7 7 0 0 0-14 0c0 4.5 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></>,
    info:      <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/></>,
    edit:      <><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/></>,
    plus:      <><path d="M12 5v14M5 12h14"/></>,
    x:         <><path d="M6 6l12 12M18 6 6 18"/></>,
    chevDown:  <><path d="m6 9 6 6 6-6"/></>,
    chevUp:    <><path d="m6 15 6-6 6 6"/></>,
    chevRight: <><path d="m9 6 6 6-6 6"/></>,
    chevLeft:  <><path d="m15 6-6 6 6 6"/></>,
    sliders:   <><path d="M4 6h10M18 6h2"/><circle cx="16" cy="6" r="2"/><path d="M4 12h4M12 12h8"/><circle cx="10" cy="12" r="2"/><path d="M4 18h12M20 18h0"/><circle cx="18" cy="18" r="2"/></>,
    share:     <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></>,
    thumbUp:   <><path d="M7 22V11"/><path d="M14 4 13 9h6a2 2 0 0 1 2 2v2l-3 7H7"/><path d="M3 11h4v11H3z"/></>,
    thumbDown: <><path d="M17 2v11"/><path d="M10 20l1-5H5a2 2 0 0 1-2-2v-2l3-7h11"/><path d="M21 13h-4V2h4z"/></>,
    sparkle:   <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></>,
    filter:    <><path d="M3 5h18l-7 9v6l-4-2v-4L3 5Z"/></>,
    layers:    <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/><path d="m3 18 9 5 9-5"/></>,
    target:    <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>,
    trash:     <><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/></>,
    check:     <><path d="m5 12 5 5L20 7"/></>,
    chat:      <><path d="M21 15a4 4 0 0 1-4 4H8l-5 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"/></>,
    expand:    <><path d="M4 14v6h6M20 10V4h-6M14 10l6-6M10 14l-6 6"/></>,
    lock:      <><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></>,
    bookmark:  <><path d="M6 4h12v17l-6-4-6 4V4Z"/></>,
    refresh:   <><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></>,
    image:     <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 16-5-5-9 9"/></>,
    dollar:    <><path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    tag:       <><path d="M20 12 12 4H4v8l8 8 8-8Z"/><circle cx="8" cy="8" r="1.5"/></>,
  };
  return <svg {...common} xmlns="http://www.w3.org/2000/svg">{paths[name]}</svg>;
};

// Source / provenance pill — subtle
const SourceBadge = ({ source }) => {
  const map = {
    MLS:    { bg: 'var(--blue-50)',  fg: 'var(--blue-700)',  br: '#cfe1ff' },
    Public: { bg: 'var(--green-50)', fg: 'var(--green-700)', br: '#bfeacd' },
    County: { bg: 'var(--amber-50)', fg: 'var(--amber-700)', br: '#fbe1aa' },
  };
  const t = map[source] || map.MLS;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 7px', borderRadius: 999, fontSize: 10.5, fontWeight: 600, letterSpacing: 0.2,
      background: t.bg, color: t.fg, border: `1px solid ${t.br}`,
    }}>{source}</span>
  );
};

// Renovation chip — categorical
const RenoChip = ({ level, style = 'pill' }) => {
  const map = {
    'as-is':     { label: 'As-is',         bg: '#fef2f2', fg: '#b91c1c', br: '#fecaca', dot: '#ef4444' },
    'light':     { label: 'Light reno',    bg: '#fff7ed', fg: '#c2410c', br: '#fed7aa', dot: '#fb923c' },
    'medium':    { label: 'Medium reno',   bg: '#fefce8', fg: '#a16207', br: '#fde68a', dot: '#eab308' },
    'renovated': { label: 'Renovated',     bg: '#ecfdf5', fg: '#047857', br: '#bbf7d0', dot: '#10b981' },
  };
  const t = map[level] || map['as-is'];
  if (style === 'dot') {
    return (
      <span style={{display:'inline-flex', alignItems:'center', gap:6, fontSize:12, color:'var(--ink-700)'}}>
        <span style={{width:8, height:8, borderRadius:99, background:t.dot}} />
        {t.label}
      </span>
    );
  }
  if (style === 'bar') {
    const order = ['as-is','light','medium','renovated'];
    const idx = order.indexOf(level);
    return (
      <span style={{display:'inline-flex', alignItems:'center', gap:6}}>
        <span style={{display:'inline-flex', gap:2}}>
          {order.map((k, i) => (
            <span key={k} style={{
              width:14, height:6, borderRadius:2,
              background: i <= idx ? t.dot : '#e5e7eb',
            }}/>
          ))}
        </span>
        <span style={{fontSize:12, color:'var(--ink-700)'}}>{t.label}</span>
      </span>
    );
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 8px', borderRadius: 999, fontSize: 11.5, fontWeight: 600,
      background: t.bg, color: t.fg, border: `1px solid ${t.br}`,
    }}>
      <span style={{width:6, height:6, borderRadius:99, background:t.dot}} />
      {t.label}
    </span>
  );
};

// Photo placeholder — striped with monospace label
const PhotoStub = ({ label = 'photo', height = 120, hue = 210 }) => (
  <div style={{
    height, borderRadius: 8, position: 'relative', overflow: 'hidden',
    background: `repeating-linear-gradient(135deg, oklch(0.92 0.04 ${hue}) 0 8px, oklch(0.94 0.03 ${hue}) 8px 16px)`,
    border: '1px solid var(--ink-100)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <span className="mono" style={{fontSize: 10, color: '#5b6b7d', background: 'rgba(255,255,255,.7)', padding: '2px 6px', borderRadius: 4, letterSpacing: 0.5}}>{label}</span>
  </div>
);

// Generic card
const Card = ({ children, style = {}, padded = true, ...rest }) => (
  <div {...rest} style={{
    background: 'var(--paper)', borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--ink-100)', boxShadow: 'var(--shadow-sm)',
    padding: padded ? 'var(--card-pad)' : 0,
    ...style,
  }}>{children}</div>
);

const Stat = ({ icon, label, value, hint }) => (
  <div style={{display:'flex', flexDirection:'column', gap: 2, minWidth: 0}}>
    <div style={{display:'flex', alignItems:'center', gap:6, color:'var(--ink-500)', fontSize: 11.5, fontWeight:500, textTransform:'uppercase', letterSpacing: .5}}>
      {icon && <Icon name={icon} size={12} />}
      {label}
    </div>
    <div style={{fontSize: 14, color:'var(--ink-900)', fontWeight: 600}}>{value}</div>
    {hint && <div style={{fontSize: 11, color:'var(--ink-400)'}}>{hint}</div>}
  </div>
);

// Segmented control
const Segmented = ({ options, value, onChange, size = 'md' }) => {
  const pad = size === 'sm' ? '5px 10px' : '7px 12px';
  const fs = size === 'sm' ? 12 : 13;
  return (
    <div style={{
      display: 'inline-flex', padding: 3, background: 'var(--ink-100)',
      borderRadius: 999, border: '1px solid var(--ink-100)',
    }}>
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button key={opt.value} onClick={() => onChange(opt.value)} style={{
            padding: pad, fontSize: fs, fontWeight: 600,
            border: 'none', background: active ? '#fff' : 'transparent',
            color: active ? 'var(--ink-900)' : 'var(--ink-500)',
            borderRadius: 999, cursor: 'pointer',
            boxShadow: active ? '0 1px 2px rgba(15,30,50,.08)' : 'none',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            transition: 'all .12s ease',
          }}>
            {opt.icon && <Icon name={opt.icon} size={14} />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

const Btn = ({ children, variant = 'default', size = 'md', icon, onClick, style = {}, ...rest }) => {
  const base = {
    border: '1px solid', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 6,
    transition: 'all .12s ease', whiteSpace: 'nowrap',
  };
  const sz = size === 'sm' ? { padding: '5px 10px', fontSize: 12 }
           : size === 'lg' ? { padding: '10px 18px', fontSize: 14 }
           : { padding: '7px 14px', fontSize: 13 };
  const v = {
    default: { background: '#fff', color: 'var(--ink-900)', borderColor: 'var(--ink-200)' },
    primary: { background: 'var(--ink-900)', color: '#fff', borderColor: 'var(--ink-900)' },
    ghost:   { background: 'transparent', color: 'var(--ink-700)', borderColor: 'transparent' },
    soft:    { background: 'var(--ink-100)', color: 'var(--ink-700)', borderColor: 'transparent' },
    success: { background: 'var(--green-600)', color: '#fff', borderColor: 'var(--green-600)' },
  }[variant];
  return (
    <button onClick={onClick} {...rest} style={{...base, ...sz, ...v, ...style}}>
      {icon && <Icon name={icon} size={size === 'lg' ? 16 : 14}/>}
      {children}
    </button>
  );
};

const Divider = ({ vertical = false, style = {} }) => (
  <div style={{
    background: 'var(--ink-100)',
    ...(vertical ? { width: 1, alignSelf: 'stretch' } : { height: 1, width: '100%' }),
    ...style,
  }}/>
);

const BrickLogo = () => (
  <div style={{display:'flex', alignItems:'center', gap: 8, flexShrink: 0}}>
    <img
      src="./bbb-logo.png"
      alt="brickbybrick AI Real Estate"
      style={{
        width: 148,
        height: 26,
        objectFit: 'contain',
        objectPosition: 'center',
        display: 'block',
      }}
    />
  </div>
);

window.Icon = Icon;
window.SourceBadge = SourceBadge;
window.RenoChip = RenoChip;
window.PhotoStub = PhotoStub;
window.Card = Card;
window.Stat = Stat;
window.Segmented = Segmented;
window.Btn = Btn;
window.Divider = Divider;
window.BrickLogo = BrickLogo;
