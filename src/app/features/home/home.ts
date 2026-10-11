import { Component } from '@angular/core';
import { Hero } from './hero/hero';
import { Services } from './services/services';
import { Solutions } from './solutions/solutions';
import { Process } from './process/process';
import { Contact } from './contact/contact';
@Component({
  selector: 'app-home',
  imports: [Hero, Services, Solutions, Process, Contact],
  // Projects and ProjectCard remain available for real, authorized portfolio material.
  template: `<app-hero /><app-services /><app-solutions /><app-process /><app-contact />`,
})
export class Home {}
