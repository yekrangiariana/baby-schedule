# App Configuration Guide

## How to Customize Your App

All app branding and information can be customized by editing a single file: **`js/config.js`**

### Configuration Options

Open `js/config.js` and edit the following values:

```javascript
const APP_CONFIG = {
  // App Identity
  name: "Baby Schedule",              // Full app name
  shortName: "Baby Schedule",         // Short name (for PWA)
  title: "Baby Schedule - Track Your Baby's Activities",  // Page title & meta title
  
  // Domain and URLs
  domain: "yourdomain.com",           // Your domain name
  baseUrl: "https://yourdomain.com/", // Full base URL with https://
  
  // Descriptions
  description: "Simple baby activity tracker...",     // Full description for SEO
  shortDescription: "Simple baby activity tracker...", // Short description
  keywords: "baby tracker, baby log, ...",            // SEO keywords
  
  // Images
  ogImage: "https://yourdomain.com/og-image.jpg",     // Open Graph image
  twitterImage: "https://yourdomain.com/twitter-image.jpg", // Twitter card image
  
  // Social Media
  locale: "en_US",                    // Locale for Open Graph
  
  // Author
  author: "Baby Schedule",            // Author name
  
  // Theme Colors
  themeColor: "#6A5ACD",             // Browser theme color
  backgroundColor: "#ffffff"          // App background color
};
```

### What Gets Updated

When you change the configuration, the following will automatically update:

1. **Page Title** - Browser tab title
2. **Meta Tags** - SEO description, keywords, author
3. **Open Graph Tags** - Facebook sharing preview
4. **Twitter Card** - Twitter sharing preview
5. **PWA Manifest** - App name in home screen, theme colors
6. **Welcome Screen** - App name display
7. **Structured Data** - JSON-LD for search engines

### Example: Rebranding the App

To rebrand the app as "My Baby Tracker":

```javascript
const APP_CONFIG = {
  name: "My Baby Tracker",
  shortName: "Baby Tracker",
  title: "My Baby Tracker - Track Your Baby's Daily Activities",
  domain: "mybaby-tracker.com",
  baseUrl: "https://mybaby-tracker.com/",
  description: "Track your baby's feeding, sleep, and diaper changes with ease.",
  shortDescription: "Track your baby's daily activities.",
  keywords: "baby tracker, baby activities, feeding log",
  ogImage: "https://mybaby-tracker.com/share-image.jpg",
  twitterImage: "https://mybaby-tracker.com/share-image.jpg",
  locale: "en_US",
  author: "My Baby Tracker",
  themeColor: "#FF6B9D",
  backgroundColor: "#FFF5F7"
};
```

### Notes

- Changes take effect immediately after refreshing the page
- No other files need to be edited
- The manifest.json file is generated dynamically from this configuration
- Make sure to update your actual domain name and image URLs to match your hosting

### Files That Use This Configuration

- `index.html` - Meta tags, title, structured data
- `js/manifest-generator.js` - PWA manifest generation
- Dynamic content in the welcome screen

All these files read from `js/config.js` automatically, so you only need to edit in one place!
