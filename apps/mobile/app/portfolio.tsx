import { usePortfolio } from '@mw/data';
import { ScreenPlaceholder } from '@mw/ui';
import { Text } from 'react-native';

export default function PortfolioScreen() {
  const portfolio = usePortfolio();

  return (
    <ScreenPlaceholder title="Portfolio">
      {portfolio.isError && <Text>{portfolio.error.message}</Text>}
      {portfolio.data && <Text>Cash: {portfolio.data.cash}</Text>}
      {portfolio.data?.positions.map((position) => (
        <Text key={position.ticker}>
          {position.ticker} · {position.quantity} @ {position.averagePrice}
        </Text>
      ))}
    </ScreenPlaceholder>
  );
}
