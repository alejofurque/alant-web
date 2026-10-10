import { RouterLink } from '@angular/router';
import { Component, ElementRef, inject, signal } from '@angular/core';
import { useMotion } from '../../../core/motion/motion-runtime';
import { Arrow } from '../../../shared/arrow/arrow';
import { MotionToggle } from '../../../shared/motion-toggle/motion-toggle';
import { STORY_STAGES } from './solutions.data';
import { StoryVisual } from './story-visual/story-visual';
import { createStoryMotion } from './solutions.motion';

@Component({
  selector: 'app-solutions',
  imports: [RouterLink, Arrow, MotionToggle, StoryVisual],
  templateUrl: './solutions.html',
  styleUrl: './solutions.css',
})
export class Solutions {
  readonly active = signal<number | null>(null);
  readonly stages = STORY_STAGES;

  constructor() {
    useMotion(inject(ElementRef<HTMLElement>), (engine, root) =>
      createStoryMotion(engine, root, (index) => this.active.set(index)),
    );
  }
}
