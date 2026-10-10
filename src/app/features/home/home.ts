import { Component } from '@angular/core';
import { Hero } from './hero/hero';
import { Services } from './services/services';
import { Solutions } from './solutions/solutions';
import { Projects } from './projects/projects';
import { Process } from './process/process';
import { Contact } from './contact/contact';
@Component({
  selector: 'app-home',
  imports: [Hero, Services, Solutions, Projects, Process, Contact],
  template: `<app-hero /><app-services /><app-solutions /><app-projects /><app-process /><app-contact />`,
})
export class Home {}
