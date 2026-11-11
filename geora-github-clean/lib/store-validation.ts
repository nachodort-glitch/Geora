import type { Store, Task, Skill } from "./game";

const modes = ["flag", "capital", "map", "expedition"];
const regions = [
  "Todo el mundo",
  "Europa",
  "América",
  "Asia",
  "África",
  "Oceanía",
];
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const integer = (v: unknown): v is number =>
  Number.isSafeInteger(v) && (v as number) >= 0;
const text = (v: unknown): v is string => typeof v === "string";
const date = (v: unknown) =>
  text(v) &&
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  Number.isFinite(Date.parse(v + "T12:00:00Z")) &&
  new Date(v + "T12:00:00Z").toISOString().slice(0, 10) === v;
const instant = (v: unknown) => text(v) && Number.isFinite(Date.parse(v));
const fail = (): never => {
  throw Error(
    "La copia de progreso está dañada o tiene un formato no reconocido.",
  );
};

export function validateStore(
  value: unknown,
  countryIds: ReadonlySet<string>,
  contentVersion: string,
): asserts value is Store {
  if (
    !record(value) ||
    value.version !== 1 ||
    !Array.isArray(value.history) ||
    !Array.isArray(value.days) ||
    !record(value.knowledge) ||
    !("game" in value)
  )
    fail();
  const s = value as unknown as Store;
  if (!s.days.every(date) || new Set(s.days).size !== s.days.length) fail();
  for (const h of s.history) {
    if (
      !record(h) ||
      !text(h.id) ||
      !modes.includes(h.mode as string) ||
      !regions.includes(h.continent as string) ||
      !integer(h.completed) ||
      !integer(h.total) ||
      h.total < 1 ||
      h.total > countryIds.size ||
      h.completed > h.total ||
      !integer(h.errors) ||
      typeof h.won !== "boolean" ||
      !instant(h.date)
    )
      fail();
  }
  for (const [id, skills] of Object.entries(s.knowledge)) {
    if (!countryIds.has(id) || !record(skills)) fail();
    for (const [skill, counts] of Object.entries(skills)) {
      if (
        !["flag", "capital", "map"].includes(skill) ||
        !record(counts) ||
        !integer(counts.correct) ||
        !integer(counts.wrong)
      )
        fail();
    }
  }
  if (s.game === null) return;
  const g = s.game;
  if (!record(g)) fail();
  if (g.contentVersion !== contentVersion)
    throw Error("La partida pertenece a otra versión del contenido.");
  if (
    !modes.includes(g.mode) ||
    !regions.includes(g.continent) ||
    !["normal", "advanced"].includes(g.difficulty) ||
    !text(g.id) ||
    !g.id ||
    !instant(g.startedAt) ||
    !integer(g.sequence) ||
    typeof g.correctionUsed !== "boolean" ||
    !["playing", "won", "lost"].includes(g.status) ||
    !Array.isArray(g.ids) ||
    !g.ids.length ||
    !g.ids.every((id) => countryIds.has(id)) ||
    new Set(g.ids).size !== g.ids.length ||
    !Array.isArray(g.queue) ||
    !record(g.passed) ||
    !Array.isArray(g.errors) ||
    !integer(g.lives)
  )
    fail();
  const skills: Skill[] =
    g.mode === "expedition" ? ["flag", "capital", "map"] : [g.mode];
  const taskValid = (t: unknown): t is Task =>
    record(t) &&
    text(t.country) &&
    g.ids.includes(t.country) &&
    skills.includes(t.skill as Skill);
  const tasks = new Set<string>();
  let passed = 0;
  for (const [id, list] of Object.entries(g.passed)) {
    if (
      !g.ids.includes(id) ||
      !Array.isArray(list) ||
      new Set(list).size !== list.length ||
      !list.every((s) => skills.includes(s))
    )
      fail();
    for (const skill of list) {
      tasks.add(id + ":" + skill);
      passed++;
    }
  }
  for (const task of g.queue) {
    if (!taskValid(task)) fail();
    const key = task.country + ":" + task.skill;
    if (tasks.has(key)) fail();
    tasks.add(key);
  }
  if (tasks.size !== g.ids.length * skills.length) fail();
  if (!g.errors.every((e) => record(e) && taskValid(e.task) && text(e.answer)))
    fail();
  if (
    g.sequence !== passed + g.errors.length ||
    g.lives !== (g.mode === "expedition" ? 6 : 3) - g.errors.length
  )
    fail();
  if (g.status === "playing" && (!g.queue.length || g.lives < 1)) fail();
  if (g.status === "won" && (g.queue.length !== 0 || g.lives < 1)) fail();
  if (g.status === "lost" && g.lives !== 0) fail();
  if (g.feedback !== null) {
    const f = g.feedback;
    if (
      !record(f) ||
      !taskValid(f.task) ||
      typeof f.correct !== "boolean" ||
      !text(f.answer)
    )
      fail();
    if (f.correct && !g.passed[f.task.country]?.includes(f.task.skill)) fail();
    if (
      !f.correct &&
      !g.queue.some(
        (t) => t.country === f.task.country && t.skill === f.task.skill,
      )
    )
      fail();
  }
}
