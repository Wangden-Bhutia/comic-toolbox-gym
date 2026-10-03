// Run: node tools/build-sw.js  -> rewrites VERSION and ASSETS in sw.js (precache everything needed offline)
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.join(__dirname,'..');
const skip=new Set(['screenshots','tools','node_modules','.git']);
const files=[];
(function walk(d,rel){for(const n of fs.readdirSync(d)){if(skip.has(n)&&rel==='')continue;const p=path.join(d,n),r=rel?rel+'/'+n:n;
  if(fs.statSync(p).isDirectory())walk(p,r);else if(!/^(README\.md|sw\.js)$/.test(n)&&!n.endsWith('.zip'))files.push(r);}})(root,'');
files.sort();
const h=crypto.createHash('sha1');files.forEach(f=>{h.update(f);h.update(fs.readFileSync(path.join(root,f)));});
const ver='ctg-'+h.digest('hex').slice(0,10);
const assets=['./'].concat(files);
let sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
sw=sw.replace(/const VERSION = '.*?';/,`const VERSION = '${ver}';`).replace(/const ASSETS = \[[\s\S]*?\];/,'const ASSETS = '+JSON.stringify(assets,null,2)+';');
fs.writeFileSync(path.join(root,'sw.js'),sw);console.log(ver,assets.length+' assets');
