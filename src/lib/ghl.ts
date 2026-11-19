/**
 * GoHighLevel form embeds (Lean CRM is GoHighLevel). The host and the form
 * ids live in src/data/site.ts (FORMS).
 *
 * Two rules, both learned the hard way:
 * - Never loading="lazy". form_embed.js registers the iframes on a page in one
 *   pass; a frame that hasn't loaded by then is never sized.
 * - Each iframe id on a page must be unique, so the caller passes a suffix.
 *
 * If a form shows a blank box, check FORMS.host first: a wrong host is a 404
 * inside an iframe, which no build or test can see.
 */
import { FORMS } from '../data/site';

export const FORM_EMBED_SCRIPT = `${FORMS.host}/js/form_embed.js`;

/** The iframe as an HTML string, so markdown and Astro pages could share one copy. */
export function formIframe(formId: string, formName: string, suffix: string, height = 400): string {
  const id = `inline-${formId}-${suffix}`;
  const attrs: Record<string, string> = {
    src: `${FORMS.host}/widget/form/${formId}`,
    id,
    'data-layout-iframe-id': id,
    'data-form-id': formId,
    'data-layout': "{'id':'INLINE'}",
    'data-trigger-type': 'alwaysShow',
    'data-trigger-value': '',
    'data-activation-type': 'alwaysActivated',
    'data-activation-value': '',
    'data-deactivation-type': 'neverDeactivate',
    'data-deactivation-value': '',
    'data-form-name': formName,
    'data-height': String(height),
    'data-cookie-consent': 'true',
    'data-cookie-consent-provider': 'auto',
    title: `${formName} form`,
    class: 'ghl-frame',
    style: `width:100%;height:${height}px;border:none`,
  };
  const html = Object.entries(attrs)
    .map(([k, v]) => `${k}="${v.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`)
    .join(' ');
  return `<iframe ${html}></iframe>`;
}
