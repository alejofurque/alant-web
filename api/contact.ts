import { createContactHandler } from '../server/contact.ts';

// Vercel Web Standard function; no Angular server or persistent process.
export default {
  fetch(request: Request): Promise<Response> {
    return createContactHandler(process.env)(request);
  },
};
