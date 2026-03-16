import {
	useEffect,
	useState,
	MouseEvent,
	CSSProperties,
	ButtonHTMLAttributes,
	useCallback,
	useRef,
	forwardRef,
	useImperativeHandle,
} from "react";
import {
	faCopy,
	faTimes,
	faCheck,
	faExchangeAlt,
	faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import "./lib.css";
import useContextMenu from "../gui/components/ContextMenu/useContextMenu";
import ContextMenu from "../gui/components/ContextMenu/ContextMenu";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode;
	className?: string;
	style?: CSSProperties;
	full?: boolean;
	rippleColor?: string;
	active?: boolean; // useful for "checkbox" variant UI
	variant?: "default" | "checkbox";
}

const Button = forwardRef<HTMLButtonElement | null, ButtonProps>(
	(
		{
			children,
			onClick,
			className = "",
			disabled = false, // parent-provided
			style = {},
			type = "button",
			full = false,
			active = false,
			rippleColor = "rgba(255, 255, 255, 0.6)",
			variant = "default",
			...rest
		},
		ref
	) => {
		const innerRef = useRef<HTMLButtonElement>(null);

		useImperativeHandle(ref, () => innerRef.current!);
		// Internal disabled state (context menu can toggle this)
		const [selfDisabled, setSelfDisabled] = useState(false);

		// Parent always wins
		const effectiveDisabled = disabled || selfDisabled;

		// Ripple
		const [coords, setCoords] = useState<{ x: number; y: number } | null>(
			null
		);
		const [isRippling, setIsRippling] = useState(false);

		useEffect(() => {
			if (coords) {
				setIsRippling(true);
				const timeout = setTimeout(() => setIsRippling(false), 300);
				return () => clearTimeout(timeout);
			}
		}, [coords]);

		useEffect(() => {
			if (!isRippling) setCoords(null);
		}, [isRippling]);

		const handleClick = useCallback(
			(e: MouseEvent<HTMLButtonElement>) => {
				if (effectiveDisabled) return;
				const rect = e.currentTarget.getBoundingClientRect();
				setCoords({
					x: e.clientX - rect.left,
					y: e.clientY - rect.top,
				});
				onClick?.(e);
			},
			[onClick, effectiveDisabled]
		);

		const buttonClasses = `ripple-button ${className} ${
			active ? "active" : ""
		} ${
			effectiveDisabled
				? "!cursor-not-allowed !bg-secondary-light !transition-none !scale-100"
				: ""
		}`;

		const {
			contextMenuVisible,
			contextMenuPosition,
			contextMenuItems,
			showContextMenu,
			hideContextMenu,
		} = useContextMenu();

		// Context menu options
		const buildMenu = () => {
			if (variant === "checkbox") {
				return [
					{
						name: "Check",
						icon: faCheck,
						action: () =>
							innerRef.current?.setAttribute(
								"aria-pressed",
								"true"
							),
					},
					{
						name: "Uncheck",
						icon: faTimes,
						action: () =>
							innerRef.current?.setAttribute(
								"aria-pressed",
								"false"
							),
					},
					{
						name: "Toggle",
						icon: faExchangeAlt,
						action: () => {
							if (innerRef.current) {
								const current =
									innerRef.current.getAttribute(
										"aria-pressed"
									) === "true";
								innerRef.current.setAttribute(
									"aria-pressed",
									String(!current)
								);
							}
						},
					},
					{
						name: "Button Info",
						icon: faInfoCircle,
						action: () => {
							if (innerRef.current) {
								alert(
									`Text: "${
										innerRef.current.innerText
									}"\nDisabled: ${effectiveDisabled}\nPressed: ${innerRef.current.getAttribute(
										"aria-pressed"
									)}`
								);
							}
						},
					},
				];
			}

			// Default button
			return [
				{
					name: "Copy Label",
					icon: faCopy,
					action: () => {
						if (innerRef.current) {
							navigator.clipboard
								?.writeText(innerRef.current.innerText)
								.catch(() => {});
						}
					},
				},
				{
					name: selfDisabled ? "Enable Button" : "Disable Button",
					icon: selfDisabled ? faCheck : faTimes,
					action: () => {
						// Only toggle selfDisabled — parent disabled still overrides
						setSelfDisabled((prev) => !prev);
					},
				},
				{
					name: "Button Info",
					icon: faInfoCircle,
					action: () => {
						if (innerRef.current) {
							alert(
								`Text: "${innerRef.current.innerText}"\nDisabled: ${effectiveDisabled}`
							);
						}
					},
				},
			];
		};

		return (
			<>
				<button
					ref={innerRef}
					disabled={effectiveDisabled}
					type={type}
					className={buttonClasses}
					onClick={handleClick}
					style={{
						...style,
						width: full ? "100%" : style.width,
					}}
					onContextMenu={(e) => {
						showContextMenu(e, buildMenu(), innerRef);
					}}
					{...rest}
				>
					{isRippling && coords && (
						<span
							className="ripple pointer-events-none"
							style={{
								left: coords.x,
								top: coords.y,
								backgroundColor: rippleColor,
							}}
						/>
					)}
					<span className="content">{children}</span>
				</button>

				{contextMenuVisible && (
					<ContextMenu
						menuItems={contextMenuItems}
						menuPosition={contextMenuPosition}
						hideMenu={hideContextMenu}
					/>
				)}
			</>
		);
	}
);

export default Button;
