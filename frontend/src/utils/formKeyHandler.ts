/*
Creates a keydown handler for textareas that submit the form on Enter
Shift+Enter creates a new line
*/

import type { RefObject } from "react";

export const createTextareaSubmitHandler = (
  formRef: RefObject<HTMLFormElement | null>
) => {
  return(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if(e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    };
  };
};