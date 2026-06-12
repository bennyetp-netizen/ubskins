## Site-wide MN/EN i18n

### Goal
Add a language toggle (MN/EN) covering all user-facing pages. Admin and email templates stay Mongolian (internal use).

### Tech
- Install `react-i18next` + `i18next`
- Two JSON dictionaries: `src/i18n/mn.json`, `src/i18n/en.json`
- Init in `src/i18n/index.ts`, imported from `src/main.tsx`
- Persist choice in `localStorage` (`lang` key), default `mn`
- Update `<html lang>` on change

### Toggle UI
- In `Navbar`: a compact "MN / EN" pill button (desktop + mobile menu)
- Click switches language instantly

### Pages/components to translate
- `Navbar`, `Footer`, `FacebookFab`
- `Index` (hero, features, FAQ, CTA)
- `Shop` (filters, empty states, sort labels)
- `SkinDetail` (specs, buttons, payment notes)
- `Cart` (line items, totals, checkout form labels, validation)
- `Orders` (statuses, QR/payment instructions, deposit/remaining)
- `Account` (profile, Steam connect)
- `AuthCallback`, `NotFound`, `Unsubscribe`
- Shared bits: `ProductTypeBadge`, `MarketPriceReference`, `FloatBar`, `SkinCard`, `QpayQrBox`, `SwipeableCartItem`
- Toast/sonner messages used across these pages

### Out of scope (stay MN)
- `Admin.tsx` (internal dashboard)
- Edge functions & email templates (server-side)
- `index.html` `<title>` / meta — kept MN since SEO targets MN market

### Approach to keep diff manageable
- Add `useTranslation()` and replace hardcoded strings key-by-key per file
- Skin names / wear values from DB stay as-is (they're proper nouns / Steam-side)
- Mongolian currency suffix `₮` stays in both languages

### Deliverables
1. i18n setup + dictionaries
2. Language toggle in Navbar
3. All listed components/pages using `t()` keys
