/* Scope-local app assets. GGUF files remain in wllama's own verified cache. */
const CACHE='minicpm-appliance-v1';
const BASE=new URL('./',self.location.href);
const SHELL=['./','./index.html','./manifest.webmanifest','./icon.svg'].map(p=>new URL(p,BASE).href);
const CDN='https://cdn.jsdelivr.net/npm/';
const RUNTIME=[CDN+'@wllama/wllama@3.6.1/esm/index.js',CDN+'@wllama/wllama@3.6.1/src/wasm/wllama.wasm',CDN+'@wllama/wllama-compat@3.6.1/wasm/wllama.js',CDN+'@wllama/wllama-compat@3.6.1/wasm/wllama.wasm'];
const PDF=[CDN+'pdfjs-dist@4.10.38/build/pdf.mjs',CDN+'pdfjs-dist@4.10.38/build/pdf.worker.mjs'];
const LOCK=new URL('./__network_lock__',BASE).href;
let lockState;
async function isLocked(){if(lockState===undefined)lockState=!!await (await caches.open(CACHE)).match(LOCK);return lockState}
self.addEventListener('install',e=>e.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(SHELL)})()));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  if(!/^https?:/.test(e.request.url))return;
  e.respondWith((async()=>{
    const cache=await caches.open(CACHE),cached=await cache.match(e.request);
    if(await isLocked())return cached||new Response('Network blocked by Local AI Appliance',{status:503});
    if(SHELL.includes(e.request.url)){
      try{const fresh=await fetch(e.request);if(fresh.ok){await cache.put(e.request,fresh.clone());return fresh}return cached||fresh}catch(error){if(cached)return cached;throw error}
    }
    if(cached)return cached;
    const response=await fetch(e.request);
    if(e.request.method==='GET'&&response.ok&&[...SHELL,...RUNTIME,...PDF].includes(e.request.url))await cache.put(e.request,response.clone());
    return response;
  })());
});
self.addEventListener('message',e=>{
  e.waitUntil((async()=>{try{
    const cache=await caches.open(CACHE);
    if(e.data.type==='LOCK'){
      // Commit marker before acknowledging; survive service-worker eviction/restart.
      if(e.data.locked){await cache.put(LOCK,new Response('locked'));lockState=true}else{await cache.delete(LOCK);lockState=false}
      e.ports[0]?.postMessage({locked:lockState});
    }else if(e.data.type==='PREPARE'){
      if(await isLocked())throw Error('通信遮断を解除してから資産を準備してください');
      for(const url of [...SHELL,...RUNTIME,...PDF])if(!await cache.match(url)){const response=await fetch(url,{mode:'cors'});if(!response.ok)throw Error('資産取得に失敗: '+url);await cache.put(url,response)}
      e.ports[0]?.postMessage({ok:true});
    }else if(e.data.type==='STATUS'){
      const has=async urls=>(await Promise.all(urls.map(u=>cache.match(u)))).every(Boolean);
      e.ports[0]?.postMessage({locked:await isLocked(),shell:await has(SHELL),runtime:await has(RUNTIME),pdf:await has(PDF)});
    }
  }catch(error){e.ports[0]?.postMessage({error:error.message})}})());
});
