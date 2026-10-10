import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { Arrow } from '../arrow/arrow';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-header',
  imports: [Arrow, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
  host: { '(document:keydown.escape)': 'closeMenu(true)' },
})
export class Header {
  readonly menuOpen = signal(false);
  readonly menuLabel = () =>
    this.menuOpen()
      ? $localize`:@@nav.closeMenu:Cerrar menú`
      : $localize`:@@nav.openMenu:Abrir menú`;
  private readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');
  constructor() {
    inject(Router)
      .events.pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (event instanceof NavigationEnd) this.closeMenu();
      });
  }
  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }
  closeMenu(restoreFocus = false): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    if (restoreFocus) this.menuButton()?.nativeElement.focus();
  }
}
