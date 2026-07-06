import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Favicon: minimalistische versie van het signatuur-element — de koperen
// kern-node op de donkere achtergrond van het huidige palet (zie globals.css).
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#101118",
          borderRadius: 8,
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#c98245",
            boxShadow: "0 0 8px 3px rgba(201, 130, 69, 0.55)",
          }}
        />
      </div>
    ),
    size,
  );
}
