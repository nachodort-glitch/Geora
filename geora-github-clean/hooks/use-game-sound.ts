"use client";
import { useCallback, useEffect, useRef, useState } from "react";
export function useGameSound() {
  const [enabled, setEnabled] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  useEffect(() => {
    try {
      setEnabled(localStorage.getItem("giratlas.sound") === "on");
    } catch {}
    return () => {
      void audio.current?.close();
    };
  }, []);
  function toggle() {
    const value = !enabled;
    setEnabled(value);
    try {
      localStorage.setItem("giratlas.sound", value ? "on" : "off");
    } catch {}
    if (value) {
      try {
        audio.current ??= new AudioContext();
        void audio.current.resume();
      } catch {}
    }
  }
  const play = useCallback(
    (correct: boolean) => {
      if (!enabled) return;
      try {
        const ctx = (audio.current ??= new AudioContext());
        void ctx.resume();
        const tones = correct ? [523.25, 659.25, 783.99] : [220, 174.61];
        tones.forEach((hz, i) => {
          const osc = ctx.createOscillator(),
            gain = ctx.createGain();
          const start = ctx.currentTime + i * 0.075;
          osc.type = "sine";
          osc.frequency.value = hz;
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.065, start + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.19);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.21);
        });
      } catch {}
    },
    [enabled],
  );
  return { enabled, toggle, play };
}
