type Candidate = {
  id: string;
  name: string;
  capital: string;
  continent: string;
};

// A seeded generator makes the choices stable across feedback and reloads.
// Sorting polynomial hashes of IDs biased the correct answer toward D.
function randomFor(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(source: readonly T[], random: () => number) {
  const result = [...source];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createChoices<T extends Candidate>(
  all: readonly T[],
  id: string,
  skill: "flag" | "capital" | "map",
  seed: number,
  normalize: (text: string) => string,
): T[] {
  const correct = all.find((c) => c.id === id);
  if (!correct) throw Error("País desconocido");
  const key = skill === "capital" ? "capital" : "name";
  let entropy = seed >>> 0;
  for (let i = 0; i < id.length; i++) {
    entropy = Math.imul(entropy ^ id.charCodeAt(i), 0x01000193);
  }
  const random = randomFor(entropy);
  const distractors = all.filter((c) => c.id !== id);
  const nearby = shuffle(
    distractors.filter((c) => c.continent === correct.continent),
    random,
  );
  const distant = shuffle(
    distractors.filter((c) => c.continent !== correct.continent),
    random,
  );
  const seen = new Set([normalize(correct[key])]);
  const picked = [correct];
  for (const candidate of [...nearby, ...distant]) {
    const answer = normalize(candidate[key]);
    if (!seen.has(answer)) {
      picked.push(candidate);
      seen.add(answer);
    }
    if (picked.length === 4) break;
  }
  return shuffle(picked, random);
}
