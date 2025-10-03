import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { 
    checkbox?: boolean
}

const Input: React.FC<InputProps> = ({ children, className, ...rest }) => {
    return (
        <div className="relative my-2 w-full">
            <input
                className={`input-main transition-all duration-300 ease-in-out focus:outline-none focus:border-accent ${className}`}
                placeholder="Search Settings..."
                {...rest}
            />
        </div>
    );
}

export default Input;