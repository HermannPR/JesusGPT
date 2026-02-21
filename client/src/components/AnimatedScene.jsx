import { useState, useEffect } from 'react';

/**
 * AnimatedScene - Displays a sequence of images with crossfade transitions.
 *
 * Place your Nano Banana images in /public/scenes/ with these names:
 *   - peace.webp      (for themes: peace, calm, rest, comfort)
 *   - forgiveness.webp (for themes: forgive, mercy, sin, repent)
 *   - love.webp        (for themes: love, compassion, kindness)
 *   - faith.webp       (for themes: faith, believe, trust, hope)
 *   - suffering.webp   (for themes: suffer, pain, trial, grief)
 *   - light.webp       (for themes: light, truth, way, guide)
 *   - garden.webp      (for themes: grow, seed, fruit, harvest)
 *   - water.webp       (for themes: water, thirst, living, spirit)
 *   - default.webp     (fallback scene)
 *
 * Images should be ~1200x600px for best results.
 */

const THEME_SCENES = {
  peace:       { image: '/scenes/peace.webp',       keywords: ['peace', 'calm', 'rest', 'comfort', 'still', 'quiet', 'anxiety', 'worry'] },
  forgiveness: { image: '/scenes/forgiveness.webp', keywords: ['forgive', 'mercy', 'sin', 'repent', 'judge', 'condemn', 'guilt'] },
  love:        { image: '/scenes/love.webp',        keywords: ['love', 'compassion', 'kindness', 'neighbor', 'heart', 'care'] },
  faith:       { image: '/scenes/faith.webp',       keywords: ['faith', 'believe', 'trust', 'hope', 'doubt', 'mountain'] },
  suffering:   { image: '/scenes/suffering.webp',   keywords: ['suffer', 'pain', 'trial', 'grief', 'mourn', 'death', 'loss', 'hurt'] },
  light:       { image: '/scenes/light.webp',       keywords: ['light', 'truth', 'way', 'guide', 'darkness', 'lamp', 'path'] },
  garden:      { image: '/scenes/garden.webp',      keywords: ['grow', 'seed', 'fruit', 'harvest', 'vine', 'tree', 'sow'] },
  water:       { image: '/scenes/water.webp',       keywords: ['water', 'thirst', 'living', 'spirit', 'river', 'well', 'baptize'] },
};

function detectScene(text) {
  const lower = text.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const [theme, config] of Object.entries(THEME_SCENES)) {
    const score = config.keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = theme;
    }
  }

  return bestMatch ? THEME_SCENES[bestMatch].image : '/scenes/default.webp';
}

export default function AnimatedScene({ text, speaking }) {
  const [sceneImage, setSceneImage] = useState(null);
  const [imageExists, setImageExists] = useState(false);

  useEffect(() => {
    const image = detectScene(text);
    setSceneImage(image);

    // Check if the image actually exists
    const img = new Image();
    img.onload = () => setImageExists(true);
    img.onerror = () => setImageExists(false);
    img.src = image;
  }, [text]);

  if (!imageExists) return null;

  return (
    <div className={`relative w-full rounded-xl overflow-hidden shadow-lg transition-all duration-1000 ${speaking ? 'h-64 md:h-80 opacity-100' : 'h-48 md:h-64 opacity-80'}`}>
      {/* Scene Image with Ken Burns effect */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[20000ms] ease-linear"
        style={{
          backgroundImage: `url(${sceneImage})`,
          transform: speaking ? 'scale(1.1)' : 'scale(1.0)',
        }}
      />

      {/* Warm overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-parchment-100/90 via-parchment-100/30 to-transparent" />

      {/* Pulsing glow when speaking */}
      {speaking && (
        <div className="absolute inset-0 border-2 border-parchment-400/50 rounded-xl animate-pulse" />
      )}
    </div>
  );
}
