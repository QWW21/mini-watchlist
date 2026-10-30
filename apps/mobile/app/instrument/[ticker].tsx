import { ScreenPlaceholder } from '@mw/ui';
import { Link, useLocalSearchParams } from 'expo-router';

export default function InstrumentScreen() {
  const { ticker } = useLocalSearchParams<{ ticker: string }>();

  return (
    <ScreenPlaceholder title={`Instrument: ${ticker}`}>
      <Link href={{ pathname: '/order/[ticker]', params: { ticker } }}>
        Buy
      </Link>
    </ScreenPlaceholder>
  );
}
