export type Todo = {
  id: number;
  label: string;
  complete?: boolean;
};

export type AppState = {
  todos: Todo[];
};

export type AddTodoRequest = Omit<Todo, 'id'>;
export type UpdateTodoRequest = Todo;

declare global {
  // deno-lint-ignore no-var
  var __INITIAL_STATE__: AppState | undefined;
}
