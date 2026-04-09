jest.mock('@react-native-ama/internal/dist/utils/logger.js', () => {
  return {
    getContrastCheckerMaxDepth: () => 5,
    shouldIgnoreContrastCheckForDisabledElement: () => true,
  };
});