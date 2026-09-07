"use client";

import { memo, useEffect, useRef, useState, type ReactElement } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { OrganelId } from "@/content/lowiCellContent";
import DnaHelix from "./DnaHelix";
import { celInstellingen as c } from "./celInstellingen";
import { celPalet } from "./celPalet";
import { maakInstrumentMateriaal, maakSchil, type InstrumentMateriaal } from "./celMaterialen";
import type { CelStaat } from "./useCelInterpolatie";
import { vervormDeling } from "./celGeometrie";

export function toeval(i: number): number { const n = Math.sin(i * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); }

function maakModel(staat: CelStaat) {
  const groep = new THREE.Group();
  const geometrieen: THREE.BufferGeometry[] = [];
  const materialen: (InstrumentMateriaal & { id: OrganelId; emissie: number })[] = [];
  const organellen: { groep: THREE.Object3D; positie: THREE.Vector3; inKern?: boolean }[] = [];
  const instanties: { mesh: THREE.InstancedMesh; posities: THREE.Vector3[]; schalen: number[] }[] = [];
  function mat(id: OrganelId, opties: Parameters<typeof maakInstrumentMateriaal>[1] = {}, kleur: THREE.ColorRepresentation = staat.kleuren[id]) {
    const binding = maakInstrumentMateriaal(kleur, opties);
    materialen.push({ ...binding, id, emissie: opties.emissie ?? c.materiaal.emissieBasis });
    return binding.materiaal;
  }
  function mesh(geometrie: THREE.BufferGeometry, materiaal: THREE.Material, parent: THREE.Object3D = groep) {
    geometrieen.push(geometrie); const object = new THREE.Mesh(geometrie, materiaal);
    object.frustumCulled = false; parent.add(object); return object;
  }
  mesh(maakSchil(1, c.instrument.icoDetail, c.instrument.membraanSchaal), mat("membraan", { schil: true, opacity: .36, emissie: .16 })).renderOrder = 3;
  const kernKleur = staat.kleuren.kern.clone().multiplyScalar(.75);
  mesh(maakSchil(.32, 18, [1, 1.06, .95]), mat("kern", { schil: true, kern: true, opacity: c.kern.schilOpacity, emissie: .12 }, kernKleur)).renderOrder = 2;
  mesh(maakSchil(.29, 12, [1, 1.06, .95]), mat("kern", { schil: true, kern: true, opacity: c.kern.binnenOpacity, emissie: .04 }, kernKleur)).renderOrder = 1;
  const nucleolusGroep = new THREE.Group(); groep.add(nucleolusGroep);
  const nucleolus = mesh(new THREE.IcosahedronGeometry(c.kern.nucleolusStraal, 6), mat("kern", { opacity: .98, emissie: .35 }, kernKleur.clone().multiplyScalar(.6)), nucleolusGroep);
  nucleolus.scale.set(1, 1.16, .84);
  organellen.push({ groep: nucleolusGroep, positie: new THREE.Vector3(...c.kern.nucleolusPositie), inKern: true });

  function wolk(aantal: number, basisStraal: number, blaasjes = false) {
    const geometrie = new THREE.IcosahedronGeometry(basisStraal, 1); geometrieen.push(geometrie);
    const korrelKleur = staat.kleuren.ribosoom.clone().lerp(new THREE.Color(1,1,1),.35).multiplyScalar(.38);
    const materiaal = mat("ribosoom", { instanced: true, emissie: blaasjes ? .22 : .09, opacity: blaasjes ? .6 : 1 }, korrelKleur);
    const object = new THREE.InstancedMesh(geometrie, materiaal, aantal); object.frustumCulled = false;
    groep.add(object);
    const posities: THREE.Vector3[] = [], schalen: number[] = [];
    for (let i = 0; i < aantal; i++) {
      const p = new THREE.Vector3();
      for (let poging = 0; poging < 12; poging++) {
        const seed = i * 97 + poging * 7;
        const z = toeval(seed + 1) * 2 - 1, hoek = toeval(seed + 2) * Math.PI * 2;
        const r = blaasjes ? .35 + .59 * Math.cbrt(toeval(seed + 3))
          : c.ribosomen.binnenStraal + (c.ribosomen.buitenStraal-c.ribosomen.binnenStraal)*Math.pow(toeval(seed+3),.8);
        p.set(Math.sqrt(1-z*z)*Math.cos(hoek), Math.sqrt(1-z*z)*Math.sin(hoek), z).multiplyScalar(r);
        // Brede, overlappende dichtheidsgolven; geen verplaatste compacte cluster.
        const dichtheid = .58 + .2*Math.sin(hoek*3+z*4) + .16*Math.cos(hoek*2-z*3);
        if (blaasjes || toeval(seed+5)<dichtheid) break;
      }
      posities.push(p);
      schalen.push(blaasjes ? .55+toeval(i*7+4)*1.6 : c.ribosomen.grootteMin+toeval(i*7+4)*c.ribosomen.grootteVariatie);
      if (blaasjes && i % 4 === 0) object.setColorAt(i, new THREE.Color(celPalet.karmijn).multiplyScalar(.55));
      else if (blaasjes) object.setColorAt(i, new THREE.Color(1, 1, 1));
    }
    instanties.push({ mesh: object, posities, schalen });
  }
  wolk(c.ribosomen.aantal, c.ribosomen.straal);
  wolk(c.instrument.blaasjes, .018, true);

  const mitoBuiten = mat("mitochondrion", { opacity: c.mitochondrien.opacity, emissie: .035, randlicht: .3 }, new THREE.Color(celPalet.weefsel).multiplyScalar(c.mitochondrien.wandKleur));
  const mitoBinnen = mat("mitochondrion", { emissie: c.mitochondrien.binnenEmissie }, new THREE.Color(celPalet.amber).multiplyScalar(c.mitochondrien.binnenKleur));
  function buigMito(p: THREE.Vector3): THREE.Vector3 {
    const x = p.x, dikte = 1 + .12 * Math.sin(x * 5 + .4);
    p.multiply(new THREE.Vector3(...c.mitochondrien.schaal));
    p.y = p.y * dikte + c.mitochondrien.kromming * Math.sin(x * 2.7);
    p.z = p.z * dikte + .009 * Math.cos(x * 4);
    return p;
  }
  for (const [x, y, z, rotatie] of c.mitochondrien.plaatsingen) {
    const mitochondrion = new THREE.Group(); mitochondrion.rotation.z = rotatie;
    const buitenGeometrie = new THREE.IcosahedronGeometry(1, 14);
    const posities = buitenGeometrie.attributes.position, punt = new THREE.Vector3();
    for (let j = 0; j < posities.count; j++) {
      buigMito(punt.fromBufferAttribute(posities, j));
      posities.setXYZ(j, punt.x, punt.y, punt.z);
    }
    buitenGeometrie.computeVertexNormals();
    mesh(buitenGeometrie, mitoBuiten, mitochondrion);
    for (let i = 0; i < c.mitochondrien.plooien; i++) {
      const px = -c.mitochondrien.plooiBereik + i * 2*c.mitochondrien.plooiBereik/(c.mitochondrien.plooien-1);
      const dwars = Math.sqrt(1 - px * px);
      const curve = new THREE.CatmullRomCurve3(Array.from({ length: 9 }, (_, j) => {
        const hoek = -1.4 + j * 2.8 / 8;
        return buigMito(new THREE.Vector3(px + .045 * Math.sin(hoek * 3 + i), Math.sin(hoek) * dwars * .7, (Math.cos(hoek) * .48 - .15) * dwars));
      }));
      mesh(new THREE.TubeGeometry(curve, 24, c.mitochondrien.plooiStraal, 5, false), mitoBinnen, mitochondrion);
    }
    groep.add(mitochondrion); organellen.push({ groep: mitochondrion, positie: new THREE.Vector3(x,y,z) });
  }
  const golgi = new THREE.Group(), golgiMat = mat("golgi", { emissie: .13 });
  for (let i = 0; i < c.golgi.schijven; i++) {
    const geo = new THREE.LatheGeometry(c.golgi.profiel.map(([r,y])=>new THREE.Vector2(r,y)), 48);
    const schijf = mesh(geo, golgiMat, golgi);
    schijf.position.y = (i-(c.golgi.schijven-1)/2)*c.golgi.afstand;
    schijf.scale.set(1-i*.035,.45,.67);
  }
  golgi.rotation.set(...c.golgi.rotatie); groep.add(golgi);
  organellen.push({ groep: golgi, positie: new THREE.Vector3(...c.golgi.positie) });
  return { groep, geometrieen, materialen, organellen, instanties };
}

function CelModel({ staat }: { staat: CelStaat }): ReactElement {
  const [model] = useState(()=>maakModel(staat));
  const modelRef = useRef(model);
  const werk = useRef({ punt: new THREE.Vector3(), matrix: new THREE.Matrix4(), vorigeDeling: -1 });
  useEffect(()=>()=>{
    model.geometrieen.forEach(g=>g.dispose());
    model.materialen.forEach(m=>{ m.materiaal.dispose(); m.ruis.dispose(); });
    model.instanties.forEach(i=>i.mesh.dispose());
  },[model]);
  useFrame(({ clock })=>{
    const model = modelRef.current, w = werk.current, deling = staat.intensiteit.celdeling;
    for (const m of model.materialen) {
      // Het bijna beeldvullende oppervlak moet ook het DOF-dieptevlak vullen.
      if (m.id === "membraan") m.materiaal.depthWrite = staat.doorsnede < .01 && staat.cameraPositie.length() < 1.2;
      m.tijd.value = clock.elapsedTime; m.deling.value = deling; m.opening.value = staat.doorsnede;
      m.materiaal.emissiveIntensity = m.emissie * (.9 + .1*staat.intensiteit[m.id]);
    }
    if (Math.abs(deling-w.vorigeDeling)<c.geometrieDrempel) return;
    w.vorigeDeling = deling;
    for (const organel of model.organellen) {
      w.punt.copy(organel.positie);
      vervormDeling(w.punt, deling, organel.inKern ? .32 : 1.1, organel.inKern);
      organel.groep.position.copy(w.punt);
      organel.groep.scale.setScalar(1-c.deling.organelVerkleining*deling);
    }
    for (const wolk of model.instanties) {
      wolk.posities.forEach((p,i)=>{
        w.punt.copy(p); vervormDeling(w.punt,deling);
        const s=wolk.schalen[i]; w.matrix.makeScale(s,s,s).setPosition(w.punt); wolk.mesh.setMatrixAt(i,w.matrix);
      });
      wolk.mesh.instanceMatrix.needsUpdate=true;
    }
  });
  return <group><primitive object={model.groep} dispose={null}/><DnaHelix staat={staat}/></group>;
}
export default memo(CelModel);
