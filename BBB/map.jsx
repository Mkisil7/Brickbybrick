// MapView. If a Google Maps key is configured we render a real Google Map with
// AdvancedMarkerElement pins for each comp + subject. Otherwise we fall back
// to the original stylized SVG so the app still renders without a key.

const RENO_COLOR = {
  'as-is': '#ef4444',
  'light': '#fb923c',
  'medium': '#eab308',
  'renovated': '#10b981',
};

const MapView = ({ subject, comps, selectedId, onHover, onSelect, hoveredId }) => {
  const cfg = (window.BBB_CONFIG?.get?.() || {});
  const hasKey = !!cfg.googleMapsKey;
  return hasKey
    ? <GoogleMapView subject={subject} comps={comps}
                     selectedId={selectedId} hoveredId={hoveredId}
                     onHover={onHover} onSelect={onSelect}/>
    : <SvgMapView subject={subject} comps={comps}
                  selectedId={selectedId} hoveredId={hoveredId}
                  onHover={onHover} onSelect={onSelect}/>;
};

// --- Google Maps implementation ---

const GoogleMapView = ({ subject, comps, selectedId, hoveredId, onHover, onSelect }) => {
  const mapEl = React.useRef(null);
  const mapRef = React.useRef(null);
  const markersRef = React.useRef(new Map()); // id -> AdvancedMarkerElement
  const [ready, setReady] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Boot the map once.
  React.useEffect(() => {
    let cancelled = false;
    const cfg = window.BBB_CONFIG.get();
    window.loadGoogleMaps(cfg.googleMapsKey).then(async (maps) => {
      if (cancelled || !mapEl.current) return;
      const { Map } = await maps.importLibrary('maps');
      const map = new Map(mapEl.current, {
        center: { lat: subject.lat, lng: subject.lng },
        zoom: 14,
        mapId: 'DEMO_MAP_ID',
        disableDefaultUI: true,
        clickableIcons: false,
        gestureHandling: 'greedy',
      });
      mapRef.current = map;
      setReady(true);
    }).catch(err => {
      console.warn('[bbb] map load failed:', err);
      setError(err);
    });
    return () => { cancelled = true; };
  }, []);

  // Re-center when subject changes.
  React.useEffect(() => {
    if (!ready || !mapRef.current) return;
    const maps = window.google?.maps;
    if (!maps || !subject?.lat || !subject?.lng) return;
    const bounds = new maps.LatLngBounds();
    bounds.extend({ lat: subject.lat, lng: subject.lng });
    comps.forEach(c => {
      if (c.lat && c.lng) bounds.extend({ lat: c.lat, lng: c.lng });
    });
    mapRef.current.fitBounds(bounds, 72);
    if (comps.length === 0) mapRef.current.setZoom(14);
  }, [ready, subject.lat, subject.lng, comps.map(c => `${c.id}:${c.lat}:${c.lng}`).join('|')]);

  // Sync markers with comps + subject.
  React.useEffect(() => {
    if (!ready || !mapRef.current || !window.google?.maps?.marker) return;

    const { AdvancedMarkerElement } = window.google.maps.marker;

    // Remove markers that aren't in the new set.
    const wantedIds = new Set(['__subject', ...comps.map(c => c.id)]);
    for (const [id, m] of markersRef.current) {
      if (!wantedIds.has(id)) {
        m.map = null;
        markersRef.current.delete(id);
      }
    }

    // Subject marker
    {
      const id = '__subject';
      const el = buildSubjectPin(subject);
      let m = markersRef.current.get(id);
      if (!m) {
        m = new AdvancedMarkerElement({
          map: mapRef.current,
          position: { lat: subject.lat, lng: subject.lng },
          content: el,
          zIndex: 9999,
        });
        markersRef.current.set(id, m);
      } else {
        m.position = { lat: subject.lat, lng: subject.lng };
        m.content = el;
      }
    }

    // Comp markers
    comps.forEach(c => {
      const isSelected = c.selected;
      const isHover = hoveredId === c.id;
      const isFocus = selectedId === c.id;
      const el = buildCompPin(c, { isSelected, isHover, isFocus });
      el.addEventListener('mouseenter', () => onHover && onHover(c.id));
      el.addEventListener('mouseleave', () => onHover && onHover(null));
      el.addEventListener('click', () => onSelect && onSelect(c.id));

      let m = markersRef.current.get(c.id);
      if (!m) {
        m = new AdvancedMarkerElement({
          map: mapRef.current,
          position: { lat: c.lat, lng: c.lng },
          content: el,
          zIndex: isFocus || isHover ? 100 : 10,
        });
        markersRef.current.set(c.id, m);
      } else {
        m.position = { lat: c.lat, lng: c.lng };
        m.content = el;
        m.zIndex = isFocus || isHover ? 100 : 10;
      }
    });
  }, [ready, comps, subject, hoveredId, selectedId]);

  const zoomBy = (delta) => {
    const m = mapRef.current;
    if (m) m.setZoom((m.getZoom() || 14) + delta);
  };
  const cycleLayer = () => {
    const m = mapRef.current;
    if (!m) return;
    const order = ['roadmap', 'hybrid', 'satellite', 'terrain'];
    const cur = m.getMapTypeId() || 'roadmap';
    m.setMapTypeId(order[(order.indexOf(cur) + 1) % order.length]);
  };

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      borderRadius: 12, overflow: 'hidden',
      border: '1px solid var(--ink-100)',
      background: '#eaf3ee',
    }}>
      <div ref={mapEl} style={{position:'absolute', inset: 0}}/>

      {error && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--ink-500)', fontSize: 13, padding: 16, textAlign: 'center',
        }}>
          Map failed to load. Check your Google Maps API key in Settings.
        </div>
      )}

      <div style={{
        position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 4,
        background: '#fff', borderRadius: 8, boxShadow: 'var(--shadow-md)', padding: 4, zIndex: 5,
      }}>
        <button style={mapBtn} data-tip="Zoom in" onClick={() => zoomBy(1)}><Icon name="plus" size={16}/></button>
        <button style={mapBtn} data-tip="Zoom out" onClick={() => zoomBy(-1)}><Icon name="chevDown" size={16}/></button>
        <div style={{height: 1, background: 'var(--ink-100)', margin: '2px 4px'}}/>
        <button style={mapBtn} data-tip="Layers" onClick={cycleLayer}><Icon name="layers" size={16}/></button>
      </div>

      <div style={{
        position: 'absolute', bottom: 12, left: 12, zIndex: 5,
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
    </div>
  );
};

const buildSubjectPin = (subject) => {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'transform: translateY(-12px); display:inline-flex; flex-direction:column; align-items:center; pointer-events:auto;';
  const chip = document.createElement('div');
  chip.style.cssText = `
    padding: 6px 10px; border-radius: 10px;
    background: #0b1a2b; color: #fff;
    font: 700 11px Inter, sans-serif; white-space: nowrap;
    box-shadow: 0 6px 16px rgba(15,30,50,.25);
    display: inline-flex; align-items: center; gap: 6px;
  `;
  chip.innerHTML = `<span style="width:8px;height:8px;border-radius:99px;background:#fff"></span>Subject · ${escapeHtml(subject.address)}`;
  const tail = document.createElement('div');
  tail.style.cssText = 'width:0;height:0;margin-top:-1px;border-left:6px solid transparent;border-right:6px solid transparent;border-top:6px solid #0b1a2b;';
  wrap.appendChild(chip);
  wrap.appendChild(tail);
  return wrap;
};

const buildCompPin = (c, { isSelected, isHover, isFocus }) => {
  const renoColor = RENO_COLOR[c.reno] || '#94a3b8';
  const wrap = document.createElement('div');
  wrap.style.cssText = `cursor: pointer; pointer-events: auto;`;
  const chip = document.createElement('div');
  chip.style.cssText = `
    min-width: 56px; padding: 4px 8px; border-radius: 999px;
    background: ${isSelected ? '#fff' : 'rgba(255,255,255,0.92)'};
    color: #0b1a2b;
    border: 1.5px solid ${isFocus ? '#0b1a2b' : (isSelected ? renoColor : '#cdd6df')};
    box-shadow: ${(isHover || isFocus) ? '0 8px 20px rgba(15,30,50,.18)' : '0 1px 2px rgba(15,30,50,.06)'};
    font: 700 11px Inter, sans-serif; white-space: nowrap;
    display: inline-flex; align-items: center; gap: 5px;
    transition: transform .15s ease;
    transform: ${(isHover || isFocus) ? 'scale(1.06)' : 'scale(1)'};
  `;
  const priceK = Math.round((c.price || 0) / 1000);
  chip.innerHTML = `<span style="width:6px;height:6px;border-radius:99px;background:${renoColor}"></span>$${priceK}k`;
  wrap.appendChild(chip);
  return wrap;
};

const escapeHtml = (s) => String(s || '').replace(/[&<>"']/g, ch => (
  { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]
));

// --- SVG fallback (original implementation) ---

const SvgMapView = ({ subject, comps, selectedId, onHover, onSelect, hoveredId }) => {
  const cx0 = subject.lng, cy0 = subject.lat;
  const spread = 0.04;
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
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{position:'absolute', inset: 0, width:'100%', height:'100%'}}>
        <defs>
          <pattern id="parcels" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="none" />
            <path d="M0 6 L6 0" stroke="rgba(120,140,130,.12)" strokeWidth="0.15"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="#e9efe6"/>
        <rect width="100" height="100" fill="url(#parcels)"/>
        <path d="M 65 12 Q 80 10 84 26 Q 86 38 72 42 Q 58 44 56 28 Q 56 14 65 12 Z" fill="#cfe5d5" opacity="0.7"/>
        <path d="M 8 70 Q 16 62 28 66 Q 40 72 36 84 Q 28 92 14 88 Q 4 82 8 70 Z" fill="#c8dde6" opacity="0.7"/>
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
        <g stroke="#fff" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.9">
          <path d="M 14 -2 L 16 102"/><path d="M 28 -2 L 30 102"/>
          <path d="M 70 -2 L 68 102"/><path d="M 86 -2 L 88 102"/>
          <path d="M -2 36 L 102 38"/><path d="M -2 64 L 102 62"/>
        </g>
        <g stroke="rgba(90,110,100,.18)" strokeWidth="0.12" fill="none">
          {Array.from({length: 14}).map((_, i) => Array.from({length: 14}).map((_, j) => (
            <rect key={`${i}-${j}`} x={4 + i * 7} y={4 + j * 6.5} width="6" height="5" />
          )))}
        </g>
        <text x="20" y="14" fontSize="2.4" fill="#7a8a85" letterSpacing="0.4" fontFamily="Inter, sans-serif" fontWeight="600">LAKEWOOD</text>
        <text x="68" y="92" fontSize="2.0" fill="#7a8a85" letterSpacing="0.3" fontFamily="Inter, sans-serif" fontWeight="500">CAPITAL CIR S</text>
        <text x="58" y="22" fontSize="1.8" fill="#6b8a7a" fontStyle="italic" fontFamily="Inter, sans-serif">Lake Lafayette</text>
        <circle cx={subjectPos.x} cy={subjectPos.y} r="12" fill="none" stroke="#1f3349" strokeWidth="0.15" strokeDasharray="0.6 0.8" opacity="0.4"/>
        <circle cx={subjectPos.x} cy={subjectPos.y} r="22" fill="none" stroke="#1f3349" strokeWidth="0.15" strokeDasharray="0.6 0.8" opacity="0.25"/>
      </svg>

      <div style={{
        position: 'absolute', left: `${subjectPos.x}%`, top: `${subjectPos.y}%`,
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

      {comps.map((c) => {
        const pos = proj(c.lat, c.lng);
        const isSelected = c.selected;
        const isHovered = hoveredId === c.id;
        const isFocus = selectedId === c.id;
        const renoColor = RENO_COLOR[c.reno] || '#94a3b8';
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

      <div style={{
        position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 4,
        background: '#fff', borderRadius: 8, boxShadow: 'var(--shadow-md)', padding: 4,
      }}>
        <button style={mapBtn} data-tip="Zoom in"><Icon name="plus" size={16}/></button>
        <button style={mapBtn} data-tip="Zoom out"><Icon name="chevDown" size={16}/></button>
        <div style={{height: 1, background: 'var(--ink-100)', margin: '2px 4px'}}/>
        <button style={mapBtn} data-tip="Layers"><Icon name="layers" size={16}/></button>
      </div>

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
