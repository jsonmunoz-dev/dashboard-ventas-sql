import { useEffect, useState } from 'react';

const TOKENS = ['series-1', 'series-2', 'text-secondary', 'text-muted', 'grid', 'surface-1'];

function read() {
  const style = getComputedStyle(document.documentElement);
  return Object.fromEntries(TOKENS.map((t) => [t, style.getPropertyValue(`--${t}`).trim()]));
}

// Los atributos SVG de Recharts no resuelven var(--x), así que se leen los
// tokens CSS en JS y se vuelven a leer cuando cambia el modo claro/oscuro.
export function useChartTheme() {
  const [theme, setTheme] = useState(read);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    const update = () => setTheme(read());
    mq?.addEventListener('change', update);
    return () => mq?.removeEventListener('change', update);
  }, []);
  return theme;
}
