import { RouterLink } from '@angular/router';
import { Component, ElementRef, inject } from '@angular/core';
import { onceInView, useMotion } from '../../../core/motion/motion-runtime';
import { Arrow } from '../../../shared/arrow/arrow';
import { SystemDiagram } from '../system-diagram/system-diagram';
@Component({
  selector: 'app-hero',
  imports: [RouterLink, Arrow, SystemDiagram],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  constructor() {
    useMotion(inject(ElementRef<HTMLElement>), ({ gsap }, root, context) =>
      onceInView(root.querySelector('.hero-copy')!, context, () => {
        gsap.fromTo(
          root.querySelectorAll('.hero-line'),
          { y: 14, opacity: 0.68 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.085,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
          },
        );
      }),
    );
  }
}
