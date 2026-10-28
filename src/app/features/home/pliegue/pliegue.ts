import { Component, ElementRef, inject } from '@angular/core';
import { useMotion } from '../../../core/motion/motion-runtime';
import { mountSculpture } from './pliegue.motion';

@Component({
  selector: 'app-pliegue',
  templateUrl: './pliegue.html',
  styleUrls: ['./pliegue.css', './pliegue-responsive.css'],
  host: { style: 'display: block; min-width: 0' },
})
export class Pliegue {
  constructor() {
    useMotion(inject(ElementRef<HTMLElement>), mountSculpture);
  }
}
