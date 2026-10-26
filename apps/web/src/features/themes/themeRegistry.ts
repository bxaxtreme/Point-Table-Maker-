export type ArenaTheme = {
  id: number;
  name: string;
  accent: string;
  glow: string;
  background: string;
  mood: string;
};

const palettes = [
  { name: "Arctic", accent: "#60a5fa", glow: "rgba(59,130,246,.28)", background: "#071326", mood: "Ice-cold blue" },
  { name: "Cyber", accent: "#22d3ee", glow: "rgba(34,211,238,.25)", background: "#06151d", mood: "Electric cyan" },
  { name: "Royal", accent: "#818cf8", glow: "rgba(129,140,248,.26)", background: "#0c1025", mood: "Royal indigo" },
  { name: "Glacier", accent: "#93c5fd", glow: "rgba(147,197,253,.22)", background: "#0a1a2d", mood: "Glacier frost" },
  { name: "Stealth", accent: "#38bdf8", glow: "rgba(56,189,248,.22)", background: "#080f1a", mood: "Stealth blue" },
  { name: "Ocean", accent: "#2dd4bf", glow: "rgba(45,212,191,.22)", background: "#061b20", mood: "Deep ocean" },
  { name: "Neon", accent: "#a5f3fc", glow: "rgba(165,243,252,.23)", background: "#08121c", mood: "Neon frost" },
  { name: "Midnight", accent: "#3b82f6", glow: "rgba(59,130,246,.25)", background: "#030712", mood: "Midnight blue" },
  { name: "Titanium", accent: "#cbd5e1", glow: "rgba(148,163,184,.18)", background: "#111827", mood: "Titanium" },
  { name: "Pulse", accent: "#38bdf8", glow: "rgba(14,165,233,.28)", background: "#07111f", mood: "Pulse energy" }
];

export const THEMES: ArenaTheme[] = Array.from({ length: 120 }, (_, index) => {
  const palette = palettes[index % palettes.length];
  const variant = Math.floor(index / palettes.length) + 1;
  return {
    id: index + 1,
    name: `${palette.name} ${String(variant).padStart(2, "0")}`,
    accent: palette.accent,
    glow: palette.glow,
    background: palette.background,
    mood: palette.mood
  };
});

export const CERTIFICATE_THEMES: ArenaTheme[] = THEMES.map(theme => ({
  ...theme,
  name: `Certificate ${theme.name}`
}));
