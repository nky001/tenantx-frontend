# TenantX Frontend (Next.js)

This frontend is part of **TenantX**, a learning project that demonstrates a multi-tenant UI (organizations → projects → tasks) with JWT-based authentication.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios

## What this frontend demonstrates

- Auth flow (register/login/logout) + persisted auth state (Zustand)
- Tenant-scoped navigation (switch organizations, then view related data)
- Simple forms with validation (React Hook Form + Zod)

## Project Structure

```
frontend/
├── app/              # Next.js app router pages
│   ├── api/          # API routes
│   ├── components/   # Shared components
│   ├── dashboard/    # Dashboard page
│   ├── login/        # Login page
│   ├── organizations/ # Organization management
│   └── register/     # Registration page
├── components/       # Reusable React components
├── lib/              # Utilities, stores, and services
│   ├── auth-store.ts # Authentication state management
│   ├── api.ts        # API client configuration
│   └── services/     # API service functions
└── content/          # Static content and translations
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://zustand-demo.pmnd.rs/)

## License

Apache License 2.0 - see LICENSE file for details

## Links

- [Main Repository](https://github.com/nky001/tenantx-backend)
- [Backend API](http://localhost:8080) (when running)
