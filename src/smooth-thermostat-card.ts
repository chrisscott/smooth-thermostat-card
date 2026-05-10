import { LitElement, html, nothing, PropertyValues, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { fireEvent } from './ha-types';
import type { HassEntity, HomeAssistant, LovelaceCard, LovelaceCardEditor } from './ha-types';
import {
  CARD_NAME,
  CARD_VERSION,
  EDITOR_NAME,
  DEFAULT_DEBOUNCE_MS,
  DEFAULT_STEP,
  HVAC_MODE_ICONS,
} from './const';
import type { SmoothThermostatCardConfig, ClimateAttributes } from './types';
import { cardStyles } from './styles';

console.info(
  `%c SMOOTH-THERMOSTAT-CARD %c v${CARD_VERSION} `,
  'color: white; background: #2b9af9; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;',
  'color: #2b9af9; background: white; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0; border: 1px solid #2b9af9;',
);

interface CustomCardEntry {
  type: string;
  name: string;
  description: string;
  preview?: boolean;
  documentationURL?: string;
}
const w = window as unknown as { customCards?: CustomCardEntry[] };
w.customCards = w.customCards ?? [];
w.customCards.push({
  type: CARD_NAME,
  name: 'Smooth Thermostat Card',
  description: 'Compact, debounced thermostat card with optimistic UI and a full GUI editor.',
  preview: true,
});

@customElement(CARD_NAME)
export class SmoothThermostatCard extends LitElement implements LovelaceCard {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config?: SmoothThermostatCardConfig;
  @state() private _pendingTemp: number | null = null;
  @state() private _pendingHigh: number | null = null;
  @state() private _pendingLow: number | null = null;

  private _debounceTimer?: number;

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import('./editor');
    return document.createElement(EDITOR_NAME) as LovelaceCardEditor;
  }

  public static getStubConfig(hass: HomeAssistant): Partial<SmoothThermostatCardConfig> {
    const climate = Object.keys(hass?.states ?? {}).find((id) => id.startsWith('climate.'));
    return {
      entity: climate ?? '',
      show_current: true,
      show_modes: true,
    };
  }

  public setConfig(config: SmoothThermostatCardConfig): void {
    if (!config?.entity || !config.entity.startsWith('climate.')) {
      throw new Error('You must specify a climate entity');
    }
    this._config = {
      show_current: true,
      show_modes: true,
      show_preset: false,
      show_fan: false,
      step: DEFAULT_STEP,
      debounce_ms: DEFAULT_DEBOUNCE_MS,
      ...config,
    };
  }

  public getCardSize(): number {
    if (!this._config) return 2;
    let size = 2;
    if (this._config.show_modes) size += 1;
    if (this._config.show_preset) size += 1;
    if (this._config.show_fan) size += 1;
    return size;
  }

  public getLayoutOptions() {
    const cfg = this._config;
    const extras = [cfg?.show_modes, cfg?.show_preset, cfg?.show_fan].filter(Boolean).length;
    const targetRows = this._isRange ? 2 : 1;
    if (cfg?.full_width) {
      const bodyRows = Math.max(targetRows, extras || 1);
      return {
        grid_columns: 4,
        grid_rows: 1 + bodyRows,
        grid_min_columns: 2,
        grid_min_rows: 1 + targetRows,
      };
    }
    return {
      grid_columns: 2,
      grid_rows: 1 + targetRows + extras,
      grid_min_columns: 2,
      grid_min_rows: 1 + targetRows,
    };
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = undefined;
    }
  }

  protected updated(changed: PropertyValues): void {
    if (!changed.has('hass') || !this._config) return;
    const stateObj = this._stateObj;
    if (!stateObj) return;
    const attrs = stateObj.attributes as ClimateAttributes;

    if (this._pendingTemp !== null && attrs.temperature === this._pendingTemp) {
      this._pendingTemp = null;
    }
    if (this._pendingHigh !== null && attrs.target_temp_high === this._pendingHigh) {
      this._pendingHigh = null;
    }
    if (this._pendingLow !== null && attrs.target_temp_low === this._pendingLow) {
      this._pendingLow = null;
    }
  }

  private get _stateObj(): HassEntity | undefined {
    if (!this._config || !this.hass) return undefined;
    return this.hass.states[this._config.entity];
  }

  private get _isRange(): boolean {
    const attrs = this._stateObj?.attributes as ClimateAttributes | undefined;
    return (
      typeof attrs?.target_temp_high === 'number' &&
      typeof attrs?.target_temp_low === 'number'
    );
  }

  private _step(): number {
    const attrs = this._stateObj?.attributes as ClimateAttributes | undefined;
    return this._config?.step ?? attrs?.target_temp_step ?? DEFAULT_STEP;
  }

  private _bounds(): { min: number; max: number } {
    const attrs = this._stateObj?.attributes as ClimateAttributes | undefined;
    return {
      min: this._config?.min_temp ?? attrs?.min_temp ?? 7,
      max: this._config?.max_temp ?? attrs?.max_temp ?? 35,
    };
  }

  private _round(v: number, step: number): number {
    const inv = 1 / step;
    return Math.round(v * inv) / inv;
  }

  private _clamp(v: number): number {
    const { min, max } = this._bounds();
    return Math.min(max, Math.max(min, v));
  }

  private _handleStepTemp(delta: number, which: 'single' | 'high' | 'low'): void {
    const stateObj = this._stateObj;
    if (!stateObj) return;
    const attrs = stateObj.attributes as ClimateAttributes;
    const step = this._step();
    const change = delta * step;

    if (which === 'high') {
      const next = (this._pendingHigh ?? attrs.target_temp_high ?? 0) + change;
      this._pendingHigh = this._clamp(this._round(next, step));
      const currentLow = this._pendingLow ?? attrs.target_temp_low ?? 0;
      if (currentLow > this._pendingHigh) this._pendingLow = this._pendingHigh;
    } else if (which === 'low') {
      const next = (this._pendingLow ?? attrs.target_temp_low ?? 0) + change;
      this._pendingLow = this._clamp(this._round(next, step));
      const currentHigh = this._pendingHigh ?? attrs.target_temp_high ?? 0;
      if (currentHigh < this._pendingLow) this._pendingHigh = this._pendingLow;
    } else {
      const next = (this._pendingTemp ?? attrs.temperature ?? 20) + change;
      this._pendingTemp = this._clamp(this._round(next, step));
    }
    this._scheduleSetTemperature();
  }

  private _scheduleSetTemperature(): void {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    const delay = this._config?.debounce_ms ?? DEFAULT_DEBOUNCE_MS;
    this._debounceTimer = window.setTimeout(() => this._commitTemperature(), delay);
  }

  private _commitTemperature(): void {
    const stateObj = this._stateObj;
    if (!stateObj) return;

    const data: Record<string, unknown> = { entity_id: stateObj.entity_id };
    let hasChange = false;

    if (this._isRange) {
      if (this._pendingHigh !== null) {
        data.target_temp_high = this._pendingHigh;
        hasChange = true;
      }
      if (this._pendingLow !== null) {
        data.target_temp_low = this._pendingLow;
        hasChange = true;
      }
    } else if (this._pendingTemp !== null) {
      data.temperature = this._pendingTemp;
      hasChange = true;
    }

    if (hasChange) {
      this.hass.callService('climate', 'set_temperature', data);
    }
  }

  private _setHvacMode(mode: string): void {
    const stateObj = this._stateObj;
    if (!stateObj) return;
    this.hass.callService('climate', 'set_hvac_mode', {
      entity_id: stateObj.entity_id,
      hvac_mode: mode,
    });
  }

  private _setPresetMode(preset: string): void {
    const stateObj = this._stateObj;
    if (!stateObj) return;
    this.hass.callService('climate', 'set_preset_mode', {
      entity_id: stateObj.entity_id,
      preset_mode: preset,
    });
  }

  private _setFanMode(fan: string): void {
    const stateObj = this._stateObj;
    if (!stateObj) return;
    this.hass.callService('climate', 'set_fan_mode', {
      entity_id: stateObj.entity_id,
      fan_mode: fan,
    });
  }

  private _handleMore(): void {
    if (!this._config) return;
    fireEvent(this, 'hass-more-info', { entityId: this._config.entity });
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this._config || !this.hass) return nothing;
    const stateObj = this._stateObj;
    if (!stateObj) {
      return html`
        <ha-card>
          <div class="warning">Entity not found: ${this._config.entity}</div>
        </ha-card>
      `;
    }

    const attrs = stateObj.attributes as ClimateAttributes;
    const name = this._config.name ?? attrs.friendly_name ?? stateObj.entity_id;
    const isOff = stateObj.state === 'off';
    const isUnavailable = stateObj.state === 'unavailable' || stateObj.state === 'unknown';
    const disabled = isOff || isUnavailable;
    const tempUnit = this.hass.config.unit_system?.temperature ?? '°C';
    const unitChar = tempUnit.replace('°', '');

    const cardClasses: string[] = [];
    if (isOff) cardClasses.push('off');
    if (isUnavailable) cardClasses.push('unavailable');
    if (this._config.full_width) cardClasses.push('full-width');

    const showModes = this._config.show_modes && !!attrs.hvac_modes?.length;
    const showPreset = this._config.show_preset && !!attrs.preset_modes?.length;
    const showFan = this._config.show_fan && !!attrs.fan_modes?.length;
    const hasControls = showModes || showPreset || showFan;

    return html`
      <ha-card class=${cardClasses.join(' ')}>
        <div class="header" @click=${this._handleMore} role="button" tabindex="0">
          <ha-state-icon
            .hass=${this.hass}
            .stateObj=${stateObj}
            .icon=${this._config.icon ?? HVAC_MODE_ICONS[stateObj.state]}
          ></ha-state-icon>
          <div class="name" title=${name}>${name}</div>
          ${this._config.show_current && attrs.current_temperature != null
            ? html`<div class="current">
                ${this._formatTemp(attrs.current_temperature)}°${unitChar}
              </div>`
            : nothing}
        </div>

        <div class="body">
          <div class="targets">
            ${this._isRange
              ? this._renderRangeRows(attrs, disabled, unitChar)
              : this._renderSingleRow(attrs, disabled, unitChar)}
          </div>
          ${hasControls
            ? html`
                <div class="controls">
                  ${showModes ? this._renderModes(attrs, stateObj) : nothing}
                  ${showPreset ? this._renderPresets(attrs) : nothing}
                  ${showFan ? this._renderFans(attrs) : nothing}
                </div>
              `
            : nothing}
        </div>
      </ha-card>
    `;
  }

  private _formatTemp(t: number | null | undefined): string {
    if (t === null || t === undefined || Number.isNaN(t)) return '—';
    return Number.isInteger(t) ? String(t) : t.toFixed(1);
  }

  private _renderSingleRow(
    attrs: ClimateAttributes,
    disabled: boolean,
    unitChar: string,
  ): TemplateResult {
    const target = this._pendingTemp ?? attrs.temperature;
    const pending = this._pendingTemp !== null;
    return html`
      <div class="target ${pending ? 'pending' : ''}">
        <button
          class="step"
          @click=${() => this._handleStepTemp(-1, 'single')}
          ?disabled=${disabled}
          aria-label="Decrease temperature"
        >
          <ha-icon icon="mdi:minus"></ha-icon>
        </button>
        <div class="temp">
          <span>${this._formatTemp(target)}<span class="unit">°${unitChar}</span></span>
        </div>
        <button
          class="step"
          @click=${() => this._handleStepTemp(1, 'single')}
          ?disabled=${disabled}
          aria-label="Increase temperature"
        >
          <ha-icon icon="mdi:plus"></ha-icon>
        </button>
      </div>
    `;
  }

  private _renderRangeRows(
    attrs: ClimateAttributes,
    disabled: boolean,
    unitChar: string,
  ): TemplateResult {
    const high = this._pendingHigh ?? attrs.target_temp_high;
    const low = this._pendingLow ?? attrs.target_temp_low;
    return html`
      <div class="target range ${this._pendingHigh !== null ? 'pending' : ''}">
        <span class="bound-label cool">Cool</span>
        <button
          class="step"
          @click=${() => this._handleStepTemp(-1, 'high')}
          ?disabled=${disabled}
          aria-label="Decrease cool setpoint"
        >
          <ha-icon icon="mdi:minus"></ha-icon>
        </button>
        <div class="temp range">
          <span>${this._formatTemp(high)}<span class="unit">°${unitChar}</span></span>
        </div>
        <button
          class="step"
          @click=${() => this._handleStepTemp(1, 'high')}
          ?disabled=${disabled}
          aria-label="Increase cool setpoint"
        >
          <ha-icon icon="mdi:plus"></ha-icon>
        </button>
      </div>
      <div class="target range ${this._pendingLow !== null ? 'pending' : ''}">
        <span class="bound-label heat">Heat</span>
        <button
          class="step"
          @click=${() => this._handleStepTemp(-1, 'low')}
          ?disabled=${disabled}
          aria-label="Decrease heat setpoint"
        >
          <ha-icon icon="mdi:minus"></ha-icon>
        </button>
        <div class="temp range">
          <span>${this._formatTemp(low)}<span class="unit">°${unitChar}</span></span>
        </div>
        <button
          class="step"
          @click=${() => this._handleStepTemp(1, 'low')}
          ?disabled=${disabled}
          aria-label="Increase heat setpoint"
        >
          <ha-icon icon="mdi:plus"></ha-icon>
        </button>
      </div>
    `;
  }

  private _renderModes(attrs: ClimateAttributes, stateObj: HassEntity): TemplateResult {
    return html`
      <div class="row modes">
        ${attrs.hvac_modes!.map(
          (m) => html`
            <button
              class="chip ${stateObj.state === m ? 'active' : ''}"
              @click=${() => this._setHvacMode(m)}
              title=${m}
              aria-label=${m}
            >
              <ha-icon icon=${HVAC_MODE_ICONS[m] ?? 'mdi:thermometer'}></ha-icon>
            </button>
          `,
        )}
      </div>
    `;
  }

  private _renderPresets(attrs: ClimateAttributes): TemplateResult {
    return html`
      <div class="row presets">
        ${attrs.preset_modes!.map(
          (p) => html`
            <button
              class="chip text ${attrs.preset_mode === p ? 'active' : ''}"
              @click=${() => this._setPresetMode(p)}
            >
              ${p.replace(/_/g, ' ')}
            </button>
          `,
        )}
      </div>
    `;
  }

  private _renderFans(attrs: ClimateAttributes): TemplateResult {
    return html`
      <div class="row fans">
        ${attrs.fan_modes!.map(
          (f) => html`
            <button
              class="chip text ${attrs.fan_mode === f ? 'active' : ''}"
              @click=${() => this._setFanMode(f)}
            >
              ${f.replace(/_/g, ' ')}
            </button>
          `,
        )}
      </div>
    `;
  }

  static styles = cardStyles;
}

declare global {
  interface HTMLElementTagNameMap {
    'smooth-thermostat-card': SmoothThermostatCard;
  }
}
