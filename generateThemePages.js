const fs = require("fs");
const path = require("path");

// Paths
const themesFile = path.join(__dirname, "themes.json");
const pagesDir = path.join(__dirname, "themes-pages");

// Ensure themes-pages folder exists
if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir, { recursive: true });

// Load themes.json
const themes = JSON.parse(fs.readFileSync(themesFile, "utf-8"));

// Generate theme pages compatible with current index.html
themes.forEach((theme) => {
  const homeBadge = theme.homeType
    ? `<span class="badge home-type">${theme.homeType}</span>`
    : "";

  // Decide if it's preloaded or user-made
  const metaLine = theme.author
    ? `<p><strong>Author:</strong> ${theme.author}</p>`
    : `<p><strong>Preloaded on:</strong> ${
        Array.isArray(theme.originalModel)
          ? theme.originalModel.join(", ")
          : theme.originalModel
      }</p>`;

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
      <!-- Badges only -->
      <div class="badges">
        <span class="badge platform">${theme.platform}</span>
        <span class="badge resolution">${theme.resolution}</span>
        ${homeBadge}
      </div>

      ${metaLine}
      <p><strong>Supported models:</strong> ${theme.supportedModels.join(", ")}</p>

      <h2>Screenshots</h2>
      <div class="screenshots">
        ${theme.screenshots
          .map((s) => `<img src="../${s}" alt="${theme.name} screenshot">`)
          .join("\n")}
      </div>

      <a class="download-btn" href="../${theme.file}" download>⬇️ Download this Theme</a>
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
