import { useState, useEffect } from "react";

export default function useStoredState(initialValue, key) {
  const storedValue = localStorage.getItem(key);
  const [value, setValue] = useState(
    storedValue ? JSON.parse(storedValue) : initialValue
  );

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
