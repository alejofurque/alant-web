import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { ContactForm } from './contact-form';
import { ContactDeliveryError, ContactGateway, ContactReceipt } from './contact-gateway';
import { vi } from 'vitest';

const inquiry = {
  name: 'Equipo de prueba',
  email: 'qa@example.test',
  company: '',
  projectType: 'software',
  message: 'Necesitamos integrar los pedidos de nuestro sistema.',
  website: '',
  consent: true,
};
async function setup(available = true, type = '') {
  const gateway = {
    available,
    privacyNotice: 'Aviso de prueba unitaria, sin efecto legal.',
    privacyVersion: 'test-v1',
    load: vi.fn().mockResolvedValue(undefined),
    send: vi.fn<(...args: unknown[]) => Promise<ContactReceipt>>(),
  };
  TestBed.configureTestingModule({
    providers: [
      { provide: ContactGateway, useValue: gateway },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { queryParamMap: convertToParamMap({ tipo: type }) } },
      },
    ],
  });
  const fixture = TestBed.createComponent(ContactForm);
  await fixture.whenStable();
  fixture.componentInstance.ready.set(true);
  await fixture.whenStable();
  return {
    fixture,
    component: fixture.componentInstance,
    page: fixture.nativeElement as HTMLElement,
    gateway,
  };
}
describe('Contact form delivery and accessibility', () => {
  it('keeps the entire form disabled and never sends when unconfigured', async () => {
    const { component, gateway, page } = await setup(false);
    component.form.setValue(inquiry);
    await component.submit();
    expect(gateway.send).not.toHaveBeenCalled();
    expect(page.querySelector('fieldset')?.disabled).toBe(true);
    expect(page.querySelector('button')?.disabled).toBe(true);
    expect(page.textContent).toContain('no envía información');
    expect(component.state()).toBe('idle');
  });
  it('exposes inline validation and focuses the first invalid field without sending', async () => {
    const { component, gateway, fixture, page } = await setup();
    component.form.patchValue({ name: '   ', email: 'incorrecto', message: 'corto' });
    await component.submit();
    await fixture.whenStable();
    expect(gateway.send).not.toHaveBeenCalled();
    const name = page.querySelector('#inquiry-name')!;
    expect(document.activeElement).toBe(name);
    expect(name.getAttribute('aria-invalid')).toBe('true');
    expect(name.getAttribute('aria-describedby')).toBe('name-error');
    expect(page.querySelector('#email-error')).not.toBeNull();
    expect(page.querySelector('#message-error')).not.toBeNull();
  });
  it('accepts only known service types from the URL', async () => {
    const { component } = await setup(true, 'integraciones');
    expect(component.form.controls.projectType.value).toBe('integraciones');
    component.form.controls.projectType.setValue('unsupported');
    expect(component.form.controls.projectType.invalid).toBe(true);
  });
  it('ignores an unknown URL project type', async () => {
    const { component } = await setup(true, '<script>');
    expect(component.form.controls.projectType.value).toBe('por-definir');
  });
  it('waits for receipt, prevents duplicate requests and resets only after acceptance', async () => {
    const { component, gateway, fixture, page } = await setup();
    let complete!: (receipt: ContactReceipt) => void;
    gateway.send.mockImplementation(
      () =>
        new Promise((resolve) => {
          complete = resolve;
        }),
    );
    component.form.setValue(inquiry);
    const pending = component.submit();
    await fixture.whenStable();
    expect(component.state()).toBe('sending');
    expect(page.querySelector('form')?.getAttribute('aria-busy')).toBe('true');
    await component.submit();
    expect(gateway.send).toHaveBeenCalledTimes(1);
    expect(page.textContent).not.toContain('Tu consulta fue recibida');
    complete({ accepted: true, receiptId: 'unit-test-only' });
    await pending;
    await fixture.whenStable();
    expect(page.querySelector('[role="status"]')?.textContent).toContain(
      'Tu consulta fue recibida',
    );
    expect(component.form.controls.message.value).toBe('');
  });
  it('preserves the inquiry on error and allows a retry', async () => {
    const { component, gateway, fixture, page } = await setup();
    component.form.setValue(inquiry);
    gateway.send.mockRejectedValueOnce(new Error('Unavailable'));
    await component.submit();
    await fixture.whenStable();
    expect(page.querySelector('[role="alert"]')?.textContent).toContain('No pudimos confirmar');
    expect(component.form.getRawValue()).toEqual(inquiry);
    gateway.send.mockResolvedValueOnce({ accepted: true, receiptId: 'unit-test-only' });
    await component.submit();
    expect(component.state()).toBe('success');
  });
  it('rejects a filled honeypot without pretending success', async () => {
    const { component, gateway } = await setup();
    component.form.setValue({ ...inquiry, website: 'spam' });
    await component.submit();
    expect(gateway.send).not.toHaveBeenCalled();
    expect(component.state()).toBe('error');
  });
  it('aborts an outstanding request when the page is destroyed', async () => {
    const { component, gateway, fixture } = await setup();
    gateway.send.mockImplementation(
      (_data, signal) =>
        new Promise((_resolve, reject) => {
          (signal as AbortSignal).addEventListener('abort', () => reject(new Error('Aborted')));
        }),
    );
    component.form.setValue(inquiry);
    const pending = component.submit();
    const signal = gateway.send.mock.calls[0][1] as AbortSignal;
    fixture.destroy();
    await pending;
    expect(signal.aborted).toBe(true);
  });
  it('requires explicit consent and exposes its error without sending', async () => {
    const { component, gateway, fixture, page } = await setup();
    component.form.setValue({ ...inquiry, consent: false });
    await component.submit();
    await fixture.whenStable();
    expect(gateway.send).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(page.querySelector('#inquiry-consent'));
    expect(page.querySelector('#inquiry-consent')?.getAttribute('aria-describedby')).toBe(
      'consent-error',
    );
  });
  it('explains rate limits while keeping the visitor data for a later retry', async () => {
    const { component, gateway, fixture, page } = await setup();
    component.form.setValue(inquiry);
    gateway.send.mockRejectedValueOnce(new ContactDeliveryError(true));
    await component.submit();
    await fixture.whenStable();
    expect(page.querySelector('[role="alert"]')?.textContent).toContain('límite de intentos');
    expect(component.form.getRawValue()).toEqual(inquiry);
  });
});
