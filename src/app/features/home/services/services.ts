import { RouterLink } from '@angular/router';
import { Component } from '@angular/core';
import { Arrow } from '../../../shared/arrow/arrow';
@Component({
  selector: 'app-services',
  imports: [RouterLink, Arrow],
  templateUrl: './services.html',
  styleUrl: './services.css',
})
export class Services {}
