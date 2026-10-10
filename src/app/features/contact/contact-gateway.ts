import { Injectable, signal } from '@angular/core';
import { siteConfig } from '../../core/site.config';

export interface ContactInquiry {
  name: string;
  email: string;
  company: string;
  projectType: string;
  message: string;
  website: string;
  startedAt: number;
  consent: boolean;
  privacyVersion: string;
}
export interface ContactReceipt {
  accepted: true;
  receiptId: string;
}
interface PublicContactConfiguration {
  enabled: true;
  privacyNotice: string;
  privacyVersion: string;
}
export class ContactDeliveryError extends Error {
  constructor(readonly rateLimited: boolean) {
    super('Contact delivery unconfirmed');
  }
}

@Injectable({ providedIn: 'root' })
export class ContactGateway {
  private readonly configuration = signal<PublicContactConfiguration | null>(null);
  private loadId = 0;
  get available(): boolean {
    return this.configuration()?.enabled === true;
  }
  get privacyNotice(): string {
    return this.configuration()?.privacyNotice ?? '';
  }
  get privacyVersion(): string {
    return this.configuration()?.privacyVersion ?? '';
  }

  async load(signal: AbortSignal): Promise<void> {
    const id = ++this.loadId;
    this.configuration.set(null);
    try {
      if (!/^\/api\/[a-z0-9/-]+$/i.test(siteConfig.contact.endpoint)) return;
      const response = await fetch(siteConfig.contact.endpoint, {
        credentials: 'same-origin',
        cache: 'no-store',
        signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]),
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) return;
      const value: unknown = await response.json();
      if (id !== this.loadId || signal.aborted || !value || typeof value !== 'object') return;
      const data = value as Partial<PublicContactConfiguration>;
      if (
        data.enabled === true &&
        typeof data.privacyNotice === 'string' &&
        data.privacyNotice.length >= 80 &&
        typeof data.privacyVersion === 'string' &&
        /^[a-zA-Z0-9._-]{1,64}$/.test(data.privacyVersion)
      ) {
        this.configuration.set(data as PublicContactConfiguration);
      }
    } catch {
      /* Static preview and unconfigured deployments remain disabled. */
    }
  }

  async send(inquiry: ContactInquiry, signal: AbortSignal): Promise<ContactReceipt> {
    if (
      !this.available ||
      inquiry.website.trim() ||
      !inquiry.consent ||
      inquiry.privacyVersion !== this.privacyVersion
    )
      throw new Error('Contact unavailable');
    // The server must validate, rate-limit and enforce anti-spam independently.
    const response = await fetch(siteConfig.contact.endpoint!, {
      method: 'POST',
      credentials: 'same-origin',
      signal,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(inquiry),
    });
    if (!response.ok) throw new ContactDeliveryError(response.status === 429);
    const result: unknown = await response.json();
    if (
      !result ||
      typeof result !== 'object' ||
      !('accepted' in result) ||
      result.accepted !== true ||
      !('receiptId' in result) ||
      typeof result.receiptId !== 'string' ||
      !result.receiptId.trim()
    ) {
      throw new Error('Missing contact receipt');
    }
    return { accepted: true, receiptId: result.receiptId };
  }
}
