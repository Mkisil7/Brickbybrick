// Subject property panel (top of right column)

const SubjectPanel = ({ subject }) => (
  <Card style={{padding: 16}}>
    <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12}}>
      <div style={{minWidth: 0, flex: 1}}>
        <div style={{display:'flex', alignItems:'center', gap: 8, fontSize: 11, color: 'var(--ink-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5}}>
          <Icon name="target" size={12}/>
          Subject Property
          <span style={{fontSize: 10, fontWeight: 600, color: 'var(--green-700)', background:'var(--green-50)', padding:'1px 6px', borderRadius: 99, border: '1px solid #bbf7d0'}}>Live</span>
        </div>
        <div style={{display:'flex', alignItems:'baseline', gap: 8, marginTop: 6}}>
          <h2 style={{margin: 0, fontSize: 22, fontWeight: 700, color:'var(--ink-900)', letterSpacing: -0.2}}>{subject.address}</h2>
        </div>
        <div style={{fontSize: 13, color: 'var(--ink-500)', marginTop: 2}}>{subject.city}</div>
      </div>
      <div style={{display:'flex', gap: 6}}>
        <Btn size="sm" icon="bookmark">Save</Btn>
        <Btn size="sm" icon="share" variant="default">Share</Btn>
      </div>
    </div>

    {/* Photo strip */}
    <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 6, marginTop: 14, height: 130}}>
      <PhotoStub label="exterior" height="100%" hue={200}/>
      <div style={{display:'grid', gridTemplateRows:'1fr 1fr', gap: 6}}>
        <PhotoStub label="kitchen" height="100%" hue={40}/>
        <PhotoStub label="living" height="100%" hue={150}/>
      </div>
      <div style={{display:'grid', gridTemplateRows:'1fr 1fr', gap: 6}}>
        <PhotoStub label="bath" height="100%" hue={210}/>
        <div style={{position:'relative'}}>
          <PhotoStub label="+12" height="100%" hue={280}/>
          <div style={{position:'absolute', inset: 0, background:'rgba(11,26,43,.55)', borderRadius: 8, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:600, fontSize: 13}}>+12 photos</div>
        </div>
      </div>
    </div>

    {/* Facts */}
    <div style={{display:'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--ink-100)'}}>
      <Stat icon="bed"   label="Beds"   value={subject.beds}/>
      <Stat icon="bath"  label="Baths"  value={subject.baths}/>
      <Stat icon="ruler" label="Sqft"   value={subject.sqft.toLocaleString()}/>
      <Stat icon="map"   label="Lot"    value={`${subject.lot.toLocaleString()} sqft`}/>
      <Stat icon="home"  label="Built"  value={subject.yearBuilt}/>
    </div>

    {/* Parcel meta */}
    <div style={{display:'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 12, padding: '10px 12px', background:'var(--ink-50)', borderRadius: 8, fontSize: 11.5}}>
      <div>
        <div style={{color:'var(--ink-400)', textTransform:'uppercase', letterSpacing: .4, fontWeight:600, fontSize: 10}}>APN</div>
        <div className="mono" style={{color:'var(--ink-700)', fontSize: 11, marginTop: 2}}>{subject.apn}</div>
      </div>
      <div>
        <div style={{color:'var(--ink-400)', textTransform:'uppercase', letterSpacing: .4, fontWeight:600, fontSize: 10}}>Zoning</div>
        <div style={{color:'var(--ink-700)', fontWeight:600, marginTop: 2}}>{subject.zoning}</div>
      </div>
      <div>
        <div style={{color:'var(--ink-400)', textTransform:'uppercase', letterSpacing: .4, fontWeight:600, fontSize: 10}}>HOA Fee</div>
        <div style={{color:'var(--ink-700)', fontWeight:600, marginTop: 2}}>{subject.hoaFee}</div>
      </div>
      <div>
        <div style={{color:'var(--ink-400)', textTransform:'uppercase', letterSpacing: .4, fontWeight:600, fontSize: 10}}>HOA Freq.</div>
        <div style={{color:'var(--ink-700)', fontWeight:600, marginTop: 2}}>{subject.hoaFreq}</div>
      </div>
    </div>

    <div style={{marginTop: 10, fontSize: 11, color:'var(--ink-400)', display:'flex', alignItems:'center', gap: 6}}>
      <Icon name="info" size={11}/>
      Parcel: {subject.parcel.length > 60 ? subject.parcel.slice(0, 58) + '…' : subject.parcel}
    </div>
  </Card>
);

window.SubjectPanel = SubjectPanel;
