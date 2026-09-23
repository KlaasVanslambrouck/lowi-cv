import { OG_CONTENT_TYPE, OG_SIZE, nidusOgAlt, nidusOgImage } from "@/lib/og";

export const alt = nidusOgAlt("en");
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return nidusOgImage("en");
}
