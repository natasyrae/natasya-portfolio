'use strict';
(() => {
  const canvas=document.getElementById('world'),ctx=canvas.getContext('2d');
  if(!ctx){canvas.replaceWith(Object.assign(document.createElement('p'),{textContent:'Explore the four studio destinations using the signs.'}));return;}
  const api=window.NatasyaStudio;
  const W=960,H=750,TW=37,TH=20,OX=480,OY=168;
  let frame=0,last=0,night=false,playing=false,paused=api.paused,animationId=null,onscreen=true;
  let player={x:8,y:5.7,tx:8,ty:5.7,heading:0};
  let keys=new Set(),nearest=null,burst=0,mouse={x:0,y:0},dpr=Math.min(window.devicePixelRatio||1,2);
  const stations=[{id:'work',x:4.4,y:4.1},{id:'story',x:2.2,y:7.5},{id:'skills',x:8.6,y:3.5},{id:'contact',x:8.6,y:8.7}];
  const p=(x,y,z=0)=>({x:OX+(x-y)*TW,y:OY+(x+y)*TH-z});
  const polygon=(points,fill,stroke=null,width=1)=>{ctx.beginPath();points.forEach((pt,i)=>{if(i===0)ctx.moveTo(pt.x,pt.y);else ctx.lineTo(pt.x,pt.y);});ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}};
  const line=(pts,color,width=1)=>{ctx.beginPath();pts.forEach((pt,i)=>i?ctx.lineTo(pt.x,pt.y):ctx.moveTo(pt.x,pt.y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke();};
  const ellipse=(x,y,rx,ry,fill,rotation=0)=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();};
  const box=(x,y,w,d,h,color,z=0)=>{
    const a=p(x,y,z),b=p(x+w,y,z),c=p(x+w,y+d,z),dd=p(x,y+d,z);
    const aa=p(x,y,z+h),bb=p(x+w,y,z+h),cc=p(x+w,y+d,z+h),ddd=p(x,y+d,z+h);
    polygon([dd,c,cc,ddd],color.left||color.side);polygon([b,c,cc,bb],color.right||color.side);polygon([aa,bb,cc,ddd],color.top);
  };
  const disk=(x,y,r,z,top,side,h=5)=>{const pos=p(x,y,z);ellipse(pos.x,pos.y+h,r*TW,r*TH,side);ctx.fillStyle=side;ctx.fillRect(pos.x-r*TW,pos.y,r*TW*2,h);ellipse(pos.x,pos.y,r*TW,r*TH,top);};
  function roundRect(x,y,w,h,r,fill){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();}
  const cylinder=(x,y,r,h,top,side,z=0)=>{const q=p(x,y,z);ctx.fillStyle=side;ctx.fillRect(q.x-r,q.y-h,r*2,h);ellipse(q.x,q.y,r,r*.43,side);ellipse(q.x,q.y-h,r,r*.43,top);};
  function plant(x,y,size=1,variant=0){
    const q=p(x,y);ellipse(q.x+3,q.y+5,23*size,9*size,'#344a3012');
    cylinder(x,y,12*size,21*size,'#e5b492','#b68562');
    ellipse(q.x,q.y-21*size,9*size,4*size,'#6f7851');
    const sway=paused?0:Math.sin(frame*.65+x)*2;
    if(variant===1){line([{x:q.x,y:q.y-20*size},{x:q.x+sway,y:q.y-61*size}],'#627d48',3*size);for(let i=0;i<5;i++){const yy=q.y-(29+i*7)*size;ellipse(q.x+(i%2?9:-8)*size+sway,yy,5*size,13*size,i%2?'#9aaa72':'#80945d',i%2?.65:-.65);}}
    else{for(let i=0;i<7;i++){const a=i*.95;ellipse(q.x+Math.cos(a)*11*size+sway,q.y-(34+Math.sin(a)*10)*size,7*size,17*size,['#9cae78','#7f9863','#b3bf8d'][i%3],a*.5);}}
  }
  function tree(x,y,size=1){const q=p(x,y);ellipse(q.x+15,q.y+9,42*size,15*size,'#40593213');line([q,{x:q.x,y:q.y-65*size}],'#a69265',9*size);line([{x:q.x,y:q.y-41*size},{x:q.x-16*size,y:q.y-67*size}],'#ac9a71',5*size);line([{x:q.x,y:q.y-46*size},{x:q.x+15*size,y:q.y-75*size}],'#ac9a71',5*size);const sway=paused?0:Math.sin(frame*.5+x)*1.5;ellipse(q.x-19*size+sway,q.y-78*size,29*size,34*size,'#a6b78b');ellipse(q.x+18*size+sway,q.y-86*size,31*size,35*size,'#8fa77b');ellipse(q.x+sway,q.y-105*size,35*size,35*size,'#b2bf95');ellipse(q.x-10*size+sway,q.y-111*size,22*size,20*size,'#bdc9a2');}
  function studio(){
    box(1.15,1.15,5.2,4.5,9,{top:'#e5cfad',left:'#c9b48f',right:'#bda985'});
    // Warm wood floorboards.
    for(let i=0;i<10;i++){line([p(1.3+i*.49,1.3,10),p(1.3+i*.49,5.5,10)],'#ceb58e',.7);}
    // Cutaway walls, so visitors can look into the room.
    box(1.13,1.13,5.25,.16,146,{top:'#f7edda',left:'#e1d6bd',right:'#d4c8b0'},10);
    box(1.13,1.13,.16,4.5,146,{top:'#faf0df',left:'#e5dcc5',right:'#d6cbb2'},10);
    // Long studio window and mullions on the back wall.
    polygon([p(2.15,1.32,50),p(5.72,1.32,50),p(5.72,1.32,125),p(2.15,1.32,125)],'#678975');
    polygon([p(2.24,1.34,55),p(5.63,1.34,55),p(5.63,1.34,120),p(2.24,1.34,120)],night?'#466e70':'#c4dacb');
    polygon([p(2.3,1.35,57),p(3.2,1.35,57),p(4.8,1.35,118),p(3.9,1.35,118)],night?'#6b929022':'#ecf2dd77');
    for(let i=1;i<4;i++)line([p(2.15+i*.89,1.36,51),p(2.15+i*.89,1.36,124)],'#7c9782',3);
    line([p(2.18,1.37,88),p(5.7,1.37,88)],'#7c9782',3);
    // Side pinboard with notes.
    polygon([p(1.32,2.15,61),p(1.32,4.45,61),p(1.32,4.45,120),p(1.32,2.15,120)],'#c8aa81');
    polygon([p(1.34,2.24,65),p(1.34,4.36,65),p(1.34,4.36,116),p(1.34,2.24,116)],'#e5ceb0');
    const notes=[[2.55,103,'#efb294'],[3.3,104,'#eff0d1'],[2.8,79,'#c2d4b3'],[3.7,87,'#f2dca5']];notes.forEach(([y,z,c])=>{polygon([p(1.36,y,z),p(1.36,y+.48,z),p(1.36,y+.48,z-19),p(1.36,y,z-19)],c);const q=p(1.36,y+.2,z-3);ellipse(q.x,q.y,1.5,1.5,'#ae7759');});
    // Wall shelf and tiny books.
    box(2,1.43,2.9,.35,6,{top:'#b7a07b',left:'#a68c67',right:'#9a805d'},35);
    ['#b9795c','#d3c5a0','#8b9f79','#c99270'].forEach((c,i)=>box(2.15+i*.32,1.45,.2,.22,15+i%2*5,{top:c,side:c},41));
    plant(4.9,1.7,.48,1);
    // Work desk, angled monitor, paper and mug.
    [2.55,5.35].forEach(x=>[2.8,4].forEach(y=>box(x,y,.12,.12,48,{top:'#b0a380',side:'#b1a382'},10)));
    box(2.43,2.65,3.2,1.55,8,{top:'#ece1c4',left:'#c7b594',right:'#d4c19b'},58);
    box(3.4,3.08,.7,.38,4,{top:'#818e7c',side:'#6e7c6b'},66);
    box(3.65,3.1,.12,.15,23,{top:'#92a08c',side:'#82927e'},70);
    polygon([p(2.95,2.94,88),p(4.7,2.94,88),p(4.7,2.94,139),p(2.95,2.94,139)],'#546e5d');
    polygon([p(3.02,2.96,93),p(4.62,2.96,93),p(4.62,2.96,133),p(3.02,2.96,133)],night?'#b6d3b6':'#d6e5cb');
    const codeColors=['#96b195','#c29875','#82a083','#c5b895'];for(let i=0;i<5;i++)line([p(3.16+(i%2)*.12,2.97,125-i*6),p(3.85+(i%3)*.21,2.97,125-i*6)],codeColors[i%4],2);
    box(3.2,3.55,1.05,.34,3,{top:'#bcc5ab',side:'#a0ad94'},66);
    for(let i=0;i<6;i++)line([p(3.3+i*.15,3.58,70),p(3.3+i*.15,3.82,70)],'#97a68f',1);
    box(4.8,3.3,.52,.55,1,{top:'#fbf3de',side:'#e4d8bc'},67);line([p(4.88,3.4,69),p(5.17,3.4,69)],'#b9c1a4',1.3);
    cylinder(2.84,3.7,7,14,'#f4dfc4','#d39d78',67);ellipse(p(2.84,3.7,81).x,p(2.84,3.7,81).y,5,2,'#8c7055');
    // Desk chair.
    disk(4.1,4.8,.43,36,'#c87e63','#a96850',7);box(3.98,4.7,.13,.13,30,{top:'#9b9678',side:'#9b9678'},9);
    polygon([p(3.69,4.94,43),p(4.53,4.94,43),p(4.53,4.94,81),p(3.69,4.94,81)],'#d78d71');line([p(3.7,4.94,80),p(4.52,4.94,80)],'#e1a184',3);
    line([p(3.7,4.6,10),p(4.5,5.1,10)],'#8e967b',3);line([p(3.7,5.1,10),p(4.5,4.6,10)],'#8e967b',3);
    // Step and welcoming doormat.
    box(5.25,5.35,1.35,.75,5,{top:'#ded7be',left:'#c1b99d',right:'#b7b399'},0);
    polygon([p(5.3,4.7,11),p(6.05,4.7,11),p(6.05,5.28,11),p(5.3,5.28,11)],'#b9ba91');
  }
  function garden(){
    // Round reading garden, notebook and bench.
    disk(2.1,7.9,1.35,1,'#c4d0ae','#b2c19c',4);
    disk(2.1,7.9,1.14,6,'#dbe1c7','#c5d0b4',2);
    [0,1,2].forEach(i=>box(1.05,7.3+i*.2,2.45,.14,7,{top:'#c39e76',left:'#a1825e',right:'#b18b63'},31));
    [1.25,3.15].forEach(x=>{box(x,7.35,.12,.5,28,{top:'#8f9677',side:'#8f9677'},3);box(x,7.82,.12,.1,52,{top:'#9f9977',side:'#a49d7a'},3);});
    [0,1].forEach(i=>box(1.05,7.85,2.45,.12,8,{top:'#c4a47e',left:'#a28660',right:'#ae8e68'},40+i*10));
    // Open book on a pedestal.
    cylinder(1.9,8.3,16,29,'#c5b99c','#b1a98a',4);
    polygon([p(1.4,8.1,38),p(1.95,8.1,35),p(1.95,8.65,35),p(1.4,8.65,38)],'#f4ebd2');
    polygon([p(1.95,8.1,35),p(2.5,8.1,38),p(2.5,8.65,38),p(1.95,8.65,35)],'#fff5dd');
    line([p(1.95,8.1,37),p(1.95,8.65,37)],'#c6bb9c',1.5);
    plant(.7,7.2,.7,1);plant(3.65,8.15,.65);
  }
  function toolkit(){
    // A compact creative workbench with stacked colorful building blocks.
    disk(8.7,3,1.65,0,'#d6ddc4','#c4ceb5',3);
    box(7.65,2.1,2.1,1.6,13,{top:'#e9d3ad',left:'#c3ad86',right:'#d0b892'},16);
    [7.82,9.4].forEach(x=>[2.2,3.4].forEach(y=>box(x,y,.12,.12,15,{top:'#b9ad8d',side:'#b9ad8d'},1)));
    box(7.95,2.5,.7,.7,30,{top:'#c0cdb1',left:'#91a888',right:'#a4ba98'},29);
    box(8.8,2.4,.65,.65,45,{top:'#dfa286',left:'#c37e62',right:'#d28d70'},29);
    box(8.35,3.1,.7,.65,21,{top:'#e9d7a6',left:'#c9b782',right:'#d9c18f'},29);
    let q=p(8.83,2.72,56);ctx.save();ctx.translate(q.x,q.y);ctx.transform(1,.53,0,1,0,0);ctx.fillStyle='#f8e9d4';ctx.font='bold 18px monospace';ctx.textAlign='center';ctx.fillText('</>',0,0);ctx.restore();
    // Tiny tilted paint palette.
    q=p(8,3.3,32);ellipse(q.x,q.y,15,8,'#f5e8c9',.2);[[0,'#d39475'],[7,'#839e76'],[-7,'#b4ad7b']].forEach(([x,c])=>ellipse(q.x+x,q.y-1,2,2,c));
    plant(9.85,2.3,.72,1);
  }
  function mailbox(){
    const x=8.6,y=8.3,q=p(x,y);
    disk(x,y,.9,1,'#d4dcbb','#bdc9a5',3);
    box(x-.13,y-.12,.25,.25,62,{top:'#a69e7e',side:'#a69e7e'},3);
    box(x-.62,y-.42,1.25,.8,34,{top:'#dc9b7a',left:'#c27d5e',right:'#ca8668'},64);
    // Envelope symbol on the front.
    polygon([p(x-.38,y+.4,72),p(x+.38,y+.4,72),p(x+.38,y+.4,88),p(x-.38,y+.4,88)],'#f6e4c5');
    line([p(x-.38,y+.42,88),p(x,y+.42,80),p(x+.38,y+.42,88)],'#cb9e7b',1.2);
    const flag=p(x+.68,y-.05,94);line([{x:flag.x,y:flag.y+20},{x:flag.x,y:flag.y-8}],'#9b7658',2);polygon([{x:flag.x,y:flag.y-8},{x:flag.x+16,y:flag.y-4},{x:flag.x,y:flag.y+1}],'#e4b48d');
    plant(9.6,8.8,.7);plant(7.5,9.05,.65,1);
    // Postcard on the grass.
    polygon([p(8.35,9.2,5),p(9,9.2,5),p(9,9.65,5),p(8.35,9.65,5)],'#f5ecd4');
  }
  function avatar(){
    const q=p(player.x,player.y),moving=Math.abs(player.x-player.tx)+Math.abs(player.y-player.ty)>.08||keys.size>0;
    const bob=paused?0:Math.sin(frame*(moving?12:2.5))*(moving?2.2:1.1);
    ellipse(q.x+2,q.y+2,16,7,'#30432e23');
    // Backpack, legs, shoes, jacket and warm face.
    roundRect(q.x-12,q.y-40+bob,24,23,6,'#746d53');
    line([{x:q.x-5,y:q.y-13+bob},{x:q.x-6+(moving?Math.sin(frame*12)*3:0),y:q.y-2}],'#5b6654',5);
    line([{x:q.x+5,y:q.y-13+bob},{x:q.x+6-(moving?Math.sin(frame*12)*3:0),y:q.y-2}],'#5b6654',5);
    ellipse(q.x-7,q.y,6,3,'#f3e5cc');ellipse(q.x+7,q.y,6,3,'#f3e5cc');
    roundRect(q.x-11,q.y-36+bob,22,25,8,'#d58b6c');
    line([{x:q.x-10,y:q.y-31+bob},{x:q.x-15,y:q.y-18+bob}],'#dba785',5);line([{x:q.x+10,y:q.y-31+bob},{x:q.x+15,y:q.y-19+bob}],'#dba785',5);
    ellipse(q.x,q.y-46+bob,12,14,'#574c39');ellipse(q.x,q.y-43+bob,9,11,'#edc09b');
    ctx.beginPath();ctx.arc(q.x-1,q.y-48+bob,11,Math.PI,Math.PI*2+.35);ctx.fillStyle='#514b38';ctx.fill();
    ellipse(q.x-3,q.y-44+bob,1,1.3,'#514b38');ellipse(q.x+4,q.y-44+bob,1,1.3,'#514b38');
    line([{x:q.x,y:q.y-39+bob},{x:q.x+3,y:q.y-39+bob}],'#c28d70',1);
    // A small friendly wave when idle.
    if(!moving){const wave=Math.sin(frame*2.2)*2;line([{x:q.x+13,y:q.y-28+bob},{x:q.x+18,y:q.y-37+bob+wave}],'#e5b28d',4);}
    if(playing){const a=p(player.x,player.y,74);roundRect(a.x-20,a.y-11,40,19,6,'#f9faf2ee');ctx.font='9px Arial';ctx.textAlign='center';ctx.fillStyle='#667a59';ctx.fillText('you',a.x,a.y+2);}
  }
  function lamp(x,y){const q=p(x,y);cylinder(x,y,7,3,'#b0b69c','#9ea48a');line([p(x,y,3),p(x,y,90)],'#7b8a70',3);box(x-.16,y-.16,.32,.32,20,{top:'#a4ad8d',left:night?'#f2d6a2':'#d9dec2',right:night?'#e3be7e':'#c6ceb0'},78);box(x-.27,y-.27,.54,.54,4,{top:'#9ba587',left:'#869578',right:'#879577'},98);if(night){const grad=ctx.createRadialGradient(q.x,q.y-87,0,q.x,q.y-87,45);grad.addColorStop(0,'#f5cf8c44');grad.addColorStop(1,'#f5cf8c00');ctx.fillStyle=grad;ctx.fillRect(q.x-45,q.y-132,90,90);}}
  function drawGround(){
    const shadow=p(5.8,6.3);ctx.save();ctx.filter='blur(20px)';ellipse(shadow.x+12,shadow.y+45,285,153,'#7183651a');ctx.restore();
    polygon([p(0,11),p(11,11),p(11,11,-27),p(0,11,-27)],'#c5cbb1');polygon([p(11,0),p(11,11),p(11,11,-27),p(11,0,-27)],'#b8c3a6');
    polygon([p(0,0),p(11,0),p(11,11),p(0,11)],night?'#c6d1ba':'#e2e6d3');
    for(let x=0;x<11;x++)for(let y=0;y<11;y++){
      const path=(x===6||x===7||y===6)||(x>=8&&y>=7&&y<=9);
      const c=path?(x+y)%2?'#e9e5d2':'#e4e0cc':(x*7+y*3)%5===0?'#d8dfc8':'#dfe5d0';
      polygon([p(x+.025,y+.025,.5),p(x+.975,y+.025,.5),p(x+.975,y+.975,.5),p(x+.025,y+.975,.5)],c);
      if(!path&&(x*9+y*5)%13===0){const q=p(x+.5,y+.5,1);line([{x:q.x-2,y:q.y},{x:q.x-4,y:q.y-5},{x:q.x-1,y:q.y-2},{x:q.x+1,y:q.y-7}], '#b6c4a0',1);}
    }
    // Floating island trim.
    line([p(0,11,-25),p(11,11,-25),p(11,0,-25)],'#bbc4a7',2);
    // Four softly inset discovery circles.
    stations.forEach(s=>{const q=p(s.x,s.y,1);ellipse(q.x,q.y,23,12,'#fff8dd44');});
  }
  function sceneryBack(){
    tree(1.3,.55,.9);tree(7.3,.8,.95);tree(10,4.7,.85);
    box(.2,4.8,.72,1.5,16,{top:'#c3cda9',side:'#a8b78f'});plant(.55,5.1,.75,1);
  }
  function sceneryFront(){
    tree(.6,9.5,.75);tree(10.1,10,.85);
    plant(5.3,9.5,.75,1);plant(4.75,10.2,.6);plant(9.9,6,.65,1);
    lamp(6.9,1.1);lamp(6,9.6);
    // Pebbles and a few blossoms add a lived-in feel.
    [[.5,6.2],[10.5,7],[4,10.5],[9,.7]].forEach(([x,y],i)=>{const q=p(x,y,1);ellipse(q.x,q.y,8,4,'#c0c8ac');ellipse(q.x-12,q.y+2,5,3,'#c9cfb7');});
    [[.45,8.5],[4,8.8],[10,1.1],[10.4,9.7]].forEach(([x,y],i)=>{const q=p(x,y);line([q,{x:q.x,y:q.y-13}],'#97ac7a',1.3);for(let k=0;k<5;k++){const a=k*Math.PI*2/5;ellipse(q.x+Math.cos(a)*3,q.y-14+Math.sin(a)*3,3,3,i%2?'#dcb095':'#f3e8bd');}ellipse(q.x,q.y-14,2,2,'#b4a267');});
  }
  function particles(){
    if(!paused){for(let i=0;i<7;i++){const x=180+((i*127+frame*5)%620),y=130+Math.sin(frame*.45+i*1.7)*60+i*33;const alpha=(Math.sin(frame+i)+1)*.17;ctx.fillStyle=night?`rgba(246,218,148,${alpha+.1})`:`rgba(174,167,121,${alpha})`;ctx.beginPath();ctx.arc(x,y,i%2?2:1.3,0,Math.PI*2);ctx.fill();}}
    if(night){[[105,112],[760,130],[842,255],[260,73],[638,64]].forEach(([x,y],i)=>{const a=.4+Math.sin(frame+i)*.2;ctx.strokeStyle=`rgba(124,147,142,${a})`;ctx.lineWidth=1;line([{x:x-4,y},{x:x+4,y}],ctx.strokeStyle,1);line([{x,y:y-4},{x,y:y+4}],ctx.strokeStyle,1);});}
    if(burst>0){for(let i=0;i<35;i++){const a=i*2.3999,rad=(1-burst)*310,q=p(player.x,player.y,40);ellipse(q.x+Math.cos(a)*rad,q.y+Math.sin(a)*rad*.6-80*(1-burst),3*burst,6*burst,['#dc9b7a','#9fb38b','#d3be83'][i%3],a);}burst=Math.max(0,burst-.018);}
  }
  function draw(){
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);ctx.save();ctx.translate(mouse.x*2,mouse.y*2);
    drawGround();sceneryBack();studio();toolkit();garden();
    // Depth-sort the player relative to the front mailbox.
    if(player.x+player.y<17)avatar();mailbox();sceneryFront();if(player.x+player.y>=17)avatar();
    if(night){ctx.globalCompositeOperation='multiply';ctx.fillStyle='#a7b8c51e';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='source-over';}
    particles();
    if(playing&&nearest){const s=stations.find(s=>s.id===nearest),q=p(s.x,s.y,118);roundRect(q.x-46,q.y-18,92,23,6,'#24483fe8');ctx.font='10px Arial';ctx.fillStyle='#fff5dd';ctx.textAlign='center';ctx.fillText(api.lang==='id'?'Enter ↵ buka':'Enter ↵ explore',q.x,q.y-3);}
    ctx.restore();
  }
  // Interior objects are decorative; exploring follows the clear ground paths.
  const blocked=(x,y)=>x<.4||y<.4||x>10.5||y>10.5||(x>1&&x<5.5&&y>1&&y<3.1);
  function update(dt){
    let dx=0,dy=0;
    if(keys.has('ArrowUp')||keys.has('w')){dx-=1;dy-=1;}
    if(keys.has('ArrowDown')||keys.has('s')){dx+=1;dy+=1;}
    if(keys.has('ArrowLeft')||keys.has('a')){dx-=1;dy+=1;}
    if(keys.has('ArrowRight')||keys.has('d')){dx+=1;dy-=1;}
    if(playing&&(dx||dy)){const len=Math.hypot(dx,dy),speed=2.8*dt;let nx=player.x+dx/len*speed,ny=player.y+dy/len*speed;if(!blocked(nx,ny)){player.x=nx;player.y=ny;}player.tx=player.x;player.ty=player.y;}
    else if(playing){const dx=player.tx-player.x,dy=player.ty-player.y,dist=Math.hypot(dx,dy);if(dist>.025){const step=Math.min(dist,2.6*dt),nx=player.x+dx/dist*step,ny=player.y+dy/dist*step;if(!blocked(nx,ny)){player.x=nx;player.y=ny;}else{player.tx=player.x;player.ty=player.y;}}}
    nearest=null;let distance=2;stations.forEach(s=>{const d=Math.hypot(s.x-player.x,s.y-player.y);if(d<distance){distance=d;nearest=s.id;}});
  }
  function tick(time){const dt=Math.min((time-last)/1000||.016,.05);last=time;if(!paused)frame+=dt;update(dt);draw();if((!paused&&onscreen)||playing||burst>0)animationId=requestAnimationFrame(tick);else animationId=null;}
  function wake(){if(!animationId){last=performance.now();animationId=requestAnimationFrame(tick);}}
  function resize(){dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=W*dpr;canvas.height=H*dpr;draw();}
  const setPlaying=value=>{playing=value;keys.clear();document.getElementById('game-controls').hidden=!value;document.getElementById('studio-scene').classList.toggle('game-active',value);document.getElementById('play-toggle').setAttribute('aria-pressed',String(value));if(value){canvas.focus({preventScroll:true});document.getElementById('studio').scrollIntoView({block:'center',behavior:paused?'instant':'smooth'});api.toast(api.lang==='id'?'Gerakkan karakter. Dekati papan, lalu tekan Enter.':'Move your little explorer. Find a sign, then press Enter.');}wake();};
  document.getElementById('play-toggle').addEventListener('click',()=>setPlaying(!playing));document.getElementById('exit-game').addEventListener('click',()=>{setPlaying(false);document.getElementById('play-toggle').focus({preventScroll:true});});
  const explore=()=>{if(nearest){setPlaying(false);api.activateStation(nearest);}else api.toast(api.lang==='id'?'Dekati salah satu papan kecil.':'Move closer to one of the little signs.');};
  document.getElementById('touch-enter').addEventListener('click',explore);
  canvas.addEventListener('keydown',e=>{if(!playing)return;const key=e.key.length===1?e.key.toLowerCase():e.key;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(key)){e.preventDefault();keys.add(key);const steps={ArrowUp:[-.22,-.22],w:[-.22,-.22],ArrowDown:[.22,.22],s:[.22,.22],ArrowLeft:[-.22,.22],a:[-.22,.22],ArrowRight:[.22,-.22],d:[.22,-.22]};if(!e.repeat){const step=steps[key],nx=player.x+step[0],ny=player.y+step[1];if(!blocked(nx,ny)){player.x=nx;player.y=ny;player.tx=nx;player.ty=ny;}}wake();}if(e.key==='Enter'){e.preventDefault();explore();}if(e.key==='Escape'){e.preventDefault();setPlaying(false);document.getElementById('play-toggle').focus({preventScroll:true});}});
  window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));window.addEventListener('blur',()=>keys.clear());
  canvas.addEventListener('blur',()=>keys.clear());
  canvas.addEventListener('pointerdown',e=>{if(!playing)return;const r=canvas.getBoundingClientRect(),px=(e.clientX-r.left)/r.width*W,py=(e.clientY-r.top)/r.height*H;const xx=((px-OX)/TW+(py-OY)/TH)/2,yy=((py-OY)/TH-(px-OX)/TW)/2;if(!blocked(xx,yy)){player.tx=xx;player.ty=yy;canvas.focus({preventScroll:true});wake();}});
  canvas.addEventListener('pointermove',e=>{if(paused)return;const r=canvas.getBoundingClientRect();mouse.x=(e.clientX-r.left)/r.width-.5;mouse.y=(e.clientY-r.top)/r.height-.5;});canvas.addEventListener('pointerleave',()=>{mouse.x=0;mouse.y=0;});
  const moveKeys={up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'};
  document.querySelectorAll('[data-move]').forEach(button=>{button.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(moveKeys[button.dataset.move]);button.setPointerCapture(e.pointerId);wake();});const stop=()=>keys.delete(moveKeys[button.dataset.move]);button.addEventListener('pointerup',stop);button.addEventListener('pointercancel',stop);button.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();keys.add(moveKeys[button.dataset.move]);wake();}});button.addEventListener('keyup',stop);button.addEventListener('blur',stop);});
  document.getElementById('light-toggle').addEventListener('click',e=>{night=!night;document.body.classList.toggle('night',night);e.currentTarget.textContent=night?'☾':'☀';e.currentTarget.setAttribute('aria-label',night?'Switch studio to daylight':'Switch studio to evening');draw();});
  window.addEventListener('ns-motion',e=>{paused=e.detail;mouse.x=0;mouse.y=0;wake();});window.addEventListener('ns-celebrate',()=>{burst=1;wake();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();if(animationId)cancelAnimationFrame(animationId);animationId=null;}else wake();});
  if('IntersectionObserver' in window){new IntersectionObserver(entries=>{onscreen=entries[0].isIntersecting;if(onscreen)wake();else if(!playing&&animationId){cancelAnimationFrame(animationId);animationId=null;}},{rootMargin:'100px'}).observe(canvas);}
  window.addEventListener('resize',resize);resize();wake();
})();
