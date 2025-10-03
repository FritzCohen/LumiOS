import React, { forwardRef } from "react";

type SelectableContainerProps = React.HTMLAttributes<HTMLDivElement>;

export const SelectableContainer = forwardRef<HTMLDivElement, SelectableContainerProps>(
  ({ style, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={{ position: "relative", overflow: "auto", ...style }}
        className={className}
        {...props}
      />
    );
  }
);

SelectableContainer.displayName = "SelectableContainer";