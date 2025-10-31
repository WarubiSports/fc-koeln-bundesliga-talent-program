# FC Köln Bundesliga Talent Program - Warubi Sports Platform

A comprehensive multi-tenant sports management platform built for 1.FC Köln International Talent Program. Features include player management, food ordering, training schedules, chore tracking, and admin panels.

## 🚀 Features

- **User Management**: Add/edit players, staff, and admin accounts
- **Food Ordering System**: €35 budget, twice weekly grocery orders
- **Training Schedule**: Apple Calendar-style monthly grid with recurring events
- **Chores & Tasks**: Weekly rotation system with staff verification
- **Players Overview**: Injury tracking, stats, filters, and sorting
- **Player Profiles**: View/edit personal info, emergency contacts, medical data
- **Inventory Management**: Staff can manage grocery items
- **Multi-tenancy**: Secure app isolation with API key authentication

## 🛠 Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (Neon serverless)
- **Authentication**: JWT with bcrypt password hashing
- **Frontend**: Vanilla HTML/CSS/JavaScript with FC Köln branding
- **Email**: SendGrid integration
- **Security**: Helmet, CORS, rate limiting, role-based access control

## 📦 Environment Variables

Required environment variables for deployment:

```env
# Database
DATABASE_URL=your_postgresql_connection_string
PGHOST=your_db_host
PGPORT=5432
PGUSER=your_db_user
PGPASSWORD=your_db_password
PGDATABASE=your_db_name

# Authentication
JWT_SECRET=your_super_secret_jwt_key

# Admin API (optional)
ADMIN_API_KEY=your_admin_api_key

# Email (optional - for password reset)
SENDGRID_API_KEY=your_sendgrid_key
```

## 🚂 Deploy to Railway

### Prerequisites
1. GitHub account
2. Railway account (sign up at [railway.app](https://railway.app))

### Deployment Steps

1. **Push to GitHub** (see instructions below)

2. **Create New Project on Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect Node.js and start building

3. **Add Environment Variables**
   - Go to your project → Settings → Variables
   - Add all required environment variables listed above
   - Railway provides PostgreSQL database addon if needed

4. **Generate Public Domain**
   - Go to Settings → Networking
   - Click "Generate Domain"
   - Your app will be live at `https://your-app.up.railway.app`

5. **Set up Database** (if using Railway PostgreSQL)
   - Add PostgreSQL service to your project
   - Railway auto-generates DATABASE_URL
   - Run migrations if needed

### Railway Auto-Configuration

Railway automatically detects:
- ✅ Node.js runtime from `package.json`
- ✅ Start command: `npm start`
- ✅ Build command: `npm run build`
- ✅ Port from `process.env.PORT` (dynamically assigned)

## 📝 Push to GitHub

### Method 1: Using Git Commands (Recommended)

```bash
# 1. Create a new repository on GitHub (don't add README or .gitignore)

# 2. Open Shell in Replit and run:
git init
git add .
git commit -m "Initial commit - FC Köln Talent Program"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git push -u origin main
```

### Method 2: Using Replit's Version Control UI

1. Click the **Version Control** icon in Replit's left sidebar
2. Click **Connect to GitHub**
3. Select "Create new repository"
4. Add files, commit message, and push

## 🏃‍♂️ Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Server runs on http://localhost:5000
```

## 🔐 Default Test Credentials

**Player Account:**
- Email: `test@fckoln.de`
- Password: `test123`

**Staff Account:**
- Email: `staff@fckoln.de`
- Password: `staff123`

## 📊 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript files
- `npm run db:push` - Push database schema changes

## 🏗 Project Structure

```
├── server/               # Backend code
│   ├── routes/          # API routes (fckoln.mjs)
│   ├── middleware/      # Auth, CORS, rate limiting
│   ├── utils/           # Logger, SendGrid
│   └── index.ts         # Server entry point
├── public/              # Frontend static files
│   ├── index.html       # Login page
│   ├── dashboard.html   # Main dashboard
│   ├── user-management.html
│   ├── grocery-order.html
│   ├── schedule.html
│   └── ...             # Other pages
├── shared/              # Shared types and schemas
└── package.json

```

## 🔒 Security Features

- Bcrypt password hashing
- JWT token authentication
- Role-based access control (player, staff, admin)
- API key authentication per app
- Rate limiting per app
- CORS protection
- Helmet security headers
- SQL injection protection (parameterized queries)
- Self-account deletion prevention

## 📱 Features by Role

**Players:**
- Food orders (€35 budget)
- View training schedule
- Complete assigned chores
- Edit personal profile

**Staff:**
- All player features
- View consolidated orders
- Manage chore assignments
- View all players overview
- Create/manage schedule events
- Manage inventory items
- **Add/edit/delete users**

**Admin:**
- All staff features
- Full system access

## 🎯 Key Endpoints

- `POST /api/fckoln/auth/login` - User login
- `GET /api/fckoln/admin/users` - List users (staff/admin)
- `POST /api/fckoln/admin/users` - Create user (staff/admin)
- `PUT /api/fckoln/admin/users/:id` - Update user (staff/admin)
- `DELETE /api/fckoln/admin/users/:id` - Delete user (staff/admin)
- `GET /api/fckoln/grocery/items` - Get grocery items
- `POST /api/fckoln/grocery/orders` - Create order
- `GET /api/fckoln/events` - Get calendar events
- `GET /healthz` - Health check

## 🤝 Contributing

This is a production application for 1.FC Köln International Talent Program.

## 📄 License

Proprietary - 1.FC Köln / Warubi Sports

## 🌐 Powered By

Warubi Sports Platform - Multi-tenant sports management infrastructure

---

**Built with ❤️ for FC Köln Bundesliga Talent Program**
