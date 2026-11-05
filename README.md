# Clothing Store (React + Vite)

Dark, red-accent order-request clothing store, styled to match the reference site.
Pages: Age gate, Home, Products (7 categories + search), Category pages, Product detail,
Merch (+ search), About (with FAQ), Contact, Cart, Privacy, Terms, Shipping & Returns.

## Run
```bash
npm install
npm run dev      # local dev
npm run build    # production build in /dist
```

## Local admin (development only)
Run `npm run dev`, then open `/admin` on the local Vite URL (for example `http://localhost:5173/admin`).

- Edit products, categories, merch, prices, sizes, images and site settings.
- Save writes the catalog to `src/data/catalog.json`.
- The last 40 saved snapshots are kept in `src/data/admin-history.json` and can be restored from the History tab.
- Uploaded images go to `public/images/uploads`.
- The admin API only runs locally during `npm run dev`; it is not available in production builds.
- There is no login, so do not expose the dev server to your network.

## Deploy on Cloudflare Pages
1. Push the repo to GitHub.
2. In Cloudflare, open **Workers & Pages -> Create -> Pages -> Connect to Git** and select the repo.
3. Use these build settings:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
4. If the build uses an older Node version, add an environment variable `NODE_VERSION=22`.
5. Deploy. `public/_redirects` handles refreshes and direct links to client-side routes.

After editing the catalog locally, run `npm run build` to verify, then commit and push. Cloudflare redeploys automatically.

## Live chat (Smartsupp)
The floating chat uses Smartsupp when `VITE_SMARTSUPP_KEY` is set. Without a key, it falls back to the WhatsApp button.

1. Create a Smartsupp account and copy your key from **Settings -> Channels -> Live chat -> Installation -> Insert code**.
2. Locally, create `.env` (not committed) and add:
   ```bash
   VITE_SMARTSUPP_KEY=your_key_here
   ```
3. In Cloudflare Pages, add the same `VITE_SMARTSUPP_KEY` environment variable.
4. Rebuild or redeploy.

Smartsupp's Free plan allows one website and 25 conversations per month.

## What to edit
- Use the local admin at `/admin` for catalog and site settings.
- `src/data/catalog.json` stores products, categories, merch, images and site settings.
- `src/data/site.js` exports that catalog to the storefront.
- `src/data/legal.js` stores legal and FAQ copy.

## Images
Put files in `public/images` and set the path in the admin, or in `src/data/catalog.json`, e.g. `"hero": "/images/hero.jpg"`.
Empty = a placeholder is shown, with a label telling you which key to fill.
- Background slots: `hero`, `productsHero`, `merchHero`, `aboutCta`
- Image slots: `brand`, `lineup`, `lifestyle`, `merchTeaser`, `about`, `aboutLineup`, `logoHeader`, `logoFooter`
- Category banners: `banner` on each category. Product images: `image` on each product/merch item.

## Style
Colors and fonts: CSS variables at the top of `src/index.css` (red `--red`, coral `--coral`, Montserrat + Inter).
Legal and FAQ text: `src/data/legal.js` (template copy, have it reviewed before launch).

## Notes
- The cart is saved in the browser. There is no backend: "Send by email" opens the customer's mail app,
  "Send by WhatsApp" opens a chat with the order summary pre-filled. The floating chat uses Smartsupp when configured, otherwise WhatsApp.
- Age verification is remembered in the browser (localStorage key `age-verified`).
- Size: cards add the default size (M); customers can change it in the cart or on the product page.
