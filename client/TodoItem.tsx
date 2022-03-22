import React from "react";
import type { Todo } from "../shared/types.ts";

export type TodoItemProps = {
  todo: Todo;
  onUpdate: (todo: Todo) => void;
  onRemove: (todo: Todo) => void;
};

const TodoItem: React.VFC<TodoItemProps> = ({ todo, onRemove, onUpdate }) => {
  return (
    <div className="TodoItem" data-testid="todo-item">
      <input
        data-testid={`todo-item-${todo.complete ? "checked" : "unchecked"}`}
        type="checkbox"
        className="TodoItem-check"
        checked={todo.complete}
        onChange={(event) => {
          onUpdate({
            ...todo,
            complete: event.currentTarget.checked,
          });
        }}
      />
      <span className="TodoItem-label" data-testid="todo-item-label">
        {todo.label}
      </span>
      <span
        className="TodoItem-close"
        onClick={() => onRemove(todo)}
      >
        X
      </span>
    </div>
  );
};

export default TodoItem;
