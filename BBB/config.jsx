// Configuration: API keys + active address. Stored in localStorage. Personal
// app, no proxy. Exposes window.BBB_CONFIG and a small <SettingsModal/>.

const CFG_KEYS = {
  gmaps: 'bbb_google_maps_key',
  gemini: 'bbb_gemini_key',
  address: 'bbb_address',
};

const readCfg = () => ({
  googleMapsKey: localStorage.getItem(CFG_KEYS.gmaps) || '',
  geminiKey: localStorage.getItem(CFG_KEYS.gemini) || '',
  address: localStorage.getItem(CFG_KEYS.address) || '',
});

const writeCfg = (next) => {
  if (next.googleMapsKey != null) localStorage.setItem(CFG_KEYS.gmaps, next.googleMapsKey);
  if (next.geminiKey != null) localStorage.setItem(CFG_KEYS.gemini, next.geminiKey);
  if (next.address != null) localStorage.setItem(CFG_KEYS.address, next.address);
};

window.BBB_CONFIG = {
  get: readCfg,
  set: (next) => {
    writeCfg(next);
    window.dispatchEvent(new CustomEvent('bbb:configchanged', { detail: readCfg() }));
  },
  clear: () => {
    Object.values(CFG_KEYS).forEach(k => localStorage.removeItem(k));
    window.dispatchEvent(new CustomEvent('bbb:configchanged', { detail: readCfg() }));
  },
};

const SettingsModal = ({ open, onClose }) => {
  const [cfg, setCfg] = React.useState(readCfg());
  React.useEffect(() => { if (open) setCfg(readCfg()); }, [open]);
  if (!open) return null;

  const save = () => {
    window.BBB_CONFIG.set(cfg);
    onClose();
  };

  const wipe = () => {
    if (window.clearCache) window.clearCache();
    window.BBB_CONFIG.clear();
    setCfg(readCfg());
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(15,30,50,0.45)', backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 520, maxWidth: 'calc(100vw - 32px)', background: '#fff',
        borderRadius: 14, boxShadow: 'var(--shadow-lg)', padding: 20,
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{fontSize: 16, fontWeight: 700}}>Settings</div>
          <button onClick={onClose} style={{
            border:'none', background:'transparent', cursor:'pointer', color:'var(--ink-500)',
          }}>
            <Icon name="x" size={18}/>
          </button>
        </div>

        <Field label="Property address" hint="Used to fetch comps, rent, and repair scope.">
          <input value={cfg.address}
                 onChange={e => setCfg({...cfg, address: e.target.value})}
                 placeholder="1247 Lakewood Dr, Tallahassee, FL 32311"
                 style={inputStyle}/>
        </Field>

        <Field label="Google Maps API key" hint="Maps JavaScript API + Places enabled.">
          <input value={cfg.googleMapsKey}
                 onChange={e => setCfg({...cfg, googleMapsKey: e.target.value})}
                 type="password" placeholder="AIza..."
                 style={inputStyle}/>
        </Field>

        <Field label="Gemini API key" hint="Used with Google Search grounding for live comps + repair costs. Leave blank to use built-in mock + RSMeans fallback.">
          <input value={cfg.geminiKey}
                 onChange={e => setCfg({...cfg, geminiKey: e.target.value})}
                 type="password" placeholder="AIza..."
                 style={inputStyle}/>
        </Field>

        <div style={{display:'flex', gap: 8, justifyContent:'space-between', alignItems:'center', marginTop: 4}}>
          <button onClick={wipe} style={ghostBtn}>Clear cache + keys</button>
          <div style={{display:'flex', gap: 8}}>
            <button onClick={onClose} style={ghostBtn}>Cancel</button>
            <button onClick={save} style={primaryBtn}>Save & reload data</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, hint, children }) => (
  <label style={{display:'flex', flexDirection:'column', gap: 4}}>
    <span style={{fontSize: 12, fontWeight: 600, color: 'var(--ink-700)'}}>{label}</span>
    {children}
    {hint && <span style={{fontSize: 11, color: 'var(--ink-500)'}}>{hint}</span>}
  </label>
);

const inputStyle = {
  width: '100%', padding: '8px 10px',
  border: '1px solid var(--ink-200)', borderRadius: 8, fontSize: 13,
  background: '#fff', fontFamily: 'inherit',
};

const ghostBtn = {
  padding: '7px 12px', border: '1px solid var(--ink-200)', background: '#fff',
  borderRadius: 8, fontSize: 13, fontWeight: 600, color: 'var(--ink-700)', cursor: 'pointer',
};

const primaryBtn = {
  padding: '7px 14px', border: 'none', background: 'var(--ink-900)',
  borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer',
};

window.SettingsModal = SettingsModal;
