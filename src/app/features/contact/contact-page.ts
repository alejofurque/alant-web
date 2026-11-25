import { Component } from '@angular/core';
import { Arrow } from '../../shared/arrow/arrow';
import { PageIntro } from '../../shared/page-intro/page-intro';
import { ContactForm } from './contact-form';

@Component({
  selector: 'app-contact-page',
  imports: [PageIntro, Arrow, ContactForm],
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.css',
})
export class ContactPage {
  readonly next = [
    {
      title: $localize`:@@contactPage.next1:Leemos tu consulta`,
      text: $localize`:@@contactPage.next1Text:Revisamos el contexto que compartiste y lo que necesitás resolver.`,
    },
    {
      title: $localize`:@@contactPage.next2:Coordinamos una conversación`,
      text: $localize`:@@contactPage.next2Text:Para entender cómo trabaja tu empresa y aclarar dudas.`,
    },
    {
      title: $localize`:@@contactPage.next3:Te enviamos una propuesta`,
      text: $localize`:@@contactPage.next3Text:Con alcance, etapas y prioridades, antes de escribir código.`,
    },
  ];
}
