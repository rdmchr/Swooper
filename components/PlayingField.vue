<template>
  <div class="flex flex-col items-center w-screen">
    <div class="flex flex-row place-content-between px-4 pt-2 w-screen">
      <div class="flex flex-col items-center">
        <p class="font-mono text-xl font-bold">Timer</p>
        <p v-if="timer" class="text-lg">{{ timer }}</p>
        <p v-else class="text-lg">0:00</p>
      </div>

      <p v-if="win" class="text-4xl cursor-pointer" @click="reset">👽</p>
      <p v-else-if="!loss" class="text-4xl cursor-pointer" @click="reset">😀</p>
      <p v-else class="text-4xl cursor-pointer" @click="reset">🥺</p>

      <div class="flex flex-col items-center">
        <p class="font-mono text-xl">🏳️‍🌈</p>
        <p class="text-lg">{{ flags }}</p>
      </div>
    </div>

    <div v-for="(row, index) in grid" class="flex flex-row">
      <div
          v-for="(square, ind) in row"
          class="square"
          :class="{ clicked: square.clicked }"
          @click="uncover(ind, index)"
          @contextmenu.prevent="flag(ind, index)"
      >
        <p v-if="square.flagged" class="square-text">🏳️‍🌈</p>
        <div v-if="square.clicked">
          <p v-if="square.around > 0" class="square-text">{{ square.around }}</p>
          <p v-if="square.bomb" class="square-text">💣</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Square } from '../square';
import { useState } from '#app';

const props = defineProps({
  size: Number,
  bombCount: Number,
});

const grid = useState('grid', () => [[]] as [Square[]]);
const loss = useState('loss', () => false);
const win = useState('win', () => false);
let start: Date = undefined;
let finish = undefined;
const timer = useState('timer', () => '');
const flags = useState('flags', () => props.bombCount);
let bombsMarked = 0;

reset();

function reset() {
  timer.value = '';
  flags.value = props.bombCount;
  loss.value = false;
  win.value = false;
  start = undefined;
  finish = undefined;
  bombsMarked = 0;
  generateGrid();
}

function generateGrid() {
  let tempGrid = [];
  for (let i = 0; i < props.size; i++) {
    let row: Square[] = [];
    for (let x = 0; x < props.size; x++) {
      const square: Square = new Square();
      row.push(square);
    }
    tempGrid.push(row);
  }
  grid.value = tempGrid as [Square[]];
  plantBombs();
  getAllAround();
}

function getAllAround() {
  grid.value.forEach((row, rowIndex) => {
    row.forEach((square, squareIndex) => {
      grid.value[rowIndex][squareIndex].around = getAround(
          squareIndex,
          rowIndex,
      );
    });
  });
}

function revealNearby(x: number, y: number) {
  // top
  if (y > 0 && grid.value[y - 1][x].clicked === false) {
    grid.value[y - 1][x].clicked = true;
    if (grid.value[y - 1][x].around === 0) {
      revealNearby(x, y - 1);
    }
  }
  // bottom
  if (y < props.size - 1 && grid.value[y + 1][x].clicked === false) {
    grid.value[y + 1][x].clicked = true;
    if (grid.value[y + 1][x].around === 0) {
      revealNearby(x, y + 1);
    }
  }
  // left
  if (x > 0 && grid.value[y][x - 1].clicked === false) {
    grid.value[y][x - 1].clicked = true;
    if (grid.value[y][x - 1].around === 0) {
      revealNearby(x - 1, y);
    }
  }
  // right
  if (x < props.size - 1 && grid.value[y][x + 1].clicked === false) {
    grid.value[y][x + 1].clicked = true;
    if (grid.value[y][x + 1].around === 0) {
      revealNearby(x + 1, y);
    }
  }
  // top left
  if (x > 0 && y > 0 && grid.value[y - 1][x - 1].clicked === false) {
    grid.value[y - 1][x - 1].clicked = true;
    if (grid.value[y - 1][x - 1].around === 0) {
      revealNearby(x - 1, y - 1);
    }
  }
  // top right
  if (y > 0 && x < props.size - 1 && grid.value[y - 1][x + 1].clicked === false) {
    grid.value[y - 1][x + 1].clicked = true;
    if (grid.value[y - 1][x + 1].around === 0) {
      revealNearby(x + 1, y - 1);
    }
  }
  //bottom right
  if (y < props.size - 1 && x < props.size - 1 && grid.value[y + 1][x + 1].clicked === false) {
    grid.value[y + 1][x + 1].clicked = true;
    if (grid.value[y + 1][x + 1].around === 0) {
      revealNearby(x + 1, y + 1);
    }
  }
  // bottom left
  if (y < props.size - 1 && x > 0 && grid.value[y + 1][x - 1].clicked === false) {
    grid.value[y + 1][x - 1].clicked = true;
    if (grid.value[y + 1][x - 1].around === 0) {
      revealNearby(x - 1, y + 1);
    }
  }
}

function plantBombs() {
  let count = props.bombCount;
  while (count > 0) {
    let randRow = Math.floor(Math.random() * props.size);
    let randCol = Math.floor(Math.random() * props.size);
    if (!grid.value[randRow][randCol].bomb) {
      grid.value[randRow][randCol].bomb = true;
      count--;
    }
  }
}

function uncover(x: number, y: number) {
  // start timer
  if (!start) start = new Date();
  if (grid.value[y][x].clicked) return; // already clicked
  if (grid.value[y][x].flagged) return; // don't allow clicking flagged squares
  if (loss.value) return; // don't allow clicking after loss
  if (win.value) return; // don't allow clicking after win
  if (grid.value[y][x].bomb) {
    grid.value[y][x].clicked = true;
    loss.value = true;
    finish = new Date();
  } else if (grid.value[y][x].around === 0) {
    revealNearby(x, y);
  } else {
    grid.value[y][x].clicked = true;
  }
}

function getAround(x: number, y: number): number {
  let around: number = 0;
  const max = props.size - 1;
  if (grid.value[y][x].bomb) {
    return -1;
  }
  // top
  if (y > 0 && grid.value[y - 1][x].bomb) {
    around++;
  }
  // top right
  if (y > 0 && x < max && grid.value[y - 1][x + 1].bomb) {
    around++;
  }

  //right
  if (x < max && grid.value[y][x + 1].bomb) {
    around++;
  }

  //bottom right
  if (y < max && x < max && grid.value[y + 1][x + 1].bomb) {
    around++;
  }

  //bottom
  if (y < max && grid.value[y + 1][x].bomb) {
    around++;
  }

  //left bottom
  if (y < max && x > 0 && grid.value[y + 1][x - 1].bomb) {
    around++;
  }

  //left
  if (x > 0 && grid.value[y][x - 1].bomb) {
    around++;
  }

  //top left
  if (y > 0 && x > 0 && grid.value[y - 1][x - 1].bomb) {
    around++;
  }
  return around;
}

function flag(x: number, y: number) {
  if (grid.value[y][x].clicked) return;
  if (grid.value[y][x].flagged) {
    grid.value[y][x].flagged = false;
    flags.value++;
    if (grid.value[y][x].bomb) {
      bombsMarked--;
    }
  } else {
    grid.value[y][x].flagged = true;
    flags.value--;
    if (grid.value[y][x].bomb) {
      bombsMarked++;
    }
  }
  if (bombsMarked === props.bombCount) {
    win.value = true;
    finish = new Date();
  }
}

function formatTime() {
  const diff = finish ? finish.getTime() - start.getTime() : new Date().getTime() - start.getTime();
  const minutes = Math.floor(diff / 60000);
  const seconds = Number(((diff % 60000) / 1000).toFixed(0));
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

setInterval(() => {
  if (start) timer.value = formatTime();
}, 500);
</script>

<style scoped>
.square {
  @apply w-15 h-15 cursor-pointer flex justify-center items-center bg-gray-200 border border-b-2 border-r-2 border-dark-800;
}

.clicked {
  @apply cursor-not-allowed bg-gray-300 border-gray-500;
}

.square-text {
  @apply text-3xl text-center font-mono;
}
</style>