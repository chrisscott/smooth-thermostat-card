import { css } from 'lit';

export const cardStyles = css`
  :host {
    display: block;
    container-type: inline-size;
    --sth-radius: 14px;
    --sth-chip-size: 30px;
  }

  ha-card {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    min-height: 28px;
    user-select: none;
  }

  .icon-badge {
    --badge-color: var(--state-icon-color, var(--primary-text-color));
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: rgba(127, 127, 127, 0.18);
    color: var(--badge-color);
    --mdc-icon-size: 20px;
    transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
  }
  .icon-badge.mode-heat,
  .icon-badge.mode-heat_cool { --badge-color: var(--state-climate-heat-color, #ff8100); }
  .icon-badge.mode-cool { --badge-color: var(--state-climate-cool-color, #2b9af9); }
  .icon-badge.mode-dry { --badge-color: var(--state-climate-dry-color, #efbd07); }
  .icon-badge.mode-fan_only { --badge-color: var(--state-climate-fan_only-color, #8a8a8a); }
  .icon-badge.mode-auto { --badge-color: var(--state-climate-auto-color, #44739e); }
  .icon-badge.mode-off { --badge-color: var(--secondary-text-color); }
  .icon-badge.mode-unavailable { --badge-color: var(--disabled-text-color, #6b6b6b); }

  /* Idle: tinted background, mode-colored icon */
  .icon-badge.idle {
    background: color-mix(in srgb, var(--badge-color) 18%, transparent);
  }

  /* Active: solid colored badge with contrasting icon + soft pulse */
  .icon-badge.active {
    background: var(--badge-color);
    color: var(--text-primary-color, #fff);
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--badge-color) 55%, transparent);
    animation: sth-badge-pulse 2.4s ease-in-out infinite;
  }
  @keyframes sth-badge-pulse {
    0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--badge-color) 55%, transparent); }
    50% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--badge-color) 0%, transparent); }
  }

  .icon-badge ha-state-icon {
    display: inline-flex;
  }

  .name {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    color: var(--primary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }

  .current {
    font-size: 12px;
    color: var(--secondary-text-color);
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }

  .targets {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .target {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    flex: 1;
    min-height: 52px;
  }

  .target.range {
    min-height: 38px;
    flex: none;
    gap: 6px;
  }
  .target.range + .target.range {
    margin-top: -2px;
  }

  .bound-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    flex-shrink: 0;
    min-width: 32px;
    text-align: left;
  }
  .bound-label.cool {
    color: var(--state-climate-cool-color, #2b9af9);
  }
  .bound-label.heat {
    color: var(--state-climate-heat-color, #ff8100);
  }

  .step {
    background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
    color: var(--primary-text-color);
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.15s ease, transform 0.08s ease, color 0.15s ease;
    --mdc-icon-size: 20px;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
  }
  .step:hover:not([disabled]) {
    background: var(--primary-color);
    color: var(--text-primary-color, white);
  }
  .step:active:not([disabled]) {
    transform: scale(0.9);
  }
  .step[disabled] {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .temp {
    flex: 1;
    text-align: center;
    font-size: 30px;
    font-weight: 300;
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
    line-height: 1;
    letter-spacing: -0.02em;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .temp.range {
    font-size: 22px;
  }
  .temp .unit {
    font-size: 16px;
    color: var(--secondary-text-color);
    margin-left: 1px;
  }
  .temp.range .unit {
    font-size: 12px;
  }
  .temp .sep {
    margin: 0 6px;
    color: var(--secondary-text-color);
    font-weight: 200;
  }

  .target.pending .temp {
    color: var(--primary-color);
    animation: sth-pulse 1.2s ease-in-out infinite;
  }
  @keyframes sth-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }

  .row {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    justify-content: space-around;
    align-items: center;
  }

  .chip {
    background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
    color: var(--secondary-text-color);
    border: none;
    border-radius: 16px;
    padding: 4px 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 11px;
    font-weight: 500;
    text-transform: capitalize;
    --mdc-icon-size: 16px;
    min-height: var(--sth-chip-size);
    min-width: var(--sth-chip-size);
    transition: background 0.15s ease, color 0.15s ease;
    -webkit-tap-highlight-color: transparent;
    white-space: nowrap;
  }
  .chip:hover {
    background: var(--divider-color);
  }
  .chip.active {
    background: var(--chip-active-color, var(--primary-color));
    color: var(--text-primary-color, white);
  }
  .chip.text {
    padding: 4px 10px;
  }

  ha-card.off .temp,
  ha-card.unavailable .temp {
    color: var(--secondary-text-color);
    opacity: 0.55;
  }
  ha-card.unavailable {
    opacity: 0.7;
  }

  .warning {
    padding: 12px;
    color: var(--error-color, #db4437);
    font-size: 13px;
  }

  /* Full-width: side-by-side targets and controls when there's room */
  @container (min-width: 380px) {
    ha-card.full-width .body {
      flex-direction: row;
      align-items: center;
      gap: 16px;
    }
    ha-card.full-width .targets {
      flex: 1 1 50%;
    }
    ha-card.full-width .controls {
      flex: 1 1 50%;
      align-self: stretch;
      justify-content: center;
    }
    ha-card.full-width .targets:only-child {
      flex-basis: 100%;
    }
    ha-card.full-width .row {
      justify-content: flex-start;
      gap: 6px;
    }
    ha-card.full-width .temp {
      font-size: 36px;
    }
    ha-card.full-width .temp.range {
      font-size: 26px;
    }
    ha-card.full-width .temp .unit {
      font-size: 18px;
    }
    ha-card.full-width .temp.range .unit {
      font-size: 14px;
    }
  }

  @container (min-width: 560px) {
    ha-card.full-width .temp {
      font-size: 44px;
    }
    ha-card.full-width .temp.range {
      font-size: 32px;
    }
    ha-card.full-width .step {
      width: 40px;
      height: 40px;
      --mdc-icon-size: 22px;
    }
  }

  /* Compact mode for narrow cards (mobile, 2-up) */
  @container (max-width: 240px) {
    ha-card {
      padding: 10px;
      gap: 6px;
    }
    .name { font-size: 13px; }
    .current { font-size: 11px; }
    .temp { font-size: 24px; }
    .temp.range { font-size: 18px; }
    .temp .unit { font-size: 13px; }
    .temp.range .unit { font-size: 10px; }
    .step {
      width: 32px;
      height: 32px;
      --mdc-icon-size: 18px;
    }
    .icon-badge {
      width: 30px;
      height: 30px;
      --mdc-icon-size: 18px;
    }
    .chip {
      font-size: 10px;
      padding: 3px 6px;
      min-height: 26px;
      min-width: 26px;
    }
    .bound-label {
      font-size: 9px;
      min-width: 26px;
    }
  }

  @container (max-width: 180px) {
    .temp { font-size: 20px; }
    .temp.range { font-size: 16px; }
    .step { width: 28px; height: 28px; }
    .bound-label {
      min-width: 0;
      font-size: 0;
    }
    .bound-label::before {
      content: '';
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }
  }
`;
