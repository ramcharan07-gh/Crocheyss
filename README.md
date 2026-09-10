# crocheyss

> Handmade crochet pieces for happy little moments.

crocheyss is a warm, responsive handmade-crochet storefront with product discovery, filtering, search, wishlist support, cart interactions, direct checkout, custom order requests, and owner order notifications through Resend.

The project is intentionally lightweight: the storefront is served by a small Node.js server, so the same application can host the frontend and provide secure server-side email endpoints.

## Features

### Storefront

- Handmade crochet brand landing page
- Animated intro experience
- Responsive desktop and mobile layout
- Product categories
- Product search
- Product sorting by price
- Product detail modal
- Product sizes and handmade trust information
- Scroll reveal animations
- FAQ section
- Custom order CTA
- WhatsApp support button

### Shopping

- Add products to a cart
- Direct **Buy now** flow
- Quantity controls
- Cart total calculation
- Persistent cart using browser `localStorage`
- Wishlist with persistent saved products
- Wishlist drawer
- Add wishlist products to cart
- Checkout form with customer name, email, address, and order note

### Email integration

- Owner-only order notifications
- Owner-only custom order notifications
- Resend API integration
- Generated order IDs
- Generated custom request IDs
- Resend response validation
- Server-side API key handling
- Customer email validation

> Current email behavior sends order notifications to `OWNER_EMAIL`. The customer enters their email so the owner can reply directly. Customer confirmation emails can be enabled later after the Resend domain is verified and customer delivery is required.

## Technology

- HTML
- CSS
- Vanilla JavaScript
- Node.js
- Native Node HTTP server
- Resend
- dotenv

## Project structure

```text
.
├── index.html          # Storefront markup and modal forms
├── styles.css          # Responsive design and animations
├── script.js           # Product, cart, wishlist, and form behavior
├── server.mjs          # Static server and email API endpoints
├── package.json        # Scripts and dependencies
├── package-lock.json   # Locked dependency versions
├── .env.example        # Safe environment variable template
├── .gitignore          # Excludes secrets and dependencies
└── README.md           # Project documentation
```

## Requirements

- Node.js 18 or newer
- npm
- A Resend account for email notifications
- A verified Resend domain for production delivery

Check your installed versions:

```powershell
node --version
npm --version
```

## Local setup

### 1. Clone the repository

```powershell
git clone https://github.com/ramcharan07-gh/Crocheyss.git
cd Crocheyss
```

If you already have the project locally:

```powershell
cd "C:\Users\Vanikumbha\OneDrive\Desktop\Projects\crochet"
```

### 2. Install dependencies

```powershell
npm install
```

### 3. Create the local environment file

Copy `.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
```

Then edit `.env`:

```env
RESEND_API_KEY=your_resend_api_key
RESEND_FROM=crocheyss <orders@crocheyss.dev>
OWNER_EMAIL=your-owner-email@example.com
PORT=3000
```

Never commit `.env`. It is excluded by `.gitignore`.

### 4. Start the application

```powershell
npm start
```

Open:

```text
http://localhost:3000
```

The server loads local `.env` values through `dotenv`. On Render, environment variables are injected by the hosting platform.

### 5. Stop the application

Press:

```text
Ctrl + C
```

## Environment variables

| Variable | Required | Description |
|---|---:|---|
| `RESEND_API_KEY` | Yes | Private Resend API key |
| `RESEND_FROM` | Yes | Verified sender, for example `crocheyss <orders@crocheyss.dev>` |
| `OWNER_EMAIL` | Yes | Email address that receives order notifications |
| `PORT` | No | Local port; Render provides its own port automatically |

### Resend sender requirements

For testing, Resend may provide a sandbox sender such as:

```env
RESEND_FROM=crocheyss <onboarding@resend.dev>
```

Sandbox mode can restrict recipients to the email address associated with the Resend account.

For production:

1. Add `crocheyss.dev` in Resend Domains.
2. Copy the DNS records Resend provides.
3. Add those records at the domain provider.
4. Wait until Resend shows the domain as **Verified**.
5. Use a sender on that domain:

```env
RESEND_FROM=crocheyss <orders@crocheyss.dev>
```

Do not use a sender domain before Resend verifies it.

## Email and order flow

### Standard order

```text
Customer adds product
        ↓
Customer opens checkout
        ↓
Frontend sends POST /api/order
        ↓
Server validates the order
        ↓
Server sends an email to OWNER_EMAIL through Resend
        ↓
Owner replies to the customer's checkout email
```

The owner email contains:

- Order ID
- Customer name
- Customer email
- Products
- Quantities
- Prices
- Delivery address
- Order note

### Custom order

```text
Customer opens custom order form
        ↓
Customer submits request
        ↓
Frontend sends POST /api/custom-order
        ↓
Server validates the request
        ↓
Server sends a custom request email to OWNER_EMAIL
```

Custom requests include:

- Customer name
- Customer email
- Requested product
- Preferred colors
- Quantity
- Needed-by date
- Notes
- Optional reference image URL

## API endpoints

### `POST /api/order`

Example request:

```json
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "address": "House, street, city, postal code",
  "note": "Please gift wrap this order",
  "items": [
    {
      "name": "Ghost charm",
      "quantity": 1,
      "price": 59
    }
  ]
}
```

Successful response:

```json
{
  "ok": true,
  "orderId": "CT-XXXXXXXX"
}
```

### `POST /api/custom-order`

Example request:

```json
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "requestType": "Custom blue bow set",
  "colors": "Blue and cream",
  "quantity": "2",
  "neededBy": "2026-12-20",
  "notes": "Please make the bows gift-ready",
  "reference": "https://example.com/reference-image.jpg"
}
```

Successful response:

```json
{
  "ok": true,
  "requestId": "CT-CUSTOM-XXXXXXXX"
}
```

## Deploying to Render

The repository is a Node web service and should be deployed as a **Web Service**, not a Static Site.

### Render settings

```text
Repository: ramcharan07-gh/Crocheyss
Branch: main
Root Directory: blank
Runtime: Node
Build Command: npm install
Start Command: npm start
```

Render provides the runtime `PORT` automatically.

### Render environment variables

Add these in the Render service's Environment section:

```text
RESEND_API_KEY=your_new_resend_api_key
RESEND_FROM=crocheyss <orders@crocheyss.dev>
OWNER_EMAIL=your-owner-email@example.com
```

Do not upload `.env` to GitHub or paste secrets into the Render build command.

### Deploy

1. Create the Render Web Service.
2. Connect the GitHub repository.
3. Add the environment variables.
4. Click **Create Web Service**.
5. Review the deployment logs.
6. Test the generated Render URL.

The deployed site will have a URL similar to:

```text
https://crocheyss.onrender.com
```

## Custom domain setup

To use `crocheyss.dev` for the website:

1. Open the Render service.
2. Go to **Settings → Custom Domains**.
3. Add `crocheyss.dev`.
4. Add the DNS records Render provides at your domain provider.
5. Wait for Render to verify the domain.

The same domain can also be verified in Resend for email sending, but the DNS records for Render and Resend must be added according to each service's instructions.

## Troubleshooting

### `Missing RESEND_API_KEY, RESEND_FROM, or OWNER_EMAIL`

Check that:

- `.env` exists locally.
- Variable names are spelled exactly.
- Values are not empty.
- The server was restarted after changing `.env`.
- Render environment variables were saved and the service was redeployed.

### `API key is invalid`

- Revoke the invalid key in Resend.
- Create a new key.
- Add it to local `.env` or Render Environment Variables.
- Restart or redeploy.
- Never commit the key.

### `domain is not verified`

- Verify the domain in Resend.
- Add the DNS records exactly as shown.
- Wait for DNS propagation.
- Use a sender address ending in the verified domain.

### `You can only send testing emails to your own email address`

This means Resend is still in sandbox mode. Verify a domain and change:

```env
RESEND_FROM=crocheyss <orders@crocheyss.dev>
```

### `Failed to fetch`

Check that:

- The Node server is running.
- The browser URL uses the same host and port as the server.
- The frontend is served through `http://localhost:3000`, not opened directly as a `file://` URL.
- Render finished deploying the latest commit.

### Orders are not reaching the owner

Check:

- `OWNER_EMAIL` is correct.
- The Resend sender domain is verified.
- Render was redeployed after environment changes.
- Resend Logs for delivery or rejection details.
- Spam and promotions folders.

## Security

- Never commit `.env`.
- Never put `RESEND_API_KEY` in frontend JavaScript.
- Never put API keys in `index.html`.
- Revoke keys that are exposed in chat, screenshots, commits, or logs.
- Use a separate production API key.
- Keep Resend calls on the server.
- Validate customer input on the server.
- Keep sender domains verified.

## Current limitations

This is a lightweight storefront foundation. It currently does not include:

- Persistent database storage
- Customer accounts
- Server-side inventory
- Payment gateway integration
- Admin dashboard
- Persistent server-side order history
- Automated shipping updates
- Customer confirmation email delivery

The browser cart, wishlist, and last-order data currently use `localStorage`. For production-scale commerce, add a database and payment provider before accepting online payments.

## Future improvements

- PostgreSQL or Supabase order database
- Admin order dashboard
- Customer authentication
- Razorpay or Stripe payments
- Payment verification and refunds
- Inventory management
- Product image storage
- Customer confirmation emails after domain verification
- Order tracking
- Reviews and ratings
- Coupon codes
- Gift wrapping and gift messages

## License

See [LICENSE](./LICENSE) for the repository license.
