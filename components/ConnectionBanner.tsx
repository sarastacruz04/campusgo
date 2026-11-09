import { StatusBanner } from '@/components/ui/StatusBanner';
import { selectIsOnline } from '@/features/settings/selectors';
import { formatTime } from '@/lib/format';
import { useAppSelector } from '@/store/hooks';

type ConnectionBannerProps = {
  /** Si la pantalla está mostrando datos guardados y de cuándo son. */
  fromCache: boolean;
  cachedAt: number | null;
};

/**
 * Banner "Sin conexión: mostrando datos guardados" (TC-17). Vive fuera de
 * components/ui porque lee Redux; por dentro usa StatusBanner, que ya se anuncia
 * al lector y combina ícono + texto + borde.
 */
export function ConnectionBanner({ fromCache, cachedAt }: ConnectionBannerProps) {
  const isOnline = useAppSelector(selectIsOnline);
  if (isOnline && !fromCache) return null;

  const when = cachedAt ? ` (guardados a las ${formatTime(new Date(cachedAt))})` : '';
  const message = fromCache
    ? `Sin conexión: mostrando datos guardados${when}.`
    : 'Sin conexión a internet.';
  return <StatusBanner tone="offline" message={message} haptic={false} />;
}
