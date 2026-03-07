import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.wesummon.app",
  appName: "Summon",
  // webDir is required by Capacitor even in server mode
  webDir: "out",
  server: {
    // Load the live site — deploy to Vercel = instant app update, no resubmission needed
    url: "https://wesummon.com",
    cleartext: false,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    SplashScreen: {
      launchShowDuration: 1800,
      backgroundColor: "#0C0A18",
      showSpinner: false,
      launchAutoHide: true,
    },
    StatusBar: {
      style: "Dark",
      backgroundColor: "#0C0A18",
    },
  },
};

export default config;
