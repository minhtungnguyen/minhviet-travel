# Playbook: Configure a Form

Superseded by the real `modules/forms` API as of Sprint 1B.2 — this playbook previously described raw SQL `INSERT`s (Sprint 1A). A form's actual fields are still defined in code (Zod schema + React component, mirroring `lib/cms/schema.ts`'s existing `leadFormSchema` pattern) — the database only holds the catalog entry and submissions, exactly as decided in the Sprint 1A.2 reduction.

## Register a new form

```
POST /api/v1/forms
{ "websiteId": "<uuid>", "key": "mice-consultation", "name": "MICE Consultation Request" }
```

Requires `forms.definition.manage`. `key` is the stable identifier the public submission endpoint addresses by, unique per website (case-insensitively). New forms are created `ACTIVE` by default — `PATCH /api/v1/forms/{id}` with `{"status": "INACTIVE"}` to take one offline without deleting it.

## Submitting to it (public, unauthenticated)

```
POST /api/v1/public/sites/{websiteKey}/forms/{formKey}/submissions
{
  "submissionType": "individual",
  "fullName": "...",
  "phone": "...",
  "email": "...",
  "consentPrivacy": true,
  "consentMarketing": false,
  "payload": { /* fields specific to this one form */ },
  "idempotencyKey": "<client-generated, e.g. a hash of session + short time bucket>"
}
```

This is the **only** endpoint in the entire API that accepts an anonymous write — `form_submissions` has no anon `INSERT` RLS policy at all (`docs/database/rls-policy-matrix.md`), so this route uses the service-role client, but only after:

1. Zod validation (`publicFormSubmissionSchema`) — `.strict()`, rejects unknown fields.
2. A honeypot check — a hidden field (`honeypot`) real users never fill in; if non-empty, the route reports success but writes nothing.
3. Payload size cap — `payload` is capped at 20,000 bytes.
4. Tag-stripping on `fullName`/`phone` (angle brackets removed) before storage.
5. Idempotency — if `idempotencyKey` matches an existing submission, the existing row's id is returned instead of creating a duplicate (retry-safe, not an error).
6. Server-side resolution of `organizationId`/`websiteId`/`formId` — never accepted from the request body, so a client can't spoof which organization a submission is attributed to.

## Reading submissions (staff)

```
GET /api/v1/form-submissions?websiteId=<uuid>
PATCH /api/v1/form-submissions/{id}
{ "status": "PROCESSED" }
```

Both require `forms.submission.read`. `PATCH` only accepts `status` (`NEW`/`VALIDATED`/`PROCESSED`/`REJECTED`/`SPAM`) — nothing else about a submission is staff-editable through this API.

## Routing and notifying on a new submission

Still no `form_routing_rules`/`form_notification_rules` table (deferred per the Sprint 1A.2 reduction) and `assigned_department_id` still doesn't exist on `form_submissions`. Routing/notification logic remains either a small addition to the public submission route itself or, more likely, CRM territory (Sprint 2) once a lead-tracking system exists to own it — unchanged from the Sprint 1A version of this playbook, restated here since Sprint 1B.2 didn't revisit that decision.
