'use strict';

const playBtn = document.querySelector('.play__btn');
const itemsContainer = document.querySelector('.items__container');

const counter = document.querySelector('.counter');
const timers = document.querySelector('.timer');
document.addEventListener('DOMContentLoaded', () => {
  playBtn.addEventListener('click', () => {
    playBtn.innerHTML = `<i class="fa-solid fa-stop"></i>`;
    // setting carrot&bug
    const createGameItem = createGameItems();
    itemsContainer.innerHTML = createGameItem.content;
    // init Count
    let carrotCount = createGameItem.count;
    counter.innerText = carrotCount;
    // gameStart
    gameStart(carrotCount);
    // reset

    // carrot&bug randomSetting
    const carrotItem = document.querySelectorAll('.game__item--carrot');
    const bugItem = document.querySelectorAll('.game__item--bug');
    setRandomPosition(carrotItem);
    setRandomPosition(bugItem);
  });
});

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
  result.style.display = 'none';
  let isGameFinished = false;
  const gameTimer = timerStart();
  const clickHandler = (e) => {
    if (isGameFinished || gameTimer.isTimerFinished()) return;
    const target = e.target;
    const carrotElement = target.closest('.game__item--carrot');
    const bugElement = target.closest('.game__item--bug');

    if (bugElement) {
      gameResult('YOU LOSE', gameTimer.timer);
      isGameFinished = true;
    } else if (carrotElement) {
      count--;
      carrotElement.style.display = 'none';
      counter.innerText = count;
      if (count === 0) {
        gameResult('YOU WON', gameTimer.timer);
        isGameFinished = true;
      }
    }
  };

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
