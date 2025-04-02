'use strict';

const playBtn = document.querySelector('.play__Btn');
const itemsContainer = document.querySelector('.items__container');
const result = document.querySelector('.result-actions');
const counter = document.querySelector('.counter');
const timers = document.querySelector('.timer');
document.addEventListener('DOMContentLoaded', () => {
  playBtn.addEventListener('click', () => {
    playBtn.innerHTML = `<i class="fa-solid fa-stop"></i>`;
    result.style.display = 'none';
    timerStart();
    const createGameItem = createGameItems();
    itemsContainer.innerHTML = createGameItem.content;

    let carrotCount = createGameItem.count;
    counter.innerText = carrotCount;
    gameStart(carrotCount);
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

function timerStart() {
  let sec = 10;
  updateTimerText(sec);
  const timer = setInterval(() => {
    sec--;
    if (sec < 0) {
      clearInterval(timer);
    } else {
      updateTimerText(sec);
    }
  }, 1000);
}

function updateTimerText(time) {
  timers.textContent = `0:${time}`;
}

function gameStart(count) {
  itemsContainer.addEventListener('click', (e) => {
    const target = e.target;
    const carrotElement = target.closest('.game__item--carrot');
    const bugElement = target.closest('.game__item--bug');
    if (bugElement) {
      counter.innerText = count;
    } else if (carrotElement) {
      count--;
      carrotElement.style.display = 'none';
      counter.innerText = count;
    }
  });
}
