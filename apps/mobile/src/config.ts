import Constants from 'expo-constants';

const API_PORT = 4000;

/**
 * In development a phone reaches the mock server on the same machine that runs
 * Metro, so we reuse Metro's host. EXPO_PUBLIC_API_URL overrides it for builds.
 */
function apiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  const metroHost = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${metroHost ?? 'localhost'}:${API_PORT}`;
}

export const API_URL = apiUrl();
