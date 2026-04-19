async function loadApps() {
  const grid = document.getElementById('app-grid');

  try {
    const response = await fetch('repo.json');
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const data = await response.json();

    data.apps.forEach(app => {
      const card = document.createElement('a');
      card.href = app.url;
      card.className = 'app-card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('target', '_blank');
      card.setAttribute('rel', 'noopener noreferrer');
      card.setAttribute('aria-label', app.name);

      card.innerHTML = `
        <div class="app-icon-wrapper">
          <img src="${app.img}" alt="${app.name}" class="app-icon" onerror="this.src='fallback.png'" />
        </div>
        <span class="app-name">${app.name}</span>
        <span class="app-description">${app.description}</span>
      `;

      grid.appendChild(card);
    });
  } catch (error) {
    grid.innerHTML = `<p class="error-msg">Erro ao carregar os apps: ${error.message}</p>`;
    console.error('Falha ao carregar repo.json:', error);
  }
}

document.addEventListener('DOMContentLoaded', loadApps);
