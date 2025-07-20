#!/bin/bash

echo "🔍 Looking for working React assets..."

# Find the working assets from previous builds
WORKING_JS=""
WORKING_CSS=""

# Check for assets in various locations
for dir in dist backup-dist .; do
  if [ -d "$dir" ]; then
    JS_FILE=$(find "$dir" -name "*D9rQIHwU*.js" 2>/dev/null | head -1)
    CSS_FILE=$(find "$dir" -name "*DFRn-7AA*.css" 2>/dev/null | head -1)
    
    if [ -n "$JS_FILE" ] && [ -n "$CSS_FILE" ]; then
      WORKING_JS="$JS_FILE"
      WORKING_CSS="$CSS_FILE"
      echo "✅ Found working assets in $dir"
      break
    fi
  fi
done

if [ -n "$WORKING_JS" ] && [ -n "$WORKING_CSS" ]; then
  echo "📦 Restoring working React application..."
  
  # Create dist/public structure
  mkdir -p dist/public/assets
  
  # Copy working assets
  cp "$WORKING_JS" dist/public/assets/
  cp "$WORKING_CSS" dist/public/assets/
  
  # Create proper index.html
  cat > dist/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1" />
    <meta name="theme-color" content="#DC143C" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="FC Köln ITP" />
    <link rel="manifest" href="/manifest.json" />
    <title>1.FC Köln International Talent Program</title>
    <script type="module" crossorigin src="/assets/index-D9rQIHwU.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-DFRn-7AA.css">
  </head>
  <body>
    <div id="root"></div>
    <!-- This is a replit script which adds a banner on the top of the page when opened in development mode outside the replit environment -->
    <script type="text/javascript" src="https://replit.com/public/js/replit-dev-banner.js"></script>
  </body>
</html>
EOF
  
  # Copy logos and manifest
  cp -r client/public/* dist/public/ 2>/dev/null || true
  
  echo "✅ React application restored successfully!"
  echo "📁 Assets: $(ls -la dist/public/assets/)"
  
else
  echo "❌ Could not find working React assets"
  echo "🔧 Need to rebuild from source..."
  exit 1
fi