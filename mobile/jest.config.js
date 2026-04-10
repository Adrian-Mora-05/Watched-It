module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^react-native-worklets$': '<rootDir>/__mocks__/react-native-worklets.js',
    '^react-native-worklets/(.*)$': '<rootDir>/__mocks__/react-native-worklets.js',
    '^react-native-reanimated$': '<rootDir>/__mocks__/react-native-reanimated.js',
    '^@react-native-ama/react-native$': '<rootDir>/__mocks__/@react-native-ama/react-native.js',
    '^@react-native-ama/forms$': '<rootDir>/__mocks__/@react-native-ama/forms.js',
    '^@react-native-ama/core$': '<rootDir>/__mocks__/@react-native-ama/core.js',
  },
};