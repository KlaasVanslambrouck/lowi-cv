import { OG_CONTENT_TYPE, OG_SIZE, homeOgAlt, homeOgImage } from "@/lib/og";

export const alt = homeOgAlt("en");
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return homeOgImage("en");
}
