import { ImageResponse } from "next/og";
import { ABOUT_ME } from "@/constants/about";

export const alt = `${ABOUT_ME.name} — ${ABOUT_ME.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Dynamically generated social preview card styled like an OS window.
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        fontFamily: "monospace",
        padding: 64,
      }}
    >
      {/* Window chrome */}
      <div style={{ display: "flex", gap: 12, marginBottom: 48 }}>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 999,
            background: "#ff5f57",
          }}
        />
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 999,
            background: "#febc2e",
          }}
        />
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 999,
            background: "#28c840",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
        }}
      >
        <div style={{ color: "#38bdf8", fontSize: 28, marginBottom: 16 }}>
          ~/devosome $ whoami
        </div>
        <div
          style={{
            color: "#f8fafc",
            fontSize: 80,
            fontWeight: 700,
            lineHeight: 1.05,
          }}
        >
          {ABOUT_ME.name}
        </div>
        <div style={{ color: "#94a3b8", fontSize: 40, marginTop: 12 }}>
          {ABOUT_ME.title}
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, color: "#64748b", fontSize: 26 }}>
        React · Next.js · TypeScript · 8+ years
      </div>
    </div>,
    size,
  );
}
