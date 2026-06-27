export function PersonaPortrait({ emotion = "curious" }: { emotion?: "curious" | "shy" | "focused" }) {
  return (
    <div className={`persona-portrait ${emotion}`} aria-label="original demo persona portrait">
      <div className="portrait-hair" />
      <div className="portrait-face">
        <span className="eye left-eye" />
        <span className="eye right-eye" />
        <span className="mouth" />
        <span className="blush blush-left" />
        <span className="blush blush-right" />
      </div>
      <div className="portrait-ribbon" />
      <div className="portrait-badge">demo persona</div>
    </div>
  );
}
