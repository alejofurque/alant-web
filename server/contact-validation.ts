export const projectTypes: Record<string, string> = {
  software: 'Software a medida',
  integraciones: 'Integración de sistemas',
  automatizacion: 'IA y automatización',
  'por-definir': 'Por definir',
};

export interface Inquiry {
  name: string;
  email: string;
  company: string;
  projectType: string;
  message: string;
  website: string;
  startedAt: number;
  consent: true;
  privacyVersion: string;
}

// Deliberately accepts one ordinary mailbox, never a display name or an address list.
export function validEmail(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 254 || /[\s\r\n]/.test(value)) return false;
  const parts = value.split('@');
  return (
    parts.length === 2 &&
    parts[0].length <= 64 &&
    /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*$/.test(parts[0]) &&
    /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/.test(parts[1])
  );
}

export function validateInquiry(value: unknown, version: string, now: number): Inquiry | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  const allowed = [
    'name',
    'email',
    'company',
    'projectType',
    'message',
    'website',
    'startedAt',
    'consent',
    'privacyVersion',
  ];
  if (Object.keys(data).some((key) => !allowed.includes(key))) return null;
  for (const field of ['name', 'email', 'company', 'projectType', 'message', 'website']) {
    if (typeof data[field] !== 'string') return null;
  }
  const name = (data.name as string).trim();
  const email = (data.email as string).trim();
  const company = (data.company as string).trim();
  const message = (data.message as string).trim();
  const type = data.projectType as string;
  if (
    name.length < 2 ||
    name.length > 100 ||
    company.length > 160 ||
    /[\x00-\x1f\x7f]/.test(name + company) ||
    !validEmail(email) ||
    message.length < 20 ||
    message.length > 4000 ||
    /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(message) ||
    !Object.hasOwn(projectTypes, type) ||
    data.website !== '' ||
    data.consent !== true ||
    data.privacyVersion !== version ||
    typeof data.startedAt !== 'number' ||
    !Number.isSafeInteger(data.startedAt) ||
    now - data.startedAt < 2000 ||
    now - data.startedAt > 24 * 60 * 60 * 1000
  )
    return null;
  return {
    name,
    email,
    company,
    message,
    projectType: type,
    website: '',
    startedAt: data.startedAt,
    consent: true,
    privacyVersion: version,
  };
}

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character]!,
  );

export function composeEmail(inquiry: Inquiry, from: string, to: string) {
  const fields = [
    ['Nombre', inquiry.name],
    ['Email', inquiry.email],
    ['Empresa', inquiry.company || 'No indicada'],
    ['Tipo de proyecto', projectTypes[inquiry.projectType]],
    ['Descripción', inquiry.message],
    ['Consentimiento', `Aceptado. Aviso ${inquiry.privacyVersion}.`],
  ];
  return {
    from: `ALANT <${from}>`,
    to: [to],
    reply_to: inquiry.email,
    subject: `Consulta ALANT · ${projectTypes[inquiry.projectType]}`,
    text:
      'Nueva consulta comercial\n\n' +
      fields.map(([label, value]) => `${label}:\n${value}`).join('\n\n'),
    html:
      '<h1>Nueva consulta comercial</h1>' +
      fields
        .map(
          ([label, value]) =>
            `<h2>${label}</h2><p>${escapeHtml(value).replace(/\r?\n/g, '<br>')}</p>`,
        )
        .join(''),
  };
}
