/**
 * SuperForms Integration Helper
 *
 * Provides re-exports and adapter utilities for sveltekit-superforms
 * with Zod v4. This module is only usable when sveltekit-superforms
 * is installed as a peer dependency.
 *
 * Usage:
 * ```typescript
 * import { superForm, superValidate, zod4 } from '@tinyland-inc/tinyland-forms/superforms';
 *
 * // Server-side validation
 * const form = await superValidate(request, zod4(mySchema));
 *
 * // Client-side form
 * const { form, errors, enhance } = superForm(data.form, {
 *   resetForm: false,
 *   clearOnSubmit: 'errors-and-message',
 *   multipleSubmits: 'prevent'
 * });
 * ```
 *
 * NOTE: This file re-exports from sveltekit-superforms which is an
 * optional peer dependency. If superforms is not installed, importing
 * from this module will fail at runtime. The field validators and
 * schemas in other modules work without superforms.
 */

// Re-export all commonly used superforms utilities
export {
  superForm,
  superValidate,
  defaults,
  message,
  setError,
  setMessage,
  fail as superFail,
} from 'sveltekit-superforms';

// Re-export Zod v4 adapter
export { zod4 } from 'sveltekit-superforms/adapters';

// Re-export types
export type {
  SuperValidated,
  SuperForm,
  FormOptions,
  FormResult,
  FormPathLeaves,
  ValidationErrors,
} from 'sveltekit-superforms';
