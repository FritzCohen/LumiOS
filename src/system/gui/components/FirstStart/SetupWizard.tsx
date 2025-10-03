import { useState } from "react";
import StartMenu from "./StartMenu";
import Welcome from "./Pages/Welcome";

import defaultUserLogo from "../../../../assets/no-bg-logo.png";

import welcomeLogo from "../../../../assets/no-bg-logo.png";
import themeLogo from "../../../../assets/Icons/themes.png";
import securityLogo from "../../../../assets/Icons/security.png";
import userLogo from "../../../../assets/Icons/people.png";

import Themes from "./Pages/Themes";
import { FirstStartState, useFirstStart } from "./useFirstStart";
import Background from "./Pages/Background";
import Panic from "./Pages/Panic";
import User from "./Pages/User";
import Endscreen from "./Pages/Endscreen";
import { useUser } from "../../../../context/user/user";
import {
	defaultBrowserConfig,
	defaultSystemProps,
} from "../../../../constants/constants";
import { DotNotation } from "../../../../types/globals";

interface Step {
	id: string | number;
	title?: string;
	image?: string | React.ReactNode;
	content: React.ReactNode;
}

const SetupWizard: React.FC = () => {
	const [currentStep, setCurrentStep] = useState(0);

	const userPrefab = useFirstStart();

	// Define the steps for the setup wizard
	const steps: Step[] = [
		{
			id: 1,
			title: "Welcome to LumiOS",
			image: welcomeLogo,
			content: <Welcome />,
		},
		{
			id: 2,
			title: "Choose Your Theme",
			image: themeLogo,
			content: <Themes userPrefab={userPrefab} />,
		},
		{
			id: 3,
			title: "Wallpapers",
			image: themeLogo,
			content: <Background userPrefab={userPrefab} />,
		},
		{
			id: 4,
			title: "Just in Case...",
			image: securityLogo,
			content: <Panic userPrefab={userPrefab} />,
		},
		{
			id: 5,
			title: "Final Steps...",
			image: userLogo,
			content: <User userPrefab={userPrefab} />,
		},
		{
			id: 6,
			title: "Finished all Steps!",
			image: welcomeLogo,
			content: <Endscreen />,
		},
	];

	const { createUser } = useUser();

	const handleFinish = () => {
		const current = userPrefab.userData;

		if (!current.username || !current.password || current.password === "" || current.username === "") {
			return;
		}

		console.log("Setup completed!");
		// Handle setup completion here
		createUser({
			...userPrefab.userData,
			icon: defaultUserLogo,
			browserConfig: defaultBrowserConfig,
			installedApps: [],
			systemProps: defaultSystemProps,
		});
	};

	const handleSkip = () => {
		console.log("Setup skipped!");

		const current = userPrefab.userData;

		// If username or password is empty, skip to second-to-last step
		if (!current.username || !current.password || current.password === "" || current.username === "") {			
			setCurrentStep(steps.length-2);
			
			return;
		}

		const fillableKeys: (keyof Omit<
			FirstStartState,
			"username" | "password"
		>)[] = ["permission", "autoLogin", "theme", "backgroundImage", "panic"];

		fillableKeys.forEach((key) => {
			const value = userPrefab.defaultUserData[key];
			const currentValue = userPrefab.userData[key];

			if (
				currentValue === undefined ||
				currentValue === null ||
				(typeof currentValue === "string" && currentValue === "") ||
				(typeof currentValue === "object" &&
					Object.keys(currentValue).length === 0) ||
				(typeof currentValue === "boolean" && currentValue === false)
			) {
				// Type-safe because key is keyof FirstStartState
				userPrefab.updateField(
					key as DotNotation<FirstStartState>,
					value
				);
			}
		});

		// Move to last step
		setCurrentStep(steps.length-1);
	};

	return (
		<div className="flex justify-center items-center w-screen h-screen desktop">
			<StartMenu
				steps={steps}
				initialStep={currentStep}
				onFinish={handleFinish}
				onSkip={handleSkip}
				onStepChange={setCurrentStep}
				setCurrentStep={setCurrentStep}
				nextButtonText="Continue"
				finishButtonText="Get Started"
				skipButtonText="Skip Setup"
				className="custom-start-menu"
			/>
		</div>
	);
};

export default SetupWizard;
