import { afterNextRender, Component, DestroyRef, ElementRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Arrow } from '../../shared/arrow/arrow';
import { ConsultationCta } from '../../shared/consultation-cta/consultation-cta';
import { PageIntro } from '../../shared/page-intro/page-intro';
import { Plane } from '../../shared/plane/plane';
import { COMPLEMENTARY, SERVICE_DETAILS, SERVICE_FAQ } from './services.data';

@Component({
  selector: 'app-services-page',
  imports: [RouterLink, Arrow, PageIntro, ConsultationCta, Plane],
  templateUrl: './services-page.html',
  styleUrl: './services-page.css',
})
export class ServicesPage {
  readonly services = SERVICE_DETAILS;
  readonly complementary = COMPLEMENTARY;
  readonly faq = SERVICE_FAQ;

  constructor() {
    const host: ElementRef<HTMLElement> = inject(ElementRef);
    const destroyRef = inject(DestroyRef);
    // The automated flow loops only while its plate is on screen.
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries)
          entry.target.classList.toggle('is-paused', !entry.isIntersecting);
      });
      host.nativeElement.querySelectorAll('.plate').forEach((plate) => observer.observe(plate));
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
