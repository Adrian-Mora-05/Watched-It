import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useLayout() {
  const { width, height } = useWindowDimensions();
  const movieCardWidth = (width * 0.9) / 3; //3 is the number of cards per row
  const movieCardHeight = movieCardWidth * 1.5;
  const insets = useSafeAreaInsets();
  
  return {
    headerHeight: height * 0.1 + insets.top,
    headerPaddingBottom: height * 0.03,
    screenWidth: width,
    screenHeight: height,
    movieCardWidth: movieCardWidth,
    movieCardHeight: movieCardHeight,
    paddingHorizontal: width * 0.05, //padding that separates the content from the edges of the screen
    paddingVertical: height * 0.02, //padding that separates the content from the edges of the headers/footers
  };
}