# ITU Online Store

## Setup Instructions

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and fill in the required values.
4. Start the server:
   ```bash
   npm start
   ```
5. Open your browser and navigate to `http://localhost:3000`.

## Features
- Full-featured online store with cart, filtering, and search.
- Admin dashboard for managing products, orders, and analytics.
- User profile with address book and order tracking.
- Build-Your-Own-PC functionality with compatibility checks.
- Light/dark mode toggle.
- SEO-ready with meta tags and sitemap.

## Security
- Session management with `express-session`.
- Environment variables for sensitive configurations.

## Notes
- Replace placeholders in `.env` with actual values for production use.
- Ensure HTTPS is enabled for secure cookies in production.
