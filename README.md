# 🌐 MLJNET RADIUS - Professional RADIUS Server Solution

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL">
</div>

<div align="center">
  <h3>🚀 Solusi Autentikasi Network yang Aman, Andal, dan Skalabel</h3>
  <p>Platform monitoring RADIUS server modern untuk ISP, Hotel, WiFi Provider, dan Enterprise</p>
</div>

## 📸 Screenshots

### 🏠 Landing Page Professional
<div align="center">
  <img src="./docs/images/landing-page.png" alt="Landing Page" width="800">
  <p><em>Halaman utama dengan desain modern dan profesional</em></p>
</div>

### 📊 Dashboard Monitoring Real-time
<div align="center">
  <img src="./docs/images/dashboard.png" alt="Dashboard" width="800">
  <p><em>Dashboard monitoring dengan data real-time dan analytics</em></p>
</div>

### 🔐 Login & Authentication
<div align="center">
  <img src="./docs/images/login-page.png" alt="Login Page" width="600">
  <p><em>Halaman login dengan keamanan berlapis</em></p>
</div>

### 📱 Responsive Design
<div align="center">
  <img src="./docs/images/mobile-responsive.png" alt="Mobile View" width="800">
  <p><em>Desain responsif untuk semua perangkat</em></p>
</div>

### 🎨 Company Logo
<div align="center">
  <img src="./docs/images/logo.png" alt="MLJNET RADIUS Logo" width="200">
  <p><em>Logo profesional MLJNET RADIUS</em></p>
</div>

## 🌟 Fitur Utama

### 🔐 **Autentikasi & Keamanan**
- ✅ NextAuth.js v5 dengan Credentials Provider
- ✅ Session management yang aman
- ✅ Password hashing dengan bcrypt
- ✅ Middleware protection untuk routes
- ✅ JWT token authentication

### 📊 **Monitoring Real-time**
- ✅ Dashboard analytics dengan Socket.IO
- ✅ Real-time device status updates
- ✅ Performance metrics dan alerts
- ✅ Historical data tracking
- ✅ Customizable alert rules

### 🎨 **UI/UX Modern**
- ✅ Shadcn/ui component library
- ✅ Dark/Light theme support
- ✅ Responsive design (Mobile-first)
- ✅ Loading states dan error handling
- ✅ Toast notifications system

### 🌐 **Network Management**
- ✅ OLT/ONU device monitoring
- ✅ SNMP configuration support
- ✅ Bulk device management
- ✅ Template-based configuration
- ✅ Connection status monitoring

### 📈 **Business Features**
- ✅ Pricing plans management
- ✅ Customer inquiry system
- ✅ Lead generation forms
- ✅ Professional landing page
- ✅ Contact management

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Components**: Shadcn/ui (New York style)
- **Icons**: Lucide React
- **State Management**: Zustand + TanStack Query
- **Authentication**: NextAuth.js v5

### **Backend**
- **API**: Next.js API Routes
- **Database**: MySQL dengan Prisma ORM
- **Real-time**: Socket.IO
- **Authentication**: NextAuth.js
- **Validation**: Zod schemas
- **File Upload**: Native FormData API

### **Infrastructure**
- **Database**: MySQL 8.0+
- **Caching**: Local memory cache
- **File Storage**: Local filesystem
- **Deployment**: Vercel/Netlify ready

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ 
- MySQL 8.0+
- Git

### **Installation**

1. **Clone Repository**
```bash
git clone https://github.com/mauljasmay/olt-onu-monitoring-panel.git
cd olt-onu-monitoring-panel
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env.local
```

4. **Configure Environment Variables**
```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/mljnet_radius"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# App Configuration
NODE_ENV="development"
```

5. **Database Setup**
```bash
# Push schema to database
npm run db:push

# (Optional) Seed database with sample data
npm run db:seed
```

6. **Start Development Server**
```bash
npm run dev
```

7. **Access Application**
- 🌐 **Landing Page**: http://localhost:3000
- 🔐 **Login**: http://localhost:3000/login
- 📊 **Dashboard**: http://localhost:3000/dashboard

### **Default Admin Account**
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `admin`

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # NextAuth.js endpoints
│   │   ├── contact/       # Contact form API
│   │   ├── dashboard/     # Dashboard API
│   │   ├── olts/          # OLT management API
│   │   └── onus/          # ONU management API
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Login page
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/                # Shadcn/ui components
│   ├── olt-table.tsx      # OLT management table
│   ├── onu-table.tsx      # ONU management table
│   └── theme-toggle.tsx   # Theme switcher
├── hooks/                 # Custom React hooks
│   ├── use-socket.ts      # Socket.IO hook
│   └── use-toast.ts       # Toast notifications
├── lib/                   # Utility libraries
│   ├── auth.ts            # NextAuth.js configuration
│   ├── db.ts              # Prisma client
│   ├── socket.ts          # Socket.IO server
│   └── utils.ts           # Helper functions
└── types/                 # TypeScript type definitions
    ├── auth.ts            # Auth types
    ├── dashboard.ts       # Dashboard types
    └── devices.ts         # Device types
```

## 🔧 Configuration

### **Database Schema**

```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String
  name      String?
  role      String   @default("user")
  createdAt DateTime @default(now())
}

model OLT {
  id          Int      @id @default(autoincrement())
  name        String
  host        String   @unique
  username    String
  password    String
  port        Int      @default(22)
  model       String
  status      String   @default("offline")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ONU {
  id        Int      @id @default(autoincrement())
  serial    String   @unique
  oltId     Int
  olt       OLT      @relation(fields: [oltId], references: [id])
  name      String?
  status    String   @default("offline")
  signal    Float?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### **Environment Variables**

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MySQL connection string | ✅ |
| `NEXTAUTH_SECRET` | JWT secret key | ✅ |
| `NEXTAUTH_URL` | Application URL | ✅ |
| `NODE_ENV` | Environment mode | ❌ |

## 📚 API Documentation

### **Authentication Endpoints**

```http
POST /api/auth/signin
POST /api/auth/signout
GET  /api/auth/session
```

### **Device Management**

```http
GET    /api/olts          # Get all OLT devices
POST   /api/olts          # Create new OLT
PUT    /api/olts/:id      # Update OLT
DELETE /api/olts/:id      # Delete OLT

GET    /api/onus          # Get all ONU devices
POST   /api/onus          # Create new ONU
PUT    /api/onus/:id      # Update ONU
DELETE /api/onus/:id      # Delete ONU
```

### **Dashboard Analytics**

```http
GET /api/dashboard/stats    # Get dashboard statistics
GET /api/dashboard/alerts   # Get system alerts
```

### **Contact & Business**

```http
POST /api/contact           # Submit contact form
```

## 🎯 Use Cases

### **🏨 Hotel & Hospitality**
- WiFi guest authentication
- Room-based access control
- Billing integration

### **🌐 ISP Providers**
- Subscriber management
- Bandwidth control
- Service plan enforcement

### **🏢 Enterprise**
- Corporate network access
- Employee authentication
- Network segmentation

### **📶 WiFi Providers**
- Public hotspot management
- Time-based access
- Marketing integration

## 🔒 Security Features

- **Encryption**: AES-256 data encryption
- **Authentication**: Multi-factor authentication support
- **Session Management**: Secure session handling
- **API Protection**: Route-based middleware
- **Input Validation**: Comprehensive input sanitization
- **CSRF Protection**: Built-in CSRF protection

## 🚀 Deployment

### **Vercel Deployment**

1. **Connect Repository**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

2. **Environment Variables**
- Set all required environment variables in Vercel dashboard
- Configure database connection
- Set NEXTAUTH_URL to your domain

### **Docker Deployment**

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t mljnet-radius .
docker run -p 3000:3000 mljnet-radius
```

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npm run type-check

# Build verification
npm run build
```

## 📈 Performance

- **Lighthouse Score**: 95+ ⚡
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <2s
- **Core Web Vitals**: All green ✅

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **📧 Contact Information**
- **Email**: info@mljnet-radius.com
- **Support**: support@mljnet-radius.com
- **Website**: https://mljnet-radius.com

### **📞 Business Hours**
- **Monday - Friday**: 09:00 - 18:00 WIB
- **Saturday**: 09:00 - 15:00 WIB
- **Sunday**: Closed

### **💬 Live Support**
- **WhatsApp**: +62 812-3456-7890
- **Telegram**: @mljnet-support

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [Shadcn/ui](https://ui.shadcn.com/) - Component Library
- [Prisma](https://www.prisma.io/) - Database ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Socket.IO](https://socket.io/) - Real-time Communication

---

<div align="center">
  <p>Made with ❤️ by <strong>MLJNET RADIUS Team</strong></p>
  <p>© 2024 MLJNET RADIUS. All rights reserved.</p>
</div>