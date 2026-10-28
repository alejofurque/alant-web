import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MotionPreferences } from '../../core/motion/motion-preferences';
import { Pliegue } from './pliegue/pliegue';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Pliegue],
  templateUrl: './home.html',
  styleUrls: ['./home-base.css', './home-hero.css', './home-services.css', './home-closing.css'],
})
export class Home {
  readonly motion = inject(MotionPreferences);
}
