import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cognicare.ner',
  appName: 'CogniCare NER (SmritiSetu)',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#0B0F17',
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#0B0F17',
  },
};

export default config;
