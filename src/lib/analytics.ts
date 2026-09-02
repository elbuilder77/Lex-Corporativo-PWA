import { track } from '@vercel/analytics';

export type AnalyticsEvent =
  | 'download_desktop_click'
  | 'copy_hash_click'
  | 'tab_change'
  | 'legal_search_performed'
  | 'tender_search_performed'
  | 'article_copy'
  | 'legal_article_send_to_studio'
  | 'source_link_click'
  | 'station_enter'
  | 'home_return_click';

export type EventProperties = Record<string, string | number | boolean | null | undefined>;

/**
 * Registra un evento personalizado en Vercel Analytics.
 * Funciona de forma segura y silenciosa en entornos de desarrollo y producción.
 */
export function trackEvent(name: AnalyticsEvent, properties?: EventProperties): void {
  try {
    // Sanitizar propiedades nulas o indefinidas
    const sanitizedProps: Record<string, string | number | boolean> = {};
    if (properties) {
      for (const [key, value] of Object.entries(properties)) {
        if (value !== null && value !== undefined) {
          sanitizedProps[key] = value;
        }
      }
    }

    track(name, sanitizedProps);
  } catch {
    // Fail silently in case analytics is blocked by adblockers or offline
  }
}
