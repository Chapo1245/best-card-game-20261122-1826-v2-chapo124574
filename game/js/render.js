// render.js — draws every visible thing: hands, played cards, life, oil, omen,
// combo chips, banners and the log. Pure DOM; no canvas, no images, no network.
function el(id) { return document.getElementById(id); }

function oilPips(n, max) {
  let s = '';
  for (let i = 0; i < max; i++) s += i < n ? '●' : '○';
  return 'Oil ' + s;
}

function makeCardElement(card, opts) {
  const o = opts || {};
  const c = colorOf(card.color);
  const div = document.createElement('div');
  div.className = 'card ' + card.color + (o.played ? ' played' : '') + (o.back ? ' back' : '');
  div.dataset.cardId = card.id;
  if (o.back) {
    div.innerHTML = '<div class="glyph">🏮</div><div class="cname">Harbor</div>';
  } else {
    div.innerHTML =
      '<div class="value">' + card.value + '</div>' +
      '<div class="glyph">' + c.glyph + '</div>' +
      '<div class="cname">' + c.name + '</div>' +
      '<div class="cost">⬢ ' + costOf(card) + ' oil</div>';
  }
  if (o.onClick) div.addEventListener('click', function () { o.onClick(card, div); });
  return div;
}

function renderHands(state) {
  const aiHand = el('ai-hand');
  aiHand.innerHTML = '';
  state.aiHand.forEach(function () {
    aiHand.appendChild(makeCardElement({ color: 'harbor', value: 0, id: 'back' }, { back: true }));
  });
  const youHand = el('you-hand');
  youHand.innerHTML = '';
  const affordable = state.youHand.some(function (c) { return costOf(c) <= state.youOil; });
  const cheapest = state.youHand.slice().sort(function (a, b) { return costOf(a) - costOf(b); })[0];
  state.youHand.forEach(function (card, idx) {
    const free = !affordable && cheapest && card.id === cheapest.id;
    const unaffordable = !free && costOf(card) > state.youOil;
    const div = makeCardElement(card, {
      onClick: function (c, d) { window.HarborPlay(c, d); },
    });
    if (free) div.classList.add('free');
    if (unaffordable) div.classList.add('unaffordable');
    const key = document.createElement('div');
    key.style.cssText = 'position:absolute;bottom:2px;left:6px;font-size:11px;color:#9fb4d8;font-weight:700;';
    key.textContent = String(idx + 1);
    div.appendChild(key);
    youHand.appendChild(div);
  });
}

function renderLife(state) {
  el('you-life-fill').style.width = Math.max(0, state.youLife) / 20 * 100 + '%';
  el('ai-life-fill').style.width = Math.max(0, state.aiLife) / 20 * 100 + '%';
  el('you-life-num').textContent = Math.max(0, state.youLife);
  el('ai-life-num').textContent = Math.max(0, state.aiLife);
  el('you-oil').textContent = oilPips(state.youOil, 5);
  el('ai-oil').textContent = oilPips(state.aiOil, 5);
}

function renderOmen(state) {
  const c = colorOf(state.omen.color);
  el('omen-text').innerHTML =
    'Vey favors <span class="t-' + c.id + '">' + c.glyph + ' ' + c.name + '</span>' +
    (state.omen.highTide ? ' — <b>the tide runs HIGH (8+)</b>' : ' — a quiet tide');
}

function renderTideTrail(state) {
  const trail = el('tide-trail');
  trail.innerHTML = '';
  state.yourColorHistory.slice(-3).forEach(function (colorId) {
    const dot = document.createElement('div');
    dot.className = 'tide-dot ' + colorId;
    dot.title = colorOf(colorId).name;
    trail.appendChild(dot);
  });
}

function renderComboChips(activeNames) {
  const map = { 'Twin Lights': 'combo-twin', 'Full Spectrum': 'combo-spectrum', 'High Tide': 'combo-tide' };
  Object.keys(map).forEach(function (name) {
    el(map[name]).classList.toggle('lit', activeNames.indexOf(name) !== -1);
  });
}

function renderRoundBanner(state) {
  el('round-banner').textContent = 'ROUND ' + state.round + ' · First to sink the rival\'s 20 light wins';
}

function renderLog(text) {
  el('log-line').textContent = text;
}

function showPlayedCard(slotId, card, animClass) {
  const slot = el(slotId);
  slot.innerHTML = '';
  const div = makeCardElement(card, { played: true });
  if (animClass) div.classList.add(animClass);
  slot.appendChild(div);
  return div;
}

function clearPlayedSlots() {
  el('you-played').innerHTML = '<div class="slot-hint">Your card</div>';
  el('ai-played').innerHTML = '<div class="slot-hint">Vey\'s card</div>';
  el('power-line').textContent = '';
  el('round-result').textContent = '';
  el('round-result').className = 'round-result';
}

function showConfetti() {
  const app = el('app');
  const colors = ['#f5c542', '#2ec4b6', '#9b5de5', '#ffd76a', '#ffffff'];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti';
    piece.style.left = Math.floor(Math.random() * 1280) + 'px';
    piece.style.background = colors[i % colors.length];
    piece.style.animationDuration = (1.6 + Math.random() * 1.8) + 's';
    piece.style.animationDelay = (Math.random() * 0.7) + 's';
    app.appendChild(piece);
    setTimeout(function () { piece.remove(); }, 4200);
  }
}
