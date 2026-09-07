"use client";

import { memo, useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { celPalet } from "./celPalet";
import { celInstellingen as c } from "./celInstellingen";
import { ruisGlsl } from "./celMaterialen";
import { toeval } from "./CelModel";
import type { CelStaat } from "./useCelInterpolatie";

function maakMedium() {
  const groep = new THREE.Group();
  const warm = new THREE.Color(celPalet.weefsel).lerp(new THREE.Color(1, 1, 1), .72);
  const tijd = { value: 0 };
  const deeltjesMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { tijd, kleur: { value: warm }, dichtheid: { value: c.instrument.fogDichtheid } },
    vertexShader: `uniform float tijd; varying vec2 vUv; varying float vDiepte;
      void main(){
        vUv=uv;
        vec4 centrum=instanceMatrix*vec4(0.,0.,0.,1.);
        float fase=dot(centrum.xyz,vec3(17.,29.,43.));
        centrum.xyz+=.007*vec3(sin(tijd*.23+fase),sin(tijd*.19+fase*.7),cos(tijd*.17+fase));
        vec4 p=modelViewMatrix*centrum;
        p.xy+=position.xy*length(instanceMatrix[0].xyz); vDiepte=-p.z;
        gl_Position=projectionMatrix*p;
      }`,
    fragmentShader: `uniform vec3 kleur; uniform float dichtheid; varying vec2 vUv; varying float vDiepte;
      void main(){ float r=length(vUv-.5)*2.; if(r>1.)discard;
        float a=exp(-r*r*5.)*.21*exp(-dichtheid*dichtheid*vDiepte*vDiepte);
        gl_FragColor=vec4(kleur,a); }`,
  });
  const plane = new THREE.PlaneGeometry(1,1);
  const deeltjes = new THREE.InstancedMesh(plane, deeltjesMat, c.instrument.deeltjes);
  deeltjes.frustumCulled = false;
  const matrix = new THREE.Matrix4();
  for(let i=0;i<c.instrument.deeltjes;i++) {
    const x=(toeval(i*5+1)*2-1)*1.35, y=(toeval(i*5+2)*2-1)*1.15, z=toeval(i*5+3)*2.5-1.1;
    const s=.002+toeval(i*5+4)*.006; matrix.makeScale(s,s,s).setPosition(x,y,z); deeltjes.setMatrixAt(i,matrix);
  }
  groep.add(deeltjes);
  const lagenMat = new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
    uniforms:{tijd,kleur:{value:warm},opacity:{value:c.instrument.mediumOpacity}},
    vertexShader:`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform float tijd; uniform vec3 kleur; uniform float opacity; varying vec2 vUv; ${ruisGlsl}
      void main(){vec2 p=vUv-.5;float rand=pow(max(0.,1.-length(p)*2.),2.);
        float mist=pow(lagen(vec3(vUv*6.,tijd*.025)),3.);
        gl_FragColor=vec4(kleur,rand*mist*opacity);}`,
  });
  const lagen: THREE.Mesh[]=[];
  for(let i=0;i<c.instrument.billboards;i++) {
    const laag=new THREE.Mesh(plane,lagenMat);laag.position.set((i%2-.5)*.5,.1,i*.52-.65);
    laag.scale.setScalar(2.8);groep.add(laag);lagen.push(laag);
  }
  const losse: THREE.BufferGeometry[]=[];
  for(let i=0;i<c.instrument.filamenten;i++) {
    const p = new THREE.Vector3((toeval(i*4+1)-.5)*1.6,(toeval(i*4+2)-.5)*1.5,(toeval(i*4+3)-.5)*1.5);
    const q = new THREE.Vector3((toeval(i*4+41)-.5)*1.6,(toeval(i*4+42)-.5)*1.5,(toeval(i*4+43)-.5)*1.5);
    const a = p.clone().lerp(q,.33).add(new THREE.Vector3(.12,-.07,.11));
    const b = p.clone().lerp(q,.67).add(new THREE.Vector3(-.09,.1,-.08));
    for(const punt of [a,b]) if(punt.length()<.4)punt.normalize().multiplyScalar(.4);
    const curve = new THREE.CatmullRomCurve3([p,a,b,q]);
    losse.push(new THREE.TubeGeometry(curve,32,c.instrument.filamentDikte,3,false));
  }
  const filamentGeo=mergeGeometries(losse);losse.forEach(g=>g.dispose());
  const filamentMat=new THREE.MeshBasicMaterial({color:warm,transparent:true,opacity:.04,blending:THREE.AdditiveBlending,depthWrite:false});
  groep.add(new THREE.Mesh(filamentGeo,filamentMat));
  return {groep,tijd,lagen,plane,deeltjes,deeltjesMat,lagenMat,filamentGeo,filamentMat};
}

function CelMedium({staat}:{staat:CelStaat}) {
  const [medium]=useState(maakMedium);
  const ref=useRef(medium);
  useEffect(()=>()=>{
    medium.plane.dispose();medium.deeltjes.dispose();medium.deeltjesMat.dispose();
    medium.lagenMat.dispose();medium.filamentGeo.dispose();medium.filamentMat.dispose();
  },[medium]);
  useFrame(({clock,camera})=>{
    const m=ref.current;m.tijd.value=clock.elapsedTime;
    m.filamentMat.opacity=.04*(1-staat.intensiteit.celdeling);
    m.lagen.forEach((laag,i)=>{
      laag.quaternion.copy(camera.quaternion);
      laag.position.x=(i%2-.5)*.5+Math.sin(clock.elapsedTime*.04+i)*.08;
    });
  });
  return <primitive object={medium.groep} dispose={null}/>;
}
export default memo(CelMedium);
