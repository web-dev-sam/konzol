
<script setup lang="ts">
declare function log(format: string, ...args: unknown[]): void

import { ref } from 'vue'
import { useTodos } from './stores/todos'
import { copyToClipboard } from './utils/utils'

const newTodo = ref('')
const todos = useTodos()

log('{:w}', console.log) // Check how this can be compiled
</script>

<template>
  <h1>Todos</h1>
  <input v-model="newTodo" placeholder="Add a task" />
  <button @click="todos.addTodo(newTodo)" @contextmenu.prevent="copyToClipboard">
    Add
  </button>

  <ul>
    <li v-for="(todo, index) in todos.todos" :key="index">
      <span>{{ todo.text }}</span>
      <button @click="todos.removeTodo(index)">del</button>
    </li>
  </ul>
</template>


<style scoped>
.todo-app {
  max-width: 400px;
  margin: 2rem auto;
  font-family: sans-serif;
}
form {
  display: flex;
  gap: 0.5rem;
}
input[type="text"] {
  flex: 1;
  padding: 0.5rem;
}
button {
  padding: 0.5rem;
  cursor: pointer;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.3rem 0;
}
span.done {
  text-decoration: line-through;
  color: gray;
}
</style>
