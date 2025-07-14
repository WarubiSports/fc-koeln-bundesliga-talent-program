# FC Köln Development Workflow

## Current Environment Issue
- The Replit environment changed from ES modules to CommonJS mode
- This broke `vite.config.ts` due to top-level await not being supported in CommonJS
- The deployment system (`npm run build` and `npm start`) works perfectly
- Only the development server (`npm run dev`) is broken

## Working Solution

### For Development (Testing Changes)
Use the CommonJS development server:
```bash
node server/index-dev.js
```

This provides:
- ✅ Working development server on port 5000
- ✅ Authentication system (max.bisinger@warubi-sports.com / ITP2024)
- ✅ Basic API endpoints for testing
- ✅ Serves the production frontend build
- ✅ Hot-reloadable by restarting the command

### For Deployment (Production)
Use the existing deployment system:
```bash
npm run build    # Creates production build
npm start        # Starts production server
```

This provides:
- ✅ Zero-dependency production server
- ✅ All authentication and database features
- ✅ Optimized frontend build
- ✅ Ready for deployment

## Workflow for Making Changes

1. **Make Code Changes**: Edit files in `client/src/`, `server/`, `shared/`
2. **Test Changes**: 
   - Run `npm run build` to create new build
   - Run `node server/index-dev.js` to test with development server
3. **Deploy Changes**:
   - Run `npm run build` to create final production build
   - The deployment system will use the production build

## Key Files
- `server/index-dev.js` - Development server (CommonJS)
- `production-build.js` - Production build script (working)
- `dist/index.js` - Production server (working)
- `dist/public/` - Production frontend (working)

## Environment Status
- ❌ `npm run dev` - Broken due to vite.config.ts top-level await
- ✅ `node server/index-dev.js` - Working development server
- ✅ `npm run build` - Working production build
- ✅ `npm start` - Working production server
- ✅ Deployment pipeline - Fully functional