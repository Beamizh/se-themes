const fs = require("fs");
const path = require("path");

// Paths
const themesFile = path.join(__dirname, "themes.json");
const pagesDir = path.join(__dirname, "themes-pages");
const indexFile = path.join(__dirname, "index.html");

// Ensure themes-pages folder exists
if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir);
}

// Load themes.json
const themes = JSON.parse(fs.readFileSync(themesFile, "utf-8"));

// Collect unique sets for filters
const models = new Set();
const platforms = new Set();
const resolutions = new Set();

themes.forEach((theme) => {
  theme.supportedModels.forEach((m) => models.add(m));
  platforms.add(theme.platform);
  resolutions.add(theme.resolution);
});

// Sort them alphabetically
const sortedModels = [...models].sort();
const sortedPlatforms = [...platforms].sort();
const sortedResolutions = [...resolutions].sort();

// Generate <option> tags
const generateOptions = (items) =>
  items.map((i) => `<option value="${i}">${i}</option>`).join("\n");

// Generate index.html
const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sony Ericsson Themes</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <header>
    <h1>Sony Ericsson Themes</h1>
    <nav>
      <a href="#">Home</a>
      <a href="#">About</a>
    </nav>
  </header>

  <main>
    <!-- Filters -->
    <section class="filters">
      <label>
        Model:
        <select id="modelFilter">
          <option value="all">All</option>
          ${generateOptions(sortedModels)}
        </select>
      </label>

      <label>
        Platform:
        <select id="platformFilter">
          <option value="all">All</option>
          ${generateOptions(sortedPlatforms)}
        </select>
      </label>

      <label>
        Resolution:
        <select id="resolutionFilter">
          <option value="all">All</option>
          ${generateOptions(sortedResolutions)}
        </select>
      </label>
    </section>

    <!-- Themes -->
    <section class="themes" id="themeList"></section>
  </main>

  <footer>
    <p>made by Beamish 🦆</p>
  </footer>

  <script src="js/main.js"></script>
</body>
</html>`;

// Write index.html
fs.writeFileSync(indexFile, indexHTML, "utf-8");
console.log("✅ index.html generated");

// Generate theme pages
themes.forEach((theme) => {
  const themeHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${theme.name}</title>
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
      <p>Original model: ${theme.originalModel}</p>
      <p>Supported models: ${theme.supportedModels.join(", ")}</p>
      <p>Platform: ${theme.platform}</p>
      <p>Resolution: ${theme.resolution}</p>

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
    <p>© 2025 Sony Ericsson Themes Archive</p>
  </footer>

</body>
</html>`;
  const filePath = path.join(pagesDir, `${theme.id}.html`);
  fs.writeFileSync(filePath, themeHTML, "utf-8");
  console.log(`✅ Theme page generated: ${theme.id}.html`);
});

console.log("🎉 All pages generated successfully!");
