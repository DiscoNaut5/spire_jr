const GAME_CONFIG = {
  maxFights: 3,
  maxEnergy: 3,
  handSize: 5,
  player: {
    maxHp: 20,
    artSrc: 'assets/hero.png'
  },
  startingDeckIds: ['atk2', 'atk2', 'atk3', 'atk3', 'blk2', 'blk2', 'blk3', 'heal3'],
  cardPool: [
    { id: 'atk2', type: 'attack', value: 2, cost: 1, icon: '🗡️', label: 'Bonk', artSrc: 'assets/attack.png' },
    { id: 'atk3', type: 'attack', value: 3, cost: 1, icon: '🗡️', label: 'Big Bonk', artSrc: 'assets/attack.png' },
    { id: 'atk4', type: 'attack', value: 4, cost: 1, icon: '🗡️', label: 'Mega Bonk', artSrc: 'assets/attack.png' },
    { id: 'blk2', type: 'block', value: 2, cost: 1, icon: '🛡️', label: 'Defend', artSrc: 'assets/hide.png' },
    { id: 'blk3', type: 'block', value: 3, cost: 1, icon: '🛡️', label: 'Big Defend', artSrc: 'assets/hide.png' },
    { id: 'blk4', type: 'block', value: 4, cost: 1, icon: '🛡️', label: 'Super Defend', artSrc: 'assets/hide.png' },
    { id: 'heal3', type: 'heal', value: 3, cost: 1, icon: '💖', label: 'Magic Potion', artSrc: 'assets/potion.png' }
  ],
  enemies: [
    { name: '🟢 Blob', artSrc: 'assets/broccoli.png', maxHp: 14, intents: [2, 3, 4] },
    { name: '🐍 Snake', art: '🐍', maxHp: 18, intents: [3, 4, 5] },
    { name: '🦀 Crab', art: '🦀', maxHp: 22, intents: [4, 5, 6] }
  ]
};

const els = {
  playerHpText: document.getElementById('playerHpText'),
  playerHpFill: document.getElementById('playerHpFill'),
  playerBlockText: document.getElementById('playerBlockText'),
  playerBlockFill: document.getElementById('playerBlockFill'),
  energyRow: document.getElementById('energyRow'),
  heroArt: document.getElementById('heroArt'),
  heroBase: document.getElementById('heroBase'),
  enemyName: document.getElementById('enemyName'),
  enemyHpText: document.getElementById('enemyHpText'),
  enemyHpFill: document.getElementById('enemyHpFill'),
  enemyArt: document.getElementById('enemyArt'),
  enemyBaseImg: document.getElementById('enemyBaseImg'),
  enemyBase: document.getElementById('enemyBase'),
  enemyIntent: document.getElementById('enemyIntent'),
  fightCounter: document.getElementById('fightCounter'),
  deckCounter: document.getElementById('deckCounter'),
  drawCounter: document.getElementById('drawCounter'),
  discardCounter: document.getElementById('discardCounter'),
  pileModal: document.getElementById('pileModal'),
  pileModalBackdrop: document.getElementById('pileModalBackdrop'),
  pileModalTitle: document.getElementById('pileModalTitle'),
  pileModalMeta: document.getElementById('pileModalMeta'),
  pileModalList: document.getElementById('pileModalList'),
  pileModalClose: document.getElementById('pileModalClose'),
  hand: document.getElementById('hand'),
  endTurnBtn: document.getElementById('endTurnBtn')
};

let nextUid = 1;

function makeUid() {
  return 'card-' + nextUid++;
}

function findCardTemplate(id) {
  return GAME_CONFIG.cardPool.find(card => card.id === id);
}

function cloneCard(card) {
  return { ...card, uid: makeUid() };
}

function buildStartingDeck() {
  return GAME_CONFIG.startingDeckIds.map(id => cloneCard(findCardTemplate(id)));
}

function shuffle(cards) {
  const copy = cards.slice();

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const temp = copy[index];
    copy[index] = copy[randomIndex];
    copy[randomIndex] = temp;
  }

  return copy;
}

function randomFrom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function sleep(ms) {
  return new Promise(resolve => {
    window.setTimeout(resolve, ms);
  });
}

function createInitialState() {
  return {
    runFight: 1,
    energy: GAME_CONFIG.maxEnergy,
    player: {
      hp: GAME_CONFIG.player.maxHp,
      maxHp: GAME_CONFIG.player.maxHp,
      block: 0
    },
    enemy: null,
    drawPile: [],
    discardPile: [],
    hand: [],
    turnLocked: false,
    gameOver: false,
    message: 'Play cards, then tap End Turn.'
  };
}

const state = createInitialState();

function resetState() {
  nextUid = 1;
  Object.assign(state, createInitialState());
  resetDeck(buildStartingDeck());
  startFight();
}

function resetDeck(cards) {
  state.drawPile = shuffle(cards.map(cloneCard));
  state.discardPile = [];
  state.hand = [];
}

function createEnemyForFight(fightNumber) {
  const baseEnemy = GAME_CONFIG.enemies[Math.min(fightNumber - 1, GAME_CONFIG.enemies.length - 1)];
  const extraHp = (fightNumber - 1) * 2;

  return {
    name: baseEnemy.name,
    art: baseEnemy.art,
    artSrc: baseEnemy.artSrc,
    intents: baseEnemy.intents.slice(),
    maxHp: baseEnemy.maxHp + extraHp,
    hp: baseEnemy.maxHp + extraHp,
    nextIntent: randomFrom(baseEnemy.intents)
  };
}

function setMessage(text) {
  state.message = text;
}

function refillEnergy() {
  state.energy = GAME_CONFIG.maxEnergy;
}

function clearBlock() {
  state.player.block = 0;
}

function moveHandToDiscard() {
  state.discardPile.push(...state.hand);
  state.hand = [];
}

function refillDrawPileIfNeeded() {
  if (state.drawPile.length > 0 || state.discardPile.length === 0) {
    return;
  }

  state.drawPile = shuffle(state.discardPile);
  state.discardPile = [];
}

function drawCards(targetCount) {
  while (state.hand.length < targetCount) {
    refillDrawPileIfNeeded();

    const card = state.drawPile.pop();
    if (!card) {
      break;
    }

    state.hand.push(card);
  }
}

function spendEnergy(cost) {
  if (state.energy < cost) {
    return false;
  }

  state.energy -= cost;
  return true;
}

function applyAttack(amount) {
  state.enemy.hp = Math.max(0, state.enemy.hp - amount);
  showHeroAttackJiggle();
  showAttackAnimation();
}

function applyBlock(amount) {
  state.player.block += amount;
}

function applyHeal(amount) {
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + amount);
}

function applyEnemyAttack() {
  const incomingDamage = state.enemy.nextIntent;
  const damageTaken = Math.max(0, incomingDamage - state.player.block);

  if (incomingDamage > 0) {
    showEnemyAttackJiggle();
  }

  state.player.hp = Math.max(0, state.player.hp - damageTaken);

  if (damageTaken > 0) {
    showHeroHitAnimation();
  } else if (incomingDamage > 0) {
    showHeroBlockAnimation();
  }

  clearBlock();
  return damageTaken;
}

function queueNextEnemyIntent() {
  state.enemy.nextIntent = randomFrom(state.enemy.intents);
}

function getDeckCount() {
  return state.drawPile.length + state.discardPile.length + state.hand.length;
}

function getFightLabel() {
  return 'Fight ' + state.runFight + ' of ' + GAME_CONFIG.maxFights;
}

function getEnergyIcons() {
  let icons = '';

  for (let count = 0; count < state.energy; count += 1) {
    icons += '⚡';
  }

  return icons || '—';
}

function getStatusMessage() {
  if (state.gameOver && state.player.hp <= 0) {
    return 'Oh no! The monster won. Refresh to try again.';
  }

  if (state.gameOver && state.player.hp > 0) {
    return 'You won the whole adventure. Nice job!';
  }

  return state.message;
}

function getCardSummary(card) {
  return card.icon + ' ' + card.label;
}

function renderPileModalContent(title, cards, meta) {
  els.pileModalTitle.textContent = title;
  els.pileModalMeta.textContent = meta;
  els.pileModalList.innerHTML = '';

  if (cards.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'pile-modal-item empty';
    empty.textContent = 'No cards here';
    els.pileModalList.appendChild(empty);
    return;
  }

  cards.forEach(card => {
    const row = document.createElement('div');
    row.className = 'pile-modal-item';
    row.innerHTML =
      '<span class="pile-item-name">' + getCardSummary(card) + '</span>' +
      '<span class="pile-item-value">⚡' + card.cost + ' • ' + card.value + '</span>';
    els.pileModalList.appendChild(row);
  });
}

function openPileModal(pileType) {
  if (pileType === 'deck') {
    const deckCards = state.hand.concat(state.drawPile, state.discardPile);
    const meta = 'Total ' + deckCards.length + ' cards • Draw ' + state.drawPile.length + ' • Discard ' + state.discardPile.length + ' • Hand ' + state.hand.length;
    renderPileModalContent('Deck', deckCards, meta);
  } else if (pileType === 'draw') {
    const drawCards = state.drawPile.slice().reverse();
    renderPileModalContent('Draw Pile', drawCards, 'Top card shown first • ' + drawCards.length + ' cards');
  } else if (pileType === 'discard') {
    const discardCards = state.discardPile.slice().reverse();
    renderPileModalContent('Discard Pile', discardCards, 'Most recently discarded shown first • ' + discardCards.length + ' cards');
  }

  els.pileModal.classList.remove('hidden');
  els.pileModal.setAttribute('aria-hidden', 'false');
}

function closePileModal() {
  els.pileModal.classList.add('hidden');
  els.pileModal.setAttribute('aria-hidden', 'true');
}

function playCard(cardUid) {
  if (state.gameOver || state.turnLocked) {
    return;
  }

  const handIndex = state.hand.findIndex(card => card.uid === cardUid);
  if (handIndex === -1) {
    return;
  }

  const card = state.hand[handIndex];
  if (!spendEnergy(card.cost)) {
    setMessage('You need more energy for that card.');
    render();
    return;
  }

  state.hand.splice(handIndex, 1);

  if (card.type === 'attack') {
    applyAttack(card.value);
    setMessage('Bonk! You hit for ' + card.value + '.');
  } else if (card.type === 'block') {
    applyBlock(card.value);
    setMessage('Nice! You built ' + card.value + ' block.');
  } else if (card.type === 'heal') {
    showHeroPotionAnimation();
    const hpBefore = state.player.hp;
    applyHeal(card.value);
    setMessage('Yum! You healed ' + (state.player.hp - hpBefore) + '.');
  }

  state.discardPile.push(card);

  if (state.enemy.hp <= 0) {
    handleFightWin();
    return;
  }

  render();
}

async function endTurn() {
  if (state.gameOver || state.turnLocked) {
    return;
  }

  state.turnLocked = true;
  moveHandToDiscard();
  render();

  await sleep(220);

  const damageTaken = applyEnemyAttack();
  render();

  if (state.player.hp <= 0) {
    state.gameOver = true;
    state.turnLocked = false;
    setMessage('Oh no! The monster won. Refresh to try again.');
    render();
    return;
  }

  await sleep(520);

  refillEnergy();
  queueNextEnemyIntent();
  drawCards(GAME_CONFIG.handSize);
  state.turnLocked = false;

  if (damageTaken > 0) {
    setMessage('Ouch! The monster hit for ' + damageTaken + '.');
  } else {
    setMessage('Blocked it all. Great job!');
  }

  render();
}

function handleFightWin() {
  if (state.runFight >= GAME_CONFIG.maxFights) {
    state.gameOver = true;
    setMessage('You won the whole adventure. Nice job!');
    render();
    return;
  }

  state.runFight += 1;
  moveHandToDiscard();
  setMessage('You won that fight. A new monster appears!');
  startFight();
}

function startFight() {
  clearBlock();
  refillEnergy();
  state.hand = [];
  state.enemy = createEnemyForFight(state.runFight);
  drawCards(GAME_CONFIG.handSize);
  render();
}

function showAttackAnimation() {
  const swing = document.createElement('div');
  swing.className = 'sword-swing';
  swing.textContent = '🗡️';

  els.enemyArt.appendChild(swing);
  els.enemyArt.classList.remove('enemy-hit');
  void els.enemyArt.offsetWidth;
  els.enemyArt.classList.add('enemy-hit');

  window.setTimeout(() => {
    els.enemyArt.classList.remove('enemy-hit');

    if (swing.parentNode) {
      swing.parentNode.removeChild(swing);
    }
  }, 520);
}

function showHeroHitAnimation() {
  const slash = document.createElement('div');
  slash.className = 'hero-slash';
  slash.textContent = '🗡️';

  els.heroArt.classList.remove('hero-hit');
  void els.heroArt.offsetWidth;
  els.heroArt.classList.add('hero-hit');
  els.heroArt.appendChild(slash);

  window.setTimeout(() => {
    els.heroArt.classList.remove('hero-hit');

    if (slash.parentNode) {
      slash.parentNode.removeChild(slash);
    }
  }, 420);
}

function showHeroBlockAnimation() {
  const shieldBurst = document.createElement('div');
  shieldBurst.className = 'hero-shield-burst';

  const ricochetSword = document.createElement('div');
  ricochetSword.className = 'hero-blocked-sword';
  ricochetSword.textContent = '🗡️';

  els.heroArt.appendChild(shieldBurst);
  els.heroArt.appendChild(ricochetSword);

  window.setTimeout(() => {
    if (shieldBurst.parentNode) {
      shieldBurst.parentNode.removeChild(shieldBurst);
    }

    if (ricochetSword.parentNode) {
      ricochetSword.parentNode.removeChild(ricochetSword);
    }
  }, 740);
}

function showHeroAttackJiggle() {
  els.heroArt.classList.remove('hero-attack-jiggle');
  void els.heroArt.offsetWidth;
  els.heroArt.classList.add('hero-attack-jiggle');

  window.setTimeout(() => {
    els.heroArt.classList.remove('hero-attack-jiggle');
  }, 340);
}

function showEnemyAttackJiggle() {
  els.enemyArt.classList.remove('enemy-attack-jiggle');
  void els.enemyArt.offsetWidth;
  els.enemyArt.classList.add('enemy-attack-jiggle');

  window.setTimeout(() => {
    els.enemyArt.classList.remove('enemy-attack-jiggle');
  }, 340);
}

function showHeroPotionAnimation() {
  const potion = document.createElement('div');
  potion.className = 'hero-potion-arc';
  potion.textContent = '🧪';

  const buttonRect = els.endTurnBtn.getBoundingClientRect();
  const heroRect = els.heroArt.getBoundingClientRect();

  const startX = buttonRect.right - 24;
  const startY = buttonRect.bottom - 18;
  const landX = heroRect.left + heroRect.width * 0.52;
  const landY = heroRect.top + heroRect.height * 0.56;

  potion.style.left = startX + 'px';
  potion.style.top = startY + 'px';
  document.body.appendChild(potion);

  // Smooth quadratic arc from end-turn button to hero center.
  const controlX = (startX + landX) * 0.5 + 84;
  const controlY = Math.min(startY, landY) - 220;
  const durationMs = 820;
  const startTime = performance.now();

  function tick(now) {
    const t = Math.min(1, (now - startTime) / durationMs);
    const u = 1 - t;

    const x = u * u * startX + 2 * u * t * controlX + t * t * landX;
    const y = u * u * startY + 2 * u * t * controlY + t * t * landY;

    const dx = 2 * u * (controlX - startX) + 2 * t * (landX - controlX);
    const dy = 2 * u * (controlY - startY) + 2 * t * (landY - controlY);
    const tangentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    const spin = t * 420;
    const scale = t < 0.62 ? 0.62 + t * 0.62 : 1.0 - (t - 0.62) * 0.7;
    const opacity = t < 0.12 ? t / 0.12 : (t > 0.9 ? 1 - (t - 0.9) / 0.1 : 1);

    potion.style.left = x + 'px';
    potion.style.top = y + 'px';
    potion.style.opacity = String(Math.max(0, Math.min(1, opacity)));
    potion.style.transform = 'translate(-50%, -50%) rotate(' + (tangentAngle + spin + 90) + 'deg) scale(' + scale + ')';

    if (t < 1) {
      window.requestAnimationFrame(tick);
      return;
    }

    if (potion.parentNode) {
      potion.parentNode.removeChild(potion);
    }
  }

  window.requestAnimationFrame(tick);
}

function renderHand() {
  els.hand.innerHTML = '';

  state.hand.forEach(card => {
    const button = document.createElement('button');
    const isDisabled = state.gameOver || state.turnLocked || state.energy < card.cost;

    button.className = 'card';
    button.classList.add('card-type-' + card.type);
    if (isDisabled) {
      button.classList.add('disabled');
    }

    const cardArt = card.artSrc
      ? '<img class="card-art" src="' + card.artSrc + '" alt="' + card.label + ' art" />'
      : '<div class="card-icon">' + card.icon + '</div>';

    button.innerHTML =
      '<div class="card-cost">⚡' + card.cost + '</div>' +
      '<div class="card-media">' + cardArt + '</div>' +
      '<div class="card-meta"><div class="card-value">' + card.value + '</div><div class="card-label">' + card.label + '</div></div>';

    button.disabled = isDisabled;
    button.addEventListener('click', () => playCard(card.uid));
    els.hand.appendChild(button);
  });
}

function renderBars() {
  els.playerHpText.textContent = state.player.hp + ' / ' + state.player.maxHp;
  els.playerHpFill.style.width = (state.player.hp / state.player.maxHp) * 100 + '%';

  els.playerBlockText.textContent = String(state.player.block);
  els.playerBlockFill.style.width = Math.min(100, state.player.block * 10) + '%';

  els.enemyHpText.textContent = state.enemy.hp + ' / ' + state.enemy.maxHp;
  els.enemyHpFill.style.width = (state.enemy.hp / state.enemy.maxHp) * 100 + '%';
}

function renderMeta() {
  els.heroBase.src = GAME_CONFIG.player.artSrc;
  els.enemyName.textContent = state.enemy.name;
  els.energyRow.textContent = getEnergyIcons();
  els.enemyIntent.textContent = '🗡️ ' + state.enemy.nextIntent;
  els.fightCounter.textContent = getFightLabel();
  els.deckCounter.textContent = 'Deck ' + getDeckCount();
  els.drawCounter.textContent = 'Draw ' + state.drawPile.length;
  els.discardCounter.textContent = 'Discard ' + state.discardPile.length;

  if (state.enemy.artSrc) {
    els.enemyBaseImg.style.display = 'block';
    els.enemyBaseImg.src = state.enemy.artSrc;
    els.enemyBase.style.display = 'none';
  } else {
    els.enemyBaseImg.style.display = 'none';
    els.enemyBase.style.display = 'block';
    els.enemyBase.textContent = state.enemy.art;
  }
  const endTurnReady = !state.gameOver && state.energy <= 0;
  els.endTurnBtn.disabled = state.gameOver || state.turnLocked;
  els.endTurnBtn.classList.toggle('end-turn-ready', endTurnReady);
  els.endTurnBtn.setAttribute('data-ready', endTurnReady ? 'true' : 'false');
}

function render() {
  renderBars();
  renderMeta();
  renderHand();
}

els.endTurnBtn.addEventListener('click', endTurn);
els.deckCounter.addEventListener('click', () => openPileModal('deck'));
els.drawCounter.addEventListener('click', () => openPileModal('draw'));
els.discardCounter.addEventListener('click', () => openPileModal('discard'));
els.pileModalClose.addEventListener('click', closePileModal);
els.pileModalBackdrop.addEventListener('click', closePileModal);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closePileModal();
  }
});

resetState();
