# CulinaMind Frontend

A modern, responsive React TypeScript application for AI-powered recipe generation and meal planning.

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components
│   │   └── FloatingLabelInput.tsx
│   ├── auth/            # Authentication components
│   │   ├── ProfileSettingsModal.tsx
│   │   └── ForgotPasswordModal.tsx
│   ├── common/          # Shared components
│   │   ├── DashboardNavbar.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── useOutsideClick.ts
│   │   └── useUrlParams.ts
│   ├── recipe/          # Recipe-related components
│   └── meal-plan/       # Meal planning components
├── pages/                # Route-based page components
│   ├── auth/            # Authentication pages
│   │   ├── Login.tsx
│   │   ├── SignUp.tsx
│   │   ├── ResetPassword.tsx
│   │   └── VerifyOTP.tsx
│   ├── dashboard/       # Dashboard feature pages
│   │   ├── Dashboard.tsx
│   │   ├── RecipeTab.tsx
│   │   ├── MealPlanTab.tsx
│   │   ├── AIAssistantTab.tsx
│   │   ├── Recipe.tsx
│   │   ├── RecipeSearch.tsx
│   │   ├── Favorites.tsx
│   │   ├── Account.tsx
│   │   ├── ProfileSettings.tsx
│   │   └── ProfileTab.tsx
│   └── public/          # Public pages
│       └── Welcome.tsx
├── services/            # API services and external integrations
│   └── api.ts
├── types/               # TypeScript interfaces and types
│   └── index.ts
├── constants/           # Application constants and configuration
│   └── index.ts
├── store/               # State management
│   └── index.ts
├── styles/              # Custom CSS and styling
│   └── index.css
├── tests/               # Test files and setup
│   └── setup.ts
├── layouts/             # Layout components
│   └── Wrapper.tsx
├── assets/              # Static assets
│   ├── icons/
│   └── images/
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

## 🛠️ Development

### Component Organization

#### **UI Components** (`src/components/ui/`)
Basic, reusable UI components that don't have business logic:
- `FloatingLabelInput.tsx` - Enhanced input component with floating labels

#### **Feature Components** (`src/components/recipe/`, `src/components/meal-plan/`)
Components specific to application features:
- Recipe generation and display
- Meal planning and management
- Shopping list functionality

#### **Common Components** (`src/components/common/`)
Shared components used across multiple features:
- `DashboardNavbar.tsx` - Main navigation
- `ProtectedRoute.tsx` - Route protection
- Custom hooks for common functionality

### Page Organization

#### **Authentication Pages** (`src/pages/auth/`)
User authentication and account management:
- Login, signup, password reset
- OTP verification
- Profile management

#### **Dashboard Pages** (`src/pages/dashboard/`)
Main application features:
- Recipe generation and search
- Meal planning
- AI cooking assistant
- User favorites and account

#### **Public Pages** (`src/pages/public/`)
Public-facing content:
- Welcome/landing page
- Marketing content

### State Management

The application uses a centralized store structure (`src/store/`) that can be expanded with:
- Redux Toolkit
- Zustand
- React Context + useReducer

### API Services

All external API calls are centralized in `src/services/api.ts`:
- Authentication endpoints
- Recipe generation
- User management
- AI chatbot integration

## 🎨 Styling

### Tailwind CSS
Primary styling framework with custom configuration:
- Responsive design utilities
- Custom color palette
- Component variants

### Custom CSS (`src/styles/index.css`)
Additional styles beyond Tailwind:
- Custom animations
- Component-specific styles
- Accessibility improvements
- Print styles

### Design System
Consistent design tokens defined in `src/constants/index.ts`:
- Color palette
- Typography scale
- Spacing system
- Component variants

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```bash
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### TypeScript Configuration
- Strict type checking enabled
- Path aliases for clean imports
- Custom type definitions

### ESLint Configuration
Modern ESLint setup with:
- TypeScript support
- React best practices
- Accessibility rules

## 🧪 Testing

### Test Setup (`src/tests/setup.ts`)
- Mock implementations for browser APIs
- Test environment configuration
- Utility functions for testing

### Testing Strategy
- Unit tests for components
- Integration tests for features
- E2E tests for user workflows

## 📱 Responsive Design

### Breakpoints
- Mobile: 320px - 640px
- Tablet: 641px - 1024px
- Desktop: 1025px+

### Mobile-First Approach
- Responsive components
- Touch-friendly interactions
- Optimized for mobile performance

## ♿ Accessibility

### WCAG Compliance
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility

### Features
- High contrast mode support
- Reduced motion preferences
- Focus management
- Color contrast compliance

## 🚀 Performance

### Optimization Strategies
- Code splitting with React.lazy
- Memoization for expensive components
- Image optimization
- Bundle size analysis

### Monitoring
- Performance metrics
- Error tracking
- User experience analytics

## 🔒 Security

### Authentication
- JWT token management
- Secure token storage
- OAuth integration (Google)
- Password security

### Data Protection
- Input validation
- XSS prevention
- CSRF protection
- Secure API communication

## 📦 Build & Deployment

### Build Process
```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Deployment
- Vercel (recommended)
- Netlify
- AWS S3 + CloudFront
- Docker containerization

## 🤝 Contributing

### Development Workflow
1. Create feature branch
2. Follow component organization
3. Add tests for new features
4. Update documentation
5. Submit pull request

### Code Standards
- TypeScript strict mode
- ESLint rules compliance
- Prettier formatting
- Conventional commits

### Component Guidelines
- Single responsibility principle
- Props interface definition
- Error boundary usage
- Performance optimization

## 📚 Additional Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

### Tools
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

## 🆘 Troubleshooting

### Common Issues
1. **Import errors** - Check file paths after reorganization
2. **Type errors** - Verify TypeScript interfaces
3. **Styling issues** - Check Tailwind classes and custom CSS
4. **Build failures** - Clear node_modules and reinstall

### Getting Help
- Check existing issues
- Review component documentation
- Consult team members
- Create detailed bug reports

## 🎯 Future Enhancements

### Planned Features
- Dark mode support
- Internationalization (i18n)
- Progressive Web App (PWA)
- Advanced meal planning
- Recipe sharing and social features

### Technical Improvements
- Advanced state management
- Performance monitoring
- Automated testing
- CI/CD pipeline
- Micro-frontend architecture
