const GAME_CONFIG = {
  maxFights: 3,
  maxEnergy: 3,
  handSize: 5,
  battlefields: [
    { id: 'mars', image: 'assets/mars_background.png', position: '58% 36%' },
    { id: 'haunted-mansion', image: 'assets/haunted_mansion_background.png', position: '50% 44%' },
    { id: 'enchanted-forest', image: 'assets/enchanted_forest.png', position: '50% 42%' },
    { id: 'dungeon', image: 'assets/dungeon.png', position: '50% 36%' },
    { id: 'beach-castle', image: 'assets/beach_castle.png', position: '50% 46%' },
    { id: 'disney-castle', image: 'assets/disney_castle.png', position: '50% 47%' }
  ],
  player: {
    maxHp: 20,
    artSrc: 'assets/hero.png'
  },
  startingDeckIds: ['atk1', 'atk1', 'atk1', 'atk1', 'blk1', 'blk1', 'blk1', 'heal1'],
  cardPool: [
    { id: 'atk1', type: 'attack', value: 2, cost: 1, icon: '🗡️', label: 'Bonk', artSrc: 'assets/attack.png' },
    { id: 'atk2', type: 'attack', value: 3, cost: 1, icon: '🗡️', label: 'Big Bonk', artSrc: 'assets/big_bonk.png' },
    { id: 'atk3', type: 'attack', value: 6, cost: 1, icon: '🗡️', label: 'Chain Lightning', artSrc: 'assets/mega_bonk.png' },
    { id: 'atk4', type: 'attack', value: 4, cost: 1, icon: '🗡️', label: 'Fireball', artSrc: 'assets/fireball.png' },
    { id: 'atk5', type: 'attack', value: 5, cost: 1, icon: '🗡️', label: 'Fart in a Jar', artSrc: 'assets/fartjar.png' },
    { id: 'blk1', type: 'block', value: 2, cost: 1, icon: '🛡️', label: 'Hide', artSrc: 'assets/hide.png' },
    { id: 'blk2', type: 'block', value: 3, cost: 1, icon: '🛡️', label: 'Defend', artSrc: 'assets/super_defend.png' },
    { id: 'blk3', type: 'block', value: 4, cost: 1, icon: '🛡️', label: 'Super Defend', artSrc: 'assets/defend.png' },
    { id: 'blk4', type: 'block', value: 6, cost: 1, icon: '🛡️', label: 'Distract with Octopus', artSrc: 'assets/octopus.png' },
    { id: 'heal1', type: 'heal', value: 3, cost: 1, icon: '💖', label: 'Neosporin', artSrc: 'assets/neosporin.png' },
    { id: 'heal2', type: 'heal', value: 5, cost: 1, icon: '💖', label: 'Magic Potion', artSrc: 'assets/super_potion.png' }
  ],
  enemies: [
    { name: 'Bats!', artSrc: 'assets/bats.png', maxHp: 7, intents: [1, 2, 2] },
    { name: 'Birds!', artSrc: 'assets/birds.png', maxHp: 8, intents: [1, 2, 2] },
    { name: 'Leech', artSrc: 'assets/leech.png', maxHp: 9, intents: [1, 2, 2] },
    { name: 'Evil Snail', artSrc: 'assets/snail.png', maxHp: 10, intents: [1, 2, 2] },
    { name: 'Evil Tardigrade', artSrc: 'assets/tardigrade.png', maxHp: 14, intents: [1, 2, 3] },
    { name: '🐉 Dragon', artSrc: 'assets/dragon.png', maxHp: 18, intents: [3, 3, 4], attackFx: '🔥🔥🔥' },
    { name: 'Broccoli Rob', artSrc: 'assets/broccoli.png', maxHp: 20, intents: [4, 4, 5] },
    { name: 'dogs', artSrc: 'assets/dogs.png', maxHp: 24, intents: [3, 8, 9] },
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
  rewardChestOverlay: document.getElementById('rewardChestOverlay'),
  rewardChestImage: document.getElementById('rewardChestImage'),
  rewardPrompt: document.getElementById('rewardPrompt'),
  youWonOverlay: document.getElementById('youWonOverlay'),
  youDiedOverlay: document.getElementById('youDiedOverlay'),
  fightAgainBtn: document.getElementById('fightAgainBtn'),
  fightAgainBtnDied: document.getElementById('fightAgainBtnDied'),
  arenaPanel: document.getElementById('arenaPanel'),
  fightStage: document.getElementById('fightStage'),
  battleRow: document.getElementById('battleRow'),
  rewardChoices: document.getElementById('rewardChoices'),
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
    awaitingReward: false,
    rewardChestOpen: false,
    rewardRevealReady: false,
    rewardOptions: [],
    battlefield: null,
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

  return {
    name: baseEnemy.name,
    art: baseEnemy.art,
    artSrc: baseEnemy.artSrc,
    attackFx: baseEnemy.attackFx || '🗡️',
    intents: baseEnemy.intents.slice(),
    maxHp: baseEnemy.maxHp,
    hp: baseEnemy.maxHp,
    nextIntent: randomFrom(baseEnemy.intents)
  };
}

function getEnemyAttackFx() {
  return state.enemy && state.enemy.attackFx ? state.enemy.attackFx : '🗡️';
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

async function applyAttack(amount) {
  showHeroAttackJiggle();
  await showAttackAnimation();
  state.enemy.hp = Math.max(0, state.enemy.hp - amount);
  showEnemyHpDrainAnimation();
}

async function applyBlock(amount) {
  await showHeroBlockCastAnimation(() => {
    state.player.block += amount;
    render();
    showBlockFillAnimation();
  }, '🛡️');
}

function showBlockFillAnimation() {
  els.playerBlockFill.classList.remove('block-gain');
  void els.playerBlockFill.offsetWidth;
  els.playerBlockFill.classList.add('block-gain');

  window.setTimeout(() => {
    els.playerBlockFill.classList.remove('block-gain');
  }, 720);
}

function showEnemyHpDrainAnimation() {
  els.enemyHpFill.classList.remove('enemy-hp-drain');
  void els.enemyHpFill.offsetWidth;
  els.enemyHpFill.classList.add('enemy-hp-drain');

  window.setTimeout(() => {
    els.enemyHpFill.classList.remove('enemy-hp-drain');
  }, 760);
}

function showPlayerHpDrainAnimation() {
  els.playerHpFill.classList.remove('player-hp-drain');
  void els.playerHpFill.offsetWidth;
  els.playerHpFill.classList.add('player-hp-drain');

  window.setTimeout(() => {
    els.playerHpFill.classList.remove('player-hp-drain');
  }, 760);
}

async function showHeroBlockCastAnimation(onGleamStart, castIcon = '🛡️') {
  const castShield = document.createElement('div');
  castShield.className = 'hero-cast-shield';
  castShield.setAttribute('data-cast-icon', castIcon);

  const shimmer = document.createElement('div');
  shimmer.className = 'hero-body-gleam';
  shimmer.classList.toggle('hero-body-gleam-heal', castIcon === '💖');

  els.heroArt.appendChild(castShield);

  await sleep(725);
  if (castShield.parentNode) {
    castShield.parentNode.removeChild(castShield);
  }

  els.heroArt.appendChild(shimmer);
  if (typeof onGleamStart === 'function') {
    onGleamStart();
  }
  await sleep(870);

  if (shimmer.parentNode) {
    shimmer.parentNode.removeChild(shimmer);
  }
}

async function applyHeal(amount) {
  await showHeroPotionAnimation();
  showHeroBlockCastAnimation(undefined, '💖');

  els.playerHpFill.classList.remove('player-hp-heal');
  void els.playerHpFill.offsetWidth;
  els.playerHpFill.classList.add('player-hp-heal');

  const hpBefore = state.player.hp;
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + amount);
  render();

  window.setTimeout(() => {
    els.playerHpFill.classList.remove('player-hp-heal');
  }, 1180);

  return state.player.hp - hpBefore;
}

function showCardPlayAnimation(cardElement) {
  if (!cardElement) {
    return Promise.resolve();
  }

  return new Promise(resolve => {
    const rect = cardElement.getBoundingClientRect();
    const clone = cardElement.cloneNode(true);
    cardElement.style.visibility = 'hidden';
    cardElement.style.pointerEvents = 'none';
    clone.style.visibility = 'visible';
    clone.classList.add('card-play-clone');
    clone.style.left = rect.left + 'px';
    clone.style.top = rect.top + 'px';
    clone.style.width = rect.width + 'px';
    clone.style.height = rect.height + 'px';
    clone.style.margin = '0';
    clone.style.pointerEvents = 'none';
    clone.disabled = true;
    document.body.appendChild(clone);

    // Force style flush so the animation class transition starts reliably.
    void clone.offsetWidth;
    clone.classList.add('card-play-fly');

    window.setTimeout(() => {
      if (clone.parentNode) {
        clone.parentNode.removeChild(clone);
      }
      resolve();
    }, 640);
  });
}

async function applyEnemyAttack() {
  const incomingDamage = state.enemy.nextIntent;
  const damageTaken = Math.max(0, incomingDamage - state.player.block);

  if (incomingDamage > 0) {
    showEnemyAttackJiggle();
  }

  if (damageTaken > 0) {
    await showHeroHitAnimation();
    state.player.hp = Math.max(0, state.player.hp - damageTaken);
    showPlayerHpDrainAnimation();
  } else if (incomingDamage > 0) {
    showHeroBlockAnimation();
  }

  clearBlock();
  return damageTaken;
}

function queueNextEnemyIntent() {
  state.enemy.nextIntent = randomFrom(state.enemy.intents);
}

function pickBattlefield() {
  if (!Array.isArray(GAME_CONFIG.battlefields) || GAME_CONFIG.battlefields.length === 0) {
    return null;
  }

  return randomFrom(GAME_CONFIG.battlefields);
}

function getDeckCount() {
  return state.drawPile.length + state.discardPile.length + state.hand.length;
}

function getFightLabel() {
  const totalFights = Math.max(1, GAME_CONFIG.enemies.length);
  return 'Fight ' + state.runFight + ' of ' + totalFights;
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

function isFinalFight() {
  return state.runFight >= Math.max(1, GAME_CONFIG.enemies.length);
}

function getCardSummary(card) {
  return card.icon + ' ' + card.label;
}

function getCardTypeStatIcon(cardType) {
  if (cardType === 'attack') {
    return '⚔️';
  }

  if (cardType === 'block') {
    return '🛡️';
  }

  if (cardType === 'heal') {
    return '❤️';
  }

  return '';
}

function buildRewardOptions(count) {
  const starterIds = new Set(GAME_CONFIG.startingDeckIds);
  const rewardPool = GAME_CONFIG.cardPool.filter(card => !starterIds.has(card.id));
  const sourcePool = rewardPool.length > 0 ? rewardPool : GAME_CONFIG.cardPool;
  const pickCount = Math.min(count, sourcePool.length);

  return shuffle(sourcePool.slice())
    .slice(0, pickCount)
    .map(card => card.id);
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
  if (state.awaitingReward) {
    return;
  }

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

async function playCard(cardUid, cardElement) {
  if (state.gameOver || state.turnLocked || state.awaitingReward) {
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

  state.turnLocked = true;
  await showCardPlayAnimation(cardElement);
  state.turnLocked = false;

  state.hand.splice(handIndex, 1);

  if (card.type === 'attack') {
    await applyAttack(card.value);
    setMessage('Bonk! You hit for ' + card.value + '.');
  } else if (card.type === 'block') {
    await applyBlock(card.value);
    setMessage('Nice! You built ' + card.value + ' block.');
  } else if (card.type === 'heal') {
    const healed = await applyHeal(card.value);
    setMessage('Yum! You healed ' + healed + '.');
  }

  state.discardPile.push(card);

  if (state.enemy.hp <= 0) {
    handleFightWin();
    return;
  }

  render();
}

async function endTurn() {
  if (state.gameOver || state.turnLocked || state.awaitingReward) {
    return;
  }

  state.turnLocked = true;
  moveHandToDiscard();
  render();

  await sleep(220);

  const damageTaken = await applyEnemyAttack();
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
  if (isFinalFight()) {
    state.awaitingReward = false;
    state.rewardChestOpen = false;
    state.rewardRevealReady = false;
    state.rewardOptions = [];
    closePileModal();
    state.gameOver = true;
    setMessage('You won the whole adventure. Nice job!');
    render();
    return;
  }

  moveHandToDiscard();
  state.awaitingReward = true;
  state.rewardChestOpen = false;
  state.rewardRevealReady = false;
  state.rewardOptions = buildRewardOptions(3);
  closePileModal();
  setMessage('Choose a reward card.');
  render();
}

async function pickReward(cardId, selectedEl) {
  if (!state.awaitingReward || !state.rewardChestOpen) {
    return;
  }

  const template = findCardTemplate(cardId);
  if (!template) {
    return;
  }

  state.turnLocked = true;

  const rewardButtons = Array.from(els.rewardChoices.querySelectorAll('.reward-choice'));
  rewardButtons.forEach(button => {
    if (button === selectedEl) {
      button.classList.add('reward-choice-picked');
    } else {
      button.classList.add('reward-choice-fade');
    }
  });

  await sleep(640);

  state.discardPile.push(cloneCard(template));
  state.awaitingReward = false;
  state.rewardChestOpen = false;
  state.rewardRevealReady = false;
  state.rewardOptions = [];
  state.runFight += 1;
  state.turnLocked = false;
  setMessage('You picked ' + template.label + '. A new monster appears!');
  startFight();
}

function startFight() {
  clearBlock();
  refillEnergy();
  state.awaitingReward = false;
  state.rewardChestOpen = false;
  state.rewardRevealReady = false;
  state.rewardOptions = [];
  state.hand = [];
  state.enemy = createEnemyForFight(state.runFight);
  state.battlefield = pickBattlefield();
  drawCards(GAME_CONFIG.handSize);
  render();
}

function showAttackAnimation() {
  return new Promise(resolve => {
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

      resolve();
    }, 520);
  });
}

function showHeroHitAnimation() {
  return new Promise(resolve => {
    const slash = document.createElement('div');
    slash.className = 'hero-slash';
    slash.textContent = getEnemyAttackFx();
    slash.classList.toggle('hero-slash-fire', slash.textContent.includes('🔥'));

    els.heroArt.classList.remove('hero-hit');
    void els.heroArt.offsetWidth;
    els.heroArt.classList.add('hero-hit');
    els.heroArt.appendChild(slash);

    window.setTimeout(() => {
      els.heroArt.classList.remove('hero-hit');

      if (slash.parentNode) {
        slash.parentNode.removeChild(slash);
      }

      resolve();
    }, 420);
  });
}

function showHeroBlockAnimation() {
  const shieldBurst = document.createElement('div');
  shieldBurst.className = 'hero-shield-burst';

  const ricochetSword = document.createElement('div');
  ricochetSword.className = 'hero-blocked-sword';
  ricochetSword.textContent = getEnemyAttackFx();
  ricochetSword.classList.toggle('hero-blocked-fire', ricochetSword.textContent.includes('🔥'));

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
  return new Promise(resolve => {
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
    resolve();
  }

  window.requestAnimationFrame(tick);
  });
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
      '<div class="card-title">' + card.label + '</div>' +
      '<div class="card-media">' + cardArt + '</div>' +
      '<div class="card-meta"><div class="card-stat-icon">' + getCardTypeStatIcon(card.type) + '</div><div class="card-value">' + card.value + '</div></div>';

    button.disabled = isDisabled;
    button.addEventListener('click', event => playCard(card.uid, event.currentTarget));
    els.hand.appendChild(button);
  });
}

function openRewardChest() {
  if (!state.awaitingReward || state.rewardChestOpen) {
    return;
  }

  state.rewardChestOpen = true;
  state.rewardRevealReady = false;
  render();

  window.setTimeout(() => {
    if (!state.awaitingReward || !state.rewardChestOpen) {
      return;
    }
    state.rewardRevealReady = true;
    render();
  }, 220);
}

function renderRewards() {
  if (!state.awaitingReward || state.gameOver) {
    els.rewardChestOverlay.classList.add('hidden');
    els.rewardChestOverlay.setAttribute('aria-hidden', 'true');
    els.rewardChoices.innerHTML = '';
    return;
  }

  els.rewardChestOverlay.classList.remove('hidden');
  els.rewardChestOverlay.setAttribute('aria-hidden', 'false');
  els.rewardChestImage.src = state.rewardChestOpen ? 'assets/open_treasure.png' : 'assets/closed_treasure.png';
  els.rewardPrompt.textContent = state.rewardChestOpen
    ? 'Pick 1 reward card'
    : 'Click the chest to open your reward';

  els.rewardChoices.innerHTML = '';
  if (!state.rewardChestOpen || !state.rewardRevealReady) {
    return;
  }

  state.rewardOptions.forEach((cardId, index) => {
    const card = findCardTemplate(cardId);
    if (!card) {
      return;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'card reward-choice reward-choice-pop card-type-' + card.type;
    button.style.animationDelay = String(index * 90) + 'ms';

    const cardArt = card.artSrc
      ? '<img class="card-art" src="' + card.artSrc + '" alt="' + card.label + ' art" />'
      : '<div class="card-icon">' + card.icon + '</div>';

    button.innerHTML =
      '<div class="card-title">' + card.label + '</div>' +
      '<div class="card-media">' + cardArt + '</div>' +
      '<div class="card-meta"><div class="card-stat-icon">' + getCardTypeStatIcon(card.type) + '</div><div class="card-value">' + card.value + '</div></div>';

    button.addEventListener('click', () => pickReward(card.id, button));
    els.rewardChoices.appendChild(button);
  });
}

function renderYouWonOverlay() {
  const showOverlay = state.gameOver && state.player.hp > 0;
  els.youWonOverlay.classList.toggle('hidden', !showOverlay);
  els.youWonOverlay.setAttribute('aria-hidden', showOverlay ? 'false' : 'true');
  els.youDiedOverlay.classList.add('hidden');
  els.youDiedOverlay.setAttribute('aria-hidden', 'true');

  if (showOverlay) {
    els.rewardChestOverlay.classList.add('hidden');
    els.rewardChestOverlay.setAttribute('aria-hidden', 'true');
    els.rewardChoices.innerHTML = '';
  }
}

function renderYouDiedOverlay() {
  const showOverlay = state.gameOver && state.player.hp <= 0;
  els.youDiedOverlay.classList.toggle('hidden', !showOverlay);
  els.youDiedOverlay.setAttribute('aria-hidden', showOverlay ? 'false' : 'true');
  els.youWonOverlay.classList.add('hidden');
  els.youWonOverlay.setAttribute('aria-hidden', 'true');

  if (showOverlay) {
    els.rewardChestOverlay.classList.add('hidden');
    els.rewardChestOverlay.setAttribute('aria-hidden', 'true');
    els.rewardChoices.innerHTML = '';
  }
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
  els.enemyIntent.classList.remove('enemy-intent-fire');
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
  const endTurnReady = !state.gameOver && !state.awaitingReward && state.energy <= 0;
  els.endTurnBtn.disabled = state.gameOver || state.turnLocked || state.awaitingReward;
  els.endTurnBtn.classList.toggle('end-turn-ready', endTurnReady);
  els.endTurnBtn.setAttribute('data-ready', endTurnReady ? 'true' : 'false');
  const pileDisabled = state.gameOver || state.turnLocked || state.awaitingReward;
  els.deckCounter.disabled = pileDisabled;
  els.drawCounter.disabled = pileDisabled;
  els.discardCounter.disabled = pileDisabled;

  const arenaSurface = els.arenaPanel || els.fightStage;

  if (arenaSurface) {
    const image = state.battlefield && state.battlefield.image ? state.battlefield.image : '';
    const position = state.battlefield && state.battlefield.position ? state.battlefield.position : '50% 50%';
    arenaSurface.style.setProperty('--fight-bg-image', image ? 'url("' + image + '")' : 'none');
    arenaSurface.style.setProperty('--fight-bg-position', position);
  }
}

function render() {
  renderBars();
  renderMeta();
  renderHand();
  renderRewards();
  renderYouWonOverlay();
  renderYouDiedOverlay();
}

els.endTurnBtn.addEventListener('click', endTurn);
els.deckCounter.addEventListener('click', () => openPileModal('deck'));
els.drawCounter.addEventListener('click', () => openPileModal('draw'));
els.discardCounter.addEventListener('click', () => openPileModal('discard'));
els.rewardChestImage.addEventListener('click', openRewardChest);
els.fightAgainBtn.addEventListener('click', resetState);
els.fightAgainBtnDied.addEventListener('click', resetState);
els.pileModalClose.addEventListener('click', closePileModal);
els.pileModalBackdrop.addEventListener('click', closePileModal);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closePileModal();
  }
});

resetState();
