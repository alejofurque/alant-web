import { afterNextRender, Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ContactDeliveryError, ContactGateway } from './contact-gateway';
import { Arrow } from '../../shared/arrow/arrow';

const trimmedLength =
  (min: number, max: number): ValidatorFn =>
  (control) => {
    const size = String(control.value ?? '').trim().length;
    return size < min || size > max ? { length: true } : null;
  };
export const PROJECT_TYPES = [
  { value: 'software', label: $localize`:@@contactForm.software:Software a medida` },
  { value: 'integraciones', label: $localize`:@@contactForm.integration:Integración de sistemas` },
  { value: 'automatizacion', label: $localize`:@@contactForm.automation:IA y automatización` },
  { value: 'por-definir', label: $localize`:@@contactForm.unsure:Todavía no lo tengo definido` },
] as const;
type Field = 'name' | 'email' | 'company' | 'projectType' | 'message' | 'consent';

@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule, Arrow],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.css',
})
export class ContactForm {
  readonly gateway = inject(ContactGateway);
  private readonly root: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  readonly ready = signal(false);
  readonly state = signal<'idle' | 'sending' | 'success' | 'error'>('idle');
  readonly rateLimited = signal(false);
  readonly types = PROJECT_TYPES;
  private startedAt = 0;
  private controller?: AbortController;
  private readonly configController = new AbortController();
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [trimmedLength(2, 100)] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(254)],
    }),
    company: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(160)] }),
    projectType: new FormControl('por-definir', {
      nonNullable: true,
      validators: [
        (control) =>
          PROJECT_TYPES.some((type) => type.value === control.value) ? null : { projectType: true },
      ],
    }),
    message: new FormControl('', { nonNullable: true, validators: [trimmedLength(20, 4000)] }),
    website: new FormControl('', { nonNullable: true }),
    consent: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] }),
  });
  constructor() {
    const type = inject(ActivatedRoute).snapshot.queryParamMap.get('tipo');
    if (PROJECT_TYPES.some((option) => option.value === type))
      this.form.controls.projectType.setValue(type!);
    afterNextRender(() => {
      this.ready.set(true);
      this.startedAt = Date.now();
      void this.gateway.load(this.configController.signal);
    });
    this.destroyRef.onDestroy(() => {
      this.controller?.abort();
      this.configController.abort();
    });
  }
  invalid(field: Field): boolean {
    const control = this.form.controls[field];
    return control.touched && control.invalid;
  }
  async submit(): Promise<void> {
    if (!this.ready() || !this.gateway.available || this.state() === 'sending') return;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      const invalidField = Object.entries(this.form.controls).find(
        ([, control]) => control.invalid,
      )?.[0];
      if (invalidField)
        this.root.nativeElement
          .querySelector<HTMLElement>(`[formControlName="${invalidField}"]`)
          ?.focus();
      return;
    }
    if (this.form.controls.website.value.trim()) {
      this.state.set('error');
      return;
    }
    this.state.set('sending');
    this.rateLimited.set(false);
    this.controller = new AbortController();
    const timeout = setTimeout(() => this.controller?.abort(), 15000);
    const values = this.form.getRawValue();
    try {
      await this.gateway.send(
        {
          ...values,
          name: values.name.trim(),
          email: values.email.trim(),
          company: values.company.trim(),
          message: values.message.trim(),
          startedAt: this.startedAt,
          privacyVersion: this.gateway.privacyVersion,
        },
        this.controller.signal,
      );
      if (this.destroyRef.destroyed) return;
      this.form.reset();
      this.startedAt = Date.now();
      this.state.set('success');
    } catch (error) {
      if (!this.destroyRef.destroyed) {
        this.rateLimited.set(error instanceof ContactDeliveryError && error.rateLimited);
        this.state.set('error');
      }
    } finally {
      clearTimeout(timeout);
    }
  }
}
