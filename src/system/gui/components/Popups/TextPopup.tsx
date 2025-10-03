import { useState } from "react";
import { OpenedApp } from "../../../../context/kernal/kernal";
import Popup from "./Popup";
import Input from "../../../lib/Input";

interface TextPopupProps {
	props: OpenedApp;
	type?: string; // optional now
	text?: string;
	freezeBackground?: boolean;
	verifyInput?: (value: string) => boolean;
	onComplete: (value: string) => void;
}

const TextPopup: React.FC<TextPopupProps> = ({
	props,
	text,
	type,
	freezeBackground,
	verifyInput,
	onComplete,
}) => {
	const [input, setInput] = useState("");
	const [status, setStatus] = useState("");

	const inputMode = !!type; // if type is passed, we expect input
	const freeze = freezeBackground || verifyInput !== undefined;

	return (
		<Popup
			app={props}
			closeOnComplete
			frozenBackground={freeze}
			width={300}
			height={200}
		>
			{({ complete }) => {
				const handleComplete = () => {
					if (inputMode) {
						if (verifyInput && !verifyInput(input)) {
							setStatus("Failed to register the input.");
							return;
						}
						onComplete(input);
						complete(input);
					} else {
						onComplete(""); // no input, just notify
						complete("");
					}
				};

				return (
					<div
						style={{
							padding: 16,
							display: "flex",
							flexDirection: "column",
							gap: 12,
						}}
					>
						{text && (
							<p
								style={{
									fontSize: "14px",
									lineHeight: "1.5",
									whiteSpace: "pre-wrap", // preserves newlines if your text has them
									wordBreak: "break-word", // breaks long words instead of overflowing
								}}
							>
								{text}
							</p>
						)}

						{inputMode && (
							<>
								<Input
									type={type}
									value={input}
									onChange={(e) => setInput(e.target.value)}
								/>
								{status && (
									<span
										style={{
											color: "red",
											fontSize: "12px",
										}}
									>
										{status}
									</span>
								)}
							</>
						)}

						<button onClick={handleComplete} style={{ padding: 8 }}>
							{inputMode ? "Submit" : "OK"}
						</button>
						<p className="clean-p text-center" onClick={complete}>Or cancel here.</p>
					</div>
				);
			}}
		</Popup>
	);
};

export default TextPopup;