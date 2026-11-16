// Zane's Crystal Service: takes an order from thatzane.de/crystals, checks it, works out the price
// from crystals.json (never trusting the browser's numbers) and posts it to Discord through the
// webhook, pinging Zane. The webhook URL stays here, as the DISCORD_WEBHOOK secret.
import data from "../../crystals/crystals.json";

interface Env {
  /** The Discord webhook URL (GitHub secret CrystalShopWebhook, set as a Worker secret). */
  DISCORD_WEBHOOK: string;
  /** Who gets pinged for a new order: a Discord user ID. */
  PING_USER_ID: string;
  /** Pages allowed to send orders, comma separated. */
  ALLOWED_ORIGINS: string;
  /** The webhook's picture. */
  AVATAR_URL: string;
}

type Crystal = { id: string; name: string; price: number; color: string; unstable?: boolean };
const CRYSTALS = new Map((data.crystals as Crystal[]).map((c) => [c.id, c]));
/** The most one order may total, in Robux. */
const MAX_ORDER = Number((data as { maxOrder?: number }).maxOrder) || 3000;

// a few orders per visitor per 10 minutes; best effort, per Worker instance
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ORDERS = 5;
const recent = new Map<string, number[]>();

const robux = (n: number) => `${n.toLocaleString("en-US")} Robux`;
/** Customer text can't ping anyone or break the message. */
const clean = (s: string) => s.replace(/@/g, "@​").replace(/`/g, "'").trim();

function cors(origin: string | null, env: Env): Record<string, string> {
  const allowed = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
  return origin && allowed.includes(origin)
    ? { "access-control-allow-origin": origin, "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type", vary: "origin" }
    : {};
}

function reply(body: object, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const origin = req.headers.get("origin");
    const headers = cors(origin, env);

    if (req.method === "OPTIONS") return new Response(null, { status: headers["access-control-allow-origin"] ? 204 : 403, headers });
    if (url.pathname === "/" && req.method === "GET") return reply({ ok: true, service: "Zane's Crystal Service" }, 200, headers);
    if (url.pathname !== "/order" || req.method !== "POST") return reply({ ok: false, error: "Not found." }, 404, headers);
    if (!headers["access-control-allow-origin"]) return reply({ ok: false, error: "Orders can only be sent from thatzane.de." }, 403, headers);
    if (!env.DISCORD_WEBHOOK) return reply({ ok: false, error: "The order service isn't set up yet." }, 503, headers);

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return reply({ ok: false, error: "That order couldn't be read." }, 400, headers);
    }

    // bots fill in the hidden "website" field; pretend it worked
    if (String(body.website ?? "").trim()) return reply({ ok: true, id: "ZCS-0000" }, 200, headers);

    const roblox = String(body.roblox ?? "").trim();
    const discord = String(body.discord ?? "").trim();
    const note = String(body.note ?? "").trim().slice(0, 500);
    const ids = Array.isArray(body.items) ? [...new Set(body.items.map(String))] : [];
    const items = ids.map((id) => CRYSTALS.get(id)).filter((c): c is Crystal => !!c);

    if (!/^[A-Za-z0-9_]{3,20}$/.test(roblox)) return reply({ ok: false, error: "Enter your Roblox username (3 to 20 letters, numbers or _)." }, 400, headers);
    if (discord.length < 2 || discord.length > 37) return reply({ ok: false, error: "Enter your Discord username." }, 400, headers);
    if (!items.length || items.length !== ids.length || items.length > CRYSTALS.size) return reply({ ok: false, error: "Pick at least one crystal from the list." }, 400, headers);
    const total = items.reduce((sum, c) => sum + c.price, 0);
    if (total > MAX_ORDER) return reply({ ok: false, error: `An order can be at most ${robux(MAX_ORDER)}. This one is ${robux(total)}.` }, 400, headers);

    const ip = req.headers.get("cf-connecting-ip") ?? "unknown";
    const now = Date.now();
    const times = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
    if (times.length >= MAX_ORDERS) return reply({ ok: false, error: "That's a lot of orders at once. Wait a few minutes, then try again." }, 429, headers);
    recent.set(ip, [...times, now]);

    const id = `ZCS-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const message = {
      username: "Zane's Crystal Service",
      avatar_url: env.AVATAR_URL,
      content: `<@${env.PING_USER_ID}> New crystal order from **${clean(roblox)}**`,
      allowed_mentions: { parse: [], users: [env.PING_USER_ID] },
      embeds: [
        {
          title: `New crystal order · ${id}`,
          color: parseInt(items[0].color.slice(1), 16),
          fields: [
            { name: "Roblox", value: `[${roblox}](https://www.roblox.com/search/users?keyword=${encodeURIComponent(roblox)})`, inline: true },
            { name: "Discord", value: clean(discord), inline: true },
            { name: `Crystals (${items.length})`, value: items.map((c) => `- ${c.name}: ${robux(c.price)}`).join("\n") },
            { name: "Total", value: `**${robux(total)}**`, inline: true },
            ...(note ? [{ name: "Note", value: clean(note) }] : []),
          ],
          footer: { text: "Zane's Crystal Service", icon_url: env.AVATAR_URL },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const sent = await fetch(env.DISCORD_WEBHOOK, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(message) });
    if (!sent.ok) return reply({ ok: false, error: "The order couldn't be delivered. Try again in a minute." }, 502, headers);
    return reply({ ok: true, id, total }, 200, headers);
  },
};
