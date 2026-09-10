# crocheyss

## About the webpage

crocheyss is a cozy, responsive handmade crochet storefront where customers can explore crochet products, save favorites, add items to a cart, buy products, and submit custom order requests.

The webpage uses a warm handmade visual style with soft colors, playful illustrations, smooth transitions, product showcases, and mobile-friendly layouts.

## Webpage link

Live website:

**[https://crocheyss.onrender.com](https://crocheyss.onrender.com)**

Repository:

**[https://github.com/ramcharan07-gh/Crocheyss](https://github.com/ramcharan07-gh/Crocheyss)**

## Tech stack

- HTML5
- CSS3
- Vanilla JavaScript
- Node.js
- Native Node HTTP server
- Resend email API
- dotenv for environment variables
- Render for deployment

## Features

- Animated intro experience
- Responsive desktop and mobile design
- Product categories and filtering
- Product search and sorting
- Product detail modal
- Product sizes and pricing
- Add to cart
- Buy now checkout
- Quantity controls
- Persistent cart with `localStorage`
- Wishlist with saved product count
- Wishlist drawer
- Add wishlist items to cart
- Custom order request form
- Owner order email notifications
- FAQ section
- WhatsApp support button
- Scroll reveal animations
- Handmade product gallery

## Deployment

The application is deployed as a Node.js Web Service on Render.

### Render configuration

```text
Repository: ramcharan07-gh/Crocheyss
Branch: main
Root Directory: blank
Build Command: npm install
Start Command: npm start
```

Render provides the runtime `PORT` environment variable automatically. Every push to the `main` branch can trigger a new deployment when automatic deploys are enabled.

## Email integration

The website uses Resend for server-side order notifications.

### Order email flow

1. A customer submits the checkout form.
2. The frontend sends the order to `POST /api/order`.
3. The Node.js server validates the request.
4. Resend sends the order notification to the configured owner email.
5. The owner can reply to the customer's email submitted during checkout.

### Custom order email flow

1. A customer submits the custom order form.
2. The frontend sends the request to `POST /api/custom-order`.
3. The server validates the request and creates a request ID.
4. Resend sends the custom order notification to the configured owner email.

### Required environment variables

Configure these values in Render Environment Variables or in a local `.env` file:

```env
RESEND_API_KEY=your_resend_api_key
RESEND_FROM=crocheyss <orders@crocheyss.dev>
OWNER_EMAIL=your-owner-email@example.com
PORT=3000
```

The sender domain must be verified in Resend before using it for production email delivery.

## Future work

- Customer confirmation emails
- PostgreSQL or Supabase order database
- Admin order dashboard
- Customer accounts and authentication
- Razorpay or Stripe payment integration
- Payment verification and refunds
- Inventory management
- Product image storage
- Order status tracking
- Product reviews and ratings
- Coupon codes and promotions
- Gift wrapping and gift messages
- Automated shipping updates
- Analytics dashboard
