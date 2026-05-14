import type { CollectionConfig } from 'payload'

// Customer accounts — completely separate from `Users` (which is for
// staff). Customers self-register from the public site, manage their
// own profile and bikes, and (in Phase 2) book services.
//
// Auth is via Payload's built-in auth — login/register/forgot/reset
// endpoints are auto-mounted at /api/customers/*. JWT cookies
// distinguish customer sessions from staff sessions automatically
// because the JWT payload encodes the collection slug.

const ADMIN_BASE = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'phone', 'createdAt'],
    description:
      'Self-registered customer accounts. Used for order history, saved addresses, ' +
      'and (Phase 2) service bookings. Separate from staff Users.',
    group: 'Customers',
  },
  auth: {
    // 30-day session for customers (better UX than the 2-hour default).
    // Staff Users keeps the default tighter expiry.
    tokenExpiration: 60 * 60 * 24 * 30,
    // Email verification required on sign-up. The customer can't
    // sign in until they click the link in their inbox.
    verify: {
      generateEmailSubject: () => 'Verify your Two Wheel Obsession account',
      generateEmailHTML: (args) => {
        const token = (args as { token?: string } | undefined)?.token ?? ''
        const verifyUrl = `${ADMIN_BASE}/account/verify?token=${encodeURIComponent(token)}`
        return `
          <p>Hi there,</p>
          <p>Thanks for creating an account at Two Wheel Obsession. Click the link below to confirm your email and finish signing up:</p>
          <p><a href="${verifyUrl}" style="background:#dc2626;color:#fff;padding:10px 18px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:600">Verify my email</a></p>
          <p>Or paste this into your browser: ${verifyUrl}</p>
          <p>If you didn't sign up, just ignore this email — we won't create the account.</p>
          <p>— Two Wheel Obsession<br/>(02) 4331 9007</p>
        `
      },
    },
    forgotPassword: {
      generateEmailSubject: () => 'Reset your Two Wheel Obsession password',
      generateEmailHTML: (args) => {
        const token = (args as { token?: string } | undefined)?.token ?? ''
        const resetUrl = `${ADMIN_BASE}/account/reset-password?token=${encodeURIComponent(token)}`
        return `
          <p>We got a request to reset your password. Click the link below to choose a new one — it expires in an hour.</p>
          <p><a href="${resetUrl}" style="background:#dc2626;color:#fff;padding:10px 18px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:600">Reset password</a></p>
          <p>Or paste this into your browser: ${resetUrl}</p>
          <p>Didn't ask for this? Ignore the email — your password stays as it is.</p>
          <p>— Two Wheel Obsession<br/>(02) 4331 9007</p>
        `
      },
    },
    // Lockout after 5 failed login attempts in 10 minutes — basic
    // brute-force protection. Resets on next successful login.
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
  },
  access: {
    // Customers can read / update their own row only. Admins can do
    // everything. Staff has no customer access.
    create: () => true, // public registration
    read: ({ req: { user } }) => {
      if (!user) return false
      if ((user as { collection?: string }).collection === 'users') {
        return (user as { role?: string }).role === 'admin'
      }
      // Customer reading themselves
      return { id: { equals: user.id } }
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if ((user as { collection?: string }).collection === 'users') {
        return (user as { role?: string }).role === 'admin'
      }
      return { id: { equals: user.id } }
    },
    delete: ({ req: { user } }) =>
      Boolean(
        user &&
          (user as { collection?: string }).collection === 'users' &&
          (user as { role?: string }).role === 'admin',
      ),
  },
  fields: [
    // Auth fields (email, password, _verified, etc.) are added by
    // `auth: { ... }` automatically — don't redeclare here.
    { name: 'firstName', type: 'text' },
    { name: 'lastName', type: 'text' },
    { name: 'phone', type: 'text', admin: { description: 'For order follow-up.' } },

    {
      type: 'collapsible',
      label: 'Default shipping address',
      admin: {
        initCollapsed: true,
        description:
          'Pre-fills the parts checkout. Customers can edit or override at checkout.',
      },
      fields: [
        { name: 'addressLine1', type: 'text' },
        { name: 'addressLine2', type: 'text' },
        { name: 'suburb', type: 'text' },
        {
          name: 'state',
          type: 'select',
          options: [
            { label: 'NSW', value: 'NSW' },
            { label: 'VIC', value: 'VIC' },
            { label: 'QLD', value: 'QLD' },
            { label: 'WA', value: 'WA' },
            { label: 'SA', value: 'SA' },
            { label: 'TAS', value: 'TAS' },
            { label: 'ACT', value: 'ACT' },
            { label: 'NT', value: 'NT' },
          ],
        },
        { name: 'postcode', type: 'text' },
      ],
    },

    {
      name: 'bikes',
      type: 'array',
      labels: { singular: 'Bike', plural: 'Bikes' },
      admin: {
        description:
          'Bikes the customer owns. Pre-fills the Phase 2 service-booking flow.',
      },
      fields: [
        { name: 'make', type: 'text', required: true },
        { name: 'model', type: 'text', required: true },
        { name: 'year', type: 'number' },
        { name: 'vin', type: 'text', admin: { description: '17-char VIN, optional but helps with parts fitment.' } },
        { name: 'registration', type: 'text' },
        {
          name: 'registrationState',
          type: 'select',
          options: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'].map((s) => ({
            label: s,
            value: s,
          })),
        },
        { name: 'notes', type: 'textarea' },
      ],
    },

    {
      type: 'row',
      fields: [
        {
          name: 'marketingConsent',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            width: '50%',
            description: 'Customer agreed to receive promotional emails.',
          },
        },
        {
          name: 'smsConsent',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            width: '50%',
            description: 'Customer agreed to receive SMS reminders (service due, parts ready, etc.).',
          },
        },
      ],
    },
  ],
}
