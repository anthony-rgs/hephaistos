// Dimensions du chrome (top + bottom overhead dans le cadre)
const PY = 14; // padding vertical intérieur
const DI_H = 26; // dynamic island height
const HI_H = 5; // home indicator height
const GAP = 10; // gap entre les éléments flex
const PX = 12; // padding horizontal (bezel)

export const PHONE_CHROME_H = PY * 2 + DI_H + GAP * 2 + HI_H; // 79px
export const PHONE_BEZEL_W = PX * 2; // 24px

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
        background: "#1c1c1e",
        borderRadius: 50,
        padding: `${PY}px ${PX}px`,
        border: "1.5px solid #3a3a3a",
        boxShadow:
          "inset 0 0 0 1px rgba(0,0,0,0.0), 0 0 0 0.5px #777, 0 30px 80px rgba(0,0,0,0.45)",
        flexShrink: 0,
      }}
    >
      {/* Bouton silencieux */}
      <div
        style={{
          position: "absolute",
          left: -3.5,
          top: 76,
          width: 3.5,
          height: 30,
          background: "#2c2c2e",
          borderRadius: "2px 0 0 2px",
          border: "0.5px solid #555",
          borderRight: "none",
        }}
      />
      {/* Volume + */}
      <div
        style={{
          position: "absolute",
          left: -3.5,
          top: 126,
          width: 3.5,
          height: 60,
          background: "#2c2c2e",
          borderRadius: "2px 0 0 2px",
          border: "0.5px solid #555",
          borderRight: "none",
        }}
      />
      {/* Volume - */}
      <div
        style={{
          position: "absolute",
          left: -3.5,
          top: 200,
          width: 3.5,
          height: 60,
          background: "#2c2c2e",
          borderRadius: "2px 0 0 2px",
          border: "0.5px solid #555",
          borderRight: "none",
        }}
      />
      {/* Power */}
      <div
        style={{
          position: "absolute",
          right: -3.5,
          top: 140,
          width: 3.5,
          height: 80,
          background: "#2c2c2e",
          borderRadius: "0 2px 2px 0",
          border: "0.5px solid #555",
          borderLeft: "none",
        }}
      />

      {/* Dynamic Island */}
      <div
        style={{
          width: 90,
          height: DI_H,
          background: "#000",
          borderRadius: 13,
          flexShrink: 0,
        }}
      />

      {/* Screen */}
      <div
        style={{
          overflow: "hidden",
          borderRadius: 6,
          flexShrink: 0,
          lineHeight: 0,
        }}
      >
        {children}
      </div>

      {/* Home indicator */}
      <div
        style={{
          width: 100,
          height: HI_H,
          background: "#484848",
          borderRadius: 3,
          flexShrink: 0,
        }}
      />
    </div>
  );
}
