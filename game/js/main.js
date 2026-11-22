// main.js — the duel's state machine: title, table, win, lose.
// One round: Vey picks a card and telegraphs it -> you play a card -> the tide
// is resolved -> both draw back to five -> oil refills -> next round.
const MAX_LIFE = 20;
const HAND_SIZE = 5;

const state = {
  screen: 'title',
  round: 1,
  youLife: MAX_LIFE,
  aiLife: MAX_LIFE,
  youOil: 3,
  aiOil: 3,
  deck: [],
  discard: [],
  youHand: [],
  aiHand: [],
  aiChosen: null,
  omen: null,
  yourColorHistory: [],
  busy: false,
  stats: { rounds: 0, biggestHit: 0, combos: 0, cardsPlayed: 0 },
};

function newGame() {
  state.screen = 'table';
  state.round = 1;
  state.youLife = MAX_LIFE;
  state.aiLife = MAX_LIFE;
  state.youOil = 3;
  state.aiOil = 3;
  state.deck = shuffleDeck(buildDeck());
  state.discard = [];
  state.youHand = drawCards(state.deck, state.discard, HAND_SIZE);
  state.aiHand = drawCards(state.deck, state.discard, HAND_SIZE);
  state.yourColorHistory = [];
  state.busy = false;
  state.stats = { rounds: 0, biggestHit: 0, combos: 0, cardsPlayed: 0 };
  el('title-screen').classList.add('hidden');
  el('end-screen').classList.add('hidden');
  clearPlayedSlots();
  renderComboChips([]);
  AudioFX.play('start');
  startRound();
}

function startRound() {
  state.aiChosen = aiChooseCard(state.aiHand, state.yourColorHistory[state.yourColorHistory.length - 1], state.aiLife, state.youLife);
  state.omen = aiTelegraph(state.aiChosen);
  renderHands(state);
  renderLife(state);
  renderOmen(state);
  renderTideTrail(state);
  renderRoundBanner(state);
  const c = colorOf(state.omen.color);
  renderLog('Round ' + state.round + ' — the Omen says ' + c.name + (state.omen.highTide ? ', tide running high. ' : '. ') + 'Play a card (click or press 1–5).');
}

function playCard(card, divEl) {
  if (state.screen !== 'table' || state.busy) return;
  const affordable = state.youHand.some(function (c) { return costOf(c) <= state.youOil; });
  const cheapest = state.youHand.slice().sort(function (a, b) { return costOf(a) - costOf(b); })[0];
  const free = !affordable && cheapest && card.id === cheapest.id;
  const cost = free ? 0 : costOf(card);
  if (cost > state.youOil) {
    renderLog('Not enough oil for that card — the harbor lends your cheapest card free.');
    AudioFX.play('click');
    if (divEl) {
      divEl.classList.remove('shake');
      void divEl.offsetWidth; // restart the animation
      divEl.classList.add('shake');
    }
    return;
  }
  state.busy = true;
  state.youOil -= cost;
  state.youHand = state.youHand.filter(function (c) { return c.id !== card.id; });
  state.discard.push(card);
  state.stats.cardsPlayed++;
  AudioFX.play('play');
  showPlayedCard('you-played', card, 'slide-in');
  renderHands(state);
  renderLife(state);
  setTimeout(function () { revealAiCard(card); }, 450);
}

function revealAiCard(youCard) {
  const aiCard = state.aiChosen;
  state.aiHand = state.aiHand.filter(function (c) { return c.id !== aiCard.id; });
  state.discard.push(aiCard);
  showPlayedCard('ai-played', aiCard, 'flip-in');
  setTimeout(function () { resolveClash(youCard, aiCard); }, 380);
}

function resolveClash(youCard, aiCard) {
  const result = resolveRound(youCard, aiCard, state.yourColorHistory);
  state.yourColorHistory.push(youCard.color);
  state.stats.rounds++;
  state.stats.combos += result.youBonuses.length;
  const youColor = colorOf(youCard.color);
  const aiColor = colorOf(aiCard.color);
  let line = 'You ' + youCard.value + ' ' + youColor.glyph + ' vs Vey ' + aiCard.value + ' ' + aiColor.glyph +
    ' — power ' + result.youPower + ' vs ' + result.aiPower + '. ';
  const resultEl = el('round-result');
  if (result.outcome === 'you') {
    state.aiLife -= result.damage;
    state.stats.biggestHit = Math.max(state.stats.biggestHit, result.damage);
    line += 'You win the tide, Vey loses ' + result.damage + ' light!';
    resultEl.textContent = '⚓ YOU WIN THE TIDE −' + result.damage + ' LIGHT';
    resultEl.className = 'round-result win';
    AudioFX.play('win');
  } else if (result.outcome === 'ai') {
    state.youLife -= result.damage;
    line += 'Vey wins the tide, you lose ' + result.damage + ' light.';
    resultEl.textContent = '🌊 VEY TAKES THE TIDE −' + result.damage + ' LIGHT';
    resultEl.className = 'round-result lose';
    AudioFX.play('lose');
  } else {
    line += 'The tide holds — no damage, both gain patience.';
    resultEl.textContent = '〰 THE TIDE HOLDS — NO DAMAGE';
    resultEl.className = 'round-result tie';
    AudioFX.play('tie');
  }
  if (result.heal > 0) {
    state.youLife = Math.min(MAX_LIFE, state.youLife + result.heal);
    line += ' Full Spectrum heals you ' + result.heal + '.';
  }
  const badges = result.youBonuses.map(function (b) { return '<span class="combo-badge">' + b.text + '</span>'; }).join('');
  el('power-line').innerHTML = 'Power ' + result.youPower + ' vs ' + result.aiPower + ' ' + badges;
  if (result.youBonuses.length > 0) AudioFX.play('combo');
  renderComboChips(result.youBonuses.map(function (b) { return b.name; }));
  renderTideTrail(state);
  renderLife(state);
  renderLog(line);
  setTimeout(function () { afterRound(result); }, 1250);
}

function afterRound(result) {
  if (state.aiLife <= 0) return endDuel(true);
  if (state.youLife <= 0) return endDuel(false);
  state.round++;
  state.youOil = Math.min(5, state.youOil + 1 + result.oilGain + result.tieOil);
  state.aiOil = Math.min(5, state.aiOil + 1);
  state.youHand = state.youHand.concat(drawCards(state.deck, state.discard, HAND_SIZE - state.youHand.length));
  state.aiHand = state.aiHand.concat(drawCards(state.deck, state.discard, HAND_SIZE - state.aiHand.length));
  state.busy = false;
  clearPlayedSlots();
  renderComboChips([]);
  startRound();
}

function endDuel(youWon) {
  state.screen = youWon ? 'win' : 'lose';
  state.busy = false;
  const title = el('end-title');
  const sub = el('end-sub');
  if (youWon) {
    title.textContent = '★ THE HARBOR IS YOURS ★';
    title.className = 'win';
    sub.textContent = 'Vey\'s light is sunk. The nine lanterns burn for Rin tonight.';
    AudioFX.play('win');
    showConfetti();
  } else {
    title.textContent = 'THE TIDE TAKES YOU';
    title.className = 'lose';
    sub.textContent = 'Vey keeps the harbor — this time. The lanterns will be lit again.';
    AudioFX.play('lose');
  }
  const s = state.stats;
  el('end-stats').innerHTML =
    statBox(s.rounds, 'Rounds') +
    statBox(s.biggestHit, 'Biggest hit') +
    statBox(s.combos, 'Combos') +
    statBox(s.cardsPlayed, 'Cards played');
  el('end-screen').classList.remove('hidden');
  renderLog(youWon ? 'Victory! The harbor is yours.' : 'Defeat. Vey keeps the harbor.');
}

function statBox(num, label) {
  return '<div class="stat-box"><div class="stat-num">' + num + '</div><div class="stat-label">' + label + '</div></div>';
}

// Clicks from the rendered hand land here (render.js wires them up).
window.HarborPlay = function (card, divEl) { playCard(card, divEl); };

document.getElementById('start-btn').addEventListener('click', function () {
  AudioFX.play('click');
  newGame();
});
document.getElementById('again-btn').addEventListener('click', function () {
  AudioFX.play('click');
  newGame();
});
document.getElementById('restart-btn').addEventListener('click', function () {
  AudioFX.play('click');
  newGame();
});
document.getElementById('sound-btn').addEventListener('click', function () {
  const on = AudioFX.toggle();
  document.getElementById('sound-btn').textContent = on ? '🔊 Sound on' : '🔇 Sound off';
});

document.addEventListener('keydown', function (e) {
  if (state.screen === 'title' && (e.key === 'Enter' || e.key === ' ')) { newGame(); return; }
  if ((state.screen === 'win' || state.screen === 'lose') && e.key === 'Enter') { newGame(); return; }
  if (state.screen !== 'table') return;
  const n = parseInt(e.key, 10);
  if (n >= 1 && n <= state.youHand.length) playCard(state.youHand[n - 1]);
});

// Test hook, only when the page is opened with ?test=1 (used by the headless
// play-test to reach the win and lose screens through real rounds).
if (window.location.search.indexOf('test=1') !== -1) {
  window.__harbor = {
    state: state,
    newGame: newGame,
    setLife: function (you, ai) {
      state.youLife = you;
      state.aiLife = ai;
      renderLife(state);
    },
    setAiCard: function (color, value) {
      const card = state.aiHand.find(function (c) { return c.color === color && c.value === value; }) ||
        { color: color, value: value, id: color + '-' + value };
      state.aiChosen = card;
      state.omen = aiTelegraph(card);
      renderOmen(state);
    },
  };
}
