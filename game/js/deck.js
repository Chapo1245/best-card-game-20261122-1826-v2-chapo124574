// deck.js — builds and shuffles the 36-card lantern deck.
// Three tides (colors), values 1-12 each. A card's identity is its tide + value.
const COLORS = [
  { id: 'amber', name: 'Amber', glyph: '☀', beats: 'teal' },
  { id: 'teal', name: 'Teal', glyph: '🌊', beats: 'violet' },
  { id: 'violet', name: 'Violet', glyph: '☾', beats: 'amber' },
];

function colorOf(colorId) {
  return COLORS.find((c) => c.id === colorId);
}

function buildDeck() {
  const deck = [];
  for (const c of COLORS) {
    for (let v = 1; v <= 12; v++) {
      deck.push({ color: c.id, value: v, id: c.id + '-' + v });
    }
  }
  return deck;
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = deck[i];
    deck[i] = deck[j];
    deck[j] = tmp;
  }
  return deck;
}

// Draw n cards, reshuffling the discard pile into the deck when it runs dry.
// Played cards return to the discard pile, so a long duel never runs out.
function drawCards(deck, discard, n) {
  const out = [];
  while (out.length < n) {
    if (deck.length === 0) {
      if (discard.length === 0) break;
      deck.push.apply(deck, shuffleDeck(discard.splice(0)));
    }
    out.push(deck.pop());
  }
  return out;
}
