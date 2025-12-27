# TenantX Frontend

**Live Demo**: [https://tenantx.niti.life](https://tenantx.niti.life)

A learning project demonstrating multi-tenant architecture with Next.js and TypeScript. This frontend showcases basic authentication, state management, and responsive design patterns.

## 🏗️ Architecture Overview

**Frontend**: Next.js 16 + TypeScript + Tailwind CSS
**Backend**: Spring Boot + AWS Lambda + PostgreSQL

## ✨ Features

- 🔐 **Authentication**: JWT-based auth with email/password and OAuth2
- 🏢 **Multi-Tenant**: Organization-scoped data isolation
- 📱 **Responsive Design**: Mobile-first UI with Tailwind CSS
- 🎯 **TypeScript**: Full type safety
- ⚡ **Next.js 16**: App Router implementation
- 🔄 **State Management**: Zustand for global state
- 📝 **Form Validation**: React Hook Form + Zod
- 🚀 **Deployment**: AWS with CI/CD pipeline

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios

### Backend Integration
- **API**: RESTful endpoints
- **Database**: PostgreSQL
- **Deployment**: AWS Lambda

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/nky001/tenantx-frontend.git
cd tenantx-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API URL
```

### Development

```bash
# Start development server
npm run dev
# Open http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (middleware)
│   ├── components/        # Shared components
│   ├── dashboard/         # Main dashboard
│   ├── login/            # Authentication
│   ├── organizations/    # Org management
│   └── register/         # User registration
├── components/            # Reusable UI components
├── lib/                  # Core utilities
│   ├── auth-store.ts     # Authentication state
│   ├── api.ts           # API client setup
│   └── services/        # Business logic
├── content/              # Static content & i18n
└── public/               # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Development server with hot reload
- `npm run build` - Production build optimization
- `npm run start` - Production server
- `npm run lint` - ESLint code quality checks

## 🌐 Live Deployment

- **Frontend**: [https://tenantx.niti.life](https://tenantx.niti.life)
- **Backend API**: [https://tenantx-api.niti.life](https://tenantx-api.niti.life)

## 🎯 Learning Outcomes

### Frontend Development
- **React Patterns**: Hooks, Context, Custom Hooks
- **TypeScript**: Strict typing and interfaces
- **State Management**: Global state with Zustand
- **API Integration**: RESTful APIs with error handling
- **Form Handling**: Complex forms with validation
- **Responsive Design**: Mobile-first approach

### Full-Stack Integration
- **Authentication**: JWT and OAuth2 flows
- **Multi-Tenant**: Organization-scoped data
- **Deployment**: AWS serverless architecture
- **CI/CD**: Automated testing and deployment

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand State Management](https://zustand-demo.pmnd.rs/)
- [React Hook Form](https://react-hook-form.com/)
- [AWS Lambda](https://aws.amazon.com/lambda/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

Apache License 2.0 - see [LICENSE](LICENSE) file for details

## 🔗 Links

- [Backend Repository](https://github.com/nky001/tenantx-backend)
- [Live Demo](https://tenantx.niti.life)
