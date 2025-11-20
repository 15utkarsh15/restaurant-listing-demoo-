const http = require('http');
const port = 5175;
const imgs = ['r1.jpg','r2.jpg','r3.jpg','r4.jpg','r5.jpg'];

function check(img){
  return new Promise(resolve=>{
    const req = http.get({host:'localhost', port, path:'/images/'+img, timeout:3000}, res=>{
      console.log(`/images/${img} -> ${res.statusCode} ${res.headers['content-type']||''}`);
      res.resume();
      resolve();
    }).on('error', e=>{
      console.log(`/images/${img} -> ERROR ${e.message}`);
      resolve();
    }).on('timeout', ()=>{
      console.log(`/images/${img} -> TIMEOUT`);
      resolve();
    });
  });
}

(async ()=>{
  for(const img of imgs){ await check(img); }
  process.exit(0);
})();
