import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  children?: ReactNode;
};

/** Stands in for a screen until its real content is built. */
export function ScreenPlaceholder({ title, children }: Props) {
  return (
    <View style={styles.screen}>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, gap: 12, padding: 16 },
  title: { fontSize: 24, fontWeight: '600' },
});
