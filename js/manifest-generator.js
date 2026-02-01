// Generate manifest.json dynamically based on config
// This should be called on page load to ensure manifest is up to date

function generateManifest() {
  if (!window.APP_CONFIG) return;

  const config = window.APP_CONFIG;

  const manifest = {
    name: config.name,
    short_name: config.shortName,
    description: config.description,
    start_url: "/",
    display: "standalone",
    background_color: config.backgroundColor,
    theme_color: config.themeColor,
    orientation: "portrait",
    scope: "/",
    lang: "en-US",
    categories: ["lifestyle", "health"],
    icons: [
      {
        src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍼</text></svg>",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshot-mobile.jpg",
        sizes: "390x844",
        type: "image/jpeg",
        form_factor: "narrow",
      },
      {
        src: "/screenshot-desktop.jpg",
        sizes: "1280x720",
        type: "image/jpeg",
        form_factor: "wide",
      },
    ],
    shortcuts: [
      {
        name: "Log Activity",
        short_name: "Log",
        description: "Quickly log a baby activity",
        url: "/",
        icons: [
          {
            src: "/shortcut-log.png",
            sizes: "96x96",
          },
        ],
      },
    ],
  };

  // Create a blob and URL for the manifest
  const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], {
    type: "application/json",
  });
  const manifestURL = URL.createObjectURL(manifestBlob);

  // Update or create the manifest link
  let manifestLink = document.querySelector('link[rel="manifest"]');
  if (manifestLink) {
    manifestLink.setAttribute("href", manifestURL);
  } else {
    manifestLink = document.createElement("link");
    manifestLink.setAttribute("rel", "manifest");
    manifestLink.setAttribute("href", manifestURL);
    document.head.appendChild(manifestLink);
  }
}

// Run on load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", generateManifest);
} else {
  generateManifest();
}
