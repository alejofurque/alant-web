import { RouterLink } from '@angular/router';
import { Component } from '@angular/core';
import { ProjectCard } from '../../../shared/project-card/project-card';
import { ProjectCardData } from '../../../shared/project-card/project-card.model';
import { Arrow } from '../../../shared/arrow/arrow';

@Component({
  selector: 'app-projects',
  imports: [RouterLink, ProjectCard, Arrow],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects {
  readonly projects: readonly ProjectCardData[] = [
    {
      id: 'reserved-project',
      category: $localize`:@@projects.softwareCategory:Software a medida`,
      title: $localize`:@@projects.projectPendingTitle:Proyecto por documentar`,
      status: 'placeholder',
      media: { kind: 'placeholder' },
      problem: null,
      solution: null,
      technologies: [],
    },
    {
      id: 'reserved-demo',
      category: $localize`:@@projects.demoCategory:Demostraciones técnicas`,
      title: $localize`:@@projects.demoPendingTitle:Demostración por incorporar`,
      status: 'placeholder',
      media: { kind: 'placeholder' },
      problem: null,
      solution: null,
      technologies: [],
    },
  ];
}
