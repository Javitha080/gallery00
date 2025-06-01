#!/bin/bash

# This script prepares the application for Netlify deployment
echo "Starting Netlify build process..."

# Install dependencies
npm install

# Build client-side only (we'll skip server-side build for static hosting)
npx vite build

# Apply post-build optimizations
echo "Applying post-build optimizations..."

# Create _redirects file for SPA routing
echo "/* /index.html 200" > dist/_redirects

# Create robots.txt file
echo -e "User-agent: *\nAllow: /" > dist/robots.txt

# Create a simple sitemap
echo '<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://homagama-maha-vidyalaya.netlify.app/</loc>
    <lastmod>'$(date +%Y-%m-%d)'</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>' > dist/sitemap.xml

echo "Build completed successfully!"