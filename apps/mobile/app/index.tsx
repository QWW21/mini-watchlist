import { ScreenPlaceholder } from '@mw/ui';
import { Link } from 'expo-router';

export default function WatchlistScreen() {
  return (
    <ScreenPlaceholder title="Watchlist">
      <Link href="/instrument/ACME">Open ACME</Link>
      <Link href="/portfolio">Open portfolio</Link>
    </ScreenPlaceholder>
  );
}
