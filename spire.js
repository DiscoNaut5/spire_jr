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

  state.player.hp = Math.max(0, state.player.hp - damageTaken);

  if (damageTaken > 0) {
    showHeroHitAnimation();
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

function playCard(cardUid) {
  if (state.gameOver) {
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

function endTurn() {
  if (state.gameOver) {
    return;
  }

  const damageTaken = applyEnemyAttack();
  moveHandToDiscard();

  if (state.player.hp <= 0) {
    state.gameOver = true;
    setMessage('Oh no! The monster won. Refresh to try again.');
    render();
    return;
  }

  refillEnergy();
  queueNextEnemyIntent();
  drawCards(GAME_CONFIG.handSize);

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

function renderHand() {
  els.hand.innerHTML = '';

  state.hand.forEach(card => {
    const button = document.createElement('button');
    const isDisabled = state.gameOver || state.energy < card.cost;

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
  els.deckCounter.textContent = 'Deck ' + getDeckCount() + ' cards';

  if (state.enemy.artSrc) {
    els.enemyBaseImg.style.display = 'block';
    els.enemyBaseImg.src = state.enemy.artSrc;
    els.enemyBase.style.display = 'none';
  } else {
    els.enemyBaseImg.style.display = 'none';
    els.enemyBase.style.display = 'block';
    els.enemyBase.textContent = state.enemy.art;
  }
  els.endTurnBtn.disabled = state.gameOver;
}

function render() {
  renderBars();
  renderMeta();
  renderHand();
}

els.endTurnBtn.addEventListener('click', endTurn);

resetState();
