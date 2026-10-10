import { Component, computed, input } from '@angular/core';
import { StoryStage } from '../solutions.data';
import { connectionPaths, SYSTEM_LAYOUTS, SYSTEM_MODULES, SystemState } from './system-layout';

@Component({
  selector: 'app-story-visual',
  templateUrl: './story-visual.html',
  styleUrls: ['./story-visual.css', './system-modules.css'],
})
export class StoryVisual {
  readonly stage = input.required<StoryStage>();
  readonly index = input.required<number>();
  readonly modules = SYSTEM_MODULES;
  readonly poses = computed(() => SYSTEM_LAYOUTS[this.index()]);
  readonly paths = computed(() => connectionPaths(this.index() as SystemState));
}
