import { setApiBaseUrl, shouldRetry } from '@mw/data';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { API_URL } from '../src/config';
import { QueryDevtools } from '../src/QueryDevtools';

setApiBaseUrl(API_URL);

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: shouldRetry } },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Watchlist' }} />
        <Stack.Screen
          name="instrument/[ticker]"
          options={{ title: 'Instrument' }}
        />
        <Stack.Screen name="order/[ticker]" options={{ title: 'Order' }} />
        <Stack.Screen name="portfolio" options={{ title: 'Portfolio' }} />
      </Stack>
      <QueryDevtools />
    </QueryClientProvider>
  );
}
