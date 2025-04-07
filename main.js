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
};
const gameState = {
  timer: null,
  clickHandler: null,
  isPlaying: false,
  isGameFinished: false,
  carrotCount: 0,
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

function playSound(name, { loop = false } = {}) {
  const sound = gameAudio[name];
  if (!sound) return;
  sound.pause();
  sound.currentTime = 0;
  sound.loop = loop;
  sound.volume = 0.5;
  sound.play();
}

function stopSound(name) {
  const sound = gameAudio[name];
  if (!sound) return;
  sound.pause();
  sound.currentTime = 0;
}

document.addEventListener('DOMContentLoaded', () => {
  dom.mainContainer.addEventListener('click', handleMainContainerClick);
});

function handleMainContainerClick(e) {
  const PlayBtn = e.target.closest('.play__btn');
  const resetBtn = e.target.closest('.reset__btn');
  if (PlayBtn) {
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
  playSound('bgAudio', { loop: true });
  updatePlayBtnToStop();
  gamePlay();
  gameState.setIsPlaying(true);
}

function stopGame(message) {
  stopSound('bgAudio');
  playSound('gameResetSound');
  hideStopBtn();
  removeClickHandler();
  gameResult(message, gameState, dom);
}
function resetGame() {
  playSound('bgAudio', { loop: true });
  showStopBtn();
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
function hideStopBtn() {
  hideBtnstyle(dom);
}
function showStopBtn() {
  showBtnStyle(dom);
}
function hideBtnstyle(dom) {
  dom.playBtn.style.opacity = 0;
  dom.playBtn.style.pointerEvents = 'none';
}
function showBtnStyle(dom) {
  dom.playBtn.style.opacity = 1;
  dom.playBtn.style.pointerEvents = 'auto';
}
function gamePlay() {
  // setting carrot&bug
  addGameItemToHtml();
  // init Count
  initCount();
  // gameStart
  gameStart();
  // carrot&bug randomSetting
  const carrotItem = dom.itemsContainer.querySelectorAll('.game__item--carrot');
  const bugItem = dom.itemsContainer.querySelectorAll('.game__item--bug');
  setRandomPosition([...carrotItem, ...bugItem], dom.itemsContainer);
}
function addGameItemToHtml() {
  const carrotCount = 10;
  gameState.carrotCount = carrotCount;
  const bugCount = 10;
  const itemHtml = createGameItems(carrotCount, bugCount);
  dom.itemsContainer.innerHTML = itemHtml;
  console.log();
}
function initCount() {
  dom.counter.innerText = gameState.carrotCount;
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

function setRandomPosition(
  gameItems,
  container,
  itemWidth = 50,
  itemHeight = 50
) {
  const containerWidth = container.getBoundingClientRect().width - itemWidth;
  const containerheight = container.getBoundingClientRect().height - itemHeight;
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
    stopSound('bgAudio');
    playSound('bugClickSound');
    gameState.setGameFinished(true);
    hideStopBtn();
  } else if (carrotElement) {
    removeCarrot(carrotElement, gameState, dom);
    playSound('carrotClickSound');
    if (gameState.carrotCount === 0) {
      gameResult('YOU WON', gameState, dom);
      gameState.setGameFinished(true);
      hideStopBtn();
      stopSound('bgAudio');
      playSound('gameWinSound');
    }
  }
}
function removeCarrot(carrotElement, state, dom) {
  carrotElement.style.display = 'none';
  state.carrotCount--;
  dom.counter.innerText = state.carrotCount;
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
