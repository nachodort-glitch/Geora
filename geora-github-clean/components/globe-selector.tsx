"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Flag,
  Landmark,
  MapPinned,
  Compass,
  MoveHorizontal,
  ArrowUpRight,
} from "lucide-react";
import { markerPosition, modeTarget, nearestMode } from "@/lib/globe";
import type { Mode } from "@/lib/content";

const modes = [
  {
    id: "flag",
    name: "Banderas",
    description: "Reconoce países por sus colores.",
    icon: Flag,
  },
  {
    id: "capital",
    name: "Capitales",
    description: "Pon nombre al corazón de cada país.",
    icon: Landmark,
  },
  {
    id: "map",
    name: "Mapa",
    description: "Encuentra cada país en el mundo.",
    icon: MapPinned,
  },
  {
    id: "expedition",
    name: "Expedición",
    description: "Tres habilidades. Una gran aventura.",
    icon: Compass,
  },
] as const;

const vertexSource = `attribute vec2 a; varying vec2 p; void main(){p=a;gl_Position=vec4(a,0.,1.);}`;
const fragmentSource = `precision mediump float;
varying vec2 p; uniform sampler2D earth; uniform float yaw;
void main(){
  float d=dot(p,p); if(d>1.){discard;}
  vec3 n=vec3(p,sqrt(max(0.,1.-d)));
  float lon=atan(n.x,n.z)+yaw;
  float lat=asin(clamp(n.y,-1.,1.));
  vec2 uv=vec2(fract((lon+3.14159265)/6.2831853),(1.5707963-lat)/3.14159265);
  vec3 c=texture2D(earth,uv).rgb;
  float light=.62+.38*max(0.,dot(n,normalize(vec3(-.45,.65,1.))));
  float rim=pow(1.-n.z,3.);
  gl_FragColor=vec4(c*light+vec3(.13,.27,.32)*rim*.18,1.-smoothstep(.992,1.,d));
}`;

export default function GlobeSelector({
  onChoose,
  disabled = false,
}: {
  onChoose: (mode: Mode) => void;
  disabled?: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const draw = useRef<(angle: number) => void>(() => {});
  const angle = useRef(0);
  const frame = useRef(0);
  const pointer = useRef<{
    id: number;
    x: number;
    angle: number;
    lastX: number;
    lastTime: number;
    speed: number;
  } | null>(null);
  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [graphicsReady, setGraphicsReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  const selected = nearestMode(rotation);
  const active = modes[selected];
  const ActiveIcon = active.icon;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    const change = () => setReduced(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const gl = element.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });
    if (!gl) return;
    let disposed = false;
    let program: WebGLProgram | null = null;
    let texture: WebGLTexture | null = null;
    let buffer: WebGLBuffer | null = null;
    const shaders: WebGLShader[] = [];
    const image = new Image();
    const lost = (event: Event) => {
      event.preventDefault();
      setGraphicsReady(false);
      draw.current = () => {};
    };
    element.addEventListener("webglcontextlost", lost);
    try {
      const compile = (type: number, source: string) => {
        const shader = gl.createShader(type);
        if (!shader) throw Error("Shader unavailable");
        shaders.push(shader);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
          throw Error("Shader failed");
        return shader;
      };
      program = gl.createProgram();
      if (!program) throw Error("Program unavailable");
      gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw Error("Program failed");
      gl.useProgram(program);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW,
      );
      const a = gl.getAttribLocation(program, "a");
      gl.enableVertexAttribArray(a);
      gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
      const yaw = gl.getUniformLocation(program, "yaw");
      texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      image.onload = () => {
        if (disposed || gl.isContextLost()) return;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          image,
        );
        draw.current = (value) => {
          if (!program || gl.isContextLost()) return;
          const size = Math.min(
            1400,
            Math.round(
              element.clientWidth * Math.min(window.devicePixelRatio || 1, 2),
            ),
          );
          if (element.width !== size) {
            element.width = size;
            element.height = size;
          }
          gl.viewport(0, 0, element.width, element.height);
          gl.useProgram(program);
          gl.uniform1f(yaw, value + 0.18);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        };
        draw.current(angle.current);
        setGraphicsReady(true);
      };
      image.src = "/data/earth-texture.svg";
    } catch {
      setGraphicsReady(false);
    }
    const resize = new ResizeObserver(() => draw.current(angle.current));
    resize.observe(element);
    return () => {
      disposed = true;
      image.onload = null;
      resize.disconnect();
      cancelAnimationFrame(frame.current);
      element.removeEventListener("webglcontextlost", lost);
      draw.current = () => {};
      shaders.forEach((s) => gl.deleteShader(s));
      gl.deleteBuffer(buffer);
      gl.deleteTexture(texture);
      gl.deleteProgram(program);
    };
  }, []);

  function update(value: number) {
    angle.current = value;
    setRotation(value);
    draw.current(value);
  }
  function settle(target: number) {
    cancelAnimationFrame(frame.current);
    if (reduced) {
      update(target);
      return;
    }
    let previous = performance.now();
    const tick = (now: number) => {
      const delta = target - angle.current;
      if (Math.abs(delta) < 0.0005) {
        update(target);
        return;
      }
      update(
        angle.current +
          delta * (1 - Math.exp(-Math.min(now - previous, 40) / 95)),
      );
      previous = now;
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  }
  function choose(index: number) {
    settle(modeTarget(angle.current, index));
  }
  function step(direction: number) {
    const snap = Math.round(angle.current / (Math.PI / 2));
    settle(((snap + direction) * Math.PI) / 2);
  }

  return (
    <section
      className="globe-selector"
      aria-label="Elige un modo girando el mundo"
    >
      <div className="globe-stage">
        <div className="globe-scene">
          <div
            className={"globe-surface " + (dragging ? "is-dragging" : "")}
            role="group"
            tabIndex={0}
            aria-label={`Globo giratorio. Modo ${active.name}. Usa las flechas izquierda y derecha para cambiar.`}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                e.preventDefault();
                step(e.key === "ArrowRight" ? 1 : -1);
              }
            }}
            onPointerDown={(e) => {
              if (e.button !== 0 || (e.target as HTMLElement).closest("button"))
                return;
              cancelAnimationFrame(frame.current);
              e.currentTarget.setPointerCapture(e.pointerId);
              pointer.current = {
                id: e.pointerId,
                x: e.clientX,
                angle: angle.current,
                lastX: e.clientX,
                lastTime: performance.now(),
                speed: 0,
              };
              setDragging(true);
            }}
            onPointerMove={(e) => {
              const p = pointer.current;
              if (!p || p.id !== e.pointerId) return;
              const now = performance.now();
              const scale = 5 / e.currentTarget.clientWidth;
              p.speed =
                ((e.clientX - p.lastX) * scale) / Math.max(now - p.lastTime, 1);
              p.lastX = e.clientX;
              p.lastTime = now;
              update(p.angle - (e.clientX - p.x) * scale);
            }}
            onPointerUp={(e) => {
              const p = pointer.current;
              if (!p || p.id !== e.pointerId) return;
              pointer.current = null;
              setDragging(false);
              const velocity =
                performance.now() - p.lastTime < 80 ? p.speed : 0;
              const projected =
                angle.current -
                (reduced
                  ? 0
                  : Math.max(-0.008, Math.min(0.008, velocity)) * 120);
              settle(Math.round(projected / (Math.PI / 2)) * (Math.PI / 2));
            }}
            onPointerCancel={() => {
              pointer.current = null;
              setDragging(false);
              settle(Math.round(angle.current / (Math.PI / 2)) * (Math.PI / 2));
            }}
          >
            <div
              className="globe-fallback"
              aria-hidden="true"
              style={{ backgroundPosition: `${rotation * -80}px center` }}
            />
            <canvas
              ref={canvas}
              className={graphicsReady ? "earth-canvas ready" : "earth-canvas"}
              aria-hidden="true"
            />
            {modes.map((m, index) => {
              const pos = markerPosition(rotation, index);
              const Icon = m.icon;
              const visible = pos.depth > 0.08;
              return (
                <button
                  key={m.id}
                  className={
                    "globe-marker " + (index === selected ? "front" : "")
                  }
                  style={{
                    left: `${50 + pos.x}%`,
                    opacity: visible ? Math.min(1, pos.depth * 2) : 0,
                    transform: `translate(-50%,-50%) scale(${0.55 + Math.max(0, pos.depth) * 0.45})`,
                    zIndex: Math.round((pos.depth + 1) * 10),
                    visibility: visible ? "visible" : "hidden",
                  }}
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={() => choose(index)}
                >
                  <span className="marker-pin">
                    <Icon size={27} strokeWidth={2.1} />
                  </span>
                  <span className="marker-label">{m.name}</span>
                </button>
              );
            })}
          </div>
          <div className="globe-shadow" aria-hidden="true" />
          <div className="orbit-label orbit-label-left">
            <span /> 195 países por descubrir
          </div>
          <div className="orbit-label orbit-label-right">
            Una vuelta. Mil descubrimientos. <span />
          </div>
        </div>
        <p className="drag-hint">
          <MoveHorizontal size={23} />
          <span className="desktop-copy">Arrastra para girar</span>
          <span className="mobile-copy">Desliza para girar</span>
        </p>
      </div>
      <div className="mode-selector-controls">
        <button
          className="round-button"
          onClick={() => step(-1)}
          aria-label="Modo anterior"
        >
          <ArrowLeft size={21} />
        </button>
        <div className="selected-mode" aria-live="polite" aria-atomic="true">
          <span className="selected-mode-icon">
            <ActiveIcon size={28} />
          </span>
          <div key={active.id} className="mode-description">
            <span className="eyebrow">TU PRÓXIMA AVENTURA</span>
            <h2>{active.name}</h2>
            <p>{active.description}</p>
          </div>
          <button
            className="primary"
            disabled={disabled}
            onClick={() => onChoose(active.id)}
          >
            Jugar a {active.name} <ArrowUpRight size={19} />
          </button>
        </div>
        <button
          className="round-button"
          onClick={() => step(1)}
          aria-label="Modo siguiente"
        >
          <ArrowRight size={21} />
        </button>
      </div>
      <button
        className="primary mobile-mode-play"
        disabled={disabled}
        onClick={() => onChoose(active.id)}
      >
        Jugar a {active.name} <ArrowUpRight size={21} />
      </button>
      <div className="mode-dots" aria-label="Modos de juego">
        {modes.map((m, i) => (
          <button
            key={m.id}
            aria-label={m.name}
            aria-pressed={i === selected}
            onClick={() => choose(i)}
          >
            <span />
            <m.icon size={17} />
            {m.name}
          </button>
        ))}
      </div>
    </section>
  );
}
