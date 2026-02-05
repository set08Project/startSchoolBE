# Vercel Web Analytics Integration

This document explains how Vercel Web Analytics has been integrated into the School Management API project.

## Overview

Vercel Web Analytics has been set up to track visitor data and page views. Since this is a backend API built with Express.js, the analytics implementation focuses on providing guidance for frontend applications that consume this API.

## What's Been Added

### 1. Package Installation

The `@vercel/analytics` package has been added to the project dependencies:

```bash
npm install @vercel/analytics
```

### 2. Analytics Demo Page

A comprehensive demo page has been created at `/analytics` that:
- Explains how to integrate Vercel Web Analytics in various frontend frameworks
- Provides code examples for React, Next.js, Vue, SvelteKit, and plain HTML
- Includes the actual analytics tracking script for demonstration
- Documents the API endpoints and features

**Access the demo:** Visit `https://your-domain.com/analytics` after deployment

### 3. Updated Build Process

The build scripts have been updated to ensure all view files (including the analytics demo) are properly copied to the dist folder:

```json
"build": "tsc && cp -r views dist/"
```

## For Frontend Developers

If you're building a frontend application that consumes this School Management API, follow these steps to add analytics:

### React / Create React App

```bash
npm install @vercel/analytics
```

```jsx
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  return (
    <div>
      {/* Your app content */}
      <Analytics />
    </div>
  );
}
```

### Next.js (App Router)

```tsx
import { Analytics } from '@vercel/analytics/next';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Next.js (Pages Router)

```tsx
import { Analytics } from '@vercel/analytics/next';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}

export default MyApp;
```

### Vue

```vue
<script setup>
import { Analytics } from '@vercel/analytics/vue';
</script>

<template>
  <Analytics />
  <!-- your content -->
</template>
```

### Plain HTML

```html
<script>
  window.va = window.va || function () { 
    (window.vaq = window.vaq || []).push(arguments); 
  };
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

### Vanilla JavaScript

```javascript
import { inject } from '@vercel/analytics';

inject();
```

## Enabling Analytics on Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click on the **Analytics** tab
4. Click **Enable** to activate Web Analytics

> **Note:** After enabling, new routes scoped at `/_vercel/insights/*` will be added to your project after the next deployment.

## Verification

After deploying and implementing analytics:

1. Visit your website
2. Open browser DevTools (F12)
3. Go to the Network tab
4. Look for a request to `/_vercel/insights/view`
5. If you see this request, analytics is working correctly!

## API Integration

The main API endpoints remain unchanged. The analytics tracking is handled on the frontend side and doesn't affect your API calls:

- **API Base:** `/api`
- **Analytics Demo:** `/analytics`
- **Root:** `/` (includes analytics info in response)

## Privacy & Compliance

Vercel Web Analytics is:
- ✅ Privacy-friendly
- ✅ GDPR compliant
- ✅ Cookie-free
- ✅ Lightweight (< 1KB)

Learn more: [Vercel Analytics Privacy Policy](https://vercel.com/docs/analytics/privacy-policy)

## Resources

- [Vercel Analytics Documentation](https://vercel.com/docs/analytics)
- [Package Reference](https://vercel.com/docs/analytics/package)
- [Custom Events](https://vercel.com/docs/analytics/custom-events)
- [Troubleshooting](https://vercel.com/docs/analytics/troubleshooting)

## Support

For questions or issues related to analytics integration, please refer to:
- Demo page at `/analytics`
- [Vercel Analytics Docs](https://vercel.com/docs/analytics)
- [GitHub Issues](https://github.com/set08Project/startSchoolBE/issues)
