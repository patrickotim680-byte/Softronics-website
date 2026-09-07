/**
 * Decorative node/edge figure that echoes the connected shape of the Softronics
 * mark. Static SVG, no animation loop, aria-hidden: it carries no information.
 */
export function NetworkField({ className }: { className?: string }) {
  const nodes = [
    { x: 20, y: 24, r: 3.5 },
    { x: 96, y: 12, r: 2.5 },
    { x: 158, y: 52, r: 4.5 },
    { x: 62, y: 86, r: 2.5 },
    { x: 128, y: 120, r: 3.5 },
    { x: 32, y: 148, r: 2.5 },
    { x: 176, y: 168, r: 3 },
    { x: 92, y: 190, r: 4 },
  ];

  const edges: [number, number][] = [
    [0, 1],
    [1, 2],
    [0, 3],
    [3, 4],
    [2, 4],
    [3, 5],
    [4, 6],
    [5, 7],
    [7, 6],
    [7, 4],
  ];

  return (
    <svg
      viewBox="0 0 200 210"
      className={className}
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      <g stroke="oklch(var(--brand) / 0.28)" strokeWidth="1">
        {edges.map(([from, to]) => (
          <line
            key={`${from}-${to}`}
            x1={nodes[from].x}
            y1={nodes[from].y}
            x2={nodes[to].x}
            y2={nodes[to].y}
          />
        ))}
      </g>
      <g fill="oklch(var(--brand) / 0.55)">
        {nodes.map((node) => (
          <circle key={`${node.x}-${node.y}`} cx={node.x} cy={node.y} r={node.r} />
        ))}
      </g>
    </svg>
  );
}
