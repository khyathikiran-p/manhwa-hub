/*
 * themeFromManhwa — pure functions mapping AniList data to motion params.
 *
 *   Genres/tags drive a "personality vector": (intensity, sharpness, warmth).
 *   These are consumed by Framer Motion variants and the ambient backdrop
 *   so the same component animates differently depending on its content.
 *
 *   intensity (0..1):
 *     overall energy. Action/horror/thriller → high. Slice of life → low.
 *     Drives glow scale, particle speed, slide rotation cadence.
 *   sharpness (0..1):
 *     transition snappiness. "Overpowered MC" / battle tags → high (stiff
 *     spring, tight overshoot). Drama/romance → soft (low stiffness, long ease).
 *   warmth (0..1):
 *     hue temperature. Romance/comedy → warm. Sci-fi/horror → cool.
 */

const INTENSE_GENRES = new Set([
  "Action",
  "Horror",
  "Thriller",
  "Supernatural",
  "Mecha",
  "Sports",
]);
const CALM_GENRES = new Set(["Slice of Life", "Romance", "Comedy", "Drama"]);

const SHARP_TAGS = new Set([
  "Overpowered Main Character",
  "Cultivation",
  "Tournament",
  "Martial Arts",
  "Magic",
  "Battle Royale",
  "Revenge",
]);

const WARM_GENRES = new Set(["Romance", "Comedy", "Slice of Life", "Ecchi"]);
const COOL_GENRES = new Set(["Sci-Fi", "Horror", "Mystery", "Psychological"]);

export function themeVectorFromManhwa(manhwa) {
  if (!manhwa) {
    return { intensity: 0.5, sharpness: 0.5, warmth: 0.5 };
  }
  const genres = manhwa.genres || [];
  const tagNames = (manhwa.tags || []).map((t) => t.name || t);

  let intensity = 0.4;
  let sharpness = 0.45;
  let warmth = 0.5;

  for (const g of genres) {
    if (INTENSE_GENRES.has(g)) intensity += 0.18;
    if (CALM_GENRES.has(g)) intensity -= 0.12;
    if (WARM_GENRES.has(g)) warmth += 0.15;
    if (COOL_GENRES.has(g)) warmth -= 0.18;
  }
  for (const t of tagNames) {
    if (SHARP_TAGS.has(t)) sharpness += 0.12;
  }

  // Score nudge — popular & high-rated titles feel more confident
  const score = manhwa.averageScore || 0;
  if (score >= 80) intensity += 0.05;

  return {
    intensity: clamp01(intensity),
    sharpness: clamp01(sharpness),
    warmth: clamp01(warmth),
  };
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

/*
 * Build Framer Motion variants from a theme vector.
 *
 *   For "sharp" content, we crank stiffness and reduce damping so cards
 *   snap into place. For "calm" content, springs are loose and the entrance
 *   uses a long ease so it feels gentle.
 */
export function variantsFromTheme(vector, baseDelay = 0) {
  const sharp = vector.sharpness;
  const intense = vector.intensity;

  // Stiffness 160 (calm) → 360 (sharp)
  const stiffness = 160 + sharp * 200;
  // Damping 28 (calm) → 18 (sharp, more overshoot)
  const damping = 28 - sharp * 10;
  // Entrance offset px — intense content slams in further
  const yOffset = 24 + intense * 30;

  // Composited-only entrance — no `filter`, no `box-shadow`. Translation,
  // scale, and opacity are all GPU compositor properties so this won't
  // paint each frame.
  return {
    hidden: {
      opacity: 0,
      y: yOffset,
      scale: 0.94 - sharp * 0.04,
    },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness,
        damping,
        mass: 0.8 + (1 - sharp) * 0.5,
        delay: baseDelay + i * (0.04 + (1 - sharp) * 0.05),
      },
    }),
    exit: {
      opacity: 0,
      y: -16,
      scale: 0.96,
      transition: { duration: 0.25 },
    },
  };
}
