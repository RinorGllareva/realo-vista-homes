import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isBot(ua: string) {
  return /facebookexternalhit|Facebot|Twitterbot|Slackbot|WhatsApp|TelegramBot|Discordbot|LinkedInBot/i.test(
    ua,
  );
}

export function middleware(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";
  const url = req.nextUrl;

  const match = url.pathname.match(/^\/properties\/.+\/(\d+)$/);
  if (match && isBot(ua)) {
    const id = match[1];
    return NextResponse.redirect(new URL(`/share/${id}`, url.origin), 302);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/properties/:path*"],
};
