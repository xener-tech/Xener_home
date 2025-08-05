import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.xener.home',
  appName: 'Xener Home',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false,
      androidSpinnerStyle: "large",
      spinnerColor: "#3B82F6"
    },
    StatusBar: {
      style: "light",
      backgroundColor: "#3B82F6"
    }
  }
};

export default config;
