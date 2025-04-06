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
  gameResult(message, gameState.timer, dom.result, dom.message);
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
  dom.playBtn.style.opacity = 0;
  dom.playBtn.style.pointerEvents = 'none';
}
function showStopBtn() {
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
  const carrotItem = document.querySelectorAll('.game__item--carrot');
  const bugItem = document.querySelectorAll('.game__item--bug');
  setRandomPosition([...carrotItem, ...bugItem], dom.itemsContainer);
}
function addGameItemToHtml() {
  const carrotCount = 10;
  gameState.carrotCount = carrotCount;
  const bugCount = 10;
  const itemHtml = createGameItems(carrotCount, bugCount);
  dom.itemsContainer.innerHTML = itemHtml;
}
function initCount() {
  dom.counter.innerText = gameState.carrotCount;
}
function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function createGameItems(carrotCount, bugCount) {
  let content = '';
  for (let i = 0; i < carrotCount; i++) {
    content += createItemsHtml('carrot', 'img/carrot.png');
  }
  for (let i = 0; i < bugCount; i++) {
    content += createItemsHtml('bug', 'img/bug.png');
  }
  return content;
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
  hideGameResult(dom.result);
  removeClickHandler();
  gameState.setGameFinished(false);
}
function startTimer() {
  const gameTimer = timerStart();
  gameState.timer = gameTimer.timer;
}
function handleItemClick(e) {
  if (gameState.isGameFinished) return;
  const target = e.target;
  const carrotElement = target.closest('.game__item--carrot');
  const bugElement = target.closest('.game__item--bug');
  if (bugElement) {
    gameResult('YOU LOSE', gameState.timer, dom.result, dom.message);
    stopSound('bgAudio');
    playSound('bugClickSound');
    gameState.setGameFinished(true);
    dom.playBtn.style.opacity = 0;
  } else if (carrotElement) {
    carrotElement.style.display = 'none';
    gameState.carrotCount--;
    dom.counter.innerText = gameState.carrotCount;
    playSound('carrotClickSound');
    if (gameState.carrotCount === 0) {
      gameResult('YOU WON', gameState.timer, dom.result, dom.message);
      gameState.setGameFinished(true);
      dom.playBtn.style.opacity = 0;
      stopSound('bgAudio');
      playSound('gameWinSound');
    }
  }
}
function timerStart() {
  let sec = config.GAME_DURATION_SEC;
  updateTime(sec);
  const timer = setInterval(() => {
    if (sec <= 0) {
      stopGame('YOU LOSE!');
    } else {
      updateTime(--sec);
    }
  }, 1000);
  return { timer };
}
function updateTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  dom.timers.innerText = `${minutes}:${seconds}`;
}
function gameResult(text, timer, result, message) {
  result.style.display = 'block';
  message.innerHTML = text;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
function hideGameResult(result) {
  result.style.display = 'none';
}
