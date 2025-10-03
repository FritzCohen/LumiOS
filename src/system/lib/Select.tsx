import React, { ReactNode, SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    children: ReactNode;
}

const Select: React.FC<SelectProps> = React.memo(({ children, ...rest }) => {
    return (
        <select

            {...rest}
        >
            {children}
        </select>
    );
});

export default Select;