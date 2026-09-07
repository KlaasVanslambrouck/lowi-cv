import { describe, expect, it } from "vitest";
import { lowiCelBeginStaat, lowiCelHoofdstukken } from "@/content/lowiCellContent";
import { celInstellingen } from "./celInstellingen";
import { celPalet } from "./celPalet";
import { dempCelStaat, maakCelDoelBerekening, maakCelStaat, organelIds } from "./useCelInterpolatie";

describe("LOWI instrument interpolation", () => {
  it("has one fixed five-colour palette and never interpolates colours", () => {
    expect(Object.keys(celPalet)).toHaveLength(5);
    const staat=maakCelStaat(), doel=maakCelStaat();
    const kleuren=organelIds.map(id=>staat.kleuren[id].getHexString());
    maakCelDoelBerekening()(3/7,doel);dempCelStaat(staat,doel,1);
    expect(organelIds.map(id=>staat.kleuren[id].getHexString())).toEqual(kleuren);
  });
  it("starts at the macro intro and reaches all camera/FOV/focus endpoints", () => {
    const bereken=maakCelDoelBerekening(),doel=maakCelStaat();bereken(0,doel);
    expect(doel.cameraPositie.toArray()).toEqual([...lowiCelBeginStaat.cameraPositie]);
    expect(doel.fov).toBe(lowiCelBeginStaat.fov);
    lowiCelHoofdstukken.forEach((hoofdstuk,i)=>{
      bereken((i+1)/7,doel);
      doel.cameraPositie.toArray().forEach((v,as)=>expect(v).toBeCloseTo(hoofdstuk.visueel.cameraPositie[as],12));
      expect(doel.fov).toBeCloseTo(hoofdstuk.visueel.fov,12);
      expect(doel.focusPunt.toArray()).toEqual([...celInstellingen.focus[hoofdstuk.organel]]);
      expect(doel.focusBereik).toBeCloseTo(celInstellingen.focusBereiken[hoofdstuk.organel],12);
      expect(doel.doorsnede).toBe(hoofdstuk.visueel.doorsnede);
      expect(doel.dnaOntvouwing).toBe(hoofdstuk.visueel.dnaOntvouwing);
      expect(doel.intensiteit[hoofdstuk.organel]).toBe(1);
    });
  });
  it("uses smoothstep for FOV, DNA and both highlights", () => {
    const doel=maakCelStaat();maakCelDoelBerekening()(2.25/7,doel);
    const t=.15625,van=lowiCelHoofdstukken[1].visueel,naar=lowiCelHoofdstukken[2].visueel;
    expect(doel.cameraPositie.z).toBeCloseTo(van.cameraPositie[2]+(naar.cameraPositie[2]-van.cameraPositie[2])*t);
    expect(doel.fov).toBeCloseTo(van.fov+(naar.fov-van.fov)*t);
    expect(doel.dnaOntvouwing).toBeCloseTo(t);
    expect(doel.intensiteit.kern).toBeCloseTo(t);
    expect(doel.intensiteit.cytoplasma).toBeCloseTo(1-t);
  });
  it("reveals the whole cell before entering it in chapter two", () => {
    const doel=maakCelStaat();maakCelDoelBerekening()((1+celInstellingen.camera.onthullingMoment)/7,doel);
    doel.cameraPositie.toArray().forEach((v,i)=>expect(v).toBeCloseTo(celInstellingen.camera.onthulling[i],12));
    expect(doel.fov).toBeCloseTo(celInstellingen.camera.onthullingFov,12);
  });
  it("is continuous at chapter boundaries and at the reveal waypoint", () => {
    const bereken=maakCelDoelBerekening(),a=maakCelStaat(),b=maakCelStaat();
    const grenzen=[...Array.from({length:6},(_,i)=>(i+1)/7),(1+celInstellingen.camera.onthullingMoment)/7];
    for(const p of grenzen){bereken(p-1e-7,a);bereken(p+1e-7,b);
      expect(a.cameraPositie.distanceTo(b.cameraPositie)).toBeLessThan(1e-8);
      expect(a.fov).toBeCloseTo(b.fov,8);
      const focusVerschil=a.focusPunt.distanceTo(b.focusPunt);
      bereken(p-.5e-7,a);bereken(p+.5e-7,b);
      expect(a.focusPunt.distanceTo(b.focusPunt)).toBeLessThan(focusVerschil*.51+1e-12);
    }
  });
  it("damps camera, FOV and focus equally at 30 and 120 fps", () => {
    const doel=maakCelStaat();maakCelDoelBerekening()(3/7,doel);
    const a=maakCelStaat(),b=maakCelStaat();
    for(let i=0;i<30;i++)dempCelStaat(a,doel,1/30);
    for(let i=0;i<120;i++)dempCelStaat(b,doel,1/120);
    expect(a.cameraPositie.distanceTo(b.cameraPositie)).toBeLessThan(1e-12);
    expect(a.focusPunt.distanceTo(b.focusPunt)).toBeLessThan(1e-12);
    expect(a.focusBereik).toBeCloseTo(b.focusBereik,12);
    expect(a.fov).toBeCloseTo(b.fov,12);
  });
  it("clamps overshoot and handles non-finite input", () => {
    const doel=maakCelStaat(),bereken=maakCelDoelBerekening();bereken(2,doel);
    expect(doel.intensiteit.celdeling).toBe(1);
    for(const p of [-1,NaN,Infinity]){bereken(p,doel);expect(doel.fov).toBe(lowiCelBeginStaat.fov);}
  });
});
