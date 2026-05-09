import type { LovelaceCardConfig } from './ha-types';

export interface SmoothThermostatCardConfig extends LovelaceCardConfig {
  entity: string;
  name?: string;
  icon?: string;
  show_current?: boolean;
  show_modes?: boolean;
  show_preset?: boolean;
  show_fan?: boolean;
  full_width?: boolean;
  step?: number;
  debounce_ms?: number;
  min_temp?: number;
  max_temp?: number;
}

export interface ClimateAttributes {
  hvac_modes?: string[];
  current_temperature?: number | null;
  temperature?: number | null;
  target_temp_high?: number | null;
  target_temp_low?: number | null;
  min_temp?: number;
  max_temp?: number;
  target_temp_step?: number;
  preset_mode?: string;
  preset_modes?: string[];
  fan_mode?: string;
  fan_modes?: string[];
  friendly_name?: string;
}
