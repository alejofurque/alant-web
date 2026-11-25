import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const cli='.npm-cache/_npx/1722e863ebfd623b/node_modules/lighthouse/cli/index.js';
mkdirSync('artifacts/creative-benchmark',{recursive:true});
const results=[];
for(let run=1;run<=3;run++)for(const [variant,port] of [['main',4204],['iteration8',4206],['fixed',4202]]) {
  const output=`artifacts/creative-benchmark/${variant}-${run}.json`;
  const args=[cli,`http://127.0.0.1:${port}/`,'--output=json',`--output-path=${output}`,'--save-assets','--chrome-flags=--headless','--quiet'];
  const p=spawnSync(process.execPath,args,{encoding:'utf8',timeout:180000});
  if(p.status!==0) throw Error(p.stderr||p.error);
  const r=JSON.parse(readFileSync(output));
  const a=r.audits;
  const item={variant,run,date:r.fetchTime,performance:r.categories.performance.score*100,cls:a['cumulative-layout-shift'].numericValue,lcpMs:a['largest-contentful-paint'].numericValue,tbtMs:a['total-blocking-time'].numericValue,fcpMs:a['first-contentful-paint'].numericValue,errors:r.runtimeError??null};
  results.push(item);
  writeFileSync('docs/qa/creative-experience/measurements.json',JSON.stringify({node:process.version,lighthouse:r.lighthouseVersion,userAgent:r.environment.hostUserAgent,settings:r.configSettings,results},null,2));
  console.log(JSON.stringify(item));
}
