import { afterEach, vi } from 'vitest';
import { ContactGateway, ContactInquiry } from './contact-gateway';
import { siteConfig } from '../../core/site.config';
const original = siteConfig.contact.endpoint;
afterEach(() => {
  siteConfig.contact.endpoint = original;
  vi.unstubAllGlobals();
});
const inquiry: ContactInquiry = {
  name: 'QA',
  email: 'qa@example.test',
  company: '',
  projectType: 'software',
  message: 'Consulta de prueba unitaria, no enviada.',
  website: '',
  startedAt: 1,
  consent: true,
  privacyVersion: 'test-v1',
};
const config = {
  enabled: true,
  privacyNotice:
    'Aviso ficticio usado exclusivamente por las pruebas unitarias del contrato, nunca publicado en la web.',
  privacyVersion: 'test-v1',
};
const signal = () => new AbortController().signal;
async function configured() {
  const request = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => config });
  vi.stubGlobal('fetch', request);
  const gateway = new ContactGateway();
  await gateway.load(signal());
  return { gateway, request };
}
describe('Contact gateway contract', () => {
  it('requires server readiness and never calls an external endpoint', async () => {
    const request = vi.fn();
    vi.stubGlobal('fetch', request);
    const gateway = new ContactGateway();
    await expect(gateway.send(inquiry, signal())).rejects.toThrow();
    siteConfig.contact.endpoint = 'https://example.test/api/contact';
    await gateway.load(signal());
    expect(gateway.available).toBe(false);
    expect(request).not.toHaveBeenCalled();
  });
  it('stays disabled on a missing API or incomplete privacy configuration', async () => {
    const request = vi.fn();
    vi.stubGlobal('fetch', request);
    const gateway = new ContactGateway();
    for (const value of [
      { enabled: false },
      { enabled: true },
      { ...config, privacyVersion: '' },
    ]) {
      request.mockResolvedValueOnce({ ok: true, json: async () => value });
      await gateway.load(signal());
      expect(gateway.available).toBe(false);
    }
    request.mockRejectedValueOnce(new Error('Offline'));
    await gateway.load(signal());
    expect(gateway.available).toBe(false);
  });
  it('rejects HTTP errors and receipts without a real provider ID', async () => {
    const { gateway, request } = await configured();
    for (const response of [
      { ok: false, status: 502 },
      { ok: true, json: async () => ({}) },
      { ok: true, json: async () => ({ accepted: true, receiptId: '' }) },
    ]) {
      request.mockResolvedValueOnce(response);
      await expect(gateway.send(inquiry, signal())).rejects.toThrow();
    }
  });
  it('accepts an explicit receipt, forwarding cancellation and consent version', async () => {
    const { gateway, request } = await configured();
    request.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accepted: true, receiptId: 'unit-test-only' }),
    });
    const abortSignal = signal();
    expect(await gateway.send(inquiry, abortSignal)).toEqual({
      accepted: true,
      receiptId: 'unit-test-only',
    });
    expect(request).toHaveBeenLastCalledWith(
      '/api/contact',
      expect.objectContaining({
        signal: abortSignal,
        method: 'POST',
        body: JSON.stringify(inquiry),
      }),
    );
  });
  it('rejects missing consent and stale notices before transmitting', async () => {
    const { gateway, request } = await configured();
    await expect(gateway.send({ ...inquiry, consent: false }, signal())).rejects.toThrow();
    await expect(gateway.send({ ...inquiry, privacyVersion: 'old' }, signal())).rejects.toThrow();
    expect(request).toHaveBeenCalledTimes(1);
  });
});
