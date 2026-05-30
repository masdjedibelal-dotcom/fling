/**
 * Entfernt Quellen, die aus dem Repo gelöscht wurden (z. B. Safe Pick),
 * falls sie auf CI/main noch liegen — verhindert Typecheck-Fehler.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const deprecated = [
  'components/chat/SafePickSetupModal.tsx',
  'components/chat/SafePickCheckinModal.tsx',
  'hooks/useSafePick.ts',
  'lib/safePick.ts',
  'components/graphics/SafePickMark.tsx',
];

for (const rel of deprecated) {
  const abs = path.join(root, rel);
  if (fs.existsSync(abs)) {
    fs.unlinkSync(abs);
    console.log(`removed deprecated: ${rel}`);
  }
}
