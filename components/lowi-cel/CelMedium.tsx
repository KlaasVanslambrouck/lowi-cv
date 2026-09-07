"use client";

import { memo, useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { celPalet } from "./celPalet";
import { celInstellingen as c } from "./celInstellingen";
import { maakRuisVolume, ruisGlsl } from "./celMaterialen";
import { toeval } from "./CelModel";
import type { CelStaat } from "./useCelInterpolatie";

function maakMedium() {
  const groep = new THREE.Group();
  const warm = new THREE.Color(celPalet.weefsel).lerp(new THREE.Color(.45, .37, .29), .5);
  const tijd = { value: 0 }, deling = { value: 0 };
  const ruis = maakRuisVolume();
  const deeltjesMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { tijd, deling, kleur: { value: warm }, dichtheid: { value: c.instrument.deeltjeFog } },
    vertexShader: `uniform float tijd; uniform float deling; varying vec2 vUv; varying float vDiepte; varying float vBuiten;
      void main(){
        vUv=uv;
        vec4 centrum=instanceMatrix*vec4(0.,0.,0.,1.);
        vBuiten=smoothstep(.94,1.08,length(centrum.xyz/vec3(1.1,.91,1.)));
        float u=clamp(abs(centrum.x/1.1),0.,1.);
        centrum.x=mix(centrum.x,sign(centrum.x)*(.08+1.6*u),deling);
        centrum.yz*=mix(1.,1.6*sqrt(u/(1.+u)),deling);
        float fase=dot(centrum.xyz,vec3(17.,29.,43.));
        centrum.xyz+=.007*vec3(sin(tijd*.23+fase),sin(tijd*.19+fase*.7),cos(tijd*.17+fase));
        vec4 p=modelViewMatrix*centrum;
        vDiepte=-p.z;
        // Houd verre vlokken groot en vaag; voorkom subpixel-sterren.
        p.xy+=position.xy*max(length(instanceMatrix[0].xyz),vDiepte*.018);
        gl_Position=projectionMatrix*p;
      }`,
    fragmentShader: `uniform vec3 kleur; uniform float dichtheid; varying vec2 vUv; varying float vDiepte; varying float vBuiten;
      void main(){ float r=length(vUv-.5)*2.; if(r>1.)discard;
        float a=pow(1.-smoothstep(0.,1.,r),3.)*${c.instrument.deeltjeHelderheid}*exp(-dichtheid*max(vDiepte-.12,0.));
        a*=mix(1.,${c.instrument.buitenHelderheid},vBuiten);
        gl_FragColor=vec4(kleur,a); }`,
  });
  const plane = new THREE.PlaneGeometry(1,1);
  const deeltjes = new THREE.InstancedMesh(plane, deeltjesMat, c.instrument.deeltjes);
  deeltjes.frustumCulled = false;
  const matrix = new THREE.Matrix4();
  for(let i=0;i<c.instrument.deeltjes;i++) {
    const z=toeval(i*5+1)*2-1, hoek=toeval(i*5+2)*Math.PI*2;
    const buiten=i%12===0, r=buiten?1.06+toeval(i*5+3)*.18:.97*Math.cbrt(toeval(i*5+3));
    const x=Math.sqrt(1-z*z)*Math.cos(hoek)*r*1.1, y=Math.sqrt(1-z*z)*Math.sin(hoek)*r*.91;
    const s=(c.instrument.deeltjeMin+Math.pow(toeval(i*5+4),2)*c.instrument.deeltjeVariatie)*(buiten?2:1);
    matrix.makeScale(s,s,s).setPosition(x,y,z*r);
    if (i % 9 === 0) {
      // Een dunne laag vlokken volgt het voorste membraanoppervlak. In macro
      // drijven ze langs de lens; op afstand blijven het zachte, donkere vlokken.
      const sx=(toeval(i*5+1)-.5)*.9, sy=(toeval(i*5+2)-.5)*.6;
      const sz=Math.sqrt(1-(sx/1.1)**2-(sy/.91)**2)+.008+toeval(i*5+3)*.014;
      const schaal=.0015+toeval(i*5+4)*.003;
      matrix.makeScale(schaal,schaal,schaal).setPosition(sx,sy,sz);
    }
    deeltjes.setMatrixAt(i,matrix);
  }
  groep.add(deeltjes);
  const lagenMat = new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
    uniforms:{tijd,uRuis:{value:ruis},kleur:{value:warm},opacity:{value:c.instrument.mediumOpacity}},
    vertexShader:`varying vec2 vUv; varying vec3 vWereld; void main(){vUv=uv;vWereld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform float tijd; uniform vec3 kleur; uniform float opacity; varying vec2 vUv; varying vec3 vWereld; ${ruisGlsl}
      void main(){vec2 p=vUv-.5;float rand=pow(max(0.,1.-length(p)*2.),2.);
        float mist=.25+pow(lagen(vec3(vUv*7.,tijd*.025)),2.);
        float binnen=1.-smoothstep(.75,1.2,length(vWereld/vec3(1.1,.91,1.)));
        gl_FragColor=vec4(kleur,rand*mist*opacity*mix(.15,1.,binnen));}`,
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
  return {groep,tijd,deling,ruis,lagen,plane,deeltjes,deeltjesMat,lagenMat,filamentGeo,filamentMat};
}

function CelMedium({staat}:{staat:CelStaat}) {
  const [medium]=useState(maakMedium);
  const ref=useRef(medium);
  useEffect(()=>()=>{
    medium.plane.dispose();medium.deeltjes.dispose();medium.deeltjesMat.dispose();
    medium.lagenMat.dispose();medium.filamentGeo.dispose();medium.filamentMat.dispose();
    medium.ruis.dispose();
  },[medium]);
  useFrame(({clock,camera})=>{
    const m=ref.current;m.tijd.value=clock.elapsedTime;
    m.deling.value=staat.intensiteit.celdeling;
    m.deeltjes.count=Math.round(c.instrument.deeltjes*staat.deeltjesDichtheid);
    m.filamentMat.opacity=.04*(1-staat.intensiteit.celdeling);
    m.lagen.forEach((laag,i)=>{
      laag.quaternion.copy(camera.quaternion);
      laag.position.x=(i%2-.5)*.5+Math.sin(clock.elapsedTime*.04+i)*.08;
    });
  });
  return <primitive object={medium.groep} dispose={null}/>;
}
export default memo(CelMedium);
