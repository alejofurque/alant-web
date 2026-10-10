import { Component } from '@angular/core';
import { Arrow } from '../../../shared/arrow/arrow';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-contact',
  imports: [Arrow, RouterLink],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {}
