// DON"T USE THIS FUCKING FILE

import { useContext } from "react";
import { ExecutableContext } from "../context/process/ProcessProvider";

// Custom hook for using the Executable context
export const useExecutables = () => {
  const context = useContext(ExecutableContext);
  if (!context) {
    throw new Error("useExecutables must be used within an ExecutableProvider");
  }
  return context;
};