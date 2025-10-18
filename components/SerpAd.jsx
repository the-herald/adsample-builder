const domainFromURL = (u) => {
  try { return new URL(u || '').hostname.replace(/^www\./,''); } catch { return ''; }
};
const resolveDomain = (ad) => (ad.dm || '').replace(/^www\./,'') || domainFromURL(ad.u) || 'example.com';
const heads3 = (ad) => (ad.h || []).slice(0, 3);
const joinDot = (arr) => arr.join(' \u00B7 ');

export function SerpAd({ ad }) {
  const domain = resolveDomain(ad);
  const title = heads3(ad).length ? heads3(ad).join(' | ') : 'Add a headline…';

  const D1 = (ad.d && ad.d[0]) || '';
  const D2 = (ad.d && ad.d[1]) || '';
  const descBase = D2 ? `${D1} ${D2}` : D1;

  const calls = (ad.c || []).slice(0, 4);
  const callsTxt = calls.length ? ` ${joinDot(calls)}` : '';

  let snHead = '', snVals = [];
  if (ad.msv && ad.msv.length) {
    snHead = ad.msv[0].h || 'Services';
    snVals = (ad.msv[0].v || []).slice(0, 4);
  } else if (ad.sv && ad.sv.length) {
    snHead = ad.sh || 'Services';
    snVals = ad.sv.slice(0, 4);
  }
  const snipPart = snVals.length ? ` — ${snHead}: ${joinDot(snVals)}` : '';
  const fullPara = `${descBase}${callsTxt}${snipPart}`;

  const path = [ad.p1, ad.p2].filter(Boolean).join('/');

  return (
    <article className="serp">
      <div className="sponsored">Sponsored</div>
      <div className="result">
        <div className="favicon" aria-hidden />
        <div className="site">{domain}</div>
        <div className="path">{domain}{path?`/${path}`:''}</div>
        <a className="title" href="#">{title}</a>
        <div className="desc">{fullPara}</div>
        {(ad.sl && ad.sl.length) ? (
          <div className="sl">
            {ad.sl.slice(0,4).map((s, i) => <a key={i} href="#">{s.t}</a>)}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function SerpDual({ ad }) {
  return (
    <div className="grid">
      <SerpAd ad={ad} />
      <div className="frame"><div style={{border:'none'}} className="serp"><SerpAd ad={ad} /></div></div>
    </div>
  );
}
