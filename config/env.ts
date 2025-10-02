import Constants from 'expo-constants';

type ExpoExtra = {
  apiUrl?: string;
};

const getExpoExtra = (): ExpoExtra | undefined => {
  const config = Constants.expoConfig ?? (Constants.manifest as any);
  if (config?.extra) {
    return config.extra as ExpoExtra;
  }

  const manifest = (Constants as any).manifest;
  if (manifest?.extra) {
    return manifest.extra as ExpoExtra;
  }

  return undefined;
};

export const getApiBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim();
  }

  const extra = getExpoExtra();
  if (extra?.apiUrl && extra.apiUrl.trim().length > 0) {
    return extra.apiUrl.trim();
  }

  return 'https://opensound.icu';
};
