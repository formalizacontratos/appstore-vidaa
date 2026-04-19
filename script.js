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

    // Aguarda 500ms para garantir que o motor da TV termina
    // de inicializar o modo rato antes de forçarmos o foco.
    setTimeout(function () {
      var cards = document.querySelectorAll('.app-card');
      if (cards.length > 0) {
        cards[0].focus();
      }
    }, 500);

  } catch (error) {
    grid.innerHTML = '<p class="error-msg">Erro ao carregar os apps: ' + error.message + '</p>';
    console.error('Falha ao carregar repo.json:', error);
  }
}

// ---------------------------------------------------------------------------
// Navegação por D-pad usando keyCode (compatibilidade máxima com TVs)
// ---------------------------------------------------------------------------
// keyCode 37 = ArrowLeft  | 38 = ArrowUp
// keyCode 39 = ArrowRight | 40 = ArrowDown | 13 = Enter

document.addEventListener('keydown', function (e) {
  var code = e.keyCode || e.which;

  // Só interceta as teclas de navegação e Enter
  if (code !== 37 && code !== 38 && code !== 39 && code !== 40 && code !== 13) {
    return;
  }

  var cards = document.querySelectorAll('.app-card');
  if (!cards || cards.length === 0) return;

  var cardsArray = Array.prototype.slice.call(cards);
  var active     = document.activeElement;
  var currentIndex = cardsArray.indexOf(active);

  // Se o foco não está em nenhum card, foca o primeiro e sai
  if (currentIndex === -1) {
    cardsArray[0].focus();
    e.preventDefault();
    return;
  }

  if (code === 13) {
    // Enter: abre o link do card focado
    active.click();
    return;
  }

  // Setas: move o índice
  e.preventDefault();

  var nextIndex = currentIndex;

  if (code === 39 || code === 40) {
    // Direita ou Baixo: avança
    nextIndex = currentIndex + 1;
  } else if (code === 37 || code === 38) {
    // Esquerda ou Cima: recua
    nextIndex = currentIndex - 1;
  }

  // Limita ao intervalo válido [0, length-1]
  if (nextIndex < 0) nextIndex = 0;
  if (nextIndex >= cardsArray.length) nextIndex = cardsArray.length - 1;

  cardsArray[nextIndex].focus();
  cardsArray[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

document.addEventListener('DOMContentLoaded', loadApps);
