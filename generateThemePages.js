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

  // Alternate flash menus
  let altFlashMenusBlock = "";
  if (theme.alternateFlashMenus && theme.alternateFlashMenus.length > 0) {
    altFlashMenusBlock = `
      <h2>Alternate Flash Menus</h2>
      <div class="alt-flash-menus">
        ${theme.alternateFlashMenus
          .map(
            (alt, i) => `
            <div class="alt-flash-menu">
              <div class="alt-card">
                <img src="../${alt.screenshot}" alt="Alternate Flash Menu ${i + 1}" 
                     class="alt-screenshot" data-alt-index="${i}">
                ${
                  alt.note
                    ? `<div class="theme-note">${alt.note}</div>`
                    : ""
                }
                <a class="download-btn" href="../${alt.file}" download>
                  ⬇️ Download Alternate Flash Menu
                </a>
              </div>
            </div>`
          )
          .join("\n")}
      </div>`;
  }

  // Platforms text
  const platformsText = Array.isArray(theme.platform)
    ? theme.platform.join(", ")
    : theme.platform || "";

  // Optional note block
  const noteBlock = theme.note
    ? `<div class="theme-note">${theme.note}</div>`
    : "";

  const themeHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${theme.name}</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <link rel="stylesheet" href="../css/style.css">
  <style>
    /* Screenshots */
    .screenshots {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: center;
    }
    .screenshots img,
    .alt-card img {
      max-width: 300px;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      cursor: pointer;
      object-fit: contain;
      transition: transform 0.2s ease-in-out;
    }
    .screenshots img:hover,
    .alt-card img:hover {
      transform: scale(1.05);
    }

    /* Theme note */
    .theme-note {
      background: #f9f9f9;
      border-left: 4px solid #4a90e2;
      padding: 10px 14px;
      margin: 8px auto; /* centered under image */
      border-radius: 6px;
      font-size: 0.95em;
      color: #333;
      max-width: 300px; /* match image width */
      text-align: left;
    }

    /* Alternate flash menus */
    .alt-flash-menus {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-top: 20px;
      justify-content: center;
    }
    .alt-flash-menu {
      text-align: center;
    }
    .alt-card {
      display: inline-block;
      text-align: center;
    }
    .alt-card .download-btn {
      display: block;
      margin: 8px auto 0 auto;
      max-width: 300px; /* match image width */
    }

    /* Lightbox shared styles */
    .lightbox {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.4);
      backdrop-filter: blur(10px);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }
    .lightbox .content {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
    }
    .lightbox .img-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease-out;
    }
    .lightbox img {
      max-width: 90vw;
      max-height: 90vh;
      border-radius: 8px;
      pointer-events: none;
    }
    .lightbox .arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      font-size: 3rem;
      color: white;
      cursor: pointer;
      user-select: none;
      padding: 0 10px;
      transition: color 0.2s;
    }
    .lightbox .arrow.left { left: -3rem; }
    .lightbox .arrow.right { right: -3rem; }
    .lightbox .arrow:hover { color: #ccc; }
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

      ${noteBlock}

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
${altFlashMenusBlock}

    </section>
  </main>

  <!-- Main Lightbox (with arrows) -->
  <div id="lightbox-main" class="lightbox">
    <div class="content">
      <div class="img-wrapper">
        <span class="arrow left">❮</span>
        <img src="" alt="Expanded screenshot">
        <span class="arrow right">❯</span>
      </div>
    </div>
  </div>

  <!-- Alt Lightbox (no arrows, with zoom/drag) -->
  <div id="lightbox-alt" class="lightbox">
    <div class="content">
      <div class="img-wrapper">
        <img src="" alt="Expanded alternate screenshot">
      </div>
    </div>
  </div>

  <footer>
    <p>made by Beamish 🦆</p>
  </footer>

  <script>
  document.addEventListener("DOMContentLoaded", () => {
    // --- Main screenshots lightbox ---
    const mainLightbox = document.getElementById("lightbox-main");
    const mainWrapper = mainLightbox.querySelector(".img-wrapper");
    const mainImg = mainWrapper.querySelector("img");
    const leftArrow = mainWrapper.querySelector(".arrow.left");
    const rightArrow = mainWrapper.querySelector(".arrow.right");
    const screenshots = Array.from(document.querySelectorAll(".screenshots img"));
    let currentIndex = 0;
    let scale = 1;
    let posX = 0, posY = 0;
    let isDragging = false, startX, startY;

    function updateTransform() {
      mainWrapper.style.transform = \`translate(\${posX}px, \${posY}px) scale(\${scale})\`;
    }
    function openLightbox(index) {
      currentIndex = index;
      mainImg.src = screenshots[currentIndex].src;
      mainLightbox.style.display = "flex";
      resetView();
    }
    function closeLightbox() {
      mainLightbox.style.display = "none";
      mainImg.src = "";
    }
    function showPrev() {
      currentIndex = (currentIndex - 1 + screenshots.length) % screenshots.length;
      mainImg.src = screenshots[currentIndex].src;
      resetView();
    }
    function showNext() {
      currentIndex = (currentIndex + 1) % screenshots.length;
      mainImg.src = screenshots[currentIndex].src;
      resetView();
    }
    function resetView() {
      scale = 1.2;
      posX = 0; posY = 0;
      updateTransform();
    }
    screenshots.forEach((img, i) => {
      img.addEventListener("click", () => openLightbox(i));
    });
    leftArrow.addEventListener("click", e => { e.stopPropagation(); showPrev(); });
    rightArrow.addEventListener("click", e => { e.stopPropagation(); showNext(); });
    mainLightbox.addEventListener("click", (e) => {
      if (!mainWrapper.contains(e.target)) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (mainLightbox.style.display === "flex") {
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") showPrev();
        if (e.key === "ArrowRight") showNext();
      }
    });
    mainWrapper.addEventListener("mousedown", (e) => {
      isDragging = true;
      startX = e.clientX - posX;
      startY = e.clientY - posY;
      e.preventDefault();
    });
    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        posX = 0; posY = 0;
        updateTransform();
      }
    });
    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        posX = e.clientX - startX;
        posY = e.clientY - startY;
        updateTransform();
      }
    });
    mainWrapper.addEventListener("wheel", (e) => {
      e.preventDefault();
      scale += e.deltaY < 0 ? 0.1 : -0.1;
      if (scale < 0.5) scale = 0.5;
      if (scale > 5) scale = 5;
      updateTransform();
    });
    mainWrapper.addEventListener("dblclick", () => {
      if (scale > 1) {
        scale = 1.2; posX = 0; posY = 0;
      } else {
        scale = 2;
      }
      updateTransform();
    });

    // --- Alternate flash menu lightbox ---
    const altLightbox = document.getElementById("lightbox-alt");
    const altWrapper = altLightbox.querySelector(".img-wrapper");
    const altImg = altWrapper.querySelector("img");
    const altScreenshots = Array.from(document.querySelectorAll(".alt-card img"));

    let altScale = 1;
    let altPosX = 0, altPosY = 0;
    let altDragging = false, altStartX, altStartY;

    function updateAltTransform() {
      altWrapper.style.transform = \`translate(\${altPosX}px, \${altPosY}px) scale(\${altScale})\`;
    }
    altScreenshots.forEach((img) => {
      img.addEventListener("click", () => {
        altImg.src = img.src;
        altLightbox.style.display = "flex";
        altScale = 1.2; altPosX = 0; altPosY = 0;
        updateAltTransform();
      });
    });
    altLightbox.addEventListener("click", (e) => {
      if (!altWrapper.contains(e.target)) {
        altLightbox.style.display = "none";
        altImg.src = "";
      }
    });
    document.addEventListener("keydown", (e) => {
      if (altLightbox.style.display === "flex" && e.key === "Escape") {
        altLightbox.style.display = "none";
        altImg.src = "";
      }
    });
    altWrapper.addEventListener("mousedown", (e) => {
      altDragging = true;
      altStartX = e.clientX - altPosX;
      altStartY = e.clientY - altPosY;
      e.preventDefault();
    });
    document.addEventListener("mouseup", () => {
      if (altDragging) {
        altDragging = false;
        altPosX = 0; altPosY = 0;
        updateAltTransform();
      }
    });
    document.addEventListener("mousemove", (e) => {
      if (altDragging) {
        altPosX = e.clientX - altStartX;
        altPosY = e.clientY - altStartY;
        updateAltTransform();
      }
    });
    altWrapper.addEventListener("wheel", (e) => {
      e.preventDefault();
      altScale += e.deltaY < 0 ? 0.1 : -0.1;
      if (altScale < 0.5) altScale = 0.5;
      if (altScale > 5) altScale = 5;
      updateAltTransform();
    });
    altWrapper.addEventListener("dblclick", () => {
      if (altScale > 1) {
        altScale = 1.2; altPosX = 0; altPosY = 0;
      } else {
        altScale = 2;
      }
      updateAltTransform();
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
