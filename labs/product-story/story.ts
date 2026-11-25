import { Component } from '@angular/core';
import { OrderPanel, IntegrationPanel, DocumentPanel, OrderSlip } from './products';

@Component({
  selector: 'story-lab',
  imports: [OrderPanel, IntegrationPanel, DocumentPanel, OrderSlip],
  templateUrl: './story.html',
})
export class StoryLab {
  readonly editorial = new URLSearchParams(window.location.search).get('concepto') === 'b';
}
