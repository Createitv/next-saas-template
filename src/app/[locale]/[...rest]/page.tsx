import { notFound } from 'next/navigation';

// Catch-all for unmatched routes below a valid locale, e.g. `/fr/unknown-page`.
// Calling `notFound()` here makes Next.js render `[locale]/not-found.tsx`
// (the localized 404 page) instead of the default root 404.
export default function CatchAllPage() {
  notFound();
}
