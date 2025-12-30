document.addEventListener('DOMContentLoaded', async () => {
  // --- CARGA DE CARTAS (desde data/messages.json o fallback) ---
  async function loadMessages() {
    try {
      const res = await fetch('data/messages.json');
      if (!res.ok) throw new Error('no-json');
      const json = await res.json();
      return Array.isArray(json.messages) ? json.messages.slice() : fallbackMessages();
    } catch {
      return fallbackMessages();
    }
  }

  function fallbackMessages() {
    return [
      "Estoy orgulloso de ti 💕",
      "Respira; estás haciendo lo mejor que puedes.",
      "Te amo en todos tus estados.",
      "Si necesitas, aquí estoy, siempre.",
      "Que hoy te sorprenda algo bonito.",
      "Eres más fuerte de lo que crees.",
      "Permítete descansar; mereces calma."
    ];
  }

  // --- MENSAJES INDEPENDIENTES PARA EL BOTÓN ANTI-DÍAS MALOS ---
  // Lista principal de frases (edítala para cambiar el contenido)
  const antiMessages = [
    "Un abrazo enorme , aquí estoy contigo.",
    "Hoy puedes descansar; yo te abrazo con paciencia.",
    "No estás sola. Te acompaño en silencio o en palabra.",
    "Estás más cerca de mejorar de lo que crees.",
    "Te envío mi mejor sonrisa y todo mi cariño.",
    "Permítete sentir yo te espero con paciencia.",
    "Aunque hoy pese, no olvides que eres mi luz.",
    "Estoy a tu lado, venga lo que venga.",
    "Si te caes, me tienes para levantarte.",
    "Tu valor existe incluso cuando no lo ves.",
    "Puedo escuchar cuando necesites soltar todo.",
    "Hoy te mando calma y una promesa: no estás sola.",
    "Pequeños pasos también cuentan yo celebro cada uno contigo.",
    "Eres importante para mí, hoy y siempre.",
    "Que esta frase te recuerde que alguien te quiere mucho.",
    "Si hoy el día fue raro, yo me quedo contigo en lo que quede.",
    "No necesito que estés bien para quererte.",
    "Aun cuando no dices nada, te sigo entendiendo.",
    "Estoy aquí, sin prisas, sin juicios, solo contigo.",
    "Tu valor no depende de cómo te sientas hoy.",
    "Te abrazo con el corazón, sin importar la distancia."
    
  ];

  // Pool que controla el ciclo sin repeticiones
  let antiPool = [];

  function shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getNextAnti() {
    // si la pool está vacía, rellenar con una copia barajada
    if (!antiPool || antiPool.length === 0) {
      antiPool = shuffleArray(antiMessages.slice());
    }
    // sacar la última (pop) para evitar repetir hasta que se acabe la pool
    return antiPool.pop();
  }

  // --- RENDER DE CARTAS + CONTROLES ---
  const cardsContainer = document.getElementById('cardsContainer');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const showAllBtn = document.getElementById('showAllBtn');
  const addForm = document.getElementById('addForm');
  const newText = document.getElementById('newText');

  let cartas = [];
  let favorites = JSON.parse(localStorage.getItem('regalo-fav-cartas') || '[]');

  function saveFavorites() {
    localStorage.setItem('regalo-fav-cartas', JSON.stringify(favorites));
  }

  function escapeHtml(str) { return String(str).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }

  function renderCards(list) {
    cardsContainer.innerHTML = '';
    list.forEach((text, i) => {
      const card = document.createElement('article');
      card.className = 'note-card';
      card.tabIndex = 0;
      card.innerHTML = `
        <div>
          <div class="note-front">Carta ${i + 1}</div>
          <div class="note-back">${escapeHtml(text)}</div>
        </div>
        <div class="note-actions">
          <button class="icon-btn heart" aria-label="Marcar como favorita" title="Marcar como favorita">${favorites.includes(text) ? '♥' : '♡'}</button>
          <button class="icon-btn delete" aria-label="Eliminar carta" title="Eliminar">🗑️</button>
        </div>
      `;
      // abrir/cerrar al clic o Enter
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('icon-btn')) return;
        card.classList.toggle('open');
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') card.classList.toggle('open');
      });

      // favorita
      const heart = card.querySelector('.icon-btn.heart');
      heart.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const idx = favorites.indexOf(text);
        if (idx === -1) favorites.push(text);
        else favorites.splice(idx, 1);
        heart.textContent = favorites.includes(text) ? '♥' : '♡';
        saveFavorites();
      });

      // eliminar quita de la lista visible y de localStorage si viene de usuario
      const del = card.querySelector('.icon-btn.delete');
      del.addEventListener('click', (ev) => {
        ev.stopPropagation();
        // quitar primera aparición en cartas
        const idx = cartas.indexOf(text);
        if (idx !== -1) cartas.splice(idx, 1);
        // quitar de storage de usuario si existe
        try {
          const saved = JSON.parse(localStorage.getItem('regalo-user-cartas') || '[]');
          const filtered = saved.filter(s => s !== text);
          localStorage.setItem('regalo-user-cartas', JSON.stringify(filtered));
        } catch { }
        renderCards(cartas);
      });

      cardsContainer.appendChild(card);
    });
  }

  shuffleBtn?.addEventListener('click', () => {
    cartas = shuffleArray(cartas);
    renderCards(cartas);
  });
  showAllBtn?.addEventListener('click', () => {
    document.querySelectorAll('.note-card').forEach(c => c.classList.add('open'));
    setTimeout(() => document.querySelectorAll('.note-card').forEach(c => c.classList.remove('open')), 4500);
  });

  addForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = newText && newText.value && newText.value.trim();
    if (!v) return;
    cartas.unshift(v);
    newText.value = '';
    renderCards(cartas);
    try {
      const saved = JSON.parse(localStorage.getItem('regalo-user-cartas') || '[]');
      saved.unshift(v);
      localStorage.setItem('regalo-user-cartas', JSON.stringify(saved.slice(0, 50)));
    } catch { }
  });

  function shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // cargar cartas y renderizar
  cartas = await loadMessages();
  cartas = shuffleArray(cartas.slice());
  try { const user = JSON.parse(localStorage.getItem('regalo-user-cartas') || '[]'); if (Array.isArray(user) && user.length) cartas = user.concat(cartas); } catch { }
  renderCards(cartas);


  const modal = document.getElementById('modal');
  const modalImg = document.getElementById('modalImg');
  const modalCaption = document.getElementById('modalCaption');
  const modalClose = document.querySelector('.modal-close');
  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  function closeModal() { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); modalImg.src = ''; }

  /* ----------------------------
     BOTÓN ANTI-DÍAS MALOS (usa antiMessages independiente, sin repeticiones hasta agotar pool)
     ---------------------------- */
  const antiBtn = document.getElementById('antiButton');
  const mensajeEl = document.getElementById('mensaje');
  antiBtn?.addEventListener('click', () => {
    const text = getNextAnti();
    showMessage(text);
    fireConfetti();
  });

  function showMessage(text) {
    mensajeEl.textContent = text;
    mensajeEl.classList.add('show');
    antiBtn.setAttribute('aria-pressed', 'true');
    clearTimeout(window.__hideMessageTimeout);
    window.__hideMessageTimeout = setTimeout(() => {
      mensajeEl.classList.remove('show');
      antiBtn.setAttribute('aria-pressed', 'false');
    }, 6500);
  }

  /* ----------------------------
     Botón favorito en header
     ---------------------------- */
  const favoriteBtn = document.getElementById('favoriteBtn');
  favoriteBtn?.addEventListener('click', () => {
    const key = 'regalo-favorito';
    const data = { savedAt: new Date().toISOString(), note: 'Página guardada como favorita' };
    localStorage.setItem(key, JSON.stringify(data));
    favoriteBtn.textContent = 'Guardado ✓';
    setTimeout(() => favoriteBtn.textContent = 'Guardar como favorito', 2100);
  });

  /* ----------------------------
     Confetti (igual que antes)
     ---------------------------- */
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext && canvas.getContext('2d');
  let confettiPieces = [];
  function resizeCanvas() { if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; } }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function fireConfetti() {
    if (!ctx) return;
    const count = 26;
    for (let i = 0; i < count; i++) confettiPieces.push(createPiece());
    animateConfetti();
  }

  function createPiece() {
    const colors = ['#ff6b91', '#ffd166', '#ff9aa2', '#ff7aa2', '#ff4d7e'];
    return {
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      w: 6 + Math.random() * 10,
      h: 8 + Math.random() * 12,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * 360,
      vr: (Math.random() - 0.5) * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 150 + Math.random() * 100
    };
  }

  let confettiAnimationId = null;
  function animateConfetti() {
    if (!ctx) return;
    cancelAnimationFrame(confettiAnimationId);
    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = confettiPieces.length - 1; i >= 0; i--) {
        const p = confettiPieces[i];
        p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vy += 0.06; p.life--;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        if (p.y > canvas.height + 60 || p.life <= 0) confettiPieces.splice(i, 1);
      }
      if (confettiPieces.length > 0) confettiAnimationId = requestAnimationFrame(frame);
      else { ctx.clearRect(0, 0, canvas.width, canvas.height); cancelAnimationFrame(confettiAnimationId); }
    }
    frame();
  }

  // --- Muro de razones: datos, render y persistencia (UNA A LA VEZ) ---
  const reasonsKey = 'regalo-razones';
  const REASONS_VERSION = 1; // incrementar si cambias las razones por defecto
  const reasonForm = document.getElementById('reasonForm');
  const reasonText = document.getElementById('reasonText');
  const reasonsContainer = document.getElementById('reasonsContainer');

  // carga inicial (si hay en localStorage) — ahora usa versionado
  function loadReasons() {
    try {
      const raw = localStorage.getItem(reasonsKey);
      if (!raw) return defaultReasons();
      const parsed = JSON.parse(raw);
      // compatibilidad: si almacenado tiene {version, items}
      if (parsed && parsed.version === REASONS_VERSION && Array.isArray(parsed.items)) {
        return parsed.items;
      }
      // si es un array antiguo (sin versión) y no está vacío, úsalo, si no, usa defaults
      if (Array.isArray(parsed) && parsed.length) return parsed;
      return defaultReasons();
    } catch {
      return defaultReasons();
    }
  }

  function saveReasons(list) {
    // guardamos con versión para futuras actualizaciones
    try {
      localStorage.setItem(reasonsKey, JSON.stringify({ version: REASONS_VERSION, items: list }));
    } catch {
      // fallback: intentar guardar solo el array
      try { localStorage.setItem(reasonsKey, JSON.stringify(list)); } catch { }
    }
  }

  function defaultReasons() {
    return [
      { id: 'r1', text: 'Cuando algo me sale bien, eres la primera persona que quiero contarle.', likes: 1 },
      { id: 'r2', text: 'Porque me importas más de lo que sé explicar.', likes: 1 },
      { id: 'r3', text: 'Porque mi mente te busca cuando se cansa.', likes: 1 },
      { id: 'r4', text: 'Porque eres tú y eso basta.', likes: 1 },
      { id: 'r5', text: 'Porque me haces querer ser mejor cada día.', likes: 1 },
      { id: 'r6', text: 'Porque te quiero más de lo que digo.', likes: 1 }
    ];
  }

  let reasons = loadReasons();
  let currentReasonIndex = 0;

  function renderSingleReason() {
    reasonsContainer.innerHTML = '';
    if (!reasons || reasons.length === 0) {
      reasonsContainer.innerHTML = `<div class="reason-card"><div class="reason-text">Aún no hay razones. Añade la primera ❤️</div></div>`;
      return;
    }

    // normalize index
    if (currentReasonIndex < 0) currentReasonIndex = reasons.length - 1;
    if (currentReasonIndex >= reasons.length) currentReasonIndex = 0;

    const r = reasons[currentReasonIndex];
    const el = document.createElement('article');
    el.className = 'reason-card';
    el.innerHTML = `
      <div class="reason-text">${escapeHtml(r.text)}</div>
      <div class="reason-meta">
        <div class="reason-likes"><span class="likes-count">${r.likes || 0}</span> ♥</div>
        <div class="reason-actions">
          <button class="icon-btn small prev-btn" title="Anterior">◀</button>
          <button class="icon-btn small next-btn" title="Siguiente">▶</button>
          <button class="icon-btn small rand-btn" title="Aleatorio">🔀</button>
          <button class="icon-btn small like-btn" title="Dar like">♥</button>
          <button class="icon-btn small delete-reason" title="Eliminar">🗑️</button>
        </div>
      </div>
      <div style="margin-top:8px;font-size:0.9rem;color:var(--muted)">Razón ${currentReasonIndex + 1} de ${reasons.length}</div>
    `;

    // botones navegación
    el.querySelector('.prev-btn').addEventListener('click', (ev) => {
      ev.stopPropagation();
      currentReasonIndex = (currentReasonIndex - 1 + reasons.length) % reasons.length;
      renderSingleReason();
    });
    el.querySelector('.next-btn').addEventListener('click', (ev) => {
      ev.stopPropagation();
      currentReasonIndex = (currentReasonIndex + 1) % reasons.length;
      renderSingleReason();
    });
    el.querySelector('.rand-btn').addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (reasons.length <= 1) return;
      let idx = Math.floor(Math.random() * reasons.length);
      if (idx === currentReasonIndex) idx = (idx + 1) % reasons.length;
      currentReasonIndex = idx;
      renderSingleReason();
    });

    // like
    el.querySelector('.like-btn').addEventListener('click', (ev) => {
      ev.stopPropagation();
      r.likes = (r.likes || 0) + 1;
      saveReasons(reasons);
      renderSingleReason();
    });

    // eliminar
    el.querySelector('.delete-reason').addEventListener('click', (ev) => {
      ev.stopPropagation();
      reasons = reasons.filter(x => x.id !== r.id);
      // ajustar índice para no salirse
      if (currentReasonIndex >= reasons.length) currentReasonIndex = Math.max(0, reasons.length - 1);
      saveReasons(reasons);
      renderSingleReason();
    });

    reasonsContainer.appendChild(el);
  }

  reasonForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = reasonText && reasonText.value && reasonText.value.trim();
    if (!v) return;
    const item = { id: String(Date.now()) + Math.random().toString(36).slice(2, 6), text: v, likes: 0 };
    reasons.unshift(item);
    saveReasons(reasons);
    reasonText.value = '';
    currentReasonIndex = 0;
    renderSingleReason();
  });

  // keyboard navigation: left/right arrows for prev/next when focus not in input
  document.addEventListener('keydown', (e) => {
    const active = document.activeElement;
    const isTyping = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
    if (isTyping) return;
    if (!reasons || reasons.length === 0) return;
    if (e.key === 'ArrowLeft') {
      currentReasonIndex = (currentReasonIndex - 1 + reasons.length) % reasons.length;
      renderSingleReason();
    } else if (e.key === 'ArrowRight') {
      currentReasonIndex = (currentReasonIndex + 1) % reasons.length;
      renderSingleReason();
    }
  });

  // render inicial (una a la vez)
  renderSingleReason();

}); // end DOMContentLoaded