/**
 * Minimal Home Assistant types and helpers.
 *
 * We don't depend on `custom-card-helpers` (unmaintained, drags in vulnerable
 * transitives) or `home-assistant-js-websocket` (only needed for types).
 * Just declare the surface we actually touch.
 */

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
  context: { id: string; user_id: string | null; parent_id?: string | null };
}

export interface HassUnitSystem {
  length: string;
  mass: string;
  temperature: string;
  volume: string;
}

export interface HassConfig {
  unit_system: HassUnitSystem;
  [key: string]: unknown;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  config: HassConfig;
  themes?: Record<string, unknown>;
  language?: string;
  callService(
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>,
    target?: { entity_id?: string | string[] },
  ): Promise<void>;
}

export interface LovelaceCardConfig {
  type: string;
  [key: string]: unknown;
}

export interface LovelaceCard extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: LovelaceCardConfig): void;
  getCardSize(): number | Promise<number>;
}

export interface LovelaceCardEditor extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: LovelaceCardConfig): void;
}

interface FireEventOptions {
  bubbles?: boolean;
  cancelable?: boolean;
  composed?: boolean;
}

export const fireEvent = <T = unknown>(
  node: HTMLElement | Window,
  type: string,
  detail?: T,
  options: FireEventOptions = {},
): Event => {
  const event = new CustomEvent<T>(type, {
    bubbles: options.bubbles ?? true,
    cancelable: !!options.cancelable,
    composed: options.composed ?? true,
    detail: detail ?? ({} as T),
  });
  node.dispatchEvent(event);
  return event;
};
