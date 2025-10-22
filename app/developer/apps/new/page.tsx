'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

type Form = {
  name: string;
  summary: string;
  description: string;
  category: string;
  price: number;
  targetDevices: string[];
  permissions: string[];
  minApiLevel: number;
  websiteUrl?: string;
  privacyPolicyUrl?: string;
  supportEmail?: string;
};

const CATEGORIES = ['GAMES','EDUCATION','PRODUCTIVITY','ENTERTAINMENT','SOCIAL','UTILITIES','MEDICAL','FITNESS','ADVENTURE','SIMULATION'];
const DEVICES = ['Quest 2','Quest 3','Quest Pro','Android Phone'];
const PERMS = ['INTERNET','CAMERA','MICROPHONE','STORAGE','BLUETOOTH','VIBRATE','WAKE_LOCK'];

export default function NewAppSubmission() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Form>({
    name: '', summary: '', description: '', category: '', price: 0,
    targetDevices: [], permissions: [], minApiLevel: 29,
    websiteUrl: '', privacyPolicyUrl: '', supportEmail: '',
  });

  const [files, setFiles] = useState<{
    apk: File|null;
    icon: File|null;
    screenshots: File[];
    heroImage: File|null;
    trailer: File|null;
  }>({ apk: null, icon: null, screenshots: [], heroImage: null, trailer: null });

  const [progress, setProgress] = useState(0);

  const validS1 = useMemo(()=> form.name && form.summary && form.description && form.category, [form]);
  const validS2 = useMemo(()=> form.targetDevices.length > 0 && form.minApiLevel >= 23, [form]);
  const validS3 = useMemo(()=> !!files.apk && !!files.icon && files.screenshots.length >= 3, [files]);

  const onFile = (key: keyof typeof files, list: FileList|null) => {
    if (!list) return;
    if (key === 'screenshots') {
      setFiles(v => ({ ...v, screenshots: Array.from(list).slice(0,10) }));
    } else {
      setFiles(v => ({ ...v, [key]: list[0] } as any));
    }
  };

  const submit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, Array.isArray(v) ? JSON.stringify(v) : String(v)));
      if (files.apk) fd.append('apk', files.apk);
      if (files.icon) fd.append('icon', files.icon);
      if (files.heroImage) fd.append('heroImage', files.heroImage);
      if (files.trailer) fd.append('trailer', files.trailer);
      files.screenshots.forEach((s,i)=>fd.append(`screenshot_${i}`, s));

      const res = await fetch('/api/developer/apps', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setProgress(100);
      router.push(`/developer/apps/${data.id}/success`);
    } catch (e) {
      console.error(e);
      alert('Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const Step = ({ n, label }: { n: number; label: string }) => (
    <div className="stepper-item">
      <div className={`stepper-dot ${step === n ? 'current' : step > n ? 'done' : 'todo'}`}>
        {step > n ? '✓' : n}
      </div>
      <div className="helper">{label}</div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div>
          <h1 style={{fontSize:22, fontWeight:800, margin:0}}>Submit new app</h1>
          <div className="helper">Provide details, upload binaries & assets, then submit for review.</div>
        </div>
      </div>

      {/* Stepper */}
      <div className="stepper">
        <Step n={1} label="Basic Info" />
        <div className={`stepper-line ${step>1 ? 'done':''}`} />
        <Step n={2} label="Technical" />
        <div className={`stepper-line ${step>2 ? 'done':''}`} />
        <Step n={3} label="Uploads" />
        <div className={`stepper-line ${step>3 ? 'done':''}`} />
        <Step n={4} label="Review" />
      </div>

      <div className="card">
        <div className="card-body space-y-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="label">App Name *</label>
                <input className="input" value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))} />
              </div>
              <div>
                <label className="label">Short Summary * (80 chars)</label>
                <input className="input" maxLength={80} value={form.summary} onChange={e=>setForm(v=>({...v,summary:e.target.value}))} />
                <div className="helper">{form.summary.length}/80</div>
              </div>
              <div>
                <label className="label">Full Description *</label>
                <textarea className="textarea" rows={6} value={form.description} onChange={e=>setForm(v=>({...v,description:e.target.value}))} />
              </div>
              <div className="row" style={{flexWrap:'wrap'}}>
                <div style={{flex:'1 1 220px'}}>
                  <label className="label">Category *</label>
                  <select className="select" value={form.category} onChange={e=>setForm(v=>({...v,category:e.target.value}))}>
                    <option value="">Select…</option>
                    {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{flex:'1 1 220px'}}>
                  <label className="label">Price (USD)</label>
                  <input type="number" step="0.01" min="0" className="input"
                         value={form.price} onChange={e=>setForm(v=>({...v,price:parseFloat(e.target.value)||0}))} />
                </div>
              </div>
              <div className="row-end">
                <button disabled={!validS1} onClick={()=>setStep(2)} className="btn-primary">Next</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="label">Target Devices *</label>
                <div className="row" style={{flexWrap:'wrap'}}>
                  {DEVICES.map(d => (
                    <label key={d} style={{display:'flex', alignItems:'center', gap:8, marginRight:12}}>
                      <input
                        type="checkbox"
                        checked={form.targetDevices.includes(d)}
                        onChange={(e)=>{
                          setForm(v=>({
                            ...v,
                            targetDevices: e.target.checked ? [...v.targetDevices, d] : v.targetDevices.filter(x=>x!==d)
                          }));
                        }}
                      />
                      <span style={{fontSize:14}}>{d}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Required Permissions</label>
                <div className="row" style={{flexWrap:'wrap'}}>
                  {PERMS.map(p => (
                    <label key={p} style={{display:'flex', alignItems:'center', gap:8, marginRight:12}}>
                      <input
                        type="checkbox"
                        checked={form.permissions.includes(p)}
                        onChange={(e)=>{
                          setForm(v=>({
                            ...v,
                            permissions: e.target.checked ? [...v.permissions, p] : v.permissions.filter(x=>x!==p)
                          }));
                        }}
                      />
                      <span style={{fontSize:14}}>{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Minimum API Level</label>
                <input type="number" min={23} max={35} className="input"
                       value={form.minApiLevel} onChange={e=>setForm(v=>({...v,minApiLevel:parseInt(e.target.value)}))} />
                <div className="helper">Quest typically requires API ≥ 29.</div>
              </div>

              <div className="row" style={{flexWrap:'wrap'}}>
                <div style={{flex:'1 1 240px'}}>
                  <label className="label">Website URL</label>
                  <input className="input" value={form.websiteUrl} onChange={e=>setForm(v=>({...v,websiteUrl:e.target.value}))} />
                </div>
                <div style={{flex:'1 1 240px'}}>
                  <label className="label">Support Email</label>
                  <input type="email" className="input" value={form.supportEmail} onChange={e=>setForm(v=>({...v,supportEmail:e.target.value}))} />
                </div>
              </div>

              <div className="row" style={{justifyContent:'space-between'}}>
                <button onClick={()=>setStep(1)} className="btn-outline">Back</button>
                <button disabled={!validS2} onClick={()=>setStep(3)} className="btn-primary">Next</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="upload">
                <div className="label">APK File * (Max 1 GB)</div>
                <input type="file" accept=".apk" onChange={e=>onFile('apk', e.target.files)} />
                {files.apk && <div className="helper" style={{marginTop:6}}>✓ {files.apk.name}</div>}
              </div>

              <div className="upload">
                <div className="label">App Icon * (512×512)</div>
                <input type="file" accept="image/*" onChange={e=>onFile('icon', e.target.files)} />
              </div>

              <div className="upload">
                <div className="label">Screenshots * (≥3, ≤10)</div>
                <input type="file" accept="image/*" multiple onChange={e=>onFile('screenshots', e.target.files)} />
                {files.screenshots.length>0 && (
                  <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:8, marginTop:10}}>
                    {files.screenshots.map((f,i)=>(<img key={i} src={URL.createObjectURL(f)} style={{width:'100%', height:80, objectFit:'cover', borderRadius:10}} />))}
                  </div>
                )}
              </div>

              <div className="upload">
                <div className="label">Hero Banner (1920×1080) — optional</div>
                <input type="file" accept="image/*" onChange={e=>onFile('heroImage', e.target.files)} />
              </div>

              <div className="upload">
                <div className="label">Trailer (MP4 ≤ 100 MB) — optional</div>
                <input type="file" accept="video/mp4" onChange={e=>onFile('trailer', e.target.files)} />
              </div>

              {!!progress && (
                <div className="space-y-6">
                  <div className="progress"><span style={{ width: `${progress}%` }} /></div>
                  <div className="helper">{progress.toFixed(0)}% uploaded</div>
                </div>
              )}

              <div className="row" style={{justifyContent:'space-between'}}>
                <button onClick={()=>setStep(2)} className="btn-outline">Back</button>
                <button disabled={!validS3 || loading} onClick={()=>setStep(4)} className="btn-primary">
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="helper" style={{fontWeight:700}}>Review</div>
              <div style={{display:'grid', gap:10, gridTemplateColumns:'repeat(2, minmax(0,1fr))'}}>
                <div><div className="helper">Name</div><div style={{fontWeight:600}}>{form.name}</div></div>
                <div><div className="helper">Category</div><div style={{fontWeight:600}}>{form.category}</div></div>
                <div><div className="helper">Price</div><div style={{fontWeight:600}}>${form.price.toFixed(2)}</div></div>
                <div><div className="helper">Target Devices</div><div style={{fontWeight:600}}>{form.targetDevices.join(', ')}</div></div>
                <div style={{gridColumn:'1 / -1'}}>
                  <div className="helper">Summary</div>
                  <div style={{fontWeight:600}}>{form.summary}</div>
                </div>
              </div>
              <label style={{display:'inline-flex', alignItems:'center', gap:8}}>
                <input type="checkbox" required />
                <span className="helper" style={{color:'#111827'}}>I agree to the Developer Terms & Content Guidelines.</span>
              </label>
              <div className="row" style={{justifyContent:'space-between'}}>
                <button onClick={()=>setStep(3)} className="btn-outline">Back</button>
                <button onClick={submit} disabled={loading} className="btn-primary">{loading ? 'Submitting…' : 'Submit for review'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
