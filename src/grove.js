import * as THREE from 'three';
// Two banyan trees and decorative red wish strings. All geometry is original.
export function createWishTrees(scene) {
  const groups = [], streamers = [];
  const bark = new THREE.MeshStandardMaterial({ color: 0x735044, roughness: 1 });
  const greens = [0x3d6f46, 0x527b45, 0x729455].map(color => new THREE.MeshStandardMaterial({ color, roughness: 1 }));
  const ribbon = new THREE.MeshStandardMaterial({ color: 0xb82d43, side: THREE.DoubleSide, roughness: .75 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xe7bd72, roughness: .7 });
  function link(group, a, b, r1, r2, material) {
    const vec = new THREE.Vector3().subVectors(b, a);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, vec.length(), 8), material);
    mesh.position.copy(a).add(b).multiplyScalar(.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vec.clone().normalize());
    mesh.castShadow = true; group.add(mesh); return mesh;
  }
  function makeTree(x, z, sign) {
    const group = new THREE.Group(); group.position.set(x, .13, z); scene.add(group);
    const up = new THREE.Vector3(0, 3.9, 0);
    link(group, new THREE.Vector3(0, 0, 0), up, .36, .57, bark);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const start = new THREE.Vector3(Math.cos(angle) * .12, 3.1, Math.sin(angle) * .12);
      const end = new THREE.Vector3(Math.cos(angle) * (2.1 + (i % 3) * .15), 4.2 + (i % 2) * .55, Math.sin(angle) * 1.85);
      link(group, start, end, .07, .14, bark);
      const foliage = new THREE.Mesh(new THREE.IcosahedronGeometry(1.38 + (i % 2) * .18, 1), greens[i % greens.length]);
      foliage.position.copy(end); foliage.scale.set(1.08, .79, .85); foliage.castShadow = true; group.add(foliage);
      if (i % 2 === 0) link(group, end, new THREE.Vector3(end.x, 1.05 + i * .14, end.z), .019, .03, bark);
    }
    const center = new THREE.Mesh(new THREE.IcosahedronGeometry(1.85, 1), greens[1]);
    center.position.set(0, 4.7, 0); center.scale.y = .79; group.add(center);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(.9, 1.03, .34, 16), gold);
    base.position.y = .14; group.add(base);
    const strings = new THREE.Group(); group.add(strings); streamers.push(strings);
    groups.push({ group, strings, sign });
    for (let k = 0; k < 15; k++) addRibbon(sign, false, k);
  }
  function addRibbon(side = 'left', animate = true, seed = undefined) {
    const g = groups.find(p => p.sign === side); if (!g) return;
    const i = seed === undefined ? g.strings.children.length : seed;
    // Uses quasi-regular placements so the whole canopy has visible red ribbons.
    const angle = (i * 2.39996) % (Math.PI * 2);
    const distance = 1.0 + ((i * 13) % 11) / 12;
    const px = Math.cos(angle) * distance, pz = Math.sin(angle) * distance * .85;
    const h = 3.7 + ((i * 7) % 9) * .11;
    const rope = new THREE.Group(); rope.position.set(px, h, pz); g.strings.add(rope);
    for (const s of [-1, 1]) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(.038, .62 + (i % 3) * .1, .012), ribbon);
      strip.position.set(s * .065, -.34, 0); strip.rotation.z = s * .23; rope.add(strip);
    }
    const knot = new THREE.Mesh(new THREE.SphereGeometry(.085, 8, 6), ribbon); rope.add(knot);
    const bow1 = new THREE.Mesh(new THREE.TorusGeometry(.09, .017, 5, 13), ribbon);
    bow1.position.x = -.095; bow1.scale.set(.8, 1, 1); rope.add(bow1);
    const bow2 = bow1.clone(); bow2.position.x = .095; rope.add(bow2);
    if (animate) rope.scale.setScalar(.01);
    rope.userData.born = animate ? performance.now() : 0;
  }
  makeTree(-9.8, -.9, 'left'); makeTree(9.8, -.9, 'right');
  return {
    addRibbon,
    animate(t) {
      for (const { strings } of groups) for (const item of strings.children) {
        item.rotation.z = Math.sin(t * 1.2 + item.position.x * 2) * .075;
        if (item.userData.born) {
          const elapsed = (performance.now() - item.userData.born) / 600;
          item.scale.setScalar(Math.min(1, elapsed));
          if (elapsed >= 1) item.userData.born = 0;
        }
      }
    }
  };
}
