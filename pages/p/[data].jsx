import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { LZ } from '../../lib/lz';
import { SerpDual } from '../../components/SerpAd';

type Payload = { ads?: any[] };

function decode(raw?: string): Payload {
  if (!raw) return {};
  try {
    const j = LZ.decompressFromEncodedURIComponent(raw);
    if (j) return JSON.parse(j);
  } catch {}
  try { return JSON.parse(decodeURIComponent(raw)); } catch {}
  return {};
}

export default function Preview(){
  const { query } = useRouter();
  const [idx, setIdx] = useState(0);

  const P = useMemo(()=>decode(query.data as string), [query.data]);
  const ads = P.ads || [];
  const ad  = ads[idx] || {};

  useEffect(()=>{ setIdx(0); }, [query.data]);

  return (
    <div className="wrap">
      <div className="header">
        <div className="brand">Ad Preview</div>
        <Link className="btn" href="/" aria-label="Bulk">Bulk Input</Link>
      </div>

      {ads.length>1 && (
        <div className="adpicker">
          {ads.map((a, i)=>(
            <button key={i} className={`chip ${i===idx?'active':''}`} onClick={()=>setIdx(i)}>
              {a.title || `Ad ${i+1}`}
            </button>
          ))}
        </div>
      )}

      <SerpDual ad={ad} />

      <div className="panel">
        <div className="hsplit">
          <div>
            <h3>Headlines</h3>
            <ul>{(ad.h||[]).map((x:string,i:number)=><li key={i}>{x}</li>)}</ul>

            <h3>Descriptions</h3>
            <ul>{(ad.d||[]).map((x:string,i:number)=><li key={i}>{x}</li>)}</ul>

            <h3>Callouts</h3>
            <ul>{(ad.c||[]).map((x:string,i:number)=><li key={i}>{x}</li>)}</ul>

            <h3>Structured Snippets</h3>
            {(ad.msv||[]).map((s:any,i:number)=>(
              <div key={i}><b>{s.h}:</b> <span className="mono">{(s.v||[]).join(' · ')}</span></div>
            ))}

            <h3>Display Paths</h3>
            <div className="mono">/{ad.p1}{ad.p1 && ad.p2?'/':''}{ad.p2||''}</div>

            <h3>Search Query</h3>
            <div className="mono">{ad.q||''}</div>

            <h3>Domain</h3>
            <div className="mono">{ad.dm||''}</div>

            <h3>Landing Page</h3>
            <div className="mono">{ad.u||''}</div>
          </div>
          <div>
            <h3>Images</h3>
            <p className="mono">N/A in this clone, but easy to add.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

