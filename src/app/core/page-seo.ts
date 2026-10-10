import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import publication from './publication.json';

@Injectable()
export class PageSeo extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    let route = snapshot.root;
    while (route.firstChild) route = route.firstChild;
    const title = this.buildTitle(snapshot) ?? 'ALANT — Software Engineering Studio';
    const description = route.data['description'] as string;
    const missing = route.data['notFound'] === true;
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({
      name: 'robots',
      content: publication.indexable && !missing ? 'index, follow' : 'noindex, nofollow',
    });
    this.document.querySelector('link[rel="canonical"]')?.remove();
    this.meta.removeTag('property="og:url"');
    if (publication.origin && !missing) {
      const path = snapshot.url.split(/[?#]/)[0];
      const url = new URL(path, publication.origin).href;
      const canonical = this.document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = url;
      this.document.head.appendChild(canonical);
      this.meta.updateTag({ property: 'og:url', content: url });
    }
  }
}
