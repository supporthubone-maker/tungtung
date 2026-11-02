import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';
import { connectRoom } from './room.js';
import { createSanctuaryDecor } from './sanctuary.js';
import { createWishTrees } from './grove.js';
import { createMeritSystem, nextLevel, currentLevelStart } from './progress.js';
import { drawFortune } from './fortune.js';

const app = document.querySelector('#app');
app.innerHTML = `<div id="scene"></div><div class="overlay"><div class="topbar"><div class="brand"><span class="mark">🪷</span><div><strong>Thiền Viện An Nhiên</strong><small>KHÔNG GIAN TÂM LINH 3D</small></div></div><div class="righttop"><button id="toggleMenu" class="pill menu-toggle" type="button">☰ Hoạt động</button><div class="pill"><span class="mobilehide">🌤️ Bình an mỗi ngày</span> <button id="sound">🔇 Âm thanh</button></div><div class="pill">👤 <span id="actorlabel">Chibi nữ</span></div><div class="pill" id="leveltop">🪷 Cấp 0 · 0 lượt</div><div class="pill" id="online">👥 0 người</div></div></div><div class="welcome">KHÔNG GIAN THANH TỊNH<strong>Chánh điện an nhiên</strong></div><aside class="sidebar"><section class="panel activities"><div class="eyebrow">HOẠT ĐỘNG TÂM LINH</div><h2>Hành trình an yên 🪷</h2><p class="sub">Chọn một hoạt động để nhân vật thực hiện</p><button class="activity" data-act="incense"><span class="activity-icon">🪔</span><span><strong>Thắp hương</strong><small>Dâng 3 nén hương lên lư</small></span></button><button class="activity" data-act="bow"><span class="activity-icon">🙏</span><span><strong>Lễ Phật</strong><small>Quỳ lạy 3 hoặc 108 lần</small></span></button><button class="activity" data-act="flower"><span class="activity-icon">🪷</span><span><strong>Dâng hoa sen</strong><small>Dâng hoa trước tượng Phật</small></span></button><button class="activity" data-act="chant"><span class="activity-icon">📿</span><span><strong>Ngồi niệm Phật</strong><small>Ngồi xếp bằng · lần chuỗi 108 hạt</small></span></button><button class="activity" data-act="fortune"><span class="activity-icon">🎋</span><span><strong>Lắc quẻ xin xăm</strong><small>Lắc ống xăm và nhận lời chiêm nghiệm</small></span></button><button class="activity" data-act="wish"><span class="activity-icon">🎀</span><span><strong>Cầu duyên · buộc dây đỏ</strong><small>Đến cây đa treo dây ước nguyện</small></span></button><div class="merit-mini"><div><strong id="merit-level">Cấp 0</strong><span id="merit-turns">0 lượt</span></div><div class="merit-track"><div id="merit-bar"></div></div><small id="merit-next">Còn 5 lượt để lên cấp 1</small><small id="dharma-label">🪷 Pháp danh: chưa được tặng</small><small id="save-mode">Lưu tạm trên thiết bị</small></div><div class="setting"><label for="wishTree">Cây cầu duyên</label><select id="wishTree"><option value="left">Cây bên trái</option><option value="right">Cây bên phải</option></select></div><div class="setting"><label for="scenestyle">Chánh điện</label><select id="scenestyle"><option value="gold" selected>Vàng son · Hoa sen</option><option value="original">An Nhiên V3</option></select></div><div class="setting"><label for="daymode">Ánh sáng</label><select id="daymode"><option value="auto">Tự động theo giờ</option><option value="morning">Sáng</option><option value="noon">Trưa</option><option value="afternoon">Chiều</option><option value="night">Tối</option></select></div><div class="setting"><label for="gender">Nhân vật</label><select id="gender"><option value="female">Chibi nữ</option><option value="male">Chibi nam</option></select></div><div class="setting"><label for="bows">Số lần lạy</label><select id="bows"><option value="3">3 lần</option><option value="108">108 lần</option></select></div><div class="setting"><label for="chants">Số biến niệm</label><select id="chants"><option value="9">9 biến (demo)</option><option value="27">27 biến</option><option value="108" selected>108 biến</option></select></div><div class="activity-note">💡 Có thể xoay cảnh bằng chuột / chạm và phóng to thu nhỏ.</div></section><section class="panel feed"><h3>📜 Nhật ký hoạt động</h3><div id="log" class="log"></div></section></aside><div class="bottom"><div class="statusdot"></div><span id="status" class="status">Sẵn sàng bắt đầu</span><div class="progress"><div id="progress"></div></div><button id="cancel" class="iconbtn" title="Dừng hoạt động">■ Dừng</button><button id="resetcam" class="iconbtn" title="Khôi phục camera">⌖</button></div><div class="chat-panel" id="chat-panel"><div class="chat-heading"><strong>💬 Trò chuyện trong chánh điện</strong><button id="toggleChat" title="Thu gọn/mở chat" type="button">−</button></div><div id="chat-info" class="chat-info">Chỉ những người cùng phòng nhìn thấy tin nhắn · không lưu lịch sử.</div><div id="chat-messages" class="chat-messages" aria-live="polite"></div><form id="chat-form" class="chat-form"><input id="chat-input" maxlength="180" placeholder="Gửi lời chào an lành..." autocomplete="off" aria-label="Nội dung chat"/><button id="chat-send" type="submit">Gửi</button></form></div><div class="hint">Kéo để xoay · Cuộn để thu phóng</div><div id="toast"></div><div class="fortune-modal" id="fortune-modal" hidden><div class="fortune-card" role="dialog" aria-modal="true" aria-labelledby="fortune-title"><span class="fortune-icon">🎋</span><h2 id="fortune-title">Quẻ An Nhiên</h2><div id="fortune-number" class="fortune-number"></div><p id="fortune-verse" class="fortune-verse"></p><p id="fortune-guidance"></p><small>Quẻ chỉ dành cho chiêm nghiệm, giải trí, không dự đoán tương lai.</small><button id="fortune-close" type="button">Đóng quẻ</button></div></div><div class="join" id="join"><div class="joincard"><div class="joinlotus">🪷</div><h2>Chào mừng đến chánh điện</h2><p>Nhập tên hiển thị và chọn nhân vật. Pháp danh ảo được tặng ở cấp 3.</p><label for="displayname">Tên hiển thị</label><input id="displayname" maxlength="24" value="Khách an nhiên" /><label for="joinGender">Nhân vật</label><select id="joinGender"><option value="female">Nữ · tóc búi, đồ lam</option><option value="male">Nam · tóc ngắn, đồ lam</option></select><button id="enterRoom">Vào chánh điện</button><small id="connection-note">Vào cùng phòng để gặp gỡ và trò chuyện với các Phật tử khác.</small></div></div></div>`;


// V4.2: Reuse all original activity button handlers; only move their visual location.
const dock = document.createElement('nav');
dock.className = 'activity-dock';
dock.setAttribute('aria-label', 'Chọn hoạt động tâm linh');
for (const button of document.querySelectorAll('.activities > .activity')) {
  const activityName = button.querySelector('strong')?.textContent?.trim() || 'Hoạt động';
  button.title = activityName;
  button.setAttribute('aria-label', activityName);
  dock.appendChild(button);
}
document.querySelector('.overlay').appendChild(dock);
const liveChat = document.querySelector('#chat-panel');
document.querySelector('.sidebar').insertBefore(liveChat, document.querySelector('.feed'));
document.querySelector('.activities .sub').textContent = 'Chọn biểu tượng hoạt động phía dưới để bắt đầu';
const logPanel = document.querySelector('.feed');
const logToggle = document.createElement('button');
logToggle.type = 'button';
logToggle.className = 'log-toggle';
logToggle.textContent = '📜 Nhật ký hoạt động ▾';
logToggle.setAttribute('aria-expanded', 'false');
logPanel.insertBefore(logToggle, logPanel.firstChild);
logToggle.addEventListener('click', () => {
  const opened = logPanel.classList.toggle('expanded');
  logToggle.setAttribute('aria-expanded', String(opened));
  logToggle.textContent = opened ? '📜 Nhật ký hoạt động ▴' : '📜 Nhật ký hoạt động ▾';
});

const scene = new THREE.Scene(); scene.background = new THREE.Color(0xf6e9d9); scene.fog = new THREE.Fog(0xf6e9d9,19,42);
const renderer = new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'}); renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.7)); renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.45;document.querySelector('#scene').append(renderer.domElement);
const camera = new THREE.PerspectiveCamera(40,innerWidth/innerHeight,.1,90);camera.position.set(9.5,9.7,18.5);
const controls = new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.065;controls.minDistance=8;controls.maxDistance=32;controls.maxPolarAngle=Math.PI*.47;controls.minPolarAngle=.29;controls.target.set(0,1.5,-1.4);controls.update();
const skyLight=new THREE.HemisphereLight(0xfff1d7,0x98745f,2.5);scene.add(skyLight);const sun=new THREE.DirectionalLight(0xffe5b1,3.2);sun.position.set(-7,15,9);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-15;sun.shadow.camera.right=15;sun.shadow.camera.top=15;sun.shadow.camera.bottom=-15;sun.shadow.bias=-.0003;scene.add(sun);
const warm=new THREE.PointLight(0xffbc73,70,14);warm.position.set(0,6,-4);scene.add(warm);
function mat(c,rough=.86,metal=0){return new THREE.MeshStandardMaterial({color:c,roughness:rough,metalness:metal})}const wood=mat(0x815039),darkwood=mat(0x593528),gold=mat(0xd7a74c,.4,.45),palegold=mat(0xf4ca72,.43,.25),stone=mat(0xe4ceb4),white=mat(0xfff3df),red=mat(0xa74f44),leaf=mat(0x52775a);
function mesh(geo,m,parent=scene,x=0,y=0,z=0){let o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function box(w,h,d,m,p=scene,x=0,y=0,z=0){return mesh(new THREE.BoxGeometry(w,h,d),m,p,x,y,z)}
function cylinder(r1,r2,h,m,p=scene,x=0,y=0,z=0,n=20){return mesh(new THREE.CylinderGeometry(r1,r2,h,n),m,p,x,y,z)}
function sphere(r,m,p=scene,x=0,y=0,z=0,ws=20,hs=12){return mesh(new THREE.SphereGeometry(r,ws,hs),m,p,x,y,z)}
function line(a,b,r,m,p){const dir=new THREE.Vector3().subVectors(b,a);const obj=mesh(new THREE.CylinderGeometry(r,r,dir.length(),10),m,p);obj.position.copy(a).add(b).multiplyScalar(.5);obj.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());return obj}
// Architectural courtyard and hall
box(32,.6,34,mat(0xcebba0),scene,0,-.41,0);box(17,.32,15,stone,scene,0,-.04,-2.0);box(14,.10,12,mat(0xae7651),scene,0,.14,-2.15);
const tiles=mat(0xd6ad87);for(let x=-7;x<=7;x+=1.4){for(let z=-7.5;z<=3.5;z+=1.4){box(1.36,.012,1.36,((Math.round(x+z)%3)===0?mat(0xba8a69):tiles),scene,x,.20,z)}}
box(16,.55,.48,darkwood,scene,0,.45,-8.15);box(.45,8,.5,darkwood,scene,-7.7,4,-8.1);box(.45,8,.5,darkwood,scene,7.7,4,-8.1);box(16,.55,.48,wood,scene,0,8,-8.1);
for(let x of [-6.4,-3.2,3.2,6.4]){cylinder(.28,.34,7.0,red,scene,x,3.7,-6.9);cylinder(.40,.40,.22,gold,scene,x,.35,-6.9);cylinder(.38,.38,.24,gold,scene,x,7,-6.9)}
for(let z of [-6.9,-3.2,1.1])for(let x of [-6.4,6.4]){cylinder(.29,.35,6.5,red,scene,x,3.5,z);cylinder(.43,.43,.2,gold,scene,x,.34,z);cylinder(.42,.42,.23,gold,scene,x,6.7,z)}
box(16,.38,11,mat(0x592d2a),scene,0,7.2,-2.8);let roof=box(17.2,.32,12.5,mat(0x6a3d39),scene,0,7.65,-2.8);roof.rotation.z=0;for(let z=-8.6;z<=3.1;z+=.5){box(17,.08,.07,mat(0x8f5244),scene,0,7.85,z)}
for(let x of [-7.1,7.1]){box(.25,.18,12.7,gold,scene,x,7.86,-2.8)}
// Back altar plinths and buddha figure: original procedural geometry (not GLB from Sansa)
box(6.9,.9,3.15,darkwood,scene,0,.68,-6.4);box(6.2,.20,2.8,gold,scene,0,1.18,-6.45);box(5.55,.6,2.2,mat(0x9d5840),scene,0,1.55,-6.55);box(5.4,.14,2.3,gold,scene,0,1.92,-6.55);
const buddha=new THREE.Group();buddha.position.set(0,2,-6.7);scene.add(buddha);
const budMat=mat(0xd9ac63,.42,.30);const robeMat=mat(0xbd8547,.66,.12);
const lotusBase=cylinder(1.45,1.2,.32,gold,buddha,0,.13,0,32);
for(let i=0;i<16;i++){const a=i*Math.PI*2/16;let p=sphere(.36,palegold,buddha,Math.cos(a)*1.15,.34,Math.sin(a)*.85);p.scale.set(.7,.38,1.4);p.rotation.y=-a}
sphere(.87,robeMat,buddha,0,.85,0).scale.set(1.65,.65,1.05);sphere(.7,robeMat,buddha,0,1.6,0).scale.set(.88,1.45,.72);sphere(.53,budMat,buddha,0,2.75,.06).scale.set(.9,1.14,.85);sphere(.3,budMat,buddha,0,3.27,0);for(let side of [-1,1]){let arm=sphere(.25,robeMat,buddha,side*.61,1.43,.42);arm.scale.set(.8,1.7,.82);arm.rotation.z=side*.47;sphere(.19,budMat,buddha,side*.34,.99,.75)}
for(let side of [-1,1]){sphere(.13,budMat,buddha,side*.5,2.7,.05);}
const halo=mesh(new THREE.TorusGeometry(.92,.075,10,50),gold,buddha,0,2.85,-.35);halo.rotation.y=0;
// altar items
for(let x of [-2.3,2.3]){cylinder(.12,.15,.72,gold,scene,x,2.36,-6.1);sphere(.14,mat(0xffb45e),scene,x,2.8,-6.1);cylinder(.37,.27,.45,mat(0xa88e58),scene,x,2.15,-5.7)}
const lotusPetal=mat(0xf3a9af);function lotus(parent,x,y,z,scale=1){let g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(scale);parent.add(g);cylinder(.15,.12,.08,gold,g,0,0,0);for(let k=0;k<9;k++){let a=k*Math.PI*2/9;let p=sphere(.22,lotusPetal,g,Math.cos(a)*.18,.13,Math.sin(a)*.18);p.scale.set(.57,1.25,.7);p.rotation.y=a}sphere(.12,palegold,g,0,.15,0);return g}
lotus(scene,-2.2,2.35,-6.3,.75);lotus(scene,2.2,2.35,-6.3,.75);
// Incense urn
const urn=new THREE.Group();urn.position.set(-3.1,0,-3.8);scene.add(urn);cylinder(.53,.41,.78,mat(0xb58355,.55,.3),urn,0,.78,0);cylinder(.60,.60,.12,gold,urn,0,1.2,0);cylinder(.48,.48,.07,mat(0x695243),urn,0,1.28,0);for(let i=0;i<3;i++){let x=(i-1)*.10;cylinder(.014,.014,.46,mat(0x9a483d),urn,x,1.53,0);sphere(.022,mat(0xf0bca2),urn,x,1.76,0)}
// Cushions, reserved location for prayer/chant
const cushions=[];const cushionFabric=mat(0xb7a8a0),cushionTrim=mat(0xd4c6ac);
for(let z of [-1.05,.55,2.12])for(let x of [-3.6,-1.8,0,1.8,3.6]){
 let g=new THREE.Group();g.position.set(x,.31,z);scene.add(g);
 let pad=cylinder(.70,.70,.17,cushionFabric,g,0,0,0,40);pad.scale.z=.83;
 const piping=mesh(new THREE.TorusGeometry(.67,.027,8,48),cushionTrim,g,0,.085,0);piping.rotation.x=Math.PI/2;piping.scale.y=.83;
 cushions.push(g);
}
// Temple décor plants and lanterns
for(let x of [-5.5,5.5]){cylinder(.46,.38,.65,mat(0x92694d),scene,x,.58,-4.9);for(let j=0;j<7;j++){let a=j*Math.PI*2/7;let l=sphere(.37,leaf,scene,x+Math.cos(a)*.4,1.28+Math.sin(j)*.15,-4.9+Math.sin(a)*.42);l.scale.set(.5,1.5,.5)}box(.45,.67,.45,mat(0xecbe77,.7,.2),scene,x,6.15,1.2);sphere(.14,mat(0xfff0a6),scene,x,6.12,1.2)}
for(let x of [-8.5,8.5]){for(let z of [-5,1]){sphere(.9,mat(0x668262),scene,x,.8,z)}}
// Gold-and-crimson temple backdrop: a separate, toggleable 3D layer.
// No original GitHub art, audio, sprites or code are bundled.
const sanctuary = createSanctuaryDecor({mat,mesh,box,cylinder,sphere});
scene.add(sanctuary.group);
const wishTrees = createWishTrees(scene);
document.querySelector('#scenestyle').addEventListener('change', event => {
  sanctuary.setEnabled(event.target.value === 'gold');
});
// Joint-driven chibi 3D: all authored primitives with hierarchical articulated joints
const figure=new THREE.Group();scene.add(figure);figure.position.set(0,.23,4.4);
const skin=mat(0xffd5bd),hair=mat(0x49302b),dress=mat(0xb8c2bf),pants=mat(0x879b99),black=mat(0x292b34),pink=mat(0xec9397);
const body=new THREE.Group();body.position.y=.89;figure.add(body);const torso=sphere(.39,dress,body,0,.29,0);torso.scale.set(1.05,1.22,.75);
const headJoint=new THREE.Group();headJoint.position.set(0,.92,0);body.add(headJoint);let head=sphere(.48,skin,headJoint,0,.36,.03);head.scale.set(1.05,1.12,1.0);const haircap=sphere(.5,hair,headJoint,0,.61,-.06);haircap.scale.set(1.085,.81,1.075);for(let s of [-1,1]){sphere(.072,black,headJoint,s*.19,.36,.46);sphere(.085,pink,headJoint,s*.34,.20,.40).scale.set(1,.55,.5)}sphere(.034,mat(0xc77e75),headJoint,0,.22,.51);
let bun=sphere(.29,hair,headJoint,0,.72,-.46);bun.scale.set(1.1,1.12,1);
const boyHair=[];for(let i=-2;i<=2;i++){const lock=sphere(.20,hair,headJoint,i*.19,.77,.10);lock.scale.set(.82,.60,1.55);boyHair.push(lock)}
// V2: stylized details. The local +Z side is the face, including when facing the Buddha.
for(const side of [-1,1]){
 const brow=box(.14,.023,.016,hair,headJoint,side*.19,.49,.477);brow.rotation.z=side*.12;
 const eyeShine=sphere(.022,mat(0xffffff),headJoint,side*.17,.397,.527);eyeShine.scale.set(.7,.85,.35);
 const fringe=sphere(.14,hair,headJoint,side*.25,.69,.28);fringe.scale.set(1.5,.52,.7);
}
const smile=mesh(new THREE.TorusGeometry(.082,.013,6,18,Math.PI),mat(0x9d5a52),headJoint,0,.18,.506);smile.rotation.z=Math.PI;
const collar=mesh(new THREE.TorusGeometry(.21,.055,9,24),mat(0xffe4ce),body,0,.57,0);collar.rotation.x=Math.PI/2;
const arms=[];for(let s of [-1,1]){let shoulder=new THREE.Group();shoulder.position.set(s*.36,.54,0);body.add(shoulder);let upper=sphere(.15,dress,shoulder,s*.05,-.22,0);upper.scale.set(.83,1.85,.87);let elbow=new THREE.Group();elbow.position.set(s*.08,-.43,0);shoulder.add(elbow);let fore=sphere(.115,skin,elbow,0,-.18,.02);fore.scale.set(.8,1.6,.8);sphere(.12,skin,elbow,0,-.37,.03);arms.push({shoulder,elbow,s})}
const legs=[];for(let s of [-1,1]){let hip=new THREE.Group();hip.position.set(s*.19,.72,0);figure.add(hip);let leg=sphere(.17,pants,hip,0,-.28,0);leg.scale.set(.9,1.9,.9);let knee=new THREE.Group();knee.position.y=-.48;hip.add(knee);sphere(.14,pants,knee,0,-.20,0).scale.set(.85,1.55,.85);sphere(.18,mat(0x69483a),knee,0,-.43,.13).scale.set(.96,.5,1.65);legs.push({hip,knee,s})}
// Shared two-hand grip is positioned using the hands rather than floating independently.
const handItem=new THREE.Group();body.add(handItem);handItem.position.set(0,.18,.37);
const gripHands=[];for(let side of [-1,1]){const palm=sphere(.11,skin,body,side*.095,.18,.44);gripHands.push(palm);palm.visible=false}
// Crossed shins visually replace the standing legs in the seated lotus pose.
const crossedLegs=new THREE.Group();figure.add(crossedLegs);crossedLegs.position.y=.28;
for(let side of [-1,1]){const shin=sphere(.20,pants,crossedLegs,side*.20,.10,.11);shin.scale.set(1.8,.58,.80);shin.rotation.y=side*.52;const foot=sphere(.145,mat(0x77675b),crossedLegs,-side*.33,.10,.27);foot.scale.set(1.25,.62,.85)}crossedLegs.visible=false;
// Kneeling shins point backward while both knees rest on the cushion.
const kneelingLegs=new THREE.Group();figure.add(kneelingLegs);kneelingLegs.position.y=.30;
for(let side of [-1,1]){sphere(.16,pants,kneelingLegs,side*.22,.13,.01).scale.set(1,.85,1.25);sphere(.15,pants,kneelingLegs,side*.22,.09,.38).scale.set(.85,.55,1.8)}kneelingLegs.visible=false;const sticks=new THREE.Group();handItem.add(sticks);for(let i=-1;i<=1;i++){cylinder(.012,.012,.53,mat(0x9e5235),sticks,i*.06,.0,0);sphere(.02,mat(0xe9c1a2),sticks,i*.06,.28,0)}sticks.position.y=.06;const offering=lotus(handItem,0,.07,0,.7);handItem.visible=false;
// Real 108-bead loop held in front of the folded hands while seated cross-legged.
const prayerBeads = new THREE.Group(); body.add(prayerBeads); prayerBeads.position.set(0,.20,.64);
const beadMat = mat(0x874a2b,.5), beadMarker = mat(0xf4c87a,.4);
const beadMeshes=[];
for(let i=0;i<108;i++){
 const a=i*Math.PI*2/108;
 const bead=sphere(.026,i%27===0?beadMarker:beadMat,prayerBeads,Math.cos(a)*.28,Math.sin(a)*.24,0,8,7);
 beadMeshes.push(bead);
}
prayerBeads.visible=false;
const beadHands=[];
for(const side of [-1,1]){
 const palm=sphere(.10,skin,body,side*.19,.21,.65,12,9);
 palm.scale.set(.75,1.0,.85);palm.visible=false;beadHands.push(palm);
}
// Bamboo divination cup, held by both hands and gently shaken.
const fortuneCup=new THREE.Group();body.add(fortuneCup);fortuneCup.position.set(0,.10,.58);
const cupWood=mat(0x96613d,.7), cupGold=mat(0xdab36a,.55,.15);
cylinder(.17,.14,.44,cupWood,fortuneCup,0,.05,0,14);
cylinder(.18,.18,.045,cupGold,fortuneCup,0,.28,0,14);
for(let i=0;i<9;i++){const a=i*2*Math.PI/9;cylinder(.012,.012,.52,mat(0xd7ac6c),fortuneCup,Math.cos(a)*.075,.51,Math.sin(a)*.075,7)}
fortuneCup.visible=false;
const rayClock=new THREE.Clock();const tmpVec=new THREE.Vector3();let active=null;let phase='idle';let phaseTime=0;let actionTime=0;let repeat=0;let count=0;let path=[];let legPhase=0;let time=0;let motionDuration=0;let muted=true;let audioCtx=null;let audioNodes=[];const activityButtons=[...document.querySelectorAll('[data-act]')];
const home=new THREE.Vector3(0,.23,4.4);const positions={incense:new THREE.Vector3(-3.1,.23,-2.35),bow:new THREE.Vector3(0,.23,-1.05),flower:new THREE.Vector3(2.25,.23,-4.3),chant:new THREE.Vector3(1.8,.23,-1.05),fortune:new THREE.Vector3(3.7,.23,-2.8),wish:new THREE.Vector3(-8.5,.23,1.1)};
let selectedCushionId=null;let selectedWishTree='left';
function entry(t){const node=document.createElement('div');node.className='entry';let stamp=new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});let a=document.createElement('time');a.textContent=stamp;let b=document.createElement('span');b.textContent=t;node.append(a,b);document.querySelector('#log').prepend(node);while(document.querySelector('#log').children.length>24)document.querySelector('#log').lastChild.remove()}
function status(t,p=0){document.querySelector('#status').textContent=t;document.querySelector('#progress').style.width=`${Math.max(0,Math.min(100,p*100))}%`}
function setPhase(s){phase=s;phaseTime=0}
function start(a){
 if(!entered){entry('Hãy vào chánh điện trước khi bắt đầu.');return}
 if(active)return;
 selectedCushionId=null;
 if(a==='bow'||a==='chant'){
   const prefer=a==='bow'?[7,6,8,5,9,2,1,3,0,4,12,11,13,10,14]:[8,9,7,6,5,13,12,14,11,10,3,2,4,1,0];
   selectedCushionId=prefer.find(i=>!room.isOccupied(i));
   if(selectedCushionId===undefined){entry('Các bồ đoàn đều đang được sử dụng.');return}
 }
 selectedWishTree=document.querySelector('#wishTree').value;
 handItem.position.set(0,.18,.37);active=a;offeredIncense.visible=false;flowerPlaced.visible=false;
 prayerBeads.visible=false;beadHands.forEach(h=>h.visible=false);fortuneCup.visible=false;repeat=0;count=0;actionTime=0;
 const labels={incense:'Thắp hương',bow:'Lễ Phật',flower:'Dâng hoa sen',chant:'Ngồi niệm Phật',fortune:'Lắc quẻ xin xăm',wish:'Buộc dây cầu duyên'};
 entry(`Bắt đầu: ${labels[a]}`);activityButtons.forEach(b=>{b.disabled=true;b.classList.toggle('active',b.dataset.act===a)});
 handItem.visible=['incense','flower'].includes(a);sticks.visible=a==='incense';offering.visible=a==='flower';
 let destination=positions[a].clone();
 if(selectedCushionId!==null){const c=cushions[selectedCushionId].position;destination.set(c.x,.23,c.z)}
 if(a==='wish'){destination.x=selectedWishTree==='left'?-8.5:8.5}
 path=[destination];setPhase('walk-in');status('Đang di chuyển vào chánh điện');room.publish();
}
function stop(done=false){let was=active;crossedLegs.visible=false;kneelingLegs.visible=false;legs.forEach(l=>l.hip.visible=true);active=null;handItem.visible=false;prayerBeads.visible=false;beadHands.forEach(h=>h.visible=false);fortuneCup.visible=false;selectedCushionId=null;gripHands.forEach(h=>h.visible=false);activityButtons.forEach(b=>{b.disabled=false;b.classList.remove('active')});if(done){entry('Đã hoàn thành hoạt động 🌸');status('Hoàn thành · Tâm an, vạn sự an lành',1);if(was)merits.award(was)}else{entry(was?'Đã dừng hoạt động':'Trở về vị trí ban đầu');status('Sẵn sàng bắt đầu',0)}setPhase('idle');if(!done){figure.position.copy(home);figure.rotation.y=0}resetV2Pose()}
function resetPose(){body.rotation.set(0,0,0);body.position.y=.89;headJoint.rotation.set(0,0,0);for(let a of arms){a.shoulder.rotation.set(0,0,0);a.elbow.rotation.set(0,0,0)}for(let l of legs){l.hip.rotation.set(0,0,0);l.knee.rotation.set(0,0,0)}}
function interpolateTo(dest,dt){let d=dest.clone().sub(figure.position);d.y=0;const len=d.length();if(len<.07)return true;let step=Math.min(len,dt*1.55);figure.position.addScaledVector(d.normalize(),step);// Chibi's eyes and chest point toward local +Z. Rotate that forward vector toward travel direction.
const angle=Math.atan2(d.x,d.z);let delta=Math.atan2(Math.sin(angle-figure.rotation.y),Math.cos(angle-figure.rotation.y));figure.rotation.y+=delta*Math.min(1,dt*7);legPhase+=dt*11;for(let l of legs){l.hip.rotation.x=Math.sin(legPhase+l.s*Math.PI/2)*.5;l.knee.rotation.x=Math.max(0,Math.sin(legPhase+l.s*Math.PI/2))*.24}for(let a of arms)a.shoulder.rotation.x=-Math.sin(legPhase+a.s*Math.PI/2)*.36;body.position.y=.89+Math.abs(Math.sin(legPhase))*.035;return false}
function faceAltar(dt){const altarFacing=Math.PI;let diff=Math.atan2(Math.sin(altarFacing-figure.rotation.y),Math.cos(altarFacing-figure.rotation.y));figure.rotation.y+=diff*Math.min(1,dt*8)}
// V2 animation controller. The pose is interpolated each frame instead of snapping.
const ease=(t)=>{t=THREE.MathUtils.clamp(t,0,1);return t*t*(3-2*t)};
const smooth=(value,target,dt,speed=9)=>THREE.MathUtils.damp(value,target,speed,dt);
const pose={bodyY:.89,torsoX:0,headX:0,armX:0,armZ:0,elbowX:0,hipX:0,kneeX:0,handY:.18,handZ:.37};
function poseTo(target,dt){for(const key in pose)pose[key]=smooth(pose[key],target[key]??({bodyY:.89,torsoX:0,headX:0,armX:0,armZ:0,elbowX:0,hipX:0,kneeX:0,handY:.18,handZ:.37})[key],dt);body.position.y=pose.bodyY;body.rotation.x=pose.torsoX;headJoint.rotation.x=pose.headX;for(const a of arms){a.shoulder.rotation.x=pose.armX;a.shoulder.rotation.z=a.s*pose.armZ;a.elbow.rotation.x=pose.elbowX}for(const l of legs){l.hip.rotation.x=pose.hipX;l.knee.rotation.x=pose.kneeX}handItem.position.y=pose.handY;handItem.position.z=pose.handZ;
const holding=active==='incense'||active==='flower';
for(let i=0;i<2;i++){let palm=gripHands[i];palm.visible=holding;palm.position.set((i===0?-.095:.095),pose.handY-.045,pose.handZ+.03)}
if(holding){for(const a of arms){a.shoulder.rotation.x=-.95;a.shoulder.rotation.z=a.s*.36;a.elbow.rotation.x=-.80}}
}
function faceTarget(dir,dt){const target=Math.atan2(dir.x,dir.z);const diff=Math.atan2(Math.sin(target-figure.rotation.y),Math.cos(target-figure.rotation.y));figure.rotation.y+=diff*Math.min(1,dt*9)}
function walkTo(dest,dt){const d=dest.clone().sub(figure.position);d.y=0;const distance=d.length();if(distance<.055)return true;faceTarget(d,dt);figure.position.addScaledVector(d.normalize(),Math.min(distance,dt*1.65));legPhase+=dt*10.5;body.position.y=.89+Math.abs(Math.sin(legPhase))*.055;for(const l of legs){l.hip.rotation.x=Math.sin(legPhase+l.s*Math.PI/2)*.44;l.knee.rotation.x=Math.max(0,Math.sin(legPhase+l.s*Math.PI/2))*.3}for(const a of arms){a.shoulder.rotation.x=-Math.sin(legPhase+a.s*Math.PI/2)*.32;a.shoulder.rotation.z=0;a.elbow.rotation.x=0}return false}
const flowerPlaced=lotus(scene,2.18,2.32,-5.55,.0);flowerPlaced.visible=false;
const offeredIncense=new THREE.Group();scene.add(offeredIncense);offeredIncense.position.set(-3.1,1.3,-3.8);for(let i=-1;i<=1;i++){cylinder(.013,.013,.46,mat(0x9e5235),offeredIncense,i*.09,.23,0);sphere(.024,mat(0xedc2a7),offeredIncense,i*.09,.46,0)}offeredIncense.visible=false;
function resetV2Pose(){crossedLegs.visible=false;kneelingLegs.visible=false;legs.forEach(l=>l.hip.visible=true);for(const k in pose)pose[k]=({bodyY:.89,torsoX:0,headX:0,armX:0,armZ:0,elbowX:0,hipX:0,kneeX:0,handY:.18,handZ:.37})[k];resetPose()}
function setSeatPose(kind,t){crossedLegs.visible=kind==='chant'&&t>.6;kneelingLegs.visible=kind==='bow'&&t>.6;legs.forEach(l=>l.hip.visible=!(crossedLegs.visible||kneelingLegs.visible))}
function finish(){setPhase('recover');entry('Nhân vật chuẩn bị đứng dậy và trở về')}
function step(dt){time+=dt;phaseTime+=dt;
 if(!active){headJoint.rotation.z=Math.sin(time*1.2)*.018;body.position.y=.89+Math.sin(time*2)*.009;return}
 actionTime+=dt;
 if(phase==='walk-in'){if(walkTo(path[0],dt)){resetV2Pose();setPhase('turn-to-altar')}return}
 if(phase==='turn-to-altar'){faceAltar(dt);poseTo({armX:-.55,armZ:-.2,elbowX:-.25},dt);if(phaseTime>1.0)setPhase('prepare');return}
 if(phase==='prepare'){faceAltar(dt);poseTo({armX:-1.05,armZ:-.42,elbowX:-.45},dt);if(phaseTime<.95)return;
  if(active==='incense'){entry('Nâng 3 nén hương hướng về Đức Phật');motionDuration=4}
  else if(active==='flower'){entry('Nâng hoa sen hướng về Đức Phật');motionDuration=4}
  else if(active==='bow'){repeat=Number(document.querySelector('#bows').value);entry(`Bắt đầu lễ Phật ${repeat} lạy`);motionDuration=3.8}
  else if(active==='chant'){repeat=Number(document.querySelector('#chants').value);entry(`Bắt đầu niệm ${repeat} biến “Nam mô A Di Đà Phật”`);motionDuration=1.9}
  else if(active==='fortune'){motionDuration=3.5;entry('Đang lắc ống xin xăm...')}
  else if(active==='wish'){motionDuration=2.6;entry('Treo dây đỏ gửi ước nguyện an lành...')}
  setPhase('perform');return}
 if(phase==='perform'){
  faceAltar(dt);const t=phaseTime;const u=THREE.MathUtils.clamp(t/motionDuration,0,1);
  if(active==='incense'){
   const raise=ease(t/1.7);poseTo({armX:-1.35*raise,armZ:-.52*raise,elbowX:-.45*raise,handY:.18+.30*raise,handZ:.37+.10*raise},dt);
   status('Đang dâng 3 nén hương',u);
   if(t>=motionDuration){handItem.visible=false;offeredIncense.visible=true;entry('Đã cắm 3 nén hương vào lư');finish()}
  }else if(active==='flower'){
   const raise=ease(t/1.7);poseTo({armX:-1.4*raise,armZ:-.52*raise,elbowX:-.42*raise,handY:.18+.32*raise,handZ:.37+.10*raise},dt);
   status('Đang dâng hoa sen',u);
   if(t>=motionDuration){handItem.visible=false;flowerPlaced.visible=true;flowerPlaced.scale.setScalar(.75);entry('Đã đặt hoa sen trên bàn thờ');finish()}
  }else if(active==='bow'){
   // One repetition contains a distinct kneel, down-bow, return and brief upright pause.
   const kneel=ease(t/.9);const down=ease((t-1.05)/.7);const up=ease((t-2.15)/.7);const bend=Math.max(0,down-up);
   poseTo({bodyY:.89-.33*kneel-.08*bend,torsoX:.10*kneel+1.05*bend,headX:.28*bend,armX:-.8*kneel-.72*bend,armZ:-.42*kneel,elbowX:-.35*kneel,hipX:-1.2*kneel,kneeX:1.55*kneel},dt,10);
   setSeatPose('bow',kneel);status(`Đang lễ Phật · ${count+1}/${repeat} lạy`,(count+u)/repeat);
   if(t>=motionDuration){count++;if(count>=repeat){entry(`Hoàn thành ${repeat} lạy`);finish()}else{setPhase('perform');if(count%10===0)entry(`Đã lễ ${count}/${repeat} lạy`)}}
  }else if(active==='chant'){
   const sit=ease(t/.9);poseTo({bodyY:.89-.38*sit,torsoX:.08*sit,headX:.03+Math.sin(time*2)*.025,armX:-1.15*sit,armZ:-.50*sit,elbowX:-.35*sit,hipX:-1.32*sit,kneeX:1.65*sit},dt);
   setSeatPose('chant',sit);prayerBeads.visible=sit>.5;beadHands.forEach((h,i)=>{h.visible=sit>.5;h.position.y=.21+Math.sin(t*4+i*Math.PI)*.037});prayerBeads.rotation.z=-(count+u)*Math.PI*2/108;prayerBeads.position.y=.22+Math.sin(t*3)*.012;status(`Nam mô A Di Đà Phật · ${count+1}/${repeat}`, (count+u)/repeat);
   if(t>=motionDuration){count++;if(count>=repeat){entry(`Đã hoàn thành ${repeat} biến niệm Phật`);prayerBeads.visible=false;beadHands.forEach(h=>h.visible=false);finish()}else{setPhase('perform');if(count%9===0)entry(`Đã niệm ${count}/${repeat} biến`)}}
  }else if(active==='fortune'){
   fortuneCup.visible=true;
   fortuneCup.rotation.set(Math.sin(t*17)*.16,0,Math.sin(t*13)*.22);
   poseTo({armX:-1.15,armZ:-.47,elbowX:-.5,handY:.22,handZ:.45},dt);
   status('Đang lắc ống xin xăm',u);
   if(t>=motionDuration){fortuneCup.visible=false;openFortune();entry('Đã nhận một quẻ chiêm nghiệm');finish()}
  }else if(active==='wish'){
   poseTo({armX:-1.3,armZ:-.3,elbowX:-.55},dt);
   status('Đang buộc dây đỏ tại cây đa',u);
   if(t>=motionDuration){wishTrees.addRibbon(selectedWishTree);room.sendRitual('wish',selectedWishTree);entry('Đã treo dây đỏ gửi lời nguyện an lành');finish()}
  }return}
 if(phase==='recover'){setSeatPose(null,0);prayerBeads.visible=false;beadHands.forEach(h=>h.visible=false);fortuneCup.visible=false;faceAltar(dt);poseTo({},dt);if(phaseTime>1.35){resetV2Pose();setPhase('walk-out')}return}
 if(phase==='walk-out'){if(walkTo(home,dt)){figure.rotation.y=0;stop(true)}else status('Đang đi ra khỏi chánh điện',.95)}
}
activityButtons.forEach(b=>b.addEventListener('click',()=>start(b.dataset.act)));document.querySelector('#cancel').addEventListener('click',()=>stop());document.querySelector('#resetcam').addEventListener('click',()=>{camera.position.set(9.5,9.7,18.5);controls.target.set(0,1.5,-1.4);controls.update()});document.querySelector('#gender').addEventListener('change',e=>{const female=e.target.value==='female';bun.visible=female;boyHair.forEach(h=>h.visible=!female);torso.material=dress;for(let a of arms){a.shoulder.children[0].material=dress}document.querySelector('#actorlabel').textContent=female?'Chibi nữ':'Chibi nam';entry(`Đổi nhân vật: ${female?'Chibi nữ':'Chibi nam'}`)});
// Simple ambient drone via Web Audio. Must be enabled by user gesture (browser autoplay policy)
const soundBtn=document.querySelector('#sound');function audioStart(){audioCtx??=new(window.AudioContext||window.webkitAudioContext)();audioCtx.resume();const out=audioCtx.createGain();out.gain.value=.023;out.connect(audioCtx.destination);for(const hz of [130.81,196,261.63]){const osc=audioCtx.createOscillator();osc.type='sine';osc.frequency.value=hz;osc.connect(out);osc.start();audioNodes.push(osc)}audioNodes.push(out)}function audioStop(){audioNodes.forEach(n=>{try{n.stop()}catch{}try{n.disconnect()}catch{}});audioNodes=[]}soundBtn.addEventListener('click',()=>{muted=!muted;if(muted){audioStop();soundBtn.textContent='🔇 Âm thanh'}else{audioStart();soundBtn.textContent='🔊 Âm thanh'};entry(muted?'Đã tắt âm thanh':'Đã bật âm thanh thiền nền')});
// Multiplayer avatars and above-head name labels.
const label=document.createElement('div');label.className='player-label';document.body.append(label);
let playerName='Khách an nhiên';let entered=false;let lastChatAt=0;let ownBubbleUntil=0;
let syncStatus='Chưa kết nối';
const room=connectRoom({onPlayers:renderRemotes,onStatus:(t)=>{syncStatus=t;document.querySelector('#chat-info').textContent=`${t} · Tin nhắn chỉ hiển thị trong phòng.`;document.querySelector('#chat-send').disabled=!room.isConnected()},onCount:(n)=>{document.querySelector('#online').textContent=`👥 ${n} người`;document.querySelector('.chat-heading strong').textContent=`💬 Trò chuyện · ${n} người`},onMessage:receiveChat,onRitual:(p)=>{wishTrees.addRibbon(p.side)}});
const merits=createMeritSystem(room,{onChange:updateMeritUI,onNotice:(s)=>{entry(s);showToast(s)}});
function updateMeritUI({merits:turns,level,dharmaName,cloud}){
 document.querySelector('#leveltop').textContent=`🪷 Cấp ${level} · ${turns} lượt`;
 document.querySelector('#merit-level').textContent=`Cấp ${level}`;
 document.querySelector('#merit-turns').textContent=`${turns} lượt`;
 const next=nextLevel(turns),start=currentLevelStart(turns);
 document.querySelector('#merit-bar').style.width=`${Math.round((turns-start)/(next-start)*100)}%`;
 document.querySelector('#merit-next').textContent=`Còn ${next-turns} lượt để lên cấp ${level+1}`;
 document.querySelector('#dharma-label').textContent=dharmaName?`🪷 Pháp danh ảo: ${dharmaName}`:'🪷 Pháp danh: mở ở cấp 3';
 document.querySelector('#save-mode').textContent=cloud?'☁ Đã lưu tiến độ':'💾 Đã lưu trên thiết bị';
 room?.publish();
}
function showToast(text){const toast=document.querySelector('#toast');toast.textContent=text;toast.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),3700)}
const remotes=new Map();
function createRemoteAvatar(id){
 const marker=new THREE.Group();scene.add(marker);
 // A subtle marker makes other visitors visible even if avatars momentarily overlap.
 const halo=new THREE.Mesh(new THREE.TorusGeometry(.49,.025,6,40),new THREE.MeshBasicMaterial({color:0x63a894,transparent:true,opacity:.88,depthWrite:false}));
 halo.rotation.x=-Math.PI/2;halo.position.y=.08;marker.add(halo);
 const outfit=mat(0xaabbb7),rSkin=mat(0xf6c6ac),rHair=mat(0x49302b),rPants=mat(0x82928a);
 const bodyGroup=new THREE.Group();marker.add(bodyGroup);bodyGroup.position.y=1.04;
 const chest=sphere(.39,outfit,bodyGroup,0,.1,0);chest.scale.set(1,1.2,.74);
 const headGroup=new THREE.Group();headGroup.position.y=.82;bodyGroup.add(headGroup);
 sphere(.42,rSkin,headGroup,0,.25,.02);sphere(.44,rHair,headGroup,0,.50,-.08).scale.set(1,.74,1);
 const bunMesh=sphere(.22,rHair,headGroup,0,.63,-.36);bunMesh.visible=true;
 const hairLocks=[];for(let i=-1;i<=1;i++){hairLocks.push(sphere(.15,rHair,headGroup,i*.19,.60,.12))}
 for(const side of [-1,1]){sphere(.06,mat(0x2c2928),headGroup,side*.15,.27,.385);sphere(.14,outfit,bodyGroup,side*.44,-.06,.04).scale.set(.72,2.6,.76)}
 const feet=[];for(const x of [-.19,.19])feet.push(sphere(.17,rPants,marker,x,.44,.10));
 const crossed=new THREE.Group();marker.add(crossed);crossed.position.y=.41;crossed.visible=false;for(const side of [-1,1]){const shin=sphere(.19,rPants,crossed,side*.17,0,.16);shin.scale.set(1.6,.55,.8);shin.rotation.y=side*.6}
 const name=document.createElement('div');name.className='player-label remote';document.body.append(name);
 const bubble=document.createElement('div');bubble.className='chat-bubble';document.body.append(bubble);bubble.hidden=true;
 return {marker,name,bubble,bodyGroup,bunMesh,hairLocks,feet,crossed,target:new THREE.Vector3(),lastAction:'',action:'idle',phase:'idle',expires:0,id};
}
function renderRemotes(players){
 // V4 bugfix: in V4 everyone spawned at (0, 4.4), exactly overlapping the local avatar.
 // All clients sort the same presence IDs and compute distinct standing positions.
 const ids=[...new Set([room.id,...players.map(p=>p.id).filter(Boolean)])].sort();
 const ownIndex=Math.max(0,ids.indexOf(room.id));
 const pair=Math.floor(ownIndex/2), side=ownIndex%2===0?-1:1;
 const nextHome=new THREE.Vector3(side*(1.22+pair*1.27),.23,4.40+pair*.52);
 const wasAtHome=figure.position.distanceTo(home)<.65;
 if(home.distanceTo(nextHome)>.015){
   home.copy(nextHome);
   if(entered && !active && wasAtHome){figure.position.copy(home);room.update(currentState())}
 }
 const roster=players.map(p=>p.name||'Khách').slice(0,8).join(' · ');
 document.querySelector('#chat-info').textContent=room.isConnected()
   ? `● Đã kết nối · ${players.length+1} người${roster?' · '+roster:''}`
   : syncStatus;
 const seen=new Set();
 for(const p of players){if(p.id===room.id)continue;seen.add(p.id);
  let el=remotes.get(p.id);if(!el){el=createRemoteAvatar(p.id);remotes.set(p.id,el);el.marker.position.set(p.x??0,.23,p.z??4.4)}
  el.target.set(p.x??0,.23,p.z??4);el.targetRotation=p.rotation??0;el.action=p.action||'idle';el.phase=p.phase||'idle';
  el.bunMesh.visible=p.gender!=='male';el.hairLocks.forEach(h=>h.visible=p.gender==='male');
  const level=Number(p.level)||0;
  const actionName={incense:'Thắp hương',flower:'Dâng hoa',bow:'Lễ Phật',chant:'Niệm Phật',fortune:'Xin xăm',wish:'Cầu duyên'}[p.action]||'Tĩnh tâm';
  el.name.textContent=`${p.name||'Khách'} · Cấp ${level} · ${actionName}${p.dharmaName?' 🪷 '+p.dharmaName:''}`;
 }
 for(const [id,el] of remotes){if(!seen.has(id)){scene.remove(el.marker);el.name.remove();el.bubble.remove();remotes.delete(id)}}
}
function moveRemotes(dt){for(const el of remotes.values()){
 el.marker.position.lerp(el.target,Math.min(1,dt*9));
 const angle=el.targetRotation??0,delta=Math.atan2(Math.sin(angle-el.marker.rotation.y),Math.cos(angle-el.marker.rotation.y));
 el.marker.rotation.y+=delta*Math.min(1,dt*9);
 const seated=['chant','bow'].includes(el.action) && ['perform','recover'].includes(el.phase);
 el.bodyGroup.position.y=THREE.MathUtils.damp(el.bodyGroup.position.y,seated?.64:1.04,9,dt);
 el.bodyGroup.rotation.x=THREE.MathUtils.damp(el.bodyGroup.rotation.x,el.action==='bow'&&el.phase==='perform'?.24:0,7,dt);
 el.crossed.visible=seated;for(const foot of el.feet)foot.visible=!seated;
 el.bubble.hidden=performance.now()>el.expires;
 if(!el.bubble.hidden)projectLabel(el.bubble,el.marker,new THREE.Vector3(0,3.3,0));
}}
function projectLabel(labelNode,object,offset){const vec=object.position.clone().add(offset).project(camera);labelNode.style.display=vec.z>1?'none':'block';labelNode.style.left=`${(vec.x*.5+.5)*innerWidth}px`;labelNode.style.top=`${(-vec.y*.5+.5)*innerHeight}px`}
function currentState(){const progress=merits?.get();return {name:playerName,gender:document.querySelector('#gender').value,x:figure.position.x,z:figure.position.z,rotation:figure.rotation.y,action:active||'idle',phase,count,cushionId:selectedCushionId,level:progress?.level||0,dharmaName:progress?.dharmaName||''}}
room.setState(currentState);
try{const savedName=localStorage.getItem('temple-display-name');if(savedName)document.querySelector('#displayname').value=savedName.slice(0,24)}catch{}
const enterButton=document.querySelector('#enterRoom');
enterButton.addEventListener('click',async()=>{
 if(entered)return;
 playerName=(document.querySelector('#displayname').value||'Khách an nhiên').trim().replace(/[\u0000-\u001f]/g,' ').slice(0,24)||'Khách an nhiên';
 document.querySelector('#gender').value=document.querySelector('#joinGender').value;
 document.querySelector('#gender').dispatchEvent(new Event('change'));
 try{localStorage.setItem('temple-display-name',playerName)}catch{}
 entered=true;document.querySelector('#join').remove();document.querySelector('#chat-panel').classList.add('chat-ready');
 // Starting position follows the same slot logic as the first Presence synchronization.
 if(!active){home.set(-1.22,.23,4.4);figure.position.copy(home)}
 room.setState(currentState);room.start();entry(`${playerName} đã vào chánh điện`);
 await merits.init(playerName,document.querySelector('#gender').value);
 room.publish();
});
function receiveChat({id,name,text,mine}){
 const box=document.querySelector('#chat-messages');
 const row=document.createElement('div');row.className=`chat-message${mine?' own':''}`;
 const title=document.createElement('strong');title.textContent=mine?'Bạn':name;
 const content=document.createElement('span');content.textContent=text;
 row.append(title,content);box.append(row);
 while(box.children.length>45)box.firstChild.remove();box.scrollTop=box.scrollHeight;
 if(!mine){const avatar=remotes.get(id);if(avatar){avatar.bubble.textContent=text;avatar.expires=performance.now()+5500;avatar.bubble.hidden=false}}else{label.dataset.chat=text.slice(0,54);ownBubbleUntil=performance.now()+5500}
}
const chatForm=document.querySelector('#chat-form');chatForm.addEventListener('submit',e=>{
 e.preventDefault();if(!entered)return;
 const now=performance.now();if(now-lastChatAt<1500){showToast('Hãy gửi tin nhắn cách nhau ít nhất 1,5 giây');return}
 const field=document.querySelector('#chat-input');const value=field.value.replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,180);
 if(!value)return;
 if(!room.sendChat(value,playerName)){showToast('Chưa kết nối phòng trò chuyện');return}
 lastChatAt=now;field.value='';receiveChat({id:room.id,name:playerName,text:value,mine:true});
});
document.querySelector('#toggleChat').addEventListener('click',()=>document.querySelector('#chat-panel').classList.toggle('collapsed'));
document.querySelector('#toggleMenu').addEventListener('click',()=>document.querySelector('.sidebar').classList.toggle('closed'));
if(innerWidth<760)document.querySelector('#chat-panel').classList.add('collapsed');
document.querySelector('#fortune-close').addEventListener('click',()=>document.querySelector('#fortune-modal').hidden=true);
function openFortune(){const result=drawFortune();document.querySelector('#fortune-title').textContent=result.title;
 document.querySelector('#fortune-number').textContent=`Số ${String(result.number).padStart(2,'0')}`;
 document.querySelector('#fortune-verse').textContent=result.verse;
 document.querySelector('#fortune-guidance').textContent=result.guidance;
 document.querySelector('#fortune-modal').hidden=false;
}
function applyLight(){const hour=new Date().getHours();const selected=document.querySelector('#daymode').value;const mode=selected==='auto'?(hour>=6&&hour<10?'morning':hour>=10&&hour<15?'noon':hour>=15&&hour<18?'afternoon':'night'):selected;
const opts={morning:[0xfff1dc,1.25,2.1,2.6,1.4],noon:[0xf4e9dc,1.55,2.8,3.3,.9],afternoon:[0xf3cda8,1.17,1.7,2.5,2.0],night:[0x332e49,.85,.48,.65,5.0]};const [bg,exposure,hem,dir,altar]=opts[mode];scene.background.setHex(bg);scene.fog.color.setHex(bg);renderer.toneMappingExposure=exposure;skyLight.intensity=hem;sun.intensity=dir;warm.intensity=altar*24;sun.color.setHex(mode==='afternoon'?0xffae73:0xffe5b1)}
document.querySelector('#daymode').addEventListener('change',applyLight);applyLight();setInterval(()=>{if(document.querySelector('#daymode').value==='auto')applyLight()},60000);
entry('Chào mừng đến chánh điện 3D');entry('Hãy chọn một biểu tượng phía dưới để bắt đầu');
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);const narrow=innerWidth<760;controls.target.set(0,1.5,-1.4);if(narrow&&camera.position.x===9.5){camera.position.set(10.5,11,25)}}window.addEventListener('resize',resize);resize();
function animate(){requestAnimationFrame(animate);let dt=Math.min(rayClock.getDelta(),.055);step(dt);controls.update();sanctuary.animate(time);wishTrees.animate(time);moveRemotes(dt);renderer.render(scene,camera);if(entered){label.textContent=playerName+(performance.now()<ownBubbleUntil?' · 💬 '+label.dataset.chat:'');projectLabel(label,figure,new THREE.Vector3(0,2.7,0));room.update(currentState())}else label.style.display='none';for(const el of remotes.values())projectLabel(el.name,el.marker,new THREE.Vector3(0,2.75,0))}animate();
