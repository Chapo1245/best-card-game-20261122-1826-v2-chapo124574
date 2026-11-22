// ai.js — Vey, Captain of the Drowned Fleet.
// Vey picks a card at the start of each round, then telegraphs it through the
// Omen: the tide he favors (honest 3 times in 4) and whether the tide runs high.
// A player who reads the Omen can counter it; a player who ignores it gets sunk.

function aiChooseCard(hand, yourLastColor, aiLife, yourLife) {
  const scored = hand.map((card) => {
    let score = card.value;
    if (yourLastColor && beatsColor(card.color, yourLastColor)) score += 4;
    if (aiLife < yourLife && card.value >= 9) score += 2; // behind: spend the big tides
    if (aiLife <= 6 && card.value >= 10) score += 4; // desperate: throw the biggest tide
    if (aiLife > yourLife && card.value >= 10) score -= 3; // ahead: save the big tides
    if (card.value <= 3) score -= 1; // weak cards are for baiting, not leading
    return { card, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].card;
}

function aiTelegraph(card) {
  const honest = Math.random() < 0.75;
  let shownColor = card.color;
  if (!honest) {
    const others = COLORS.filter((c) => c.id !== card.color);
    shownColor = others[Math.floor(Math.random() * others.length)].id;
  }
  const highTide = card.value >= 8 && Math.random() < 0.75;
  return { color: shownColor, highTide, honest };
}
