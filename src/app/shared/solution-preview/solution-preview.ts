import { Component, input } from '@angular/core';

/** Conceptual interfaces, never customer screenshots or interactive product demos. */
@Component({
  selector: 'app-solution-preview',
  templateUrl: './solution-preview.html',
  styleUrl: './solution-preview.css',
})
export class SolutionPreview {
  readonly kind = input.required<'software' | 'integraciones' | 'automatizacion'>();
}
