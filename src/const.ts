export const CARD_VERSION = '0.1.0';
export const CARD_NAME = 'smooth-thermostat-card';
export const EDITOR_NAME = 'smooth-thermostat-card-editor';

export const DEFAULT_DEBOUNCE_MS = 750;
export const DEFAULT_STEP = 0.5;

export const HVAC_MODE_ICONS: Record<string, string> = {
  auto: 'mdi:thermostat-auto',
  heat_cool: 'mdi:autorenew',
  heat: 'mdi:fire',
  cool: 'mdi:snowflake',
  dry: 'mdi:water-percent',
  fan_only: 'mdi:fan',
  off: 'mdi:power',
};

export const HVAC_MODE_COLORS: Record<string, string> = {
  auto: 'var(--state-climate-auto-color, #44739e)',
  heat_cool: 'var(--state-climate-auto-color, #44739e)',
  heat: 'var(--state-climate-heat-color, #ff8100)',
  cool: 'var(--state-climate-cool-color, #2b9af9)',
  dry: 'var(--state-climate-dry-color, #efbd07)',
  fan_only: 'var(--state-climate-fan_only-color, #8a8a8a)',
  off: 'var(--disabled-text-color, #6b6b6b)',
};
