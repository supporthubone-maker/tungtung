import * as THREE from 'three';

/**
 * A 3D interpretation of the central-altar / gold-and-crimson / lotus-aisle
 * composition from the public Temple RPC demo. All geometry is created here;
 * no assets or executable code are copied from the reference repository.
 * This visual layer is optional: hiding group restores the existing V3 hall.
 */
export function createSanctuaryDecor({ mat, mesh, box, cylinder, sphere }) {
  const group = new THREE.Group();
  group.name = 'An Nhien · Chan Dien Vang Son';

  const crimson = mat(0x642b32, .73);
  const deepRed = mat(0x421e2b, .7);
  const wine = mat(0x8d3b3d, .75);
  const goldenWood = mat(0x9d5738, .8);
  const oldGold = mat(0xb78136, .38, .55);
  const brightGold = mat(0xffdc91, .3, .5);
  const softGold = mat(0xecc57d, .43, .25);
  const velvet = mat(0x9b2638, .96);
  const stone = mat(0x362832, .8);
  const glow = new THREE.MeshBasicMaterial({ color: 0xffc971, transparent: true, opacity: .23, depthWrite: false, side: THREE.DoubleSide });

  function torus(radius, tube, material, x, y, z, parent = group) {
    return mesh(new THREE.TorusGeometry(radius, tube, 12, 96), material, parent, x, y, z);
  }
  function stroke(x1,y1,z1,x2,y2,z2,r,material,parent=group) {
    const a = new THREE.Vector3(x1,y1,z1);
    const b = new THREE.Vector3(x2,y2,z2);
    const direction = b.clone().sub(a);
    const line = mesh(new THREE.CylinderGeometry(r,r,direction.length(),8),material,parent);
    line.position.copy(a.add(b).multiplyScalar(.5));
    line.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());
    return line;
  }

  // Layered lacquered backdrop. Its face stays BEHIND the existing Buddha.
  box(15.05, 6.58, .22, deepRed, group, 0, 3.95, -7.80);
  box(14.30, 6.00, .08, goldenWood, group, 0, 4.02, -7.64);
  box(13.95, 5.69, .09, crimson, group, 0, 4.03, -7.56);
  for (const y of [1.37, 6.77]) box(14.5,.15,.17,oldGold,group,0,y,-7.41);
  for (const x of [-6.9,6.9]) box(.16,5.5,.16,oldGold,group,x,4.05,-7.41);

  // A succession of ornate red alcoves on each side of the central statue.
  for (const side of [-1,1]) {
    for (let i=0; i<2; i++) {
      const x=side*(3.85+i*1.55);
      box(1.30,4.36,.10,deepRed,group,x,4.03,-7.37);
      box(1.11,4.11,.05,wine,group,x,4.05,-7.30);
      box(1.16,.10,.14,brightGold,group,x,6.11,-7.17);
      box(1.16,.10,.14,brightGold,group,x,2.01,-7.17);
      box(.10,4.11,.14,oldGold,group,x-.56,4.05,-7.17);
      box(.10,4.11,.14,oldGold,group,x+.56,4.05,-7.17);
      for (let y=2.5; y<5.8; y+=.61) {
        const medallion=torus(.16,.014,softGold,x,y,-7.20);
        medallion.scale.y=.85;
      }
    }
    // Hanging ornaments in front of the shrine roof.
    box(2.35,.29,.22,oldGold,group,side*4.45,6.90,-6.55);
    box(2.14,.20,.19,crimson,group,side*4.45,6.66,-6.48);
    for(let k=0;k<5;k++) {
      const x=side*4.45+(k-2)*.43;
      sphere(.065,softGold,group,x,6.48,-6.46);
    }
  }

  // Central Dharma wheel / halo — behind the Buddha's head, with subtle emissive discs.
  const haloX=0, haloY=4.75, haloZ=-7.30;
  const haloDisk = mesh(new THREE.CircleGeometry(2.05,96),glow,group,haloX,haloY,haloZ-.06);
  haloDisk.renderOrder=1;
  const haloOuter=torus(2.06,.075,oldGold,haloX,haloY,haloZ);
  torus(1.85,.045,brightGold,haloX,haloY,haloZ+.035);
  torus(1.51,.027,softGold,haloX,haloY,haloZ+.045);
  for(let i=0;i<48;i++) {
    const a=i/48*Math.PI*2;
    const inner=2.16, outer=i%4===0?2.60:2.38;
    stroke(Math.cos(a)*inner,haloY+Math.sin(a)*inner,haloZ,
      Math.cos(a)*outer,haloY+Math.sin(a)*outer,haloZ,.021, i%4===0?brightGold:oldGold);
  }
  for(let i=0;i<12;i++) {
    const a=i/12*Math.PI*2;
    sphere(.06,brightGold,group,Math.cos(a)*1.70,haloY+Math.sin(a)*1.70,haloZ+.045);
  }

  // Raised altar rails and gold decorative crossbars; keep path toward the urn clear.
  for(let side of [-1,1]) {
    box(2.10,.20,.42,oldGold,group,side*4.53,1.68,-5.76);
    box(2.25,.12,.55,deepRed,group,side*4.53,1.83,-5.78);
    const x=side*4.92;
    for(let z of [-5.78,-3.10]) {
      cylinder(.095,.13,1.13,oldGold,group,x,.82,z,16);
      sphere(.19,brightGold,group,x,1.46,z);
    }
    // Large ceremonial lanterns flank the offering space.
    const lantern = new THREE.Group();
    lantern.position.set(side*5.42,0,-4.98);
    group.add(lantern);
    cylinder(.29,.38,.21,oldGold,lantern,0,.44,0,20);
    cylinder(.095,.13,1.7,oldGold,lantern,0,1.39,0,16);
    const lanternLight = new THREE.MeshBasicMaterial({color:0xffdd91});
    const flame=sphere(.27,lanternLight,lantern,0,2.18,0);
    flame.scale.set(.68,1.6,.72);
    cylinder(.40,.32,.23,oldGold,lantern,0,2.56,0,20);
    cylinder(.07,.13,.29,brightGold,lantern,0,2.78,0,12);
  }

  // Central crimson lotus walkway from the entrance to the altar.
  // Existing 15 oval cushions remain above it, fully interactive.
  box(5.55,.038,11.50,oldGold,group,0,.228,-.38);
  box(5.27,.046,11.34,velvet,group,0,.256,-.38);
  for(let side of [-1,1]) {
    box(.055,.02,11.25,brightGold,group,side*2.37,.288,-.38);
    box(.030,.02,11.25,oldGold,group,side*2.23,.292,-.38);
  }
  // Repeating lotus medallions on the carpet between cushion rows.
  for(let z=-5.03; z<=4.1; z+=1.17) {
    const zOffset=(Math.round((z+5.03)/1.17)%2===0)?0:.18;
    const flower=new THREE.Group();flower.position.set(0,.302,z+zOffset);group.add(flower);
    const ring=torus(.21,.018,softGold,0,0,0,flower);ring.rotation.x=Math.PI/2;
    for(let n=0;n<8;n++) {
      const a=n/8*Math.PI*2;
      let petal=sphere(.095,oldGold,flower,Math.cos(a)*.15,0,Math.sin(a)*.15);
      petal.scale.set(.7,.19,1.40);petal.rotation.y=a;
    }
  }

  // Two rows of shallow side lantern-light strips show the central depth.
  for (let z=-5.5; z<=3.5; z+=2.4) {
    for(const side of [-1,1]) {
      const x=side*6.65;
      const holder=cylinder(.18,.24,.24,oldGold,group,x,.45,z,18);
      holder.castShadow=false;
      const orb=sphere(.22,new THREE.MeshBasicMaterial({color:0xffd18b}),group,x,.72,z);
      orb.scale.set(.8,1.1,.8);
    }
  }

  // Fine atmospheric dust / sacred-light motes, with no network assets.
  const count=90, points=new Float32Array(count*3);
  for(let i=0;i<count;i++) {
    points[i*3]=Math.sin(i*7.17)*6.1;
    points[i*3+1]=.65+((i*13.31)%6.3);
    points[i*3+2]=-6.2+((i*17.7)%11);
  }
  const dustGeometry=new THREE.BufferGeometry();
  dustGeometry.setAttribute('position',new THREE.BufferAttribute(points,3));
  const dust=new THREE.Points(dustGeometry,new THREE.PointsMaterial({color:0xffe0ac,size:.045,transparent:true,opacity:.65,sizeAttenuation:true,depthWrite:false}));
  group.add(dust);
  const ambient=new THREE.PointLight(0xffbd72,6,12,2);
  ambient.position.set(0,5,-4.9);group.add(ambient);

  let enabled=true;
  return {
    group,
    setEnabled(value){enabled=Boolean(value);group.visible=enabled;},
    animate(time){
      if(!enabled)return;
      haloOuter.rotation.z=time*.012;
      haloDisk.material.opacity=.19+.04*Math.sin(time*.7);
      const attr=dustGeometry.getAttribute('position');
      for(let i=0;i<count;i++) {
        let y=attr.array[i*3+1]+.0011;
        if(y>6.95)y=.6;
        attr.array[i*3+1]=y;
      }
      attr.needsUpdate=true;
    }
  };
}
