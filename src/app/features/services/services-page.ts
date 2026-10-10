import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Arrow } from '../../shared/arrow/arrow';
import { PageIntro } from '../../shared/page-intro/page-intro';
import { ConsultationCta } from '../../shared/consultation-cta/consultation-cta';
import { SERVICE_DETAILS } from './services.data';
@Component({
  selector: 'app-services-page',
  imports: [RouterLink, Arrow, PageIntro, ConsultationCta],
  templateUrl: './services-page.html',
  styleUrl: './services-page.css',
})
export class ServicesPage {
  readonly services = SERVICE_DETAILS;
}
