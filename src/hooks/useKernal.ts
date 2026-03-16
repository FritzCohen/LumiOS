import { useContext } from "react";
import { KernelContext } from "../context/kernal/kernal";

export function useKernel() {
  const context = useContext(KernelContext);
  if (!context) {
    throw new Error("useKernel must be used within a KernelProvider");
  }
  return context;
}
