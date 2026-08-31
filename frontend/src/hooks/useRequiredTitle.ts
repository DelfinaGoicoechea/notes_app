import { useState } from "react";

export const EMPTY_TITLE_MESSAGE = "Title cannot be empty";

function isBlankTitle(title: string): boolean {
  return title.trim() === "";
};

const TITLE_INPUT_BASE = "border rounded-md px-3 py-2 text-sm focus:outline-none";

function getTitleInputClassName(showError: boolean): string {
  return showError 
    ? `${TITLE_INPUT_BASE} border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-500` 
    : `${TITLE_INPUT_BASE} focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-gray-400`
};

export function useRequiredTitle(title: string, errorId: string) {
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<boolean>(false);
  const showError = hasAttemptedSubmit && isBlankTitle(title);

  const handleTitleChange = (value: string, setTitle: (nextTitle: string) => void) => {
    setTitle(value);

    if(!isBlankTitle(value)) {
      setHasAttemptedSubmit(false);
    };
  };

  const validateTitle = (): boolean => {
    setHasAttemptedSubmit(true);
    return !isBlankTitle(title);
  };

  const resetTitleValidation = () => {
    setHasAttemptedSubmit(false);
  };

  return {
    showError,
    handleTitleChange,
    validateTitle,
    resetTitleValidation,
    titleInputClassName: getTitleInputClassName(showError),
    titleErrorId: errorId,
    titleInputA11yProps: {
      "aria-invalid": showError,
      "aria-describedby": showError ? errorId : undefined,
    },
  };
}