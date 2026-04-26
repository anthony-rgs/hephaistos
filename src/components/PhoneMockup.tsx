// Dimensions du chrome (top + bottom overhead dans le cadre)
const PY = 14; // padding vertical intérieur
const DI_H = 26; // dynamic island height
const HI_H = 5; // home indicator height
const GAP = 10; // gap entre les éléments flex
const PX = 12; // padding horizontal (bezel)

export const PHONE_CHROME_H = PY * 2 + DI_H + GAP * 2 + HI_H; // 79px
export const PHONE_BEZEL_W = PX * 2; // 24px

const BTN: React.CSSProperties = {
  position: "absolute",
  width: 3.5,
  background: "linear-gradient(to right, #2a2a2c, #333335)",
  border: "0.5px solid rgba(255,255,255,0.08)",
};

export default function PhoneMockup({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: GAP,
        background: "linear-gradient(160deg, #242426 0%, #1a1a1c 100%)",
        borderRadius: 50,
        padding: `${PY}px ${PX}px`,
        border: "1.5px solid #3a3a3c",
        boxShadow: [
          "inset 0 1px 0 rgba(255,255,255,0.07)",
          "inset 0 -1px 0 rgba(0,0,0,0.4)",
          "0 0 0 0.5px #555",
          "0 4px 12px rgba(0,0,0,0.3)",
          "0 20px 60px rgba(0,0,0,0.55)",
          "0 40px 100px rgba(0,0,0,0.35)",
          "0 0 60px rgba(139,92,246,0.07)",
        ].join(", "),
        flexShrink: 0,
      }}
    >
      {/* Bouton silencieux */}
      <div style={{ ...BTN, left: -3.5, top: 76, height: 30, borderRadius: "2px 0 0 2px", borderRight: "none" }} />
      {/* Volume + */}
      <div style={{ ...BTN, left: -3.5, top: 126, height: 60, borderRadius: "2px 0 0 2px", borderRight: "none" }} />
      {/* Volume - */}
      <div style={{ ...BTN, left: -3.5, top: 200, height: 60, borderRadius: "2px 0 0 2px", borderRight: "none" }} />
      {/* Power */}
      <div style={{ ...BTN, right: -3.5, top: 140, height: 80, borderRadius: "0 2px 2px 0", borderLeft: "none" }} />

      {/* Dynamic Island */}
      <div
        style={{
          width: 90,
          height: DI_H,
          background: "#000",
          borderRadius: 13,
          flexShrink: 0,
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03)",
        }}
      />

      {/* Screen */}
      <div
        style={{
          overflow: "hidden",
          borderRadius: 6,
          flexShrink: 0,
          lineHeight: 0,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.5)",
        }}
      >
        {children}
      </div>

      {/* Home indicator */}
      <div
        style={{
          width: 100,
          height: HI_H,
          background: "rgba(255,255,255,0.22)",
          borderRadius: 3,
          flexShrink: 0,
        }}
      />
    </div>
  );
}
