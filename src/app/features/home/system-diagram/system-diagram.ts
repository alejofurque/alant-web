import { Component, ElementRef, inject, signal } from '@angular/core';
import { useMotion } from '../../../core/motion/motion-runtime';
import { createLivingArchitecture } from './system-diagram.motion';

@Component({
  selector: 'app-system-diagram',
  templateUrl: './system-diagram.html',
  styleUrls: ['./system-diagram.css', './system-diagram.motion.css'],
})
export class SystemDiagram {
  readonly canReplay = signal(false);
  private restart: (() => void) | null = null;
  readonly connections = [
    { id: 'crm', path: 'M174 95H195Q212 95 212 112V153Q212 170 228 170' },
    { id: 'erp', path: 'M174 245H195Q212 245 212 228V187Q212 170 228 170' },
    { id: 'output', path: 'M396 170H456' },
  ];

  constructor() {
    useMotion(inject(ElementRef<HTMLElement>), (engine, root, context) =>
      createLivingArchitecture(engine, root, context, (restart) => {
        this.restart = restart;
        this.canReplay.set(!!restart);
      }),
    );
  }

  replay(): void {
    this.restart?.();
  }
}
