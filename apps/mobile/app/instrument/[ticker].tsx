import { useChart, useInstrument } from '@mw/data';
import { ScreenPlaceholder } from '@mw/ui';
import { Link, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

export default function InstrumentScreen() {
  const { ticker } = useLocalSearchParams<{ ticker: string }>();
  const instrument = useInstrument(ticker);
  const chart = useChart(ticker, '1D');

  return (
    <ScreenPlaceholder title={`Instrument: ${ticker}`}>
      {instrument.isError && <Text>{instrument.error.message}</Text>}
      {instrument.data && (
        <Text>
          {instrument.data.name} · {instrument.data.sector} ·{' '}
          {instrument.data.price}
        </Text>
      )}
      {chart.data && <Text>{chart.data.length} chart points</Text>}
      <Link href={{ pathname: '/order/[ticker]', params: { ticker } }}>
        Buy
      </Link>
    </ScreenPlaceholder>
  );
}
