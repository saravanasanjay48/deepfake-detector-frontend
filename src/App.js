import { useState, useCallback } from 'react';
import axios from 'axios';

const API = 'https://deepfake-detector-backend-nvkd.onrender.com';

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post(`${API}/predict`, formData);
      setResult(res.data);
    } catch (e) {
      setResult({ error: 'Something went wrong. Is the server running?' });
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:'100vh',background:'#0f0f1a',color:'white',fontFamily:'system-ui',padding:'20px'}}>
      <div style={{maxWidth:'680px',margin:'0 auto'}}>

        <div style={{textAlign:'center',marginBottom:'40px',paddingTop:'20px'}}>
          <div style={{fontSize:'48px',marginBottom:'8px'}}>🔍</div>
          <h1 style={{fontSize:'28px',fontWeight:'700',margin:'0 0 8px',background:'linear-gradient(135deg,#a78bfa,#60a5fa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
            DeepFake Detector
          </h1>
          <p style={{color:'#9ca3af',fontSize:'15px',margin:0}}>
            Upload a face image — AI will tell you if it's real or fake
          </p>
        </div>

        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => document.getElementById('fileInput').click()}
          style={{
            border:`2px dashed ${dragging ? '#a78bfa' : '#374151'}`,
            borderRadius:'16px',
            padding:'40px 20px',
            textAlign:'center',
            cursor:'pointer',
            background: dragging ? 'rgba(167,139,250,0.08)' : 'rgba(255,255,255,0.03)',
            transition:'all 0.2s',
            marginBottom:'20px'
          }}
        >
          <input id="fileInput" type="file" accept="image/*" hidden onChange={(e) => handleFile(e.target.files[0])} />
          {preview ? (
            <img src={preview} alt="preview" style={{maxWidth:'100%',maxHeight:'300px',borderRadius:'12px',objectFit:'contain'}} />
          ) : (
            <>
              <div style={{fontSize:'40px',marginBottom:'12px'}}>📷</div>
              <p style={{color:'#9ca3af',margin:'0 0 4px'}}>Drop an image here, or click to browse</p>
              <p style={{color:'#6b7280',fontSize:'13px',margin:0}}>JPG, PNG, WEBP supported</p>
            </>
          )}
        </div>

        <button
          onClick={analyze}
          disabled={!file || loading}
          style={{
            width:'100%',padding:'14px',borderRadius:'12px',border:'none',
            background: file && !loading ? 'linear-gradient(135deg,#7c3aed,#2563eb)' : '#374151',
            color:'white',fontSize:'16px',fontWeight:'600',
            cursor: file ? 'pointer' : 'not-allowed',
            transition:'all 0.2s',marginBottom:'20px'
          }}
        >
          {loading ? '🔄 Analyzing...' : '🔍 Detect Deepfake'}
        </button>

        {result && !result.error && result.label !== 'unknown' && (
          <div style={{
            background: result.label === 'FAKE' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
            border:`1px solid ${result.label === 'FAKE' ? '#ef4444' : '#22c55e'}`,
            borderRadius:'16px',padding:'24px',textAlign:'center'
          }}>
            <div style={{fontSize:'52px',marginBottom:'8px'}}>{result.label === 'FAKE' ? '⚠️' : '✅'}</div>
            <div style={{fontSize:'32px',fontWeight:'800',color: result.label === 'FAKE' ? '#ef4444' : '#22c55e',marginBottom:'8px'}}>
              {result.label}
            </div>
            <div style={{color:'#d1d5db',marginBottom:'16px'}}>
              Confidence: <strong>{result.confidence}%</strong>
            </div>

            <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap',marginBottom:'16px'}}>
              <div style={{background:'rgba(34,197,94,0.15)',padding:'8px 16px',borderRadius:'8px',fontSize:'14px'}}>
                ✅ Real: {result.real_probability}%
              </div>
              <div style={{background:'rgba(239,68,68,0.15)',padding:'8px 16px',borderRadius:'8px',fontSize:'14px'}}>
                ⚠️ Fake: {result.fake_probability}%
              </div>
            </div>

            {result.analysis && (
              <div style={{borderTop:'1px solid rgba(255,255,255,0.1)',paddingTop:'16px'}}>
                <p style={{color:'#9ca3af',fontSize:'13px',margin:'0 0 10px'}}>
                  Analysis breakdown:
                </p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                  <div style={{background:'rgba(255,255,255,0.05)',padding:'10px',borderRadius:'8px',fontSize:'13px',textAlign:'left'}}>
                    🤖 Deep Learning<br/>
                    <span style={{color:'#a78bfa',fontWeight:'600'}}>{result.analysis.deep_learning}%</span>
                  </div>
                  <div style={{background:'rgba(255,255,255,0.05)',padding:'10px',borderRadius:'8px',fontSize:'13px',textAlign:'left'}}>
                    📊 Frequency Analysis<br/>
                    <span style={{color:'#60a5fa',fontWeight:'600'}}>{result.analysis.frequency}%</span>
                  </div>
                  <div style={{background:'rgba(255,255,255,0.05)',padding:'10px',borderRadius:'8px',fontSize:'13px',textAlign:'left'}}>
                    🔊 Noise Pattern<br/>
                    <span style={{color:'#34d399',fontWeight:'600'}}>{result.analysis.noise}%</span>
                  </div>
                  <div style={{background:'rgba(255,255,255,0.05)',padding:'10px',borderRadius:'8px',fontSize:'13px',textAlign:'left'}}>
                    🔬 ELA Analysis<br/>
                    <span style={{color:'#f87171',fontWeight:'600'}}>{result.analysis.ela}%</span>
                  </div>
                  <div style={{background:'rgba(255,255,255,0.05)',padding:'10px',borderRadius:'8px',fontSize:'13px',textAlign:'left',gridColumn:'span 2'}}>
                    🎨 Texture Consistency<br/>
                    <span style={{color:'#fbbf24',fontWeight:'600'}}>{result.analysis.texture}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {result?.error && (
          <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid #ef4444',borderRadius:'12px',padding:'16px',color:'#fca5a5'}}>
            ❌ {result.error}
          </div>
        )}

        {result?.label === 'unknown' && (
          <div style={{background:'rgba(234,179,8,0.1)',border:'1px solid #eab308',borderRadius:'12px',padding:'16px',color:'#fde047',textAlign:'center'}}>
            😕 {result.result}
          </div>
        )}

        <p style={{color:'#4b5563',textAlign:'center',fontSize:'12px',marginTop:'30px'}}>
          Powered by MTCNN + Xception + ELA + Frequency Analysis · For research purposes only
        </p>
      </div>
    </div>
  );
}