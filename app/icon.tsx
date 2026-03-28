import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
          fontSize: 20,
          fontWeight: 700,
          color: "white",
          letterSpacing: "-0.5px",
        }}
      >
        S
      </div>
    ),
    { ...size }
  );
}
