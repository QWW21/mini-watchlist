import { ScreenPlaceholder } from '@mw/ui';
import { useLocalSearchParams } from 'expo-router';

export default function OrderScreen() {
  const { ticker } = useLocalSearchParams<{ ticker: string }>();

  return <ScreenPlaceholder title={`Order: ${ticker}`} />;
}
