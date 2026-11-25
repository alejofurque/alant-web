import { Component, input } from '@angular/core';

export type PlaneKind = 'web' | 'system' | 'flow';

/**
 * Decorative, conceptual interface for one service. Sized in `em` so a single
 * font-size on any ancestor scales the whole plane without layout recalculation.
 */
@Component({
  selector: 'app-plane',
  templateUrl: './plane.html',
  styleUrl: './plane.css',
  host: { '[class]': '"plane plane-" + kind()', 'aria-hidden': 'true' },
})
export class Plane {
  readonly kind = input.required<PlaneKind>();
}
