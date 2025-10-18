import { useMemo, useState } from 'react';
import Link from 'next/link';
import { LZ } from '../lib/lz';

const lines = (v) => v.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);

function parseBlock(txt){
  const get = (label) => {
    const m = txt.match(new RegExp(`^${label}\\s*:\\s*([\\s\\S]*?)(?:\\n[A-Z][^:\\n]*:|$)`,'mi'));
    return m ? m[1].trim() : '';
  };
  const out = { title:'', q:'', dm:'', u:'', p1:'', p2:'', h:[], d:[], c:[], msv:[] };
  out.title = get('Title');
  out.q     = get('Search');
  out.dm    = get('Domain').replace(/^https?:\/\//,'').replace(/^www\./,'');
  out.u     = get('URL');
  const paths = get('Paths');
  if (paths.includes('|')) { const [a,b]=paths.split('|').map(s=>s.trim()); out.p1=a||''; out.p2=b||''; }
  else if (paths) out.p1=paths.trim();

  const heads = get('Heads'); if (heads) out.h = lines(heads);
  const descs = get('Descs'); if (descs) out.d = lines(descs);
  const calls = get('Callouts'); if (calls) out.c = lines(calls);

  for(let i=1;i<=4;i++){
    const sn = get(`Snip${i}`);
    if(!sn) continue;
    const arr = lines(sn);
    if(!arr.length) continue;
    const header = arr.shift();
    out.msv.push({ h: header, v: arr });
  }
  return out;
}

function splitBlocks(raw){
  return raw.split(/\n-{3,}\n|(?=^Title\s*:)/gmi).map(s=>s.trim()).filter(Boolean);
}

export default function Home(){
  const [bulk, setBulk] = useState('');

  const payload = useMemo(()=>{
    const blocks = splitBlocks(bulk);
    const ads = blocks.map(parseBlock).filter(a => (a.h?.length || a.d?.length));
    return { ads };
  }, [bulk]);

  const hash = LZ.compressToEncodedURIComponent(JSON.stringify(payload));
  const url  = `/p/${hash}`;

  return (
    <div className="wrap">
      <div className="header">
        <div className="brand">Karooya-style RSA Preview (Bulk)</div>
        <Link className="btn" href={url} target="_blank">Open Preview</Link>
      </div>

      <div className="panel">
        <label>Bulk Ad Copy</label>
        <textarea rows={24} value={bulk} onChange={e=>setBulk(e.target.value)} placeholder={`Title: Sailboat Slips
Search: sailboat slips for rent
Domain: example.com
Paths: sailboat | slips
Heads:
Sailboat Slips for Rent
Sailboat Slips Near You
Reserve Your Sailboat Slip Today
Secure Dockage for Sailboats
Monthly & Annual Slip Options
Trusted Marina for Sailboats
Descs:
Dock your sailboat safely with premium slip rentals available year-round.
Enjoy easy access, secure facilities, and calm waters for your sailboat.
Callouts:
Protected Harbor
Deep Water Access
Electric & Water Hookups
Onsite Security
Snip1:
Amenities
WiFi
Water & Power
Restrooms
Parking
---
(Next ad...)`}/>
      </div>

      <div className="panel">
        <label>Share URL (compressed)</label>
        <div className="mono">{url}</div>
      </div>
    </div>
  );
}
