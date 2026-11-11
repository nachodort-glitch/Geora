import test from "node:test";
import assert from "node:assert/strict";
import { createGame, emptyStore, submit, advance } from "../lib/game.ts";
import { validateStore } from "../lib/store-validation.ts";
const ids = new Set(["ESP", "FRA"]);
const start = (mode = "flag") => ({
  ...emptyStore(),
  game: createGame([...ids], mode, "Europa", "normal", "v1", () => 0.99),
});
const valid = (s) => validateStore(JSON.parse(JSON.stringify(s)), ids, "v1");

test("las copias válidas conservan todas las fases y las reglas del juego", () => {
  for (const mode of ["flag", "capital", "map", "expedition"]) {
    let s = start(mode);
    valid(s);
    while (s.game.status === "playing") {
      s = submit(s, s.game.sequence, true, "respuesta", "2026-11-11");
      valid(s);
      s = advance(s, s.game.sequence);
      valid(s);
    }
    assert.equal(s.game.status, "won");
    s = start(mode);
    while (s.game.status === "playing") {
      s = submit(s, s.game.sequence, false, "error", "2026-11-11");
      valid(s);
      s = advance(s, s.game.sequence);
      valid(s);
    }
    assert.equal(s.game.status, "lost");
  }
});
test("rechaza copias que antes podían romper la interfaz o alterar vidas", () => {
  const changes = [
    (s) => (s.game.queue = []),
    (s) => s.game.queue.push(s.game.queue[0]),
    (s) => (s.game.mode = "otro"),
    (s) => s.game.ids.push("ESP"),
    (s) => (s.game.feedback = {}),
    (s) => (s.game.lives = 99),
    (s) => (s.knowledge.ESP = { flag: { correct: -1, wrong: 0 } }),
    (s) => s.history.push({}),
    (s) => s.days.push("2026-02-31"),
    (s) => (s.game.queue[0].skill = "map"),
  ];
  for (const change of changes) {
    const s = start();
    change(s);
    assert.throws(() => valid(s));
  }
  assert.throws(() => valid(null));
  assert.throws(() =>
    valid({ version: 1, days: [], history: [], knowledge: {} }),
  );
});
test("el historial de aprendizaje sin una partida activa sigue siendo válido", () =>
  valid(emptyStore()));
