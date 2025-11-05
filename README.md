# Admin Panel - Production Ready React + Tailwind CSS

A comprehensive, production-ready admin panel built with React, TypeScript, and Tailwind CSS. Features a responsive sidebar, dark navy theme (#1F3556), and complete dashboard functionality.

## 🚀 Features

### Layout & Responsiveness
- ✅ Responsive sidebar (overlay on mobile, persistent on desktop)
- ✅ Profile avatar toggle for sidebar control
- ✅ Smooth slide animations and focus management
- ✅ ESC key and backdrop click to close overlay
- ✅ Accessible keyboard navigation

### Core Pages
- ✅ **Dashboard** - Stats cards, charts, quick actions
- ✅ **User Management** - Searchable table, CSV export, user actions
- ✅ **KYC Management** - Document review with approve/reject workflow
- ✅ **Wallet Management** - Top-up requests, manual credit/debit, low balance alerts
- ✅ **Transaction Management** - Filterable transactions, status updates, refunds
- ✅ **Commission Settings** - Editable service commission rates
- ✅ **Service Control** - Toggle services, configure API keys
- ✅ **Reports** - Charts for recharge, commission, wallet analytics
- ✅ **Referral & Cashback** - Manage referral programs and cashback campaigns
- ✅ **Support & Feedback** - Ticket management system
- ✅ **CMS Management** - WYSIWYG editor for content pages
- ✅ **Notification Management** - Send push/SMS/email broadcasts
- ✅ **Admin Profile** - Profile management and role-based permissions

### Design System
- ✅ Navy theme (#1F3556) with light blue backgrounds (#EAF6FF)
- ✅ Semantic design tokens (HSL colors only)
- ✅ Custom component variants
- ✅ Pin input components with square boxes
- ✅ Consistent rounded cards (rounded-xl) and shadows

### Technical Features
- ✅ TypeScript with strict typing
- ✅ React Query for data management
- ✅ React Router for navigation
- ✅ Heroicons for consistent iconography
- ✅ Recharts for data visualization
- ✅ React Quill for rich text editing
- ✅ CSV export functionality
- ✅ Mock data layer with realistic sample data

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── AdminLayout.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   └── ui/
│       ├── pin-input.tsx
│       └── [shadcn components]
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   ├── useKeyboardShortcuts.ts
│   ├── useFocusTrap.ts
│   └── use-mobile.tsx
├── mocks/
│   └── data.ts
├── pages/
│   ├── Dashboard.tsx
│   ├── UserManagement.tsx
│   ├── KYCManagement.tsx
│   ├── WalletManagement.tsx
│   ├── TransactionManagement.tsx
│   ├── CommissionSettings.tsx
│   ├── ServiceControl.tsx
│   ├── Reports.tsx
│   ├── ReferralCashback.tsx
│   ├── Support.tsx
│   ├── CMSManagement.tsx
│   └── NotificationManagement.tsx
├── lib/
│   └── utils.ts
└── App.tsx
```

## 🛠 Installation & Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Build for production:**
```bash
npm run build
```

## 🎨 Design Tokens

### Colors
- **Primary**: #1F3556 (Dark Navy)
- **Background**: #EAF6FF (Light Blue)
- **Cards**: #FFFFFF (White)
- **Success**: Green variants
- **Warning**: Orange variants
- **Error**: Red variants

### Key Components
- **Sidebar**: Collapsible with smooth animations
- **Header**: Profile avatar, search, notifications
- **Cards**: Rounded corners (rounded-xl) with shadows
- **Tables**: Sortable, filterable, with pagination
- **Forms**: Consistent styling with focus states

## 🔐 Authentication

Mock authentication is included. Default credentials:
- **Email**: admin@example.com
- **Password**: admin123

## 📊 Mock Data

Comprehensive mock data includes:
- Users with KYC status and wallet balances
- Transaction history with various statuses
- KYC documents and approval workflow
- Commission settings for different services
- Support tickets and responses
- Referral and cashback data

## 🎯 Key Features

### Sidebar Behavior
- **Mobile/Tablet** (<1024px): Hidden by default, slides in as overlay
- **Desktop** (≥1024px): Persistent sidebar with collapse option
- **Toggle**: Profile avatar button in top-left header
- **Accessibility**: Focus trap, ESC key support, ARIA labels

### Data Management
- Real-time updates for status changes
- CSV export functionality
- Pagination and filtering
- Search across multiple fields

### User Experience
- Responsive design for all screen sizes
- Loading states and error handling
- Toast notifications for actions
- Keyboard shortcuts (Ctrl/Cmd + B for sidebar toggle)

## 🚀 Deployment

The application is ready for deployment on any static hosting service:

```bash
npm run build
```

Deploy the `dist` folder to your preferred hosting platform (Vercel, Netlify, etc.).

## 🔧 Customization

### Adding New Pages
1. Create page component in `src/pages/`
2. Add route to `src/App.tsx`
3. Add navigation item to `src/components/layout/Sidebar.tsx`

### Styling
- All colors are defined in `src/index.css` using HSL
- Component variants in Tailwind config
- Use semantic design tokens only

### Mock Data
- Add new mock data to `src/mocks/data.ts`
- Follow existing patterns for data structure

## 📝 License

This project is open source and available under the MIT License.