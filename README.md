This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public site URL (no trailing slash). Used for SEO metadata, `sitemap.xml` and `robots.txt`. Falls back to `http://localhost:3000`. |
| `WEATHER_API_KEY` | [WeatherAPI.com](https://www.weatherapi.com/) key. Used server-side by `/api/weather` — **not** `NEXT_PUBLIC_`, so it never reaches the client bundle. |
| `RESEND_API_KEY` | [Resend](https://resend.com/) API key for the contact form. |
| `RESEND_TO_EMAIL` | Destination address that receives contact-form submissions. |

> **Resend sandbox note:** the contact route sends from `onboarding@resend.dev`,
> Resend's shared sandbox sender. Without a **verified domain**, Resend only
> delivers to the email address of the account that owns the API key. For
> production, verify your own domain and update the `from` address in
> `src/app/api/contact/route.ts`.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
