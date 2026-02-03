import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/src/constants/colors';

/**
 * Soft coral gradient background used across all main screens.
 * Positioned absolutely, covering the top 45% of the screen.
 */
export function GradientBackground(): React.ReactElement {
  return (
    <LinearGradient
      colors={[colors.primaryGradientStart, colors.surfaceLight]}
      style={styles.gradient}
      locations={[0, 0.85]}
    />
  );
}

const styles = StyleSheet.create({
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
  },
});
