// TS DOES NOT WORK

import React, {
	useRef,
	useState,
	useImperativeHandle,
	InputHTMLAttributes,
	useEffect,
	useLayoutEffect,
	useCallback,
} from "react";
import { createPortal } from "react-dom";
import useContextMenu from "../gui/components/ContextMenu/useContextMenu";
import ContextMenu from "../gui/components/ContextMenu/ContextMenu";
import { useOutsideClick } from "../../hooks/useOutsideClick";

/* ================= TYPES ================= */

type ColorFormat = "hex" | "hex-short" | "rgba";

interface RGBA {
	r: number;
	g: number;
	b: number;
	a: number;
}

interface HSV {
	h: number;
	s: number;
	v: number;
}

interface Props extends Omit<
	InputHTMLAttributes<HTMLInputElement>,
	"value" | "onChange"
> {
	value: string;
	onChange: (value: string) => void;
}

/* ================= COLOR MATH ================= */

const rgbToHsv = ({ r, g, b }: RGBA): HSV => {
	r /= 255;
	g /= 255;
	b /= 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const d = max - min;

	let h = 0;
	if (d !== 0) {
		if (max === r) h = ((g - b) / d) % 6;
		else if (max === g) h = (b - r) / d + 2;
		else h = (r - g) / d + 4;
		h *= 60;
	}

	return {
		h: h < 0 ? h + 360 : h,
		s: max === 0 ? 0 : d / max,
		v: max,
	};
};

const hsvToRgb = ({ h, s, v }: HSV): RGBA => {
	const c = v * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = v - c;

	let r = 0,
		g = 0,
		b = 0;

	if (h < 60) [r, g, b] = [c, x, 0];
	else if (h < 120) [r, g, b] = [x, c, 0];
	else if (h < 180) [r, g, b] = [0, c, x];
	else if (h < 240) [r, g, b] = [0, x, c];
	else if (h < 300) [r, g, b] = [x, 0, c];
	else [r, g, b] = [c, 0, x];

	return {
		r: Math.round((r + m) * 255),
		g: Math.round((g + m) * 255),
		b: Math.round((b + m) * 255),
		a: 1,
	};
};

const rgbaToHex = ({ r, g, b }: RGBA, short = false) => {
	const h = (n: number) => n.toString(16).padStart(2, "0");
	const full = `#${h(r)}${h(g)}${h(b)}`;
	return short ? `#${full[1]}${full[3]}${full[5]}` : full;
};

const rgbaToString = (c: RGBA) => `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;

const hexToRgba = (hex: string): RGBA | null => {
	const clean = hex.replace("#", "");
	if (![3, 6].includes(clean.length)) return null;

	const full =
		clean.length === 3
			? clean
					.split("")
					.map((c) => c + c)
					.join("")
			: clean;

	const n = parseInt(full, 16);
	return {
		r: (n >> 16) & 255,
		g: (n >> 8) & 255,
		b: n & 255,
		a: 1,
	};
};

/* ================= SV SQUARE ================= */

const SVSquare: React.FC<{
	hsv: HSV;
	onChange: (hsv: HSV) => void;
}> = ({ hsv, onChange }) => {
	const ref = useRef<HTMLDivElement>(null);

	const handle = (e: React.MouseEvent) => {
		const rect = ref.current!.getBoundingClientRect();
		const s = Math.min(
			1,
			Math.max(0, (e.clientX - rect.left) / rect.width),
		);
		const v = Math.min(
			1,
			Math.max(0, 1 - (e.clientY - rect.top) / rect.height),
		);
		onChange({ ...hsv, s, v });
	};

	return (
		<div
			ref={ref}
			onMouseDown={handle}
			className="relative h-40 w-40 cursor-crosshair"
			style={{
				background: `
          linear-gradient(to top, black, transparent),
          linear-gradient(to right, white, transparent),
          hsl(${hsv.h}, 100%, 50%)
        `,
			}}
		>
			{/* Cursor */}
			<div
				className="absolute h-3 w-3 rounded-full border-2 border-white"
				style={{
					left: `${hsv.s * 100}%`,
					top: `${(1 - hsv.v) * 100}%`,
					transform: "translate(-50%, -50%)",
					boxShadow: "0 0 6px #00f6ff",
					background: "transparent",
				}}
			/>
		</div>
	);
};

/* ================= MAIN COMPONENT ================= */

const ColorPickerInput = React.forwardRef<HTMLInputElement, Props>(
	({ value, onChange, className = "", ...rest }, ref) => {
		const inputRef = useRef<HTMLInputElement>(null);
		const popoverRef = useRef<HTMLDivElement>(null);

		useImperativeHandle(ref, () => inputRef.current!);

		const [format, setFormat] = useState<ColorFormat>("hex");
		const [rgba, setRgba] = useState<RGBA>({ r: 0, g: 0, b: 0, a: 1 });
		const [hsv, setHsv] = useState<HSV>({ h: 0, s: 0, v: 0 });
		const [display, setDisplay] = useState(value);
		const [open, setOpen] = useState(false);
		const [position, setPosition] = useState({ top: 0, left: 0 });

		const {
			contextMenuVisible,
			contextMenuPosition,
			contextMenuItems,
			showContextMenu,
			hideContextMenu,
		} = useContextMenu();

		const formatValue = useCallback(
			(c: RGBA, f = format) =>
				f === "rgba"
					? rgbaToString(c)
					: rgbaToHex(c, f === "hex-short"),
			[format],
		);

		// Calculate position from the anchorRef
		useLayoutEffect(() => {
			if (!open || !inputRef.current || !popoverRef.current) return;

			const update = () => {
				const rect = inputRef.current!.getBoundingClientRect();
				const popRect = popoverRef.current!.getBoundingClientRect();

				setPosition({
					top: rect.bottom,
					left: rect.left + rect.width - popRect.width,
				});
			};

			update();

			window.addEventListener("resize", update);
			window.addEventListener("scroll", update);

			return () => {
				window.removeEventListener("resize", update);
				window.removeEventListener("scroll", update);
			};
		}, [open]);

		useEffect(() => {
			if (value.startsWith("#")) {
				const parsed = hexToRgba(value);
				if (parsed) {
					setRgba(parsed);
					setHsv(rgbToHsv(parsed));
					setDisplay(formatValue(parsed));
				}
			}
		}, [value, formatValue]);

		useEffect(() => {
			const rgb = { ...hsvToRgb(hsv), a: rgba.a };
			setRgba(rgb);
			const out = formatValue(rgb);
			setDisplay(out);
			onChange(out);
		}, [hsv, formatValue]);

		useOutsideClick([popoverRef], ({ clickedRefIndex }) => {
			if (clickedRefIndex != 0) {
				setOpen(false);
			}
		});

		return (
			<>
				<div
					className="relative flex items-center !w-full"
					onContextMenu={(e) =>
						showContextMenu(
							e,
							[
								{
									name: "Hex (#RRGGBB)",
									action: () => setFormat("hex"),
								},
								{
									name: "Short Hex (#RGB)",
									action: () => setFormat("hex-short"),
								},
								{
									name: "RGBA",
									action: () => setFormat("rgba"),
									gap: true,
								},
							],
							inputRef,
						)
					}
				>
					<input
						ref={inputRef}
						value={display}
						onChange={(e) => setDisplay(e.target.value)}
						className={`input-like-select pr-10 !w-full ${className}`}
						{...rest}
					/>

					<button
						type="button"
						onClick={() => setOpen((o) => !o)}
						className="absolute right-2 h-6 w-6 rounded border"
						style={{
							background: rgbaToHex(rgba),
						}}
					/>
				</div>

				{open &&
					createPortal(
						<div
							ref={popoverRef}
							className="fixed p-3 rounded border bg-[#0b0f1a] border-[#2f2f6a] z-50"
							style={{ top: position.top, left: position.left }}
						>
							<SVSquare hsv={hsv} onChange={setHsv} />
							<input
								type="range"
								min={0}
								max={360}
								value={hsv.h}
								onChange={(e) =>
									setHsv({ ...hsv, h: +e.target.value })
								}
                style={{ background: "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)", }}
								className="w-full mt-2"
							/>
						</div>,
						document.body,
					)}

				{contextMenuVisible && (
					<ContextMenu
						menuItems={contextMenuItems}
						menuPosition={contextMenuPosition}
						hideMenu={hideContextMenu}
					/>
				)}
			</>
		);
	},
);

export default ColorPickerInput;
