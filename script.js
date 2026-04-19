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

    // Foca o primeiro cartão assim que os cards estiverem no DOM.
    // Isto "acorda" o modo de foco da TV e desativa o cursor do rato.
    const firstCard = grid.querySelector('.app-card');
    if (firstCard) firstCard.focus();

  } catch (error) {
    grid.innerHTML = `<p class="error-msg">Erro ao carregar os apps: ${error.message}</p>`;
    console.error('Falha ao carregar repo.json:', error);
  }
}

// ---------------------------------------------------------------------------
// Navegação espacial por D-pad (setas do comando da TV)
// ---------------------------------------------------------------------------
// Estratégia: em vez de calcular posições no grid via CSS (que pode variar),
// usamos getBoundingClientRect() para encontrar o cartão mais próximo na
// direção pressionada. Assim funciona independentemente do número de colunas.

function getCards() {
  return Array.from(document.querySelectorAll('.app-card'));
}

function getRect(el) {
  return el.getBoundingClientRect();
}

// Calcula o centro X e Y de um elemento.
function center(rect) {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

// Devolve o melhor candidato na direção indicada relativamente ao elemento atual.
// Critério: o candidato tem de estar "para a frente" na direção pretendida
// e é escolhido o que tiver menor distância euclidiana ao centro do atual.
function findNeighbor(current, direction) {
  const cards   = getCards();
  const curRect = getRect(current);
  const curC    = center(curRect);

  let best     = null;
  let bestDist = Infinity;

  cards.forEach(card => {
    if (card === current) return;

    const rect = getRect(card);
    const c    = center(rect);

    // Filtra apenas os cartões que estão "à frente" na direção correta.
    // Usamos uma tolerância de 5px para evitar rejeitar vizinhos alinhados.
    const isForward = {
      ArrowRight: c.x > curC.x + 5,
      ArrowLeft:  c.x < curC.x - 5,
      ArrowDown:  c.y > curC.y + 5,
      ArrowUp:    c.y < curC.y - 5,
    }[direction];

    if (!isForward) return;

    const dist = Math.hypot(c.x - curC.x, c.y - curC.y);
    if (dist < bestDist) {
      bestDist = dist;
      best = card;
    }
  });

  return best;
}

document.addEventListener('keydown', e => {
  const ARROW_KEYS = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'];

  if (!ARROW_KEYS.includes(e.key)) return;

  // Evita scroll acidental da página
  e.preventDefault();

  const current = document.activeElement;
  if (!current || !current.classList.contains('app-card')) {
    // Se o foco estiver perdido, volta ao primeiro cartão
    const first = document.querySelector('.app-card');
    if (first) first.focus();
    return;
  }

  const neighbor = findNeighbor(current, e.key);
  if (neighbor) {
    neighbor.focus();
    // Garante que o cartão focado é sempre visível no ecrã
    neighbor.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});

// A tecla Enter no cartão focado abre o link (comportamento padrão do <a>).
// Não é necessário código adicional para isso.

document.addEventListener('DOMContentLoaded', loadApps);
