/**
 * Apple Push Notification service (APNs) — JWT-based HTTP/2 sender.
 * No external dependencies — uses Node's built-in http2 + crypto.
 *
 * Required env vars (add to Vercel):
 *   APNS_KEY_ID      — 10-char key ID from Apple Developer → Certificates → Keys
 *   APNS_TEAM_ID     — 10-char Team ID from Apple Developer → Membership
 *   APNS_PRIVATE_KEY — contents of the .p8 file (with \n escaped as \\n in Vercel)
 *   APNS_BUNDLE_ID   — com.wesummon.summon
 */

import http2 from "node:http2";
import crypto from "node:crypto";

const APNS_HOST = "api.push.apple.com";

// Cache JWT for 55 min (APNs tokens expire after 60)
let cachedToken: { value: string; expiresAt: number } | null = null;

function getJwt(): string | null {
  const keyId = process.env.APNS_KEY_ID;
  const teamId = process.env.APNS_TEAM_ID;
  const privateKey = process.env.APNS_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!keyId || !teamId || !privateKey) return null;

  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt > now) return cachedToken.value;

  const header = Buffer.from(JSON.stringify({ alg: "ES256", kid: keyId })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ iss: teamId, iat: now })).toString("base64url");
  const toSign = `${header}.${payload}`;

  const sign = crypto.createSign("SHA256");
  sign.update(toSign);
  // ieee-p1363 = raw r||s format required for JWT ES256
  const sig = sign.sign({ key: privateKey, dsaEncoding: "ieee-p1363" }, "base64url");

  const token = `${toSign}.${sig}`;
  cachedToken = { value: token, expiresAt: now + 3300 };
  return token;
}

export type PushPayload = {
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

/**
 * Send a push notification to a single APNs device token.
 * Returns true on 200, false on any error.
 */
export function sendPush(deviceToken: string, { title, body, data }: PushPayload): Promise<boolean> {
  const jwt = getJwt();
  const bundleId = process.env.APNS_BUNDLE_ID;
  if (!jwt || !bundleId) return Promise.resolve(false);

  return new Promise((resolve) => {
    const client = http2.connect(`https://${APNS_HOST}`);
    client.on("error", () => resolve(false));

    const apnsPayload = JSON.stringify({
      aps: { alert: { title, body }, sound: "default", badge: 1 },
      ...data,
    });

    const req = client.request({
      ":method": "POST",
      ":path": `/3/device/${deviceToken}`,
      authorization: `bearer ${jwt}`,
      "apns-topic": bundleId,
      "apns-push-type": "alert",
      "apns-expiration": "0",
      "content-type": "application/json",
      "content-length": `${Buffer.byteLength(apnsPayload)}`,
    });

    let status = 0;
    req.on("response", (headers) => { status = Number(headers[":status"]); });
    req.write(apnsPayload);
    req.end();
    req.on("end", () => { client.close(); resolve(status === 200); });
    req.on("error", () => { client.close(); resolve(false); });
  });
}

/**
 * Send a push to multiple tokens over a single reused HTTP/2 connection.
 * Returns the number of successful sends.
 */
export function sendPushToTokens(tokens: string[], push: PushPayload): Promise<number> {
  const jwt = getJwt();
  const bundleId = process.env.APNS_BUNDLE_ID;
  if (!jwt || !bundleId || tokens.length === 0) return Promise.resolve(0);

  return new Promise((resolve) => {
    const client = http2.connect(`https://${APNS_HOST}`);
    client.on("error", () => resolve(0));

    const apnsPayload = JSON.stringify({
      aps: { alert: { title: push.title, body: push.body }, sound: "default", badge: 1 },
      ...push.data,
    });
    const payloadBytes = Buffer.byteLength(apnsPayload);

    let sent = 0;
    let pending = tokens.length;

    const done = () => { client.close(); resolve(sent); };

    for (const token of tokens) {
      const req = client.request({
        ":method": "POST",
        ":path": `/3/device/${token}`,
        authorization: `bearer ${jwt}`,
        "apns-topic": bundleId,
        "apns-push-type": "alert",
        "apns-expiration": "0",
        "content-type": "application/json",
        "content-length": `${payloadBytes}`,
      });

      let status = 0;
      req.on("response", (headers) => { status = Number(headers[":status"]); });
      req.write(apnsPayload);
      req.end();
      req.on("end", () => { if (status === 200) sent++; if (--pending === 0) done(); });
      req.on("error", () => { if (--pending === 0) done(); });
    }
  });
}
