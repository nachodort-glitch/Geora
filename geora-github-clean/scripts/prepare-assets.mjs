import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const flags = JSON.parse(
  await readFile(resolve(root, "lib/flags.json"), "utf8"),
);
await mkdir(resolve(root, "public/flags"), { recursive: true });
for (const [code, svg] of Object.entries(flags)) {
  await writeFile(resolve(root, "public/flags", code + ".svg"), svg);
}

// A small equirectangular land texture derived from the project's Natural Earth
// data. The globe itself is a WebGL sphere; geography stays local, with no API.
const world = JSON.parse(
  await readFile(resolve(root, "public/data/world.json"), "utf8"),
);
function simplify(points, tolerance = 0.12) {
  if (points.length < 6) return points;
  const keep = new Set([0, points.length - 1]);
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [start, end] = stack.pop();
    const [x, y] = points[start],
      [ex, ey] = points[end];
    const dx = ex - x,
      dy = ey - y,
      length = dx * dx + dy * dy;
    let maximum = tolerance * tolerance,
      found = -1;
    for (let i = start + 1; i < end; i++) {
      const [px, py] = points[i];
      const t = length
        ? Math.max(0, Math.min(1, ((px - x) * dx + (py - y) * dy) / length))
        : 0;
      const distance = (px - x - t * dx) ** 2 + (py - y - t * dy) ** 2;
      if (distance > maximum) {
        maximum = distance;
        found = i;
      }
    }
    if (found !== -1) {
      keep.add(found);
      stack.push([start, found], [found, end]);
    }
  }
  return [...keep].sort((a, b) => a - b).map((i) => points[i]);
}
const paths = [];
for (const feature of world.features) {
  const polygons =
    feature.geometry.type === "Polygon"
      ? [feature.geometry.coordinates]
      : feature.geometry.coordinates;
  for (const polygon of polygons) {
    for (const ring of polygon) {
      const points = simplify(ring);
      if (points.length < 4) continue;
      paths.push(
        "M" +
          points
            .map(
              ([x, y]) =>
                `${(((x + 180) * 2048) / 360).toFixed(1)},${(((90 - y) * 1024) / 180).toFixed(1)}`,
            )
            .join("L") +
          "Z",
      );
    }
  }
}
await writeFile(
  resolve(root, "public/data/earth-texture.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1024" viewBox="0 0 2048 1024"><rect width="2048" height="1024" fill="#2099d2"/><path d="${paths.join(" ")}" fill="#69b663" stroke="#87c578" stroke-width=".55" fill-rule="evenodd"/></svg>`,
);
const countries = JSON.parse(
  await readFile(resolve(root, "lib/countries.json"), "utf8"),
);
const regions = {
  Europa: ["europe", -25, 75, 30, 74],
  América: ["america", -174, -30, -58, 84],
  Asia: ["asia", 25, 180, -12, 80],
  África: ["africa", -20, 56, -36, 39],
  Oceanía: ["oceania", 110, 180, -48, 10],
};
for (const [name, [slug, west, east, south, north]] of Object.entries(
  regions,
)) {
  const ids = new Set(
    countries.filter((c) => c.continent === name).map((c) => c.id),
  );
  const shapes = [];
  for (const feature of world.features) {
    if (!ids.has(feature.properties.id)) continue;
    const polygons =
      feature.geometry.type === "Polygon"
        ? [feature.geometry.coordinates]
        : feature.geometry.coordinates;
    for (const polygon of polygons)
      for (const ring of polygon) {
        const points = simplify(ring, 0.3);
        if (points.length < 4) continue;
        shapes.push(
          "M" +
            points
              .map(
                ([x, y]) =>
                  `${(((Math.max(west, Math.min(east, x)) - west) / (east - west)) * 120).toFixed(1)},${(((north - Math.max(south, Math.min(north, y))) / (north - south)) * 90).toFixed(1)}`,
              )
              .join("L") +
            "Z",
        );
      }
  }
  await writeFile(
    resolve(root, `public/data/continent-${slug}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90"><path d="${shapes.join(" ")}" fill="black" fill-rule="evenodd"/></svg>`,
  );
}
console.log(
  "Banderas, continentes y textura terrestre listos (fuentes locales).",
);
