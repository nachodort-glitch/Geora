export const TAU = Math.PI * 2;
export function nearestMode(angle: number) {
  return ((Math.round(angle / (Math.PI / 2)) % 4) + 4) % 4;
}
export function modeTarget(angle: number, index: number) {
  const target = (index * Math.PI) / 2;
  return target + Math.round((angle - target) / TAU) * TAU;
}
export function markerPosition(angle: number, index: number) {
  const phase = (index * Math.PI) / 2 - angle;
  return { x: Math.sin(phase) * 43, depth: Math.cos(phase) };
}
