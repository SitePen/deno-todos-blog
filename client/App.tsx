import React, { useEffect, useState } from "react";
import type { AppState, Todo } from "../shared/types.ts";
import { addTodo, getTodos, removeTodo, updateTodo } from "./api.ts";
import Input from "./Input.tsx";
import TodoItem from "./TodoItem.tsx";

export type AppProps = {
  initialState?: AppState;
};

const App: React.VFC<AppProps> = ({ initialState }) => {
  const [todos, setTodos] = useState<Todo[]>(initialState?.todos ?? []);
  const [initialized, setInitialized] = useState(
    initialState?.todos.length ?? 0 > 0,
  );

  useEffect(() => {
    if (!initialized) {
      getTodos().then((todos) => setTodos(todos));
      setInitialized(true);
    }
  }, [initialized]);

  return (
    <div className="App">
      <h1><img src="todos.png"/><span>todos</span></h1>
      <Input
        onSubmit={async (label) => {
          const newTodo = await addTodo({ label });
          setTodos([...todos, newTodo]);
        }}
      />
      {todos.map((todo, i) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onUpdate={async (updatedTodo) => {
            const newTodo = await updateTodo(updatedTodo);
            setTodos([
              ...todos.slice(0, i),
              newTodo,
              ...todos.slice(i + 1),
            ]);
          }}
          onRemove={async ({ id }) => {
            await removeTodo(id);
            setTodos([
              ...todos.slice(0, i),
              ...todos.slice(i + 1),
            ]);
          }}
        />
      ))}
    </div>
  );
};

export default App;
