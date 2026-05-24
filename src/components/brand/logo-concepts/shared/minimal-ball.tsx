/** Geometric soccer ball — minimal panels, readable at 16px+ */
type MinimalBallProps = {
  cx: number;
  cy: number;
  r: number;
  stroke: string;
  accent: string;
  strokeWidth?: number;
};

export function MinimalBall({
  cx,
  cy,
  r,
  stroke,
  accent,
  strokeWidth = 1.15,
}: MinimalBallProps) {
  const sw = strokeWidth;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} stroke={stroke} strokeWidth={sw} fill="none" />
      {/* Simplified panel seams */}
      <path
        d={`M ${cx} ${cy - r} Q ${cx + r * 0.9} ${cy} ${cx} ${cy + r}`}
        stroke={stroke}
        strokeWidth={sw * 0.9}
        fill="none"
      />
      <path
        d={`M ${cx - r} ${cy} Q ${cx} ${cy - r * 0.85} ${cx + r} ${cy}`}
        stroke={stroke}
        strokeWidth={sw * 0.9}
        fill="none"
      />
      <path
        d={`M ${cx - r * 0.65} ${cy - r * 0.55} L ${cx + r * 0.2} ${cy - r * 0.35}`}
        stroke={stroke}
        strokeWidth={sw * 0.85}
        fill="none"
        strokeLinecap="round"
      />
      {/* Single green pentagon hint */}
      <circle cx={cx + r * 0.15} cy={cy - r * 0.2} r={r * 0.22} fill={accent} />
    </g>
  );
}
