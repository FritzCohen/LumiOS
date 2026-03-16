import { useEffect, useState } from "react";
import { GITHUB_LINK, OS_NAME } from "../../../../constants/constants";
import { OpenedApp } from "../../../../context/kernal/kernal";
import Popup from "./Popup";
import { useUser } from "../../../../context/user/user";

const COOLDOWN = 3;

const FirstStartPopup: React.FC<{ props: OpenedApp }> = ({ props }) => {
	const { currentUser, modifyUserProp } = useUser();
	const [timeLeft, setTimeLeft] = useState(COOLDOWN);
	const [progressStarted, setProgressStarted] = useState(false);

	useEffect(() => {
		const start = Date.now();

		setTimeout(() => setProgressStarted(true), 10);

		const update = () => {
			const elapsed = Math.floor((Date.now() - start) / 1000);
			const remaining = Math.max(COOLDOWN - elapsed, 0);

			setTimeLeft(remaining);

			if (remaining > 0) {
				setTimeout(update, 200);
			}
		};

		update();
	}, []);

	const submit = async (func: (val: boolean) => void) => {
		if (!currentUser) return;

		modifyUserProp(
			currentUser.username,
			"systemProps.system.firstLogin",
			false,
		);
		func(true);
	};

	return (
		<Popup app={props} closeOnComplete width={350} height={550}>
			{({ complete }) => (
				<div className="flex flex-col h-full">
					{/* CONTENT */}
					<div className="flex flex-col gap-4 px-6 pt-6 pb-4">
						<div className="text-2xl font-semibold">
							About {OS_NAME}
						</div>

						<p className="clean">
							{OS_NAME} is a modern React + TypeScript operating
							system built for the browser, providing a dynamic
							desktop environment with themes, apps, plugins, and
							offline support.
						</p>

						<p className="clean">
							The project is open source and licensed under the{" "}
							<span className="font-medium">Apache License</span>.
							Source code is available on{" "}
							<a
								href={GITHUB_LINK}
								className="text-text-secondary"
								target="_blank"
								rel="noreferrer"
							>
								Github
							</a>
							.
						</p>

						<p className="clean">
							For questions or feedback, join the official{" "}
							<a
								href="https://discord.gg/TyacaNY3GK"
								className="text-text-secondary"
								target="_blank"
								rel="noreferrer"
							>
								Discord server
							</a>
							.
						</p>

						<p className="clean">
							If you create modifications or improvements, please
							submit them through the repository on Github.
						</p>
					</div>

					{/* FOOTER */}
					<div className="mt-auto glass-heavy shadow-inner py-5">
						<button
							disabled={timeLeft > 0}
							onClick={() => submit(complete)}
							className="relative overflow-hidden rounded-md px-4 py-1 float-right mr-5"
						>
							<div
								className="absolute left-0 top-0 h-full bg-surfaceAlt transition-all"
								style={{
									width: progressStarted ? "100%" : "0%",
									transitionDuration: `${COOLDOWN}s`,
									transitionTimingFunction: "linear",
								}}
							/>

							<span className="relative z-10">
								{timeLeft > 0
									? `Continue (${timeLeft})`
									: "Continue"}
							</span>
						</button>
					</div>
				</div>
			)}
		</Popup>
	);
};

export default FirstStartPopup;
