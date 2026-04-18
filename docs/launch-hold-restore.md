# Restore shop pricing & hero price (launch hold)

Use this checklist when you are ready to show prices again and turn **Add to cart** back on.

---

## 1. Shop page — `client/src/pages/Shop.js`

### 1.1 Re-enable the primary button

- Find `const SHOP_CTA_HOLD = true;` near the top of the file.
- Set it to **`false`**.

That restores normal **Add to cart** text and behavior (the handler already checks `SHOP_CTA_HOLD`).

### 1.2 Show unit price + regional note again

- Remove the JSX comment wrappers around:
  - The block that starts with **“Price hidden during launch hold”** (the `<div>` with `formatPrice(unitPrice)`, “Per unit”, and “Price for your region …”).
- Delete the `{/*` opening and `*/}` closing so that markup is live JSX again (not commented out).

### 1.3 Show “Total” again

- Remove the JSX comment wrappers around the block that starts with **“Total hidden during launch hold”** (the row with **Total** and `formatMoney(quantity * unitPrice, currency)`).

### 1.4 Fix imports and `usePricing`

- **Import:** add `formatMoney` back from `../config/product`:

  ```js
  import { PRODUCT_DISPLAY_NAME, formatMoney } from '../config/product';
  ```

- **`usePricing`:** replace the minimal destructure with:

  ```js
  const { unitPrice, currency, geoReady, formatPrice } = usePricing();
  ```

After this, `npm run build` (or your IDE) should confirm there are no unused variables.

---

## 2. Home page — hero price next to “Shop Earwing” — `client/src/pages/Home.js`

### 2.1 Import pricing

- Add:

  ```js
  import { usePricing } from '../context/PricingContext';
  ```

### 2.2 Use pricing inside `Home`

- At the top of the `Home` component (with your other hooks), add:

  ```js
  const { geoReady, formatPrice, unitPrice } = usePricing();
  ```

### 2.3 Replace the product-name-only line with price + name

- Today the hero shows only `{PRODUCT_DISPLAY_NAME}` in the `<span>` next to the Shop link.
- Replace that `<span>` contents with the previous pattern:

  - While `!geoReady`: show the small loading skeleton (`w-36 h-4` pulse).
  - When ready: **`formatPrice(unitPrice)`**, then **` · `**, then **`{PRODUCT_DISPLAY_NAME}`**.

- On that `<span>`, you can add **`tabular-nums`** back to the `className` if you want the old numeric alignment (optional).

- Remove or replace the small comment **“Launch hold: restore price next to CTA …”** once restored.

---

## 3. Quick verification

- [ ] Home hero: price and product name appear after geo/pricing loads.
- [ ] Shop: unit price, region line, and total render; button says **Add to cart** and adds to cart / navigates as before.
- [ ] `npm run build` in `client` passes.

If anything fails to compile, compare variable names (`unitPrice`, `currency`, `formatPrice`, `formatMoney`) with the uncommented JSX in `Shop.js`.
