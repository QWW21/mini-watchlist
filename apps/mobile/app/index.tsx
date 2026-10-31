import { useInstruments } from '@mw/data';
import { ScreenPlaceholder } from '@mw/ui';
import { Link } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

export default function WatchlistScreen() {
  const instruments = useInstruments();

  return (
    <ScreenPlaceholder title="Watchlist">
      <Link href="/portfolio">Open portfolio</Link>
      {instruments.isPending && <Text>Loading…</Text>}
      {instruments.isError && <Text>{instruments.error.message}</Text>}
      <ScrollView>
        {instruments.data?.map((instrument) => (
          <View key={instrument.ticker}>
            <Link href={`/instrument/${instrument.ticker}`}>
              {instrument.ticker} · {instrument.name} · {instrument.price} (
              {instrument.dailyChangePct}%)
            </Link>
          </View>
        ))}
      </ScrollView>
    </ScreenPlaceholder>
  );
}
