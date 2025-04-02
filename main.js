'use strict';

const playBtn = document.querySelector('.play__Btn');
const carrot = document.querySelector('.game__item--carrot');
const bug = document.querySelector('.game__item--bug');
const itemsContainer = document.querySelector('.items__container');
const result = document.querySelector('.result-actions');
result.style.display = 'none';
document.addEventListener('DOMContentLoaded', () => {
  playBtn.addEventListener('click', () => {
    itemsContainer.innerHTML = createGameItems();
    const carrotItem = document.querySelectorAll('.game__item--carrot');
    const bugItem = document.querySelectorAll('.game__item--bug');
    setRandomPosition(carrotItem);
    setRandomPosition(bugItem);
  });
});

const getRandom = (max, min) => Math.floor(Math.random() * (max - min));

function createGameItems() {
  let content = '';
  for (let i = 0; i <= 5; i++) {
    content += `<div class="game__item game__item--carrot">
        <img src="img/carrot.png" alt="Carrot" />
      </div>
      <div class="game__item game__item--bug">
        <img src="img/bug.png" alt="Bug" />
      </div>`;
  }
  return content;
}

function setRandomPosition(gameItem) {
  const item = document.querySelector('.game__item');
  const containerWidth = itemsContainer.getBoundingClientRect().width;
  const containerheight = itemsContainer.getBoundingClientRect().height;
  const itemWidth = item.getBoundingClientRect().width;
  const itemHeight = item.getBoundingClientRect().height;
  gameItem.forEach((carrots) => {
    carrots.style.left = getRandom(containerWidth, itemWidth) + 'px';
    carrots.style.top = getRandom(containerheight, itemHeight) + 'px';
  });
}
