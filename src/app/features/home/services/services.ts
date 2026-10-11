import { RouterLink } from '@angular/router';
import { Component } from '@angular/core';
import { Arrow } from '../../../shared/arrow/arrow';
import { SolutionPreview } from '../../../shared/solution-preview/solution-preview';
@Component({
  selector: 'app-services',
  imports: [RouterLink, Arrow, SolutionPreview],
  templateUrl: './services.html',
  styleUrl: './services.css',
})
export class Services {}
