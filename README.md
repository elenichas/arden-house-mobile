# Arden House

Arden House is a phone-first interactive prototype for hotel guests before and during a stay. It brings reservations, room preferences, concierge services, meeting rooms, dining, and practical hotel assistance into one calm mobile experience.

The project uses fictional guest, hotel, and booking data. No payment is taken and no real service request is sent.

## Guest journeys

- Review an existing reservation and prepare the room before arrival.
- Compare guestrooms and complete a prototype booking.
- Rebook a previous stay or reuse saved preferences.
- Set an arrival profile for bed, lighting, refreshments, mornings, and privacy.
- Request housekeeping, dining, transport, spa, or meeting-room support.
- Ask the built-in demo assistant for practical help.
- Switch on a low-light jet-lag mode.

## Run locally

Requires Node.js 20 or later and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
npm run lint
npm run build
node scripts/audit-contrast.mjs
```

## Technology

Next.js, React, TypeScript, Tailwind CSS, Framer Motion, Radix UI, and a deterministic local assistant transport for safe demonstrations.

## Prototype note

All content and imagery are intended for demonstration. Replace mock data and the local assistant transport with authenticated hotel services before any production use.
