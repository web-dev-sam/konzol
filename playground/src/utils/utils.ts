import { useTodos } from '../stores/todos'

const { todos } = useTodos()

export function copyToClipboard(): void {
  todos.value.push({ text: 'HAHA!!! I hack you!!! Your computa belong to M;EMEEEEE NOWWW, HAHAHAHA', done: false })
}
