import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Watchlist' }} />
      <Stack.Screen
        name="instrument/[ticker]"
        options={{ title: 'Instrument' }}
      />
      <Stack.Screen name="order/[ticker]" options={{ title: 'Order' }} />
      <Stack.Screen name="portfolio" options={{ title: 'Portfolio' }} />
    </Stack>
  );
}
