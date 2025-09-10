const fs = require("fs");
const path = require("path");

// Paths
const themesFile = path.join(__dirname, "themes.json");
const pagesDir = path.join(__dirname, "themes-pages");

// Ensure themes-pages folder exists
if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir, { recursive: true });

// Load themes.json
const themes = JSON.parse(fs.readFileSync(themesFile, "utf-8"));

themes.forEach((theme) => {
  const homeBadge = theme.homeType
    ? `<span class="badge home-type">${theme.homeType}</span>`
    : "";

  // Determine theme type
  let themeType = "preloaded";
  if (theme.carrier) {
    themeType = "carrier";
  } else if (theme.author) {
    themeType = "user";
  }

  // Decide if it's preloaded or user-made
  let metaLine = "";
  if (theme.author) {
    metaLine = `<p><strong>Author:</strong> ${theme.author}</p>`;
  } else {
    const originalSafe = Array.isArray(theme.originalModel)
      ? theme.originalModel.join(", ")
      : theme.originalModel;
    metaLine = `<p><strong>Preloaded on:</strong> ${originalSafe}</p>`;
    if (theme.carrier) {
      metaLine += `<p><strong>Carrier:</strong> ${theme.carrier}</p>`;
    }
  }

  // Type badge
  let typeBadge = "";
  if (themeType === "user") {
    typeBadge = `<span class="badge type user-made">User-made</span>`;
  } else if (themeType === "carrier") {
    typeBadge = `<span class="badge type carrier">Carrier</span>`;
  } else {
    typeBadge = `<span class="badge type preloaded">Preloaded</span>`;
  }

  // Platforms text
  const platformsText = Array.isArray(theme.platform)
    ? theme.platform.join(", ")
    : theme.platform || "";

  const themeHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${theme.name}</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <link rel="stylesheet" href="../css/style.css">
  <style>
    /* Fix stretched screenshots */
    .screenshots {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .screenshots img {
      max-width: 300px;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      cursor: pointer;
      object-fit: contain;
      background: #111;
    }

    /* Lightbox */
    #lightbox {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.4);
      backdrop-filter: blur(10px);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }
    #lightbox .content {
      position: relative;
      display: flex;
      align-items: center;
    }
    #lightbox img {
      max-width: 90vw;
      max-height: 90vh;
      border-radius: 8px;
    }
    #lightbox .arrow {
      font-size: 3rem;
      color: white;
      cursor: pointer;
      user-select: none;
      padding: 0 10px;
      transition: color 0.2s;
    }
    #lightbox .arrow:hover {
      color: #ccc;
    }
  </style>
</head>
<body>

  <header>
    <h1>${theme.name}</h1>
    <nav>
      <a href="../index.html">⬅ Home</a>
    </nav>
  </header>

  <main>
    <section class="theme-details">
      <!-- Badges -->
      <div class="badges">
        <span class="badge resolution">${theme.resolution}</span>
        ${homeBadge}
        ${typeBadge}
      </div>

      ${metaLine}
      <p><strong>Supported models:</strong> ${theme.supportedModels.join(", ")}</p>
      <p><strong>Supported platforms:</strong> ${platformsText}</p>

      <h2>Screenshots</h2>
      <div class="screenshots">
        ${theme.screenshots
          .map((s, i) => `<img src="../${s}" alt="${theme.name} screenshot" data-index="${i}">`)
          .join("\n")}
      </div>

      <a class="download-btn" href="../${theme.file}" download>⬇️ Download this Theme</a>
      ${
        theme.swf
          ? `<a class="download-btn" href="../${theme.swf}" download>⬇️ Download Flash Menu (.swf)</a>`
          : ""
      }
    </section>
  </main>

  <!-- Lightbox -->
  <div id="lightbox">
    <div class="content">
      <span class="arrow left">❮</span>
      <img src="" alt="Expanded screenshot">
      <span class="arrow right">❯</span>
    </div>
  </div>

  <footer>
    <p>made by Beamish 🦆</p>
  </footer>

  <!-- Screenshot click handling -->
  <script>
  document.addEventListener("DOMContentLoaded", () => {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = lightbox.querySelector("img");
    const leftArrow = lightbox.querySelector(".arrow.left");
    const rightArrow = lightbox.querySelector(".arrow.right");
    const screenshots = Array.from(document.querySelectorAll(".screenshots img"));
    let currentIndex = 0;

    function openLightbox(index) {
      currentIndex = index;
      lightboxImg.src = screenshots[currentIndex].src;
      lightbox.style.display = "flex";
    }

    function closeLightbox() {
      lightbox.style.display = "none";
      lightboxImg.src = "";
    }

    function showPrev() {
      currentIndex = (currentIndex - 1 + screenshots.length) % screenshots.length;
      lightboxImg.src = screenshots[currentIndex].src;
    }

    function showNext() {
      currentIndex = (currentIndex + 1) % screenshots.length;
      lightboxImg.src = screenshots[currentIndex].src;
    }

    screenshots.forEach((img, i) => {
      img.addEventListener("click", () => openLightbox(i));
    });

    leftArrow.addEventListener("click", e => {
      e.stopPropagation();
      showPrev();
    });

    rightArrow.addEventListener("click", e => {
      e.stopPropagation();
      showNext();
    });

    // Close on click outside the image
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (lightbox.style.display === "flex") {
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") showPrev();
        if (e.key === "ArrowRight") showNext();
      }
    });
  });
  </script>

</body>
</html>`;

  const filePath = path.join(pagesDir, `${theme.id}.html`);
  fs.writeFileSync(filePath, themeHTML, "utf-8");
  console.log(`✅ Theme page generated: ${theme.id}.html`);
});

console.log("🎉 All theme pages generated successfully!");
