"use client";

import { useEffect } from "react";

/**
 * Initialises Capacitor native features when running inside the iOS app.
 * Completely inert in a normal browser — all imports are guarded by
 * Capacitor.isNativePlatform(), so they never run on wesummon.com in Safari.
 */
export default function CapacitorProvider() {
  useEffect(() => {
    initCapacitor();
  }, []);

  return null;
}

async function initCapacitor() {
  // Guard: only run inside the Capacitor native app
  const { Capacitor } = await import("@capacitor/core");
  if (!Capacitor.isNativePlatform()) return;

  await Promise.all([initStatusBar(), initSplashScreen(), initPushNotifications()]);
  initExternalLinks();
}

/**
 * In WKWebView, target="_blank" links open inside the app webview.
 * Intercept external link clicks and open them in the iOS system browser,
 * which also triggers "Open in App" prompts for Spotify, Apple Music, etc.
 */
function initExternalLinks() {
  document.addEventListener("click", (e) => {
    const a = (e.target as Element).closest("a[href]") as HTMLAnchorElement | null;
    if (!a) return;
    const href = a.href;
    if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    if ((href.startsWith("https://") || href.startsWith("http://")) && !href.includes("wesummon.com")) {
      e.preventDefault();
      window.open(href, "_system");
    }
  }, true); // capture phase — fires before any component onClick
}

async function initStatusBar() {
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#0C0A18" });
  } catch { /* not available on this platform */ }
}

async function initSplashScreen() {
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide({ fadeOutDuration: 300 });
  } catch { /* not available */ }
}

async function initPushNotifications() {
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");

    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== "granted") return;

    await PushNotifications.register();

    // Receive the APNs token and send it to our server
    await PushNotifications.addListener("registration", async ({ value: token }) => {
      try {
        await fetch("/api/push/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, platform: "ios" }),
        });
      } catch { /* fire-and-forget */ }
    });

    // Handle notification tapped while app is open
    // Extract path from full URL so Next.js router handles the navigation
    await PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
      const url = action.notification.data?.url as string | undefined;
      if (!url) return;
      try {
        const parsed = new URL(url);
        window.location.href = parsed.pathname + parsed.search;
      } catch {
        window.location.href = url;
      }
    });
  } catch { /* not available */ }
}
