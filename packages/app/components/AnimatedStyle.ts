import { useTheme } from '@/context/ThemeContext';
import {
  useAnimatedStyle,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';

interface AnimatedStyleParams {
  scrollY: SharedValue<number>;
  index: number;
  height: number;
}

export const useArticleAnimatedStyle = ({
  scrollY,
  index,
  height,
}: AnimatedStyleParams) => {
  const { theme } = useTheme();
  return useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [(index - 1) * height, index * height, (index + 1) * height],
      [0.9, 1, 0.9],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const borderOpacity = interpolate(
      scrollY.value,
      [(index - 1) * height, index * height, (index + 1) * height],
      [0, 1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const padding = interpolate(
      scrollY.value,
      [(index - 1) * height, index * height, (index + 1) * height],
      [20, 0, 20], // Adjusted padding values as per your comment
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const borderRadius = interpolate(
      scrollY.value,
      [(index - 1) * height, index * height, (index + 1) * height],
      [15, 0, 15], // Adjusted border radius values as per your comment
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return {
      transform: [{ scale }],
      borderWidth: 2,
      borderColor: theme.borderColor,
      padding: padding,
      borderRadius: borderRadius,
      opacity: borderOpacity,
    };
  });
};
