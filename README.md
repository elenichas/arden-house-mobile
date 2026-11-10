# Aspra, Milos

Aspra is a phone-first guest app for a fictional 22-suite sea hotel cut into the white volcanic rock of Milos, Greece. It covers the whole trip: booking, preparing the suite, planning days on the island, a 24-hour AI concierge, and what the guest keeps after they fly home.

All guests, bookings and prices are fictional. No payment is taken and no request is sent anywhere.

## Guest journeys

The gate offers three ways in. You can also open one directly with `?guest=new`, `?guest=booked` or `?guest=returning`.

- **New guest.** Choose a suite, pick dates and guests, add extras (boat or car transfer, early arrival, late check out, a celebration), tell us your pace and interests, set up the suite (pillows, scent, fridge, temperature), then confirm.
- **Booked guest.** Find the booking (ASP-2614, Weiss), see the countdown and arrival, and prepare the stay in two short steps.
- **Returning guest.** See moments from the last stay and the preferences we kept, then book the same suite again with them applied.

Inside the app there are four tabs:

- **Today** changes with the trip. A preview switch shows the three stages: before (countdown, getting here, suite setup, packing list, Greek words), on Milos (conditions, the day's timeline, one-tap requests, experiences picked from your preferences) and after (recipe, island pantry shipped home, monthly letter, rebooking).
- **Plan** shows each day of the stay. Add experiences ranked by your interests, ask Nefeli to plan a day, and change extras until 48 hours before arrival.
- **Nefeli** is the concierge, available at any hour. Replies can include actions such as adding an experience to the plan or sending a request to the team.
- **Journal** fills with each day of the stay and keeps past stays.

Your profile (top right) holds the preferences that carry from stay to stay.

## Your suite in 3D

Guests can walk through their suite before they arrive and set it up. The suite is modelled in code with Three.js (React Three Fiber, drei and postprocessing) in `components/aspra/suite3d/`, so there is no model or texture file to download. Open it on its own at `/suite` (or `/suite?suite=cave`).

The room is a hand-plastered barrel vault cut into the cliff, with a deep arch onto a terrace 14 m above the sea. Inside there is a built-in plaster wardrobe with arched bays, linen robes and cane doors. Outside there is a pergola, loungers, bougainvillea over the arch, a plunge pool for the pool suite and villa, an animated sea, and the hotel caique in the bay.

Nine settings, each with a hotspot in the room. Every choice changes the model straight away:

- Bed: one king or two singles
- Pillows: goose feather, feather free, firm latex or buckwheat, each modelled with its own loft and shape
- Linen: chalk white, sand or sea blue on the duvet and front pillows
- Temperature: 18 to 26°C. At 20°C or below a wool blanket is added, at 24°C or above the duvet becomes a cotton sheet, and the ceiling fan speeds up or slows down
- Curtains: open to the sea, or sheers drawn, which soften the light and move in the breeze
- Flowers: bougainvillea, olive branch, wild flowers or none, in a clay jug
- Scent: a reed diffuser in the wall niche, with drifting particles in the scent's colour
- On the table: figs and grapes, loukoumi and baklava with coffee cups, or water
- Minibar: island wine, no alcohol, children's drinks or empty, set out on top of the cabinet

The viewer has three times of day (morning, sunset, night with a moon, stars, lamps and a lit pool), four places to stand (door, bed, wardrobe, terrace), and a guided mode that steps through all nine settings. Graphics run in two modes: High adds ambient occlusion, bloom, soft shadows and a vignette, Light skips them for older phones. Auto picks one and drops to Light if the frame rate falls. Devices without WebGL get the same choices without the 3D view.

The tour opens from the suite cards and the "Set up your suite" step in booking, from the booked guest's preparation step, from Today and from Plan. In the booking flow choices go into the booking draft. After booking they save to the guest's profile.

File map: `scene.tsx` (canvas, camera, hotspots, effects), `environment.tsx` (sky, sea, terrace, lighting), `furniture.tsx` (everything in the room), `geometry.ts` and `textures.ts` (procedural shapes and materials), `suite-tour.tsx` (the interface).

## Screen sizes

The app is designed for phones first and adapts at two widths:

- Phone (under 768 px): one column, a floating tab bar, flows and sheets fill the screen.
- Tablet (768 px and up): a wider column, dialogs and booking flows open in a centred window, lists go to two columns.
- Desktop (1024 px and up): a glass sidebar replaces the top bar and tab bar, Today and Plan use two columns, and the 3D suite fills the window with its settings panel on the right.

## The concierge

`app/api/chat/route.ts` streams replies from Claude through the Vercel AI Gateway when `AI_GATEWAY_API_KEY` (or a Vercel OIDC token) is set. Without it, the route returns 503 and the app uses the local responder in `components/aspra/concierge-engine.ts`, which reads the guest's stage, booking, plan and preferences. The local responder also supplies the action buttons for every reply.

## Run locally

Requires Node.js 20 or later.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) at phone width.

## Quality checks

```bash
pnpm lint
pnpm build
```

## Code map

- `components/aspra/data.ts` has the hotel, suites, experiences, extras, sample guests and helpers.
- `components/aspra/store.tsx` holds app state: guest, booking, preferences, plan, requests.
- `components/aspra/entry/` has the gate, booking flow, booked and returning entries.
- `components/aspra/tabs/` has Today, Plan, Nefeli and Journal.
- `public/images/aspra/` has the generated photography.

## Design

The theme is Meltemi: black on a cool white with one electric sea blue, large rounded shapes, and frosted glass surfaces over a soft blue, aqua and warm backdrop. Headings are set in Bricolage Grotesque and text in Instrument Sans.

Glass comes in four strengths, defined in `app/globals.css`: `glass` for cards, `glass-strong` for sheets and the tab bar, `glass-dark` for dark screens, and `glass-smoke` for text and controls that sit on photos or the 3D view. People who ask their device to reduce transparency get solid surfaces instead.

The five directions that were considered are still at `/themes`.
