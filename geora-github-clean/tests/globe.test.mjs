import test from "node:test";
import assert from "node:assert/strict";
import { nearestMode, modeTarget, markerPosition, TAU } from "../lib/globe.ts";

test("el selector mantiene los cuatro modos tras giros completos en ambas direcciones", () => {
  for (let turns = -5; turns <= 5; turns++) {
    for (let mode = 0; mode < 4; mode++) {
      assert.equal(nearestMode(turns * TAU + (mode * Math.PI) / 2), mode);
    }
  }
});
test("elegir un modo cruza por el camino corto incluso al pasar de 3 a 0", () => {
  for (const angle of [-TAU - 0.2, -0.2, 0, 4.9, TAU + 0.2]) {
    for (let mode = 0; mode < 4; mode++) {
      const target = modeTarget(angle, mode);
      assert.ok(Math.abs(target - angle) <= Math.PI + 1e-9);
      assert.equal(nearestMode(target), mode);
    }
  }
});
test("los marcadores se ocultan al pasar por detrás de la esfera", () => {
  assert.deepEqual(markerPosition(0, 0), { x: 0, depth: 1 });
  assert.ok(markerPosition(0, 2).depth < 0);
  assert.ok(markerPosition(Math.PI, 0).depth < 0);
  assert.ok(markerPosition(Math.PI, 2).depth > 0.99);
});
