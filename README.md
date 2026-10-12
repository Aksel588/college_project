# AURA / ARCHIVE — High-Performance & Editorial Fashion Shop

A full-stack React eCommerce application inspired by **Nike** (high-performance athletics & quick-action UX) and **Zara** (minimalist editorial typography, modern grid aesthetics, clean monochromatic tones), powered by a **MySQL** backend.

---

## 🚀 Features

1. **Brand Aesthetic & Modern Clean Design**:
   - Monochromatic palette, high-contrast bold typography (`Syne` + `Inter`).
   - Sticky minimal navigation with active tickers, search bar, and bag counts.
   - High-impact editorial hero campaign with video/photography backdrop.
   - Dynamic product grid with hover overlays, badges (`JUST RELEASED`, `STUDIO EDITION`, `BESTSELLER`), and quick-view actions.

2. **Full Product Quick View & Customization**:
   - Multi-angle gallery preview.
   - Size picker (US Footwear / Clothing XS-XXL).
   - Color selection.
   - Live availability and shipping perks.

3. **Slide-Over Shopping Bag (Basket)**:
   - Dynamic item increment/decrement and deletion.
   - Free shipping progress meter (unlocks at $150).
   - Real-time subtotal and estimated shipping calculation.

4. **Simulated Secure Pay & Checkout**:
   - Two-step shipping address form.
   - Card details simulation with 256-bit SSL badges.
   - Direct MySQL transactional order creation.
   - Instant confirmation receipt with reference numbers (e.g. `NZ-828063`).

5. **User Accounts & Authentication**:
   - Register new account (name, email, password hashed with `bcryptjs`).
   - Sign in with JWT tokens.
   - Profile badge with live order history modal.

6. **MySQL Database Integration**:
   - **`users`**: Customer credentials and authentication records.
   - **`products`**: Catalog items, images, categories, prices, sizes, and colors.
   - **`orders`**: Full checkout receipts, addresses, order totals, and status.

---

## 🛠️ How to Run

### 1. Backend (Express & MySQL)
```bash
cd server
npm install
node server.js
```
The server runs on **`http://localhost:5001`** and will auto-create the `nike_zara_shop` database and seed initial products if empty.

### 2. Frontend (React + Vite)
```bash
cd client
npm install
npm run dev
```
The storefront runs on **`http://localhost:5174`** (or `5173`).
