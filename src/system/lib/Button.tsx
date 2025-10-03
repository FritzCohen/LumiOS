import { useEffect, useState, MouseEvent, CSSProperties, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = "",
  disabled = false,
  style = {},
  type = "button",
  ...rest
}) => {
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: -1, y: -1 });
  const [isRippling, setIsRippling] = useState(false);
  
  useEffect(() => {
    if (coords.x !== -1 && coords.y !== -1) {
      setIsRippling(true);
      setTimeout(() => setIsRippling(false), 300);
    } else setIsRippling(false);
  }, [coords]);
  
  useEffect(() => {
    if (!isRippling) setCoords({ x: -1, y: -1 });
  }, [isRippling]);  
  
  return (
    <button
      disabled={disabled}
      type={type}
      className={`ripple-button ${className} ${disabled && "!cursor-not-allowed !bg-secondary-light !transition-none !scale-100"}`}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        const rect = (e.target as HTMLButtonElement).getBoundingClientRect();
        setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        onClick && onClick(e);
      }}
      style={style}
      {...rest}
    >
      {isRippling ? (
        <span
          className="ripple pointer-events-none"
          style={{
            left: coords.x,
            top: coords.y
          }}
        />
      ) : (
        ''
      )}
      <span className="content">{children}</span>
    </button>
  );
}

export default Button;