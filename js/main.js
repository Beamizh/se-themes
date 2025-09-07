// js/main.js
document.addEventListener('DOMContentLoaded', () => {
  const modelFilter = document.getElementById('modelFilter');
  const platformFilter = document.getElementById('platformFilter');
  const resolutionFilter = document.getElementById('resolutionFilter');
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
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  async function init() {
    try {
      const res = await fetch('themes.json');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      themes = await res.json();

      if (!Array.isArray(themes)) throw new Error('themes.json does not contain an array');

      populateFilters();
      renderThemes();
    } catch (err) {
      console.error(err);
      showError('⚠️ Failed to load themes.json. Are you running a local server (e.g. Live Server)?');
      themeList.innerHTML = '<p style="padding:12px; color:#666">No themes to show.</p>';
    }
  }

  function populateFilters() {
    const models = new Set();
    const platforms = new Set();
    const resolutions = new Set();

    themes.forEach(theme => {
      (theme.supportedModels || []).forEach(m => models.add(m));
      if (theme.platform) platforms.add(theme.platform);
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

    fill(modelFilter, models);
    fill(platformFilter, platforms);
    fill(resolutionFilter, resolutions);
  }

  function renderThemes() {
    const searchTerm = (searchInput.value || '').trim().toLowerCase();
    const selectedModel = modelFilter.value;
    const selectedPlatform = platformFilter.value;
    const selectedResolution = resolutionFilter.value;

    themeList.innerHTML = '';
    let visibleCount = 0;

    themes.forEach(theme => {
      const supportedModels = Array.isArray(theme.supportedModels) ? theme.supportedModels : [];
      const platform = theme.platform || '';
      const resolution = theme.resolution || '';
      const author = theme.author || null;
      const originalModel = theme.originalModel;

      const haystack = [
        theme.name || '',
        supportedModels.join(' '),
        author || '',
        Array.isArray(originalModel) ? originalModel.join(' ') : (originalModel || ''),
        platform,
        resolution
      ].join(' ').toLowerCase();

      const matchesSearch = searchTerm === '' || haystack.includes(searchTerm);
      const matchesModel = selectedModel === 'all' || supportedModels.includes(selectedModel);
      const matchesPlatform = selectedPlatform === 'all' || platform === selectedPlatform;
      const matchesResolution = selectedResolution === 'all' || resolution === selectedResolution;

      if (matchesSearch && matchesModel && matchesPlatform && matchesResolution) {
        visibleCount++;
        const card = document.createElement('div');
        card.className = 'theme-card';

        const preview = (theme.screenshots && theme.screenshots[0]) ? theme.screenshots[0] : '';
        const link = 'themes-pages/' + encodeURIComponent(theme.id) + '.html';

        const nameSafe = escapeHtml(theme.name);
        const platformSafe = escapeHtml(platform);
        const resolutionSafe = escapeHtml(resolution);

        // Preloaded vs User-made label
        let metaLine = '';
        if (author) {
          metaLine = `<p class="meta"><strong>Author:</strong> ${escapeHtml(author)}</p>`;
        } else {
          const originalSafe = Array.isArray(originalModel)
            ? escapeHtml(originalModel.join(', '))
            : escapeHtml(originalModel || '');
          metaLine = `<p class="meta"><strong>Preloaded on:</strong> ${originalSafe}</p>`;
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
                  <span class="badge platform">${platformSafe}</span>
                  <span class="badge resolution">${resolutionSafe}</span>
                  ${theme.homeType ? `<span class="badge home-type">${escapeHtml(theme.homeType)}</span>` : ''}
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

  modelFilter.addEventListener('change', renderThemes);
  platformFilter.addEventListener('change', renderThemes);
  resolutionFilter.addEventListener('change', renderThemes);
  searchInput.addEventListener('input', renderThemes);

  init();
});
