import { OG_CONTENT_TYPE, OG_SIZE, lowiOgAlt, lowiOgImage } from "@/lib/og";

export const alt = lowiOgAlt("en");
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return lowiOgImage("en");
}
