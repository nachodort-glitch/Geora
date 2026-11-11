import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createChoices } from "../lib/choices.ts";
import { normalize } from "../lib/validation.ts";

const countries = JSON.parse(fs.readFileSync("lib/countries.json", "utf8"));
const options = (id, skill, seed) =>
  createChoices(countries, id, skill, seed, normalize);

test("los 195 países tienen cuatro opciones únicas y una sola solución en ambos modos", () => {
  for (const skill of ["flag", "capital"]) {
    const key = skill === "capital" ? "capital" : "name";
    for (const country of countries) {
      const result = options(country.id, skill, 123456);
      assert.equal(result.length, 4);
      assert.equal(result.filter((c) => c.id === country.id).length, 1);
      assert.equal(new Set(result.map((c) => normalize(c[key]))).size, 4);
    }
  }
});

test("las respuestas correctas se reparten entre A, B, C y D", () => {
  for (const skill of ["flag", "capital"]) {
    const counts = [0, 0, 0, 0];
    for (let seed = 0; seed < 40; seed++) {
      for (const country of countries) {
        counts[
          options(country.id, skill, seed * 1299709).findIndex(
            (c) => c.id === country.id,
          )
        ]++;
      }
    }
    const total = countries.length * 40;
    for (const count of counts)
      assert.ok(
        count / total > 0.21 && count / total < 0.29,
        JSON.stringify({ skill, counts }),
      );
  }
});

test("la mezcla se conserva al volver a la pregunta y cambia con la semilla", () => {
  for (const skill of ["flag", "capital"]) {
    const first = options("ESP", skill, 76);
    assert.deepEqual(options("ESP", skill, 76), first);
    assert.notDeepEqual(options("ESP", skill, 77), first);
  }
});

test("los distractores priorizan el mismo continente", () => {
  for (const country of countries) {
    for (const skill of ["flag", "capital"]) {
      assert.ok(
        options(country.id, skill, 42).every(
          (c) => c.continent === country.continent,
        ),
      );
    }
  }
});
