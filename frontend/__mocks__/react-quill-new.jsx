import React from "react";

function ReactQuill({ value, onChange, placeholder }) {
  return (
    <textarea
      aria-label="Content"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  );
}

export default ReactQuill;