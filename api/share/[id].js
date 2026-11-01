const API_BASE = "https://api.realo-realestate.com";
const SITE_ORIGIN = "https://www.realo-realestate.com";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function pickOne(raw) {
  if (Array.isArray(raw)) return raw[0] || null;
  if (raw && typeof raw === "object") {
    if (Array.isArray(raw.$values)) return raw.$values[0] || null;
    if (Array.isArray(raw.data)) return raw.data[0] || null;
    return raw;
  }
  return null;
}

function toArray(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    if (Array.isArray(raw.$values)) return raw.$values;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.items)) return raw.items;
    if (Array.isArray(raw.result)) return raw.result;
  }
  return [];
}

function extractImageUrl(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value.imageUrl || value.ImageUrl || value.url || value.src || "";
  }
  return "";
}

function absoluteUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  return `${SITE_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

function socialImageUrl(url) {
  const absolute = absoluteUrl(url);
  if (!absolute) return "";

  if (absolute.includes("res.cloudinary.com") && absolute.includes("/image/upload/")) {
    return absolute.replace(
      "/image/upload/",
      "/image/upload/f_jpg,q_auto:good,w_1200,h_630,c_fill,g_auto/"
    );
  }

  return absolute;
}

function firstPropertyImage(property) {
  const imageCollections = [
    property?.images,
    property?.Images,
    property?.propertyImages,
    property?.PropertyImages,
  ];

  for (const collection of imageCollections) {
    const images = toArray(collection);
    for (const image of images) {
      const url = socialImageUrl(extractImageUrl(image));
      if (url) return url;
    }
  }

  return socialImageUrl(
    property?.mainImageUrl ||
      property?.MainImageUrl ||
      property?.imageUrl ||
      property?.ImageUrl ||
      ""
  );
}

function propertyUrl(property, id) {
  const title = property?.title || property?.Title || "property";
  return `${SITE_ORIGIN}/properties/${encodeURIComponent(title)}/${id}`;
}

function priceText(value) {
  const price = value === undefined || value === null ? "" : String(value).trim();
  if (!price) return "";
  return price.startsWith("€") ? price : `€${price}`;
}

function isSocialCrawler(req) {
  const ua = String(req.headers["user-agent"] || "").toLowerCase();
  return /bot|crawler|spider|preview|facebookexternalhit|facebot|twitterbot|whatsapp|viber|telegrambot|discordbot|linkedinbot|slackbot|skypeuripreview|applebot|snapchat/.test(ua);
}

export default async function handler(req, res) {
  const id = Number(req.query.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).send("Invalid property id");
  }

  try {
    const response = await fetch(`${API_BASE}/api/Property/GetProperty/${id}`, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return res.status(response.status).send("Property not found");
    }

    const property = pickOne(await response.json());
    if (!property) return res.status(404).send("Property not found");

    const titleRaw = property.title || property.Title || "Realo Real Estate";
    const city = property.city || property.City || "";
    const price = priceText(property.price ?? property.Price);
    const descriptionRaw = [city, price].filter(Boolean).join(" • ") || "Shiko pronën në Realo Real Estate.";
    const redirectUrl = propertyUrl(property, id);
    const version = typeof req.query.v === "string" && req.query.v ? `?v=${encodeURIComponent(req.query.v)}` : "";
    const shareUrl = `${SITE_ORIGIN}/share/${id}${version}`;
    const ogImage = firstPropertyImage(property);

    if (!isSocialCrawler(req)) {
      return res.redirect(302, redirectUrl);
    }

    const title = escapeHtml(titleRaw);
    const description = escapeHtml(descriptionRaw);
    const imageTags = ogImage
      ? `
  <meta property="og:image" content="${escapeHtml(ogImage)}" />
  <meta property="og:image:secure_url" content="${escapeHtml(ogImage)}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:image" content="${escapeHtml(ogImage)}" />`
      : "";

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    // Bots and people share this URL. Never let the edge cache serve this bot page to a
    // person (they must get the redirect above); the script below is a last fallback.
    res.setHeader("Cache-Control", "no-store");
    const target = escapeHtml(redirectUrl);

    return res.status(200).send(`<!doctype html>
<html lang="sq">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Realo Real Estate" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${shareUrl}" />${imageTags}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script>location.replace(${JSON.stringify(redirectUrl).replace(/</g, "\\u003c")});</script>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #06130f; color: #f5f0e8; font-family: system-ui, sans-serif; text-align: center; }
    a { display: inline-block; margin-top: 16px; padding: 12px 22px; border-radius: 999px; background: #c69937; color: #0a4834; font-weight: 700; text-decoration: none; }
  </style>
</head>
<body>
  <main>
    <p>${title}</p>
    <a href="${target}">Hap pronën</a>
  </main>
</body>
</html>`);
  } catch (error) {
    console.error("Share preview error:", error);
    return res.status(500).send("Failed to build share preview");
  }
}
