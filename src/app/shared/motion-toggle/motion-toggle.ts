import { Component, inject } from '@angular/core';
import { MotionPreferences } from '../../core/motion/motion-preferences';

@Component({
  selector: 'app-motion-toggle',
  template: `<button
    type="button"
    role="switch"
    aria-label="Animaciones"
    i18n-aria-label="@@motion.toggle"
    [attr.aria-checked]="!motion.reduced()"
    [style.visibility]="motion.ready() ? 'visible' : 'hidden'"
    [disabled]="motion.systemReduced() || motion.unavailable()"
    (click)="motion.toggle()"
  >
    <span class="switch-track" aria-hidden="true"><span></span></span>
    @if (motion.reduced()) {
      <span i18n="@@motion.reduced">Movimiento reducido</span>
    } @else {
      <span i18n="@@motion.active">Movimiento activo</span>
    }
  </button>`,
  styles: `
    :host {
      display: block;
    }
    button {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      min-height: 44px;
      font-size: 11px;
      color: #bbc9c8;
    }
    .switch-track {
      width: 28px;
      height: 16px;
      padding: 3px;
      border: 1px solid #829b91;
      border-radius: 9px;
    }
    .switch-track > span {
      display: block;
      width: 8px;
      height: 8px;
      background: #bbc9c8;
      border-radius: 50%;
    }
    [aria-checked='true'] .switch-track {
      border-color: #97e5b3;
    }
    [aria-checked='true'] .switch-track > span {
      transform: translateX(12px);
      background: #97e5b3;
    }
    button:disabled {
      cursor: default;
    }
  `,
})
export class MotionToggle {
  readonly motion = inject(MotionPreferences);
}
