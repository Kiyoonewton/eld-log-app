# ELD Logger Application

A full-stack Next.js application for truck drivers to manage Electronic Logging Device (ELD) logs, route planning, and daily log sheet generation.

## Project Structure

```
eld-logger/
├── README.md
├── package.json
├── tsconfig.json
├── next.config.js
├── .env.local
├── public/
│   └── assets/
│       └── images/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── route/
│   │   │   │   └── route.ts
│   │   │   └── logs/
│   │   │       └── route.ts
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Select.tsx
│   │   ├── forms/
│   │   │   └── TripDetailsForm.tsx
│   │   ├── map/
│   │   │   ├── RouteMap.tsx
│   │   │   └── MapWrapper.tsx
│   │   └── logs/
│   │       ├── DailyLogSheet.tsx
│   │       └── LogGrid.tsx
│   ├── lib/
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   ├── constants.ts
│   │   └── mapUtils.ts
│   ├── hooks/
│   │   ├── useRouteCalculation.ts
│   │   └── useLogGeneration.ts
│   └── services/
│       ├── routeService.ts
│       └── logService.ts
└── prisma/
    └── schema.prisma
```

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   Create a `.env.local` file with necessary API keys

4. Run the development server:
   ```
   npm run dev
   ```

## Technology Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Leaflet for maps
- React Hook Form for form handling
- Zod for validation

## Features

- Trip planning with route calculation
- ELD log generation based on HOS regulations
- Interactive map visualization
- Daily log sheet generation
- Type-safe code with TypeScript