"use client";
import {
  Compass,
  Flag,
  Flame,
  Globe2,
  LockKeyhole,
  Medal,
  Trophy,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { countries } from "@/lib/content";
import type { Store } from "@/lib/game";
import { streak } from "@/lib/game";
import { localDay } from "@/lib/persistence";
const continentFiles: Record<string, string> = {
  Europa: "europe",
  América: "america",
  Asia: "asia",
  África: "africa",
  Oceanía: "oceania",
};

export function ContinentShape({ name }: { name: string }) {
  return (
    <span
      className="continent-shape"
      aria-hidden="true"
      style={{
        maskImage: `url(/data/continent-${continentFiles[name] || "europe"}.svg)`,
        WebkitMaskImage: `url(/data/continent-${continentFiles[name] || "europe"}.svg)`,
      }}
    />
  );
}

export function LittleWorld({ victory = false }: { victory?: boolean }) {
  return (
    <div
      className={"little-world-scene " + (victory ? "celebrating" : "")}
      aria-hidden="true"
    >
      {victory && (
        <div className="world-flag">
          <span />
          <Flag size={45} fill="currentColor" />
        </div>
      )}
      <div className="little-world" />
      <span className="world-plinth" />
      {victory && (
        <div className="celebration-sparks">
          {Array.from({ length: 9 }, (_, i) => (
            <i key={i} style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>
      )}
    </div>
  );
}

function learnedCount(store: Store, ids: string[]) {
  return ids.filter((id) =>
    Object.values(store.knowledge[id] || {}).some((v) => (v?.correct || 0) > 0),
  ).length;
}

export function Passport({
  store,
  onPlay,
}: {
  store: Store;
  onPlay: () => void;
}) {
  const learned = learnedCount(
    store,
    countries.map((c) => c.id),
  );
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">CADA SELLO TIENE UNA HISTORIA</p>
        <h1>
          Tu mundo,
          <br />
          <span>sello a sello.</span>
        </h1>
        <p>
          Lo que descubres se queda contigo. Completa retos y llena tu
          pasaporte.
        </p>
      </div>
      <section className="passport-collection">
        <div className="passport-cover" aria-label="Pasaporte Giratlas">
          <span>GIRATLAS</span>
          <Globe2 size={86} strokeWidth={1} />
          <strong>
            PASAPORTE
            <br />
            DE EXPLORADOR
          </strong>
          <span className="passport-number">EL MUNDO TE ESPERA</span>
        </div>
        <div className="passport-content">
          <div className="collection-title">
            <div>
              <span className="eyebrow">TU COLECCIÓN</span>
              <h2>
                Cinco continentes.
                <br />
                Infinitas ganas.
              </h2>
            </div>
            <div className="collection-count">
              <strong>
                {learned}
                <small> / 195</small>
              </strong>
              <span>países con un acierto</span>
            </div>
          </div>
          <div className="stamp-grid">
            {["Europa", "América", "Asia", "África", "Oceanía"].map(
              (name, i) => {
                const ids = countries
                  .filter((c) => c.continent === name)
                  .map((c) => c.id);
                const count = learnedCount(store, ids);
                const earned = store.history.some(
                  (h) =>
                    h.won &&
                    (h.continent === name || h.continent === "Todo el mundo"),
                );
                return (
                  <div
                    key={name}
                    className={`travel-stamp stamp-${i} ${earned ? "stamped" : ""} ${!count && !earned ? "unexplored" : ""}`}
                  >
                    <span className="stamp-caption">
                      GIRATLAS · {earned ? "COMPLETADO" : "POR DESCUBRIR"}
                    </span>
                    <ContinentShape name={name} />
                    <strong>{name}</strong>
                    <span>
                      {earned ? (
                        <>
                          <Trophy size={12} /> Reto completado
                        </>
                      ) : (
                        <>
                          {count} / {ids.length} países
                        </>
                      )}
                    </span>
                    {earned && <span className="stamp-check">✓</span>}
                  </div>
                );
              },
            )}
            <button className="stamp-next" onClick={onPlay}>
              <Compass size={35} />
              <strong>
                Tu próxima
                <br />
                aventura
              </strong>
              <span>
                Elegir un reto <ArrowUpRight size={15} />
              </span>
            </button>
          </div>
        </div>
      </section>
      <div className="passport-footnote">
        <Sparkles size={19} />
        <p>
          Un sello se consigue al completar un reto de ese continente. Cada
          acierto, también en un intento sin terminar, cuenta en tu aprendizaje.
        </p>
      </div>
    </>
  );
}

export function ExplorerProfile({
  store,
  account,
}: {
  store: Store;
  account: string | null;
}) {
  const wins = store.history.filter((h) => h.won).length;
  const days = streak(store.days, localDay());
  const name = account?.split("@")[0] || "Explorador";
  const now = new Date();
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - 6 + i);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      label: d.toLocaleDateString("es", { weekday: "narrow" }),
      date: d.toLocaleDateString("es", { day: "numeric", month: "long" }),
    };
  });
  return (
    <section className="explorer-profile">
      <div className="explorer-card">
        <div className="explorer-avatar">{name[0].toUpperCase()}</div>
        <div>
          <p className="eyebrow">CLUB DE MENTES CURIOSAS</p>
          <h2>{name}</h2>
          <p>
            {wins
              ? "Explorador de nuevos horizontes"
              : "Cada viaje empieza con curiosidad."}
          </p>
        </div>
        <div className="identity-route">
          <span />
          <i />
          <span />
          <i />
          <span />
        </div>
        <Globe2 className="identity-globe" size={185} strokeWidth={0.7} />
      </div>
      <div className="explorer-bottom">
        <div className="achievement-shelf">
          <h3>Lo que te has ganado</h3>
          {[
            { icon: Flag, title: "Primer paso", earned: store.days.length > 0 },
            { icon: Medal, title: "Explorador", earned: wins > 0 },
            { icon: Flame, title: "Constancia", earned: days >= 3 },
          ].map(({ icon: Icon, title, earned }) => (
            <div
              key={title}
              className={
                "achievement-medal " + (earned ? "unlocked" : "locked")
              }
            >
              <span>
                {earned ? <Icon size={25} /> : <LockKeyhole size={21} />}
              </span>
              <small>{title}</small>
            </div>
          ))}
        </div>
        <div className="week-activity">
          <h3>Un poquito cada día</h3>
          <div>
            {week.map((day) => (
              <span
                key={day.key}
                title={`${day.date}: ${store.days.includes(day.key) ? "practicado" : "sin actividad"}`}
                className={store.days.includes(day.key) ? "practiced" : ""}
              >
                <i />
                {day.label}
              </span>
            ))}
          </div>
          <small>Tu actividad de los últimos siete días</small>
        </div>
      </div>
    </section>
  );
}
