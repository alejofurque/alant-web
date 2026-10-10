import { Component } from '@angular/core';
import { PageIntro } from '../../shared/page-intro/page-intro';
import { Arrow } from '../../shared/arrow/arrow';
import { RouterLink } from '@angular/router';
import { ContactForm } from './contact-form';
@Component({
  selector: 'app-contact-page',
  imports: [PageIntro, Arrow, ContactForm, RouterLink],
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.css',
})
export class ContactPage {}
