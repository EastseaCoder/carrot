'use strict';
const dom = {
  mainContainer: document.querySelector('.background__container'),
  itemsContainer: document.querySelector('.items__container'),
  counter: document.querySelector('.counter'),
  timers: document.querySelector('.timer'),
  result: document.querySelector('.result-actions'),
  message: document.querySelector('.result__message'),
  playBtn: document.querySelector('.play__btn'),
};

const config = {
  GAME_DURATION_SEC: 10,
  CARROT_COUNT: 10,
  setIsCarrotCount(value) {
    this.CARROT_COUNT = value;
  },
  BUG_COUNT: 10,
  ITEM_WIDTH: 50,
  ITEM_HEIGHT: 50,
};
const gameState = {
  timer: null,
  clickHandler: null,
  isPlaying: false,
  isGameFinished: false,
  setIsPlaying(value) {
    this.isPlaying = value;
  },
  setGameFinished(value) {
    this.isGameFinished = value;
  },
};

const gameAudio = {
  bgAudio: new Audio('/sound/bg.mp3'),
  gameResetSound: new Audio('/sound/alert.wav'),
  bugClickSound: new Audio('/sound/bug_pull.mp3'),
  carrotClickSound: new Audio('/sound/carrot_pull.mp3'),
  gameWinSound: new Audio('/sound/game_win.mp3'),
};

const sound = {
  play(name, { loop = false } = {}) {
    const sound = gameAudio[name];
    if (!sound) return;
    try {
      sound.pause();
      sound.currentTime = 0;
      sound.loop = loop;
      sound.volume = 0.5;
      sound.play();
    } catch (e) {
      alert(`Sound Error:${name}`);
    }
  },
  stop(name) {
    const sound = gameAudio[name];
    if (!sound) return;
    sound.pause();
    sound.currentTime = 0;
  },
};

document.addEventListener('DOMContentLoaded', () => {
  dom.mainContainer.addEventListener('click', handleMainContainerClick);
});

function handleMainContainerClick(e) {
  const playBtn = e.target.closest('.play__btn');
  const resetBtn = e.target.closest('.reset__btn');
  if (playBtn) {
    handlePlayBtnClick();
  } else if (resetBtn) {
    handleResetBtnClick();
  }
}

function handlePlayBtnClick() {
  if (!gameState.isPlaying) {
    startGame();
  } else {
    stopGame('Retry?');
  }
}
function handleResetBtnClick() {
  resetGame();
}

function startGame() {
  sound.play('bgAudio', { loop: true });
  updatePlayBtnToStop();
  gamePlay();
  gameState.setIsPlaying(true);
}

function stopGame(message) {
  sound.stop('bgAudio');
  sound.play('gameResetSound');
  togglePlayBtn(false);
  removeClickHandler();
  gameResult(message, gameState, dom);
}
function resetGame() {
  sound.play('bgAudio', { loop: true });
  togglePlayBtn(true);
  gamePlay();
}
function removeClickHandler() {
  if (gameState.clickHandler) {
    dom.itemsContainer.removeEventListener('click', gameState.clickHandler);
  }
}

function updatePlayBtnToStop() {
  dom.playBtn.innerHTML = `<i class="fa-solid fa-stop"></i>`;
}

function togglePlayBtn(show) {
  dom.playBtn.style.opacity = show ? 1 : 0;
  dom.playBtn.style.pointerEvents = show ? 'auto' : 'none';
}

function gamePlay() {
  renderGameItems();
  initializeCount();
  gameStart();
}

function renderGameItems() {
  // setting carrot&bug
  addGameItemToHtml();
  // carrot&bug randomSetting
  const gameItems = dom.itemsContainer.querySelectorAll('.game__item');
  setRandomPosition([...gameItems], dom.itemsContainer, config);
}
function addGameItemToHtml() {
  config.setIsCarrotCount(10);
  const carrotCount = config.CARROT_COUNT;
  const bugCount = config.BUG_COUNT;
  const itemHtml = createGameItems(carrotCount, bugCount);
  dom.itemsContainer.innerHTML = itemHtml;
}
function initializeCount() {
  dom.counter.innerText = config.CARROT_COUNT;
}
function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function createGameItems(carrotCount, bugCount) {
  // soultion1
  // const carrots = Array.from({ length: carrotCount }, () =>
  //   createItemsHtml('carrot', 'img/carrot.png')
  // );
  // const bugs = Array.from({ length: bugCount }, () =>
  //   createItemsHtml('bug', 'img/bug.png')
  // );
  // return [...carrots, ...bugs].join('');
  // soultion2
  // return [
  //   ...Array(carrotCount)
  //     .fill()
  //     .map(() => createItemsHtml('carrot', 'img/carrot.png')),
  //   ...Array(bugCount)
  //     .fill()
  //     .map(() => createItemsHtml('bug', 'img/bug.png')),
  // ].join('');
  // soultion3
  return [
    { count: carrotCount, type: 'carrot', src: 'img/carrot.png' },
    { count: bugCount, type: 'bug', src: 'img/bug.png' },
  ]
    .flatMap(({ count, type, src }) =>
      Array.from({ length: count }, () => createItemsHtml(type, src))
    )
    .join('');
}

function createItemsHtml(type, src) {
  return `<div class="game__item game__item--${type}">
        <img src="${src}" alt="${type}" />
      </div>`;
}

function setRandomPosition(gameItems, container, config) {
  const containerWidth =
    container.getBoundingClientRect().width - config.ITEM_WIDTH;
  const containerheight =
    container.getBoundingClientRect().height - config.ITEM_HEIGHT;
  gameItems.forEach((item) => {
    item.style.left = getRandom(0, containerWidth) + 'px';
    item.style.top = getRandom(0, containerheight) + 'px';
  });
}

function gameStart() {
  startSetting();
  gameState.clickHandler = handleItemClick;
  dom.itemsContainer.addEventListener('click', handleItemClick);
}
function startSetting() {
  resetGameState();
  startTimer();
}
function resetGameState() {
  hideGameResult();
  removeClickHandler();
  gameState.setGameFinished(false);
}
function startTimer() {
  gameState.timer = timerStart();
}
function handleItemClick(e) {
  if (gameState.isGameFinished) return;
  const target = e.target;
  const carrotElement = target.closest('.game__item--carrot');
  const bugElement = target.closest('.game__item--bug');
  if (bugElement) {
    gameResult('YOU LOSE', gameState, dom);
    sound.stop('bgAudio');
    sound.play('bugClickSound');
    gameState.setGameFinished(true);
    togglePlayBtn(false);
  } else if (carrotElement) {
    removeCarrot(carrotElement, config, dom);
    sound.play('carrotClickSound');
    if (config.CARROT_COUNT === 0) {
      gameResult('YOU WON', gameState, dom);
      gameState.setGameFinished(true);
      togglePlayBtn(false);
      sound.stop('bgAudio');
      sound.play('gameWinSound');
    }
  }
}
function removeCarrot(carrotElement, config, dom) {
  carrotElement.style.display = 'none';
  config.CARROT_COUNT--;
  dom.counter.innerText = config.CARROT_COUNT;
}
function timerStart() {
  let sec = config.GAME_DURATION_SEC;
  updateTime(sec, dom);
  const timer = setInterval(() => {
    if (sec <= 0) {
      stopGame('YOU LOSE!');
    } else {
      updateTime(--sec, dom);
    }
  }, 1000);
  return timer;
}
function updateTime(time, dom) {
  const minutes = String(Math.floor(time / 60)).padStart(2, '0');
  const seconds = String(Math.floor(time % 60)).padStart(2, '0');
  dom.timers.innerText = `${minutes}:${seconds}`;
}
function gameResult(text, state, dom) {
  showGameResultMessage(dom, text);
  stopTimer(state);
}
function showGameResultMessage(dom, text) {
  dom.result.style.display = 'block';
  dom.message.innerHTML = text;
}
function stopTimer(state) {
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }
}
function hideGameResult() {
  dom.result.style.display = 'none';
}
