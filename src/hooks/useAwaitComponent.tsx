import { useState, useCallback } from "react";

type AwaitableComponentProps<T> = {
  onResolve: (value: T) => void;
};

export function useAwaitComponent<T>() {
  const [component, setComponent] = useState<React.ReactNode | null>(null);

  const awaitComponent = useCallback(
    (Component: React.FC<AwaitableComponentProps<T>>): Promise<T> => {
      return new Promise<T>((resolve) => {
        const handleResolve = (value: T) => {
          setComponent(null); // unmount the component
          resolve(value); // continue execution
        };

        // Mount the component with the handler
        setComponent(<Component onResolve={handleResolve} />);
      });
    },
    []
  );

  return { awaitComponent, AwaitedComponent: component };
}