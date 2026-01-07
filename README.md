# E-Kart - Modern E-commerce Platform

A modern, responsive e-commerce platform built with React, TypeScript, and Supabase.

## 🚀 Quick Start

### Local Development
```bash
# Clone the repository
git clone https://github.com/jeredson/e-kart.git
cd e-kart

# Install dependencies
npm install

# Start development server
npm run dev
```

### Deploy to Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jeredson/e-kart)

Or follow the [Deployment Guide](./DEPLOYMENT.md) for detailed instructions.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **State Management**: React Context, TanStack Query
- **Backend**: Supabase (Database, Auth, Storage)
- **Routing**: React Router DOM
- **Deployment**: Vercel

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, Cart)
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── lib/                # Utility functions
├── pages/              # Page components
└── main.tsx           # App entry point
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📱 Features

- 🛒 Shopping cart functionality
- 👤 User authentication
- 📱 Responsive design
- 🔍 Product search and filtering
- ⭐ Product reviews and ratings
- 👨‍💼 Admin panel for product management
- 🎨 Modern UI with dark/light theme support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
