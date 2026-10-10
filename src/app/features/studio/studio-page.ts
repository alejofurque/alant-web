import { Component } from '@angular/core';
import { PageIntro } from '../../shared/page-intro/page-intro';
import { ConsultationCta } from '../../shared/consultation-cta/consultation-cta';
import { Process } from '../home/process/process';
@Component({
  selector: 'app-studio-page',
  imports: [PageIntro, ConsultationCta, Process],
  templateUrl: './studio-page.html',
  styleUrl: './studio-page.css',
})
export class StudioPage {}
