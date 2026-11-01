import { matchPath, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { PropertySummary } from "@/lib/properties";

export const WHATSAPP_NUMBER = "38348282262";
const SITE_ORIGIN = "https://www.realo-realestate.com";

/**
 * Short link for a property, e.g. https://www.realo-realestate.com/share/1387.
 * WhatsApp/Viber show it as a card with the property's photo, title and price, and
 * tapping it opens that exact property page.
 */
export const propertyShareLink = (id: string | number) => `${SITE_ORIGIN}/share/${id}`;

export const whatsappLink = (text?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

/** Message asking about a specific property, with its title, ID and link. */
export const propertyQuestion = (id: string | number, title?: string) =>
  [
    "Përshëndetje Realo, kam një pyetje për këtë pronë:",
    title ? `${title} (ID ${id})` : `ID ${id}`,
    propertyShareLink(id),
  ].join("\n");

/**
 * WhatsApp link for the page the visitor is on: on a property page it already names the
 * property and includes its link, everywhere else it opens a plain chat.
 */
export const useContextWhatsAppLink = () => {
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const match = matchPath("/properties/:title/:id", pathname);
  if (!match?.params.id) return whatsappLink();
  const id = match.params.id;
  // Prefer the real title from the cached list; the URL may carry a shortened one.
  const cached = queryClient
    .getQueryData<PropertySummary[]>(["properties"])
    ?.find((p) => String(p.propertyId) === id)?.title;
  let title = cached ?? match.params.title;
  if (!cached && title) {
    try {
      title = decodeURIComponent(title);
    } catch {
      /* keep the raw title */
    }
  }
  return whatsappLink(propertyQuestion(id, title));
};
