# ElectroHub (abrar-electronics)

Next.js + TypeScript + Tailwind. Backend Next.js ke andar hai (API routes), alag server nahi chalana.

## Run
npm install
npm run dev   -> http://localhost:3000

## Structure
- app/page.tsx          homepage (components jode hue)
- components/           har section ka alag component
- lib/data.ts           brands + products data (baad mein MongoDB yahan lagao)
- app/api/brands        GET /api/brands
- app/api/products      GET /api/products  (?q=fan se search)
- app/api/products/[id] GET /api/products/1
- public/images/        abhi placeholder .svg hain, real images rakh kar lib/data.ts mein path badlo
