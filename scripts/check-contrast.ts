// Verifica el contraste de todos los pares de CONTRAST_PAIRS en los tres temas (V-01).
// Uso: npm run a11y:contrast. Sale con código 1 si algún par queda bajo el mínimo,
// para que no se pueda dar por buena una paleta que incumple WCAG AA.
// Escribe con process.stdout porque es una herramienta de terminal, no código de la app
// (en la app console.* está prohibido por la regla no-console).
import { contrastRatio, MIN_RATIO } from '../lib/contrast';
import { CONTRAST_PAIRS, themes, type ThemeName } from '../theme/colors';

const THEME_LABELS: Record<ThemeName, string> = {
  light: 'Claro',
  dark: 'Oscuro',
  highContrast: 'Alto contraste',
};

const print = (line: string) => process.stdout.write(`${line}\n`);

let failures = 0;

for (const themeName of Object.keys(themes) as ThemeName[]) {
  const colors = themes[themeName];
  print(`\nTema: ${THEME_LABELS[themeName]}`);

  for (const pair of CONTRAST_PAIRS) {
    const fg = colors[pair.foreground];
    const bg = colors[pair.background];
    const ratio = contrastRatio(fg, bg);
    const min = MIN_RATIO[pair.kind];
    const ok = ratio >= min;
    if (!ok) failures += 1;

    print(
      `  ${ok ? 'OK   ' : 'FALLA'} ${ratio.toFixed(2).padStart(5)}:1 (mín. ${min}:1, ${pair.kind}) ` +
        `${pair.foreground} ${fg} sobre ${pair.background} ${bg} — ${pair.usage}`,
    );
  }
}

const total = CONTRAST_PAIRS.length * Object.keys(themes).length;
if (failures > 0) {
  process.stderr.write(`\n${failures} de ${total} pares no cumplen WCAG AA.\n`);
  process.exit(1);
}
print(`\nLos ${total} pares cumplen WCAG AA.`);
