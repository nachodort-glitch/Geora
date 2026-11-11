"use client";
import { useId } from "react";
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
  Landmark,
  MapPinned,
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

export function ContinentMedal({ name }: { name: string }) {
  const uid = useId().replace(/:/g, "");
  const gold = `medal-gold-${uid}`;
  const shadow = `medal-shadow-${uid}`;
  const mask = `medal-map-${uid}`;
  const world = name === "Todo el mundo";
  return (
    <div className="continent-medal" aria-hidden="true">
      <svg viewBox="0 0 260 310">
        <defs>
          <linearGradient id={gold} x1="0" y1="0" x2=".8" y2="1">
            <stop stopColor="#fff0a3" />
            <stop offset=".35" stopColor="#f8c94f" />
            <stop offset=".65" stopColor="#c98a16" />
            <stop offset="1" stopColor="#ffdc72" />
          </linearGradient>
          <filter id={shadow} x="-30%" y="-30%" width="160%" height="175%">
            <feDropShadow
              dx="0"
              dy="5"
              stdDeviation="2"
              floodColor="#072c45"
              floodOpacity=".4"
            />
          </filter>
          <mask
            id={mask}
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <image
              href={`/data/continent-${continentFiles[name] || "europe"}.svg`}
              x="78"
              y="129"
              width="104"
              height="85"
            />
          </mask>
        </defs>
        <g filter={`url(#${shadow})`}>
          <path
            d="M47 0H103L144 90 108 116Z"
            fill="#156b4c"
            stroke="#142c42"
            strokeWidth="3"
          />
          <path
            d="M157 0H213L152 116 116 90Z"
            fill="#23866a"
            stroke="#142c42"
            strokeWidth="3"
          />
          <path d="M68 0H83L131 101 117 107Z" fill="#f9cf56" />
          <path d="M176 0H192L142 107 128 101Z" fill="#ffdd70" />
          <rect
            x="106"
            y="74"
            width="48"
            height="32"
            rx="9"
            fill={`url(#${gold})`}
            stroke="#96600f"
            strokeWidth="3"
          />
          <circle
            cx="130"
            cy="180"
            r="96"
            fill={`url(#${gold})`}
            stroke="#142c42"
            strokeWidth="3"
          />
          <circle
            cx="130"
            cy="180"
            r="84"
            fill="#d99e22"
            stroke="#fff0b5"
            strokeWidth="3"
          />
          <circle
            cx="130"
            cy="180"
            r="76"
            fill="#176d50"
            stroke="#99651a"
            strokeWidth="3"
          />
          {world ? (
            <Globe2
              x="85"
              y="132"
              width="90"
              height="90"
              color="#fff2bd"
              strokeWidth="1.4"
            />
          ) : (
            <rect
              x="75"
              y="126"
              width="110"
              height="92"
              fill="#fff3c5"
              mask={`url(#${mask})`}
            />
          )}
          {Array.from({ length: 7 }, (_, i) => (
            <g key={i} fill="#f4ce68">
              <ellipse
                cx={70 - i * 1.4}
                cy={169 + i * 10}
                rx="9"
                ry="4"
                transform={`rotate(${38 + i * 7} ${70 - i * 1.4} ${169 + i * 10})`}
              />
              <ellipse
                cx={190 + i * 1.4}
                cy={169 + i * 10}
                rx="9"
                ry="4"
                transform={`rotate(${-38 - i * 7} ${190 + i * 1.4} ${169 + i * 10})`}
              />
            </g>
          ))}
          <path
            d="M22 238 62 244 130 234 198 244 238 238 231 266 198 276 130 267 62 276 29 266Z"
            fill={`url(#${gold})`}
            stroke="#885812"
            strokeWidth="2.5"
          />
          <text
            x="130"
            y="260"
            textAnchor="middle"
            fill="#142c42"
            fontFamily="Manrope, sans-serif"
            fontWeight="900"
            fontSize={name.length > 9 ? "14" : "20"}
            letterSpacing="1"
          >
            {world ? "MUNDO" : name.toLocaleUpperCase("es")}
          </text>
          <path
            d="m130 281 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1Z"
            fill="#ffdc71"
          />
        </g>
      </svg>
      <span className="medal-spark spark-one">✦</span>
      <span className="medal-spark spark-two">✦</span>
    </div>
  );
}

export function ExplorerTicket({
  store,
  account,
}: {
  store: Store;
  account?: string | null;
}) {
  const wins = store.history.filter((h) => h.won).length;
  const days = streak(store.days, localDay());
  const name = account?.split("@")[0] || "Explorador";
  return (
    <div className="arcade-ticket">
      <div className="ticket-avatar">{name[0].toUpperCase()}</div>
      <div className="ticket-details">
        <h2>
          {name}
          <span> · Explorador</span>
        </h2>
        <p>
          <strong>{Object.keys(store.knowledge).length}</strong> países <i>·</i>{" "}
          <strong>{days}</strong> días <i>·</i> <strong>{wins}</strong> retos
        </p>
      </div>
      <div className="ticket-badges" aria-label="Logros de explorador">
        {[
          { icon: Flag, earned: store.days.length > 0, title: "Primer paso" },
          { icon: Landmark, earned: wins > 0, title: "Explorador" },
          { icon: MapPinned, earned: days >= 3, title: "Constancia" },
        ].map(({ icon: Icon, earned, title }) => (
          <span
            className={earned ? "earned" : "locked"}
            key={title}
            title={`${title}: ${earned ? "conseguido" : "por conseguir"}`}
          >
            <Icon size={19} />
          </span>
        ))}
      </div>
    </div>
  );
}

export function Passport({
  store,
  account,
  onPlay,
}: {
  store: Store;
  account?: string | null;
  onPlay: () => void;
}) {
  const learned = learnedCount(
    store,
    countries.map((c) => c.id),
  );
  const names = ["Europa", "América", "Asia", "África", "Oceanía"];
  const earnedRegion = names.find((name) =>
    store.history.some(
      (h) => h.won && (h.continent === name || h.continent === "Todo el mundo"),
    ),
  );
  const featured = earnedRegion || "Europa";
  const ordered = [featured, ...names.filter((name) => name !== featured)];
  return (
    <>
      <div className="page-heading passport-heading">
        <p className="eyebrow">TU AVENTURA DEJA HUELLA</p>
        <h1 tabIndex={-1}>
          Tu mundo, <span>sello a sello.</span>
        </h1>
      </div>
      <ExplorerTicket store={store} account={account} />
      <section className="passport-collection" aria-label="Colección de sellos">
        <div className="collection-title">
          <div>
            <h2>Mi colección de sellos</h2>
            <p>Cada reto completado se convierte en un recuerdo.</p>
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
          {ordered.map((name) => {
            const index = names.indexOf(name);
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
                className={`travel-stamp stamp-${index} ${name === featured ? "stamp-featured" : ""} ${earned ? "stamped" : ""} ${!count && !earned ? "unexplored" : ""}`}
              >
                <span className="stamp-caption">
                  GIRATLAS · EXPLORA EL MUNDO
                </span>
                <strong>{name}</strong>
                <ContinentShape name={name} />
                {earned ? (
                  <span className="stamp-status">
                    <Trophy size={14} /> COMPLETADA
                  </span>
                ) : (
                  <span className="stamp-status">
                    <Compass size={14} /> POR DESCUBRIR
                  </span>
                )}
                <span className="stamp-total">
                  {count} / {ids.length}
                </span>
                {earned ? (
                  <span className="stamp-check">✓</span>
                ) : count === 0 && name !== featured ? (
                  <LockKeyhole className="stamp-lock" size={22} />
                ) : null}
              </div>
            );
          })}
        </div>
        <button className="primary passport-play" onClick={onPlay}>
          Conseguir mi próximo sello <ArrowUpRight size={20} />
        </button>
      </section>
      <div className="passport-footnote">
        <Sparkles size={18} />
        <p>
          Gana un reto para conseguir el sello de su continente. Cada acierto se
          conserva en tu aprendizaje.
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
      <ExplorerTicket store={store} account={account} />
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
