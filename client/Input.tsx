import React, { useState } from "react";

export type InputProps = {
  initialValue?: string;
  onSubmit: (value: string) => void;
};

const Input: React.VFC<InputProps> = ({ initialValue, onSubmit }) => {
  const [value, setValue] = useState(initialValue ?? '');

  return (
    <input
      className="Input"
      data-testid="input"
      placeholder="What needs to be done?"
      value={value}
      onChange={(event) => setValue(event.currentTarget.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          onSubmit(value);
          setValue('');
        }
      }}
    />
  );
};

export default Input;
