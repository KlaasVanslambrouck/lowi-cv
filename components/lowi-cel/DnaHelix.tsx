"use client";

import { memo, useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { celInstellingen } from "./celInstellingen";
import { vervormDeling } from "./celGeometrie";
import type { CelStaat } from "./useCelInterpolatie";
import { maakInstrumentMateriaal } from "./celMaterialen";
import { celPalet } from "./celPalet";

const instellingen = celInstellingen.dna;
const SEGMENTEN = instellingen.segmenten;
const RADIAAL = instellingen.radiaal;
const BASENPAREN = instellingen.basenparen;

function maakStrengGeometrie(curve: THREE.CatmullRomCurve3) {
  const ringen: { t: number; zijde: -1 | 1; naad: boolean }[] = [];
  let zijde: -1 | 1 = 1;
  for (let i = 0; i <= SEGMENTEN; i++) {
    const t = i / SEGMENTEN;
    const naad = i === SEGMENTEN / 4 || i === SEGMENTEN * 3 / 4;
    ringen.push({ t, zijde, naad });
    if (naad) {
      zijde = zijde === 1 ? -1 : 1;
      ringen.push({ t, zijde, naad });
    }
  }
  // Breid de procedurele TubeGeometry uit met dubbele naadringen; dezelfde
  // buis vervormt vervolgens mee met de curve en de deling.
  const geometrie = new THREE.TubeGeometry(curve, SEGMENTEN, instellingen.strengDikte, RADIAAL, false);
  geometrie.deleteAttribute("normal");
  geometrie.deleteAttribute("uv");
  geometrie.setAttribute("position", new THREE.BufferAttribute(new Float32Array(ringen.length * (RADIAAL + 1) * 3), 3).setUsage(THREE.DynamicDrawUsage));
  const indices: number[] = [];
  for (let i = 1; i < ringen.length; i++) {
    // De twee kanten van een delingsnaad krijgen geen verbindende driehoeken.
    if (ringen[i].t === ringen[i - 1].t) continue;
    for (let j = 0; j < RADIAAL; j++) {
      const a = (i - 1) * (RADIAAL + 1) + j;
      const b = i * (RADIAAL + 1) + j;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  geometrie.setIndex(indices);
  return { geometrie, ringen };
}

function maakDna(staat: CelStaat) {
  const groep = new THREE.Group();
  const binding = maakInstrumentMateriaal(staat.kleuren.kern, { emissie: instellingen.emissieBasis });
  const materiaal = binding.materiaal;
  const strengen = [0, Math.PI].map((fase) => {
    const compact: THREE.Vector3[] = [];
    const uitgestrekt: THREE.Vector3[] = [];
    for (let i = 0; i <= instellingen.controlepunten; i++) {
      const t = i / instellingen.controlepunten;
      const hoek = t * Math.PI * 2 * instellingen.windingen + fase;
      const bocht = t * Math.PI * 2;
      const r = instellingen.compacteStraal + instellingen.compacteStrengAfstand * Math.cos(hoek);
      compact.push(new THREE.Vector3(r * Math.cos(bocht), instellingen.compacteHoogte * (t - 0.5) + instellingen.compacteStrengAfstand * Math.sin(hoek), r * Math.sin(bocht)));
      uitgestrekt.push(new THREE.Vector3(instellingen.ontvouwenStraal * Math.cos(hoek), instellingen.ontvouwenHoogte * (t - 0.5), instellingen.ontvouwenStraal * Math.sin(hoek)));
    }
    const curve = new THREE.CatmullRomCurve3(compact.map((punt) => punt.clone()));
    const { geometrie, ringen } = maakStrengGeometrie(curve);
    const mesh = new THREE.Mesh(geometrie, materiaal);
    mesh.frustumCulled = false;
    groep.add(mesh);
    return { compact, uitgestrekt, curve, geometrie, ringen };
  });
  const basenGeometrie = new THREE.CylinderGeometry(instellingen.basisDikte, instellingen.basisDikte, 1, RADIAAL);
  const basisBinding = maakInstrumentMateriaal(staat.kleuren.kern.clone().lerp(new THREE.Color(celPalet.weefsel), .3), { emissie: instellingen.emissieBasis });
  const basen = new THREE.InstancedMesh(basenGeometrie, basisBinding.materiaal, BASENPAREN);
  basen.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  basen.frustumCulled = false;
  groep.add(basen);
  return { groep, materiaal, binding, basisBinding, strengen, basenGeometrie, basen };
}

function DnaHelix({ staat }: { staat: CelStaat }): ReactElement {
  const [dna] = useState(() => maakDna(staat));
  const werk = useMemo(() => ({
    centrum: new THREE.Vector3(), tangent: new THREE.Vector3(), normaal: new THREE.Vector3(),
    vorigeTangent: new THREE.Vector3(), draaiing: new THREE.Quaternion(),
    binormaal: new THREE.Vector3(), punt: new THREE.Vector3(), a: new THREE.Vector3(), b: new THREE.Vector3(),
    richting: new THREE.Vector3(), yAs: new THREE.Vector3(0, 1, 0), zAs: new THREE.Vector3(0, 0, 1),
    matrix: new THREE.Matrix4(), rotatie: new THREE.Quaternion(), schaal: new THREE.Vector3(),
    vorigeOntvouwing: -1, vorigeDeling: -1,
  }), []);
  const dnaRef = useRef(dna);
  const werkRef = useRef(werk);

  useEffect(() => () => {
    dna.strengen.forEach(({ geometrie }) => geometrie.dispose());
    dna.basenGeometrie.dispose();
    dna.basen.dispose();
    dna.materiaal.dispose();
    dna.binding.ruis.dispose();
    dna.basisBinding.materiaal.dispose();
    dna.basisBinding.ruis.dispose();
  }, [dna]);

  useFrame(({ clock }) => {
    const dna = dnaRef.current;
    const werk = werkRef.current;
    const deling = staat.intensiteit.celdeling;
    dna.binding.tijd.value = clock.elapsedTime;
    dna.basisBinding.tijd.value = clock.elapsedTime;
    dna.materiaal.emissiveIntensity = instellingen.emissieBasis + instellingen.emissieActief * staat.intensiteit.kern;
    if (Math.abs(werk.vorigeOntvouwing - staat.dnaOntvouwing) < celInstellingen.geometrieDrempel && Math.abs(werk.vorigeDeling - deling) < celInstellingen.geometrieDrempel) return;
    werk.vorigeOntvouwing = staat.dnaOntvouwing;
    werk.vorigeDeling = deling;

    for (const streng of dna.strengen) {
      // De controlepunten van de curve zelf veranderen; geen schaalanimatie.
      streng.curve.points.forEach((punt, index) => {
        punt.lerpVectors(streng.compact[index], streng.uitgestrekt[index], staat.dnaOntvouwing);
      });
      const positie = streng.geometrie.attributes.position;
      for (let i = 0; i < streng.ringen.length; i++) {
        const { t, zijde, naad } = streng.ringen[i];
        streng.curve.getPoint(t, werk.centrum);
        streng.curve.getTangent(t, werk.tangent);
        if (i === 0) {
          werk.normaal.crossVectors(werk.tangent, Math.abs(werk.tangent.z) > instellingen.normaalGrens ? werk.yAs : werk.zAs).normalize();
        } else {
          // Transporteer het lokale vlak langs de curve; een wisselende
          // referentie-as per punt gaf zichtbare knikken in de streng.
          werk.draaiing.setFromUnitVectors(werk.vorigeTangent, werk.tangent);
          werk.normaal.applyQuaternion(werk.draaiing).normalize();
        }
        werk.vorigeTangent.copy(werk.tangent);
        werk.binormaal.crossVectors(werk.tangent, werk.normaal).normalize();
        const straal = instellingen.strengDikte * (naad ? 1 - deling : 1);
        for (let j = 0; j <= RADIAAL; j++) {
          const hoek = j / RADIAAL * Math.PI * 2;
          werk.punt.copy(werk.centrum).addScaledVector(werk.normaal, -straal * Math.cos(hoek)).addScaledVector(werk.binormaal, straal * Math.sin(hoek));
          vervormDeling(werk.punt, deling, instellingen.delingsStraal, true, zijde);
          positie.setXYZ(i * (RADIAAL + 1) + j, werk.punt.x, werk.punt.y, werk.punt.z);
        }
      }
      positie.needsUpdate = true;
      streng.geometrie.computeVertexNormals();
    }
    for (let i = 0; i < BASENPAREN; i++) {
      const t = (i + 0.5) / BASENPAREN;
      dna.strengen[0].curve.getPoint(t, werk.a);
      dna.strengen[1].curve.getPoint(t, werk.b);
      const zijde = Math.cos(t * Math.PI * 2) < 0 ? -1 : 1;
      vervormDeling(werk.a, deling, instellingen.delingsStraal, true, zijde);
      vervormDeling(werk.b, deling, instellingen.delingsStraal, true, zijde);
      werk.richting.subVectors(werk.b, werk.a);
      werk.schaal.set(1, werk.richting.length(), 1);
      werk.rotatie.setFromUnitVectors(werk.yAs, werk.richting.normalize());
      werk.centrum.copy(werk.a).add(werk.b).multiplyScalar(0.5);
      werk.matrix.compose(werk.centrum, werk.rotatie, werk.schaal);
      dna.basen.setMatrixAt(i, werk.matrix);
    }
    dna.basen.instanceMatrix.needsUpdate = true;
  });

  return <primitive object={dna.groep} dispose={null} />;
}

export default memo(DnaHelix);
