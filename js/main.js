// js/main.js
document.addEventListener('DOMContentLoaded', () => {
  const modelFilter = document.getElementById('modelFilter'); // hidden input
  const platformFilter = document.getElementById('platformFilter');
  const resolutionFilter = document.getElementById('resolutionFilter');
  const typeFilter = document.getElementById('typeFilter');
  const searchInput = document.getElementById('searchInput');
  const themeList = document.getElementById('themeList');
  const errorBox = document.getElementById('errorBox');

  let themes = [];

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.style.display = 'block';
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));
  }

  async function init() {
    try {
      const res = await fetch('themes.json');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      themes = await res.json();
      if (!Array.isArray(themes)) throw new Error('themes.json does not contain an array');

      populateFilters();
      await loadModelSelect(); // load custom dropdown with images
      renderThemes();
    } catch (err) {
      console.error(err);
      showError('⚠️ Failed to load themes.json. Are you running a local server (e.g. Live Server)?');
      themeList.innerHTML = '<p style="padding:12px; color:#666">No themes to show.</p>';
    }
  }

  function populateFilters() {
    const platforms = new Set();
    const resolutions = new Set();

    themes.forEach(theme => {
      if (theme.platform) {
        if (Array.isArray(theme.platform)) {
          theme.platform.forEach(p => platforms.add(p));
        } else {
          platforms.add(theme.platform);
        }
      }
      if (theme.resolution) resolutions.add(theme.resolution);
    });

    function fill(selectEl, items) {
      while (selectEl.options.length > 1) selectEl.remove(1);
      [...items].sort().forEach(it => {
        const opt = document.createElement('option');
        opt.value = it;
        opt.textContent = it;
        selectEl.appendChild(opt);
      });
    }

    fill(platformFilter, platforms);
    fill(resolutionFilter, resolutions);
  }

  async function loadModelSelect() {
    try {
      const res = await fetch('models.json');
      if (!res.ok) return;
      const models = await res.json();

      const selectBtn = document.querySelector('#modelSelect .select-btn');
      const optionsList = document.querySelector('#modelSelect .select-options');
      const hiddenInput = document.getElementById('modelFilter');

      // "All" option without image
      optionsList.innerHTML = `<li data-value="all"><span>All</span></li>`;

      models.forEach(m => {
        optionsList.innerHTML += `
          <li data-value="${m.name}">
            <img src="${m.image}" alt="${m.name}">
            <span>${m.name}</span>
          </li>
        `;
      });

      // Toggle dropdown
      selectBtn.addEventListener('click', () => {
        optionsList.style.display = optionsList.style.display === 'block' ? 'none' : 'block';
      });

      // Select option
      optionsList.addEventListener('click', e => {
        const li = e.target.closest('li');
        if (!li) return;
        const value = li.dataset.value;
        const text = li.querySelector('span').textContent;

        selectBtn.textContent = text; // only show text
        hiddenInput.value = value;
        optionsList.style.display = 'none';

        renderThemes();
      });

      // Close if clicking outside
      document.addEventListener('click', e => {
        if (!e.target.closest('.custom-select')) {
          optionsList.style.display = 'none';
        }
      });
    } catch (err) {
      console.error("Failed to load models.json", err);
    }
  }

  function renderThemes() {
    const searchTerm = (searchInput.value || '').trim().toLowerCase();
    const selectedModel = modelFilter.value;
    const selectedPlatform = platformFilter.value;
    const selectedResolution = resolutionFilter.value;
    const selectedType = typeFilter.value;

    themeList.innerHTML = '';
    let visibleCount = 0;

    themes.forEach(theme => {
      const supportedModels = Array.isArray(theme.supportedModels) ? theme.supportedModels : [];
      const platforms = Array.isArray(theme.platform) ? theme.platform : [theme.platform || ""];
      const resolution = theme.resolution || '';
      const author = theme.author || null;
      const originalModel = theme.originalModel;
      const carrier = theme.carrier || null;
      let themeType = "preloaded";

      if (carrier) {
        themeType = "carrier";
      } else if (author) {
        themeType = "user";
      }

      const haystack = [
        theme.name || '',
        supportedModels.join(' '),
        author || '',
        carrier || '',
        Array.isArray(originalModel) ? originalModel.join(' ') : (originalModel || ''),
        platforms.join(' '),
        resolution
      ].join(' ').toLowerCase();

      const matchesSearch = searchTerm === '' || haystack.includes(searchTerm);
      const matchesModel = selectedModel === 'all' || supportedModels.includes(selectedModel);
      const matchesPlatform = selectedPlatform === 'all' || platforms.includes(selectedPlatform);
      const matchesResolution = selectedResolution === 'all' || resolution === selectedResolution;
      const matchesType = selectedType === 'all' || selectedType === themeType;

      if (matchesSearch && matchesModel && matchesPlatform && matchesResolution && matchesType) {
        visibleCount++;
        const card = document.createElement('div');
        card.className = 'theme-card';

        const preview = (theme.screenshots && theme.screenshots[0]) ? theme.screenshots[0] : '';
        const link = 'themes-pages/' + encodeURIComponent(theme.id) + '.html';

        const nameSafe = escapeHtml(theme.name);
        const resolutionSafe = escapeHtml(resolution);

        // Meta line
        let metaLine = '';
        if (themeType === "user") {
          metaLine = `<p class="meta"><strong>Author:</strong> ${escapeHtml(author)}</p>`;
        } else {
          const originalSafe = Array.isArray(originalModel)
            ? escapeHtml(originalModel.join(', '))
            : escapeHtml(originalModel || '');
          metaLine = `<p class="meta"><strong>Preloaded on:</strong> ${originalSafe}</p>`;
          if (carrier) {
            metaLine += `<p class="meta"><strong>Carrier:</strong> ${escapeHtml(carrier)}</p>`;
          }
        }

        // Type badge
        let typeBadge = '';
        if (themeType === "user") {
          typeBadge = `<span class="badge type user-made">User-made</span>`;
        } else if (themeType === "carrier") {
          typeBadge = `<span class="badge type carrier">Carrier</span>`;
        } else {
          typeBadge = `<span class="badge type preloaded">Preloaded</span>`;
        }

        // Platform badge
        let platformBadge = '';
        if (platforms.length > 1) {
          platformBadge = `<span class="badge platform">Multi-platform</span>`;
        } else {
          platformBadge = `<span class="badge platform">${escapeHtml(platforms[0] || '')}</span>`;
        }

        card.innerHTML = `
          <a href="${link}">
            ${preview ? `<img src="${escapeHtml(preview)}" alt="${nameSafe} Preview">` : ''}
            <div class="card-body">
              <div class="card-top">
                <h3>${nameSafe}</h3>
                ${metaLine}
              </div>
              <div class="card-bottom">
                <div class="badges">
                  <span class="badge model">${supportedModels.length > 1 ? 'Multi-model' : (supportedModels[0] || '')}</span>
                  ${platformBadge}
                  <span class="badge resolution">${resolutionSafe}</span>
                  ${theme.homeType ? `<span class="badge home-type">${escapeHtml(theme.homeType)}</span>` : ''}
                  ${typeBadge}
                </div>
              </div>
            </div>
          </a>
        `;

        themeList.appendChild(card);
      }
    });

    if (visibleCount === 0) {
      themeList.innerHTML = '<p style="padding:16px; color:#666">No themes match your search/filters.</p>';
    }
  }

  platformFilter.addEventListener('change', renderThemes);
  resolutionFilter.addEventListener('change', renderThemes);
  typeFilter.addEventListener('change', renderThemes);
  searchInput.addEventListener('input', renderThemes);

  init();
});
