import { Component, computed, input } from '@angular/core';
import { Arrow } from '../arrow/arrow';
import { ProjectCardData } from './project-card.model';

@Component({
  selector: 'app-project-card',
  imports: [Arrow],
  templateUrl: './project-card.html',
  styleUrl: './project-card.css',
})
export class ProjectCard {
  readonly project = input.required<ProjectCardData>();
  readonly statusLabel = computed(() => {
    switch (this.project().status) {
      case 'placeholder':
        return $localize`:@@projects.reserved:Espacio reservado`;
      case 'demo':
        return $localize`:@@projects.demoStatus:Demostración técnica`;
      case 'case':
        return $localize`:@@projects.caseStatus:Proyecto documentado`;
    }
  });
}
