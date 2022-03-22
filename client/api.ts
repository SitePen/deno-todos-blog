import type {
  AddTodoRequest,
  Todo,
  UpdateTodoRequest,
} from "../shared/types.ts";

function checkResponse(response: Response) {
  if (response.status >= 400) {
    throw new Error(response.statusText);
  }
}

export async function getTodos(): Promise<Todo[]> {
  const response = await fetch("/todos");
  checkResponse(response);
  return response.json();
}

export async function addTodo(data: AddTodoRequest): Promise<Todo> {
  const response = await fetch("/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  checkResponse(response);
  return response.json();
}

export async function updateTodo(data: UpdateTodoRequest): Promise<Todo> {
  const response = await fetch(`/todos/${data.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  checkResponse(response);
  return response.json();
}

export async function removeTodo(todoId: number): Promise<void> {
  const response = await fetch(`/todos/${todoId}`, { method: "DELETE" });
  checkResponse(response);
}
