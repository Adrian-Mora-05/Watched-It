export const API_URL = __DEV__
  ? process.env.EXPO_PUBLIC_LOCAL_API_URL
  : process.env.EXPO_PUBLIC_PROD_API_URL;