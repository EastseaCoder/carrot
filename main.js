'use strict';
const mainContainer = document.querySelector('.background__container');
const itemsContainer = document.querySelector('.items__container');
const counter = document.querySelector('.counter');
const timers = document.querySelector('.timer');

let currentTimer = null;
let gameHandler = null;

const btnState = {
  isPlaying: false,
  setIsPlaying(value) {
    this.isPlaying = value;
  },
};
const gameAudio = {
  bgAudio: new Audio('/sound/bg.mp3'),
  gameResetSound: new Audio('/sound/alert.wav'),
  bugClickSound: new Audio('/sound/bug_pull.mp3'),
  carrotClickSound: new Audio('/sound/carrot_pull.mp3'),
  gameWinSound: new Audio('/sound/game_win.mp3'),
};
for (let key in gameAudio) {
  gameAudio[key].preload = 'auto';
  gameAudio[key].load();
}

function playSound(name) {
  const sound = gameAudio[name];
  if (!sound) return;
  if (name === 'bgAudio') {
    sound.loop = 'true';
  }
  sound.pause();
  sound.currentTime = 0;
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
  mainContainer.addEventListener('click', (e) => {
    const PlayBtn = e.target.closest('.play__btn');
    const resetBtn = e.target.closest('.reset__btn');
    if (PlayBtn) {
      if (!btnState.isPlaying) {
        playSound('bgAudio');
        PlayBtn.innerHTML = `<i class="fa-solid fa-stop"></i>`;
        gameUpdate();
        btnState.setIsPlaying(true);
      } else {
        stopSound('bgAudio');
        playSound('gameResetSound');
        PlayBtn.style.opacity = 0;
        if (gameHandler) {
          itemsContainer.removeEventListener('click', gameHandler);
        }
        gameResult('Retry?', currentTimer);
      }
    } else if (resetBtn) {
      playSound('bgAudio');
      const mainBtn = document.querySelector('.main__btn');
      mainBtn.style.opacity = 1;
      gameUpdate();
    }
  });
});

function gameUpdate() {
  // setting carrot&bug
  const createGameItem = createGameItems();
  itemsContainer.innerHTML = createGameItem.content;
  // init Count
  let carrotCount = createGameItem.count;
  counter.innerText = carrotCount;
  // gameStart
  gameStart(carrotCount);
  // carrot&bug randomSetting
  const carrotItem = document.querySelectorAll('.game__item--carrot');
  const bugItem = document.querySelectorAll('.game__item--bug');
  setRandomPosition(carrotItem);
  setRandomPosition(bugItem);
}

function getRandom(max, min) {
  return Math.floor(Math.random() * (max - min));
}

function createGameItems() {
  const array = Array(10);
  const obj = {
    content: '',
    count: 0,
  };
  for (let i = 0; i < array.length; i++) {
    obj.content += `<div class="game__item game__item--carrot">
        <img src="img/carrot.png" alt="Carrot" />
      </div>
      <div class="game__item game__item--bug">
        <img src="img/bug.png" alt="Bug" />
      </div>`;
    obj.count++;
  }
  return obj;
}

function setRandomPosition(gameItem) {
  const item = document.querySelector('.game__item');
  const containerWidth = itemsContainer.getBoundingClientRect().width;
  const containerheight = itemsContainer.getBoundingClientRect().height;
  const itemWidth = item.getBoundingClientRect().width;
  const itemHeight = item.getBoundingClientRect().height;
  gameItem.forEach((item) => {
    item.style.left = getRandom(containerWidth, itemWidth) + 'px';
    item.style.top = getRandom(containerheight, itemHeight) + 'px';
  });
}

function gameStart(count) {
  const result = document.querySelector('.result-actions');
  const Btn = document.querySelector('.play__btn');
  result.style.display = 'none';
  let isGameFinished = false;
  const gameTimer = timerStart();
  currentTimer = gameTimer.timer;
  const clickHandler = (e) => {
    if (isGameFinished || gameTimer.isTimerFinished()) return;
    const target = e.target;
    const carrotElement = target.closest('.game__item--carrot');
    const bugElement = target.closest('.game__item--bug');

    if (bugElement) {
      gameResult('YOU LOSE', gameTimer.timer);
      stopSound('bgAudio');
      playSound('bugClickSound');
      isGameFinished = true;
      Btn.style.opacity = 0;
    } else if (carrotElement) {
      count--;
      carrotElement.style.display = 'none';
      counter.innerText = count;
      gameAudio.carrotClickSound.play();
      if (count === 0) {
        gameResult('YOU WON', gameTimer.timer);
        isGameFinished = true;
        Btn.style.opacity = 0;
        stopSound('bgAudio');
        playSound('gameWinSound');
      }
    }
  };
  gameHandler = clickHandler;
  itemsContainer.addEventListener('click', clickHandler);
}

function timerStart() {
  let sec = 10;
  let isTimerFinished = false;
  timers.textContent = `0:${sec}`;
  const timer = setInterval(() => {
    sec--;
    if (sec < 0) {
      gameResult('YOU LOSE', timer);
      isTimerFinished = true;
      stopSound('bgAudio');
      playSound('gameResetSound');
    } else {
      timers.textContent = `0:${sec}`;
    }
  }, 1000);
  return { timer, isTimerFinished: () => isTimerFinished };
}

function gameResult(text, timer) {
  const result = document.querySelector('.result-actions');
  const message = document.querySelector('.result__message');
  result.style.display = 'block';
  message.innerHTML = text;
  clearInterval(timer);
}
