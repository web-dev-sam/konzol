import { ref } from 'vue'

interface Todo {
  text: string
  done: boolean
}

const todos = ref([] as Todo[])

const addTodo = wrapFunction((todo: string): void => {
  if (todo.trim() === '')
    return
  todos.value.push({ text: todo, done: false })
})

export function useTodos() {
  function removeTodo(index: number): void {
    todos.value.splice(index, 1)
  }

  return {
    todos,
    addTodo,
    removeTodo,
  }
}

function wrapFunction<T extends (...args: any[]) => any>(fn: T): T {
  return function (...args: any[]) {
    const stack = new Error().stack
    console.log('🔄 Called from:', stack)
    console.log('📦 Args:', args)
    const result = fn(...args)
    console.log('✅ Result:', result)
    return result
  } as T
}

function LogCall(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const originalMethod = descriptor.value

  descriptor.value = function (...args: any[]) {
    const stack = new Error().stack
    console.log(`🔄 Called method: ${propertyKey}`)
    console.log('🔍 Stack trace:', stack)
    console.log('📦 Arguments:', args)
    const result = originalMethod.apply(this, args)
    console.log('✅ Result:', result)
    return result
  }

  return descriptor
}
