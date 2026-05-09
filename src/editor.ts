import { LitElement, html, css, nothing, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { fireEvent } from './ha-types';
import type { HomeAssistant, LovelaceCardEditor } from './ha-types';
import { EDITOR_NAME, DEFAULT_DEBOUNCE_MS, DEFAULT_STEP } from './const';
import type { SmoothThermostatCardConfig } from './types';

interface HaFormSchemaItem {
  name: string;
  required?: boolean;
  default?: unknown;
  selector?: Record<string, unknown>;
  type?: string;
  schema?: HaFormSchemaItem[];
  title?: string;
  icon?: string;
}

const LABELS: Record<string, string> = {
  entity: 'Entity (required)',
  name: 'Name',
  icon: 'Icon',
  step: 'Temperature step',
  debounce_ms: 'Debounce delay (ms)',
  show_current: 'Show current temperature',
  show_modes: 'Show HVAC mode buttons',
  show_preset: 'Show preset modes',
  show_fan: 'Show fan modes',
  min_temp: 'Min temperature override',
  max_temp: 'Max temperature override',
};

const HELPERS: Record<string, string> = {
  debounce_ms:
    'Wait this long after the last +/- tap before sending to Home Assistant. Higher = fewer service calls during rapid clicking.',
  step: 'Increment per +/- tap (e.g. 0.5 or 1.0).',
  show_current: 'Display the current room temperature in the header.',
  min_temp: 'Leave empty to use the entity defaults.',
  max_temp: 'Leave empty to use the entity defaults.',
};

@customElement(EDITOR_NAME)
export class SmoothThermostatCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config?: SmoothThermostatCardConfig;

  public setConfig(config: SmoothThermostatCardConfig): void {
    this._config = config;
  }

  private _schema(): HaFormSchemaItem[] {
    return [
      {
        name: 'entity',
        required: true,
        selector: { entity: { domain: 'climate' } },
      },
      {
        name: '',
        type: 'grid',
        schema: [
          { name: 'name', selector: { text: {} } },
          { name: 'icon', selector: { icon: {} } },
        ],
      },
      {
        name: '',
        type: 'grid',
        schema: [
          {
            name: 'step',
            default: DEFAULT_STEP,
            selector: { number: { min: 0.1, max: 5, step: 0.1, mode: 'box' } },
          },
          {
            name: 'debounce_ms',
            default: DEFAULT_DEBOUNCE_MS,
            selector: {
              number: { min: 0, max: 3000, step: 50, mode: 'box', unit_of_measurement: 'ms' },
            },
          },
        ],
      },
      {
        name: '',
        type: 'expandable',
        title: 'Display options',
        icon: 'mdi:eye-settings',
        schema: [
          { name: 'show_current', default: true, selector: { boolean: {} } },
          { name: 'show_modes', default: true, selector: { boolean: {} } },
          { name: 'show_preset', default: false, selector: { boolean: {} } },
          { name: 'show_fan', default: false, selector: { boolean: {} } },
        ],
      },
      {
        name: '',
        type: 'expandable',
        title: 'Temperature range',
        icon: 'mdi:thermometer-lines',
        schema: [
          {
            name: '',
            type: 'grid',
            schema: [
              { name: 'min_temp', selector: { number: { mode: 'box', step: 0.5 } } },
              { name: 'max_temp', selector: { number: { mode: 'box', step: 0.5 } } },
            ],
          },
        ],
      },
    ];
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${this._schema()}
        .computeLabel=${this._computeLabel}
        .computeHelper=${this._computeHelper}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _computeLabel = (s: HaFormSchemaItem): string => LABELS[s.name] ?? s.name;
  private _computeHelper = (s: HaFormSchemaItem): string | undefined => HELPERS[s.name];

  private _valueChanged(ev: CustomEvent): void {
    fireEvent(this, 'config-changed', { config: ev.detail.value });
  }

  static styles = css`
    ha-form {
      display: block;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'smooth-thermostat-card-editor': SmoothThermostatCardEditor;
  }
}
