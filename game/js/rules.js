// rules.js — the duel's rules: oil costs, the tide cycle, combos, round resolution.
// Cost: values 1-4 cost 1 oil, 5-8 cost 2, 9-12 cost 3.
// Tide cycle: Amber beats Teal, Teal beats Violet, Violet beats Amber (+3 power).

function costOf(card) {
  return 1 + Math.floor((card.value - 1) / 4);
}

function beatsColor(attackerColor, defenderColor) {
  return colorOf(attackerColor).beats === defenderColor;
}

// Combos are checked against the player's own played-card history (colors).
function comboBonuses(youCard, yourColorHistory) {
  const bonuses = [];
  if (yourColorHistory.length > 0 && yourColorHistory[yourColorHistory.length - 1] === youCard.color) {
    bonuses.push({ name: 'Twin Lights', power: 2, text: 'Twin Lights +2' });
  }
  const lastThree = yourColorHistory.slice(-2).concat([youCard.color]);
  if (lastThree.length === 3 && new Set(lastThree).size === 3) {
    bonuses.push({ name: 'Full Spectrum', power: 4, heal: 2, text: 'Full Spectrum +4, heal 2' });
  }
  if (youCard.value >= 10) {
    bonuses.push({ name: 'High Tide', power: 0, oil: 1, text: 'High Tide +1 oil' });
  }
  return bonuses;
}

// Resolves one round. Damage is the power gap, at least 1, at most 6.
function resolveRound(youCard, aiCard, yourColorHistory) {
  const youBonuses = comboBonuses(youCard, yourColorHistory);
  const bonusPower = youBonuses.reduce((sum, b) => sum + b.power, 0);
  const youPower = youCard.value + (beatsColor(youCard.color, aiCard.color) ? 3 : 0) + bonusPower;
  const aiPower = aiCard.value + (beatsColor(aiCard.color, youCard.color) ? 3 : 0);
  const diff = youPower - aiPower;
  let outcome = 'tie';
  let damage = 0;
  if (diff > 0) {
    outcome = 'you';
    damage = Math.max(1, Math.min(6, diff));
  } else if (diff < 0) {
    outcome = 'ai';
    damage = Math.max(1, Math.min(6, -diff));
  }
  const heal = youBonuses.reduce((sum, b) => sum + (b.heal || 0), 0);
  const oilGain = youBonuses.reduce((sum, b) => sum + (b.oil || 0), 0);
  // A tied tide grants both sides patience: +1 oil next round.
  const tieOil = outcome === 'tie' ? 1 : 0;
  return { youPower, aiPower, outcome, damage, heal, oilGain, tieOil, youBonuses };
}
