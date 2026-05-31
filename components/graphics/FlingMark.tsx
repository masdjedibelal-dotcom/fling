import { FlingWordmark } from '@/components/graphics/FlingWordmark';
import type { WordmarkSurface } from '@/lib/brand';

type Props = {
  size?: number;
  /** @deprecated Nutze `surface` — früher: letterOnly auf dunklem UI */
  letterOnly?: boolean;
  /** Hintergrundfläche für die Wortmarke */
  surface?: WordmarkSurface;
  color?: string;
  radius?: number;
};

/**
 * App-Marke — Wortmarke (ersetzt das rote F-Tile).
 * `letterOnly` und `color` bleiben für alte Aufrufe kompatibel.
 */
export function FlingMark({
  size = 80,
  letterOnly: _letterOnly,
  surface = 'dark',
}: Props) {
  const wordmarkSize = Math.max(18, Math.round(size * 0.42));
  return <FlingWordmark size={wordmarkSize} surface={surface} />;
}
