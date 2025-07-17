# FC Köln Management System - Replit Deployment Ready

## Overview
This is a simplified, deployment-ready version of the FC Köln International Talent Program Management System. The application has been restructured for seamless deployment on Replit while maintaining core functionality.

## Key Features
- **Thomas Delivery Fix**: Resolves the "Message is not a valid html token" error
- **Staff Authentication**: Thomas Ellinger can complete food deliveries
- **Zero Dependencies**: No external packages required for deployment
- **Replit Optimized**: Single-file structure for easy deployment

## Authentication System
The system includes the following user credentials:

| User | Email | Password | Role | Permissions |
|------|-------|----------|------|-------------|
| Max Bisinger | max.bisinger@warubi-sports.com | ITP2024 | admin | Full access |
| Thomas Ellinger | thomas.ellinger@warubi-sports.com | ITP2024 | staff | Delivery completion |
| Thomas Ellinger (Alt) | th.el@warubi-sports.com | ITP2024 | staff | Delivery completion |

## API Endpoints

### Authentication
- `POST /api/auth/simple-login` - User login
- `GET /api/auth/user` - Get current user info

### Health Check
- `GET /api/health` - Server health status

### Food Orders
- `PATCH /api/food-orders/{id}/complete` - Complete delivery (staff/admin only)

## Deployment Instructions

### Option 1: Direct Deployment (Recommended)
1. The main application is in `index.js`
2. Click the Replit Deploy button
3. The application will start automatically

### Option 2: Build Process
1. Run `npm run build` to create production build
2. Run `npm run start` to start production server
3. Application will be available on the configured port

## File Structure
```
├── index.js              # Main application server (deployment-ready)
├── production-build.js   # Build script for dist folder
├── dist/                 # Production build output
│   ├── index.js          # Production server
│   ├── package.json      # Production config
│   └── public/           # Static files
├── server/               # Development server files
├── client/               # Frontend source files
└── README.md            # This file
```

## Testing the Deployment
Once deployed, you can test the system:

1. **Health Check**: `GET /api/health`
2. **Login Test**: Use Thomas's credentials to authenticate
3. **Delivery Test**: Complete a food order to verify the fix

## Technical Details
- **Runtime**: Node.js 18+
- **Format**: CommonJS (no ES modules)
- **Dependencies**: Zero external dependencies
- **Port**: Configurable via PORT environment variable (default: 5000)

## Problem Resolution
This deployment fixes the following issues:
- ✅ "Message is not a valid html token" error for Thomas
- ✅ Module resolution conflicts in production
- ✅ CommonJS vs ES modules compatibility
- ✅ External dependency conflicts
- ✅ Replit deployment "promotion failed" errors

## Development vs Production
- **Development**: Use the full stack with React frontend and Express backend
- **Production**: Use the simplified `index.js` for deployment
- **Authentication**: Both systems use the same credential system

## Support
For issues or questions, refer to the main project documentation or contact the development team.