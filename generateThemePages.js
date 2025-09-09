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
          .map((s) => `<img src="../${s}" alt="${theme.name} screenshot">`)
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

  <footer>
    <p>made by Beamish 🦆</p>
  </footer>

</body>
</html>`;

  const filePath = path.join(pagesDir, `${theme.id}.html`);
  fs.writeFileSync(filePath, themeHTML, "utf-8");
  console.log(`✅ Theme page generated: ${theme.id}.html`);
});

console.log("🎉 All theme pages generated successfully!");
