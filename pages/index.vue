<template>
    <div class="flex flex-col items-center w-screen">
      <div v-if="reload" class="mb-2">
        <PlayingField :size="size" :bombCount="bombCount" :key="reload" />
      </div>
      <div>
        <h1 class="text-lg font-bold">Configure field</h1>
      </div>
      <form @submit.prevent="" class="flex flex-col max-w-35">
        <label class="flex flex-col font-semibold">
          Bomb count
          <input type="number" v-model="bombCount" class="border border-dark-600 rounded-lg px-2">
        </label>
        <label class="flex flex-col font-semibold mt-2">
          Field size
          <input type="number" v-model="size"  class="border border-dark-600 rounded-lg px-2">
        </label>
      </form>
      <button @click="reloadField" class="mt-2 border border-dark-600 rounded-lg px-2">Reload</button>
    </div>
</template>

<script lang="ts" setup>
import { useState } from '#app';

const bombCount = useState('bombCount', () => 11);
const size = useState('size', () => 10);
const reload = useState('reload', () => Math.random());

function reloadField() {
  reload.value = Math.random();
}

</script>