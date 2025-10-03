import { useEffect, useRef, useState } from "react";
import { OpenedApp } from "../../../../context/kernal/kernal";
import { Permission } from "../../../../types/globals";
import Input from "../../../lib/Input";
import Popup from "./Popup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import Button from "../../../lib/Button";
import verifyPasswordIntegrity from "../../../../context/user/verifyPasswordIntegrity";
import { defaultPanic, defaultSystemProps } from "../../../../constants/constants";
import defaultIcon from "../../../../assets/no-bg-logo.png";
import defaultBG from "../../../../assets/background/bg1.avif";
import { useUser } from "../../../../context/user/user";
import { useKernel } from "../../../../hooks/useKernal";
import VerifyUserPopup from "./VerifyUserPopup";

interface CreateUserPopupProps {
	props: OpenedApp;
}

const CreateUserPopup: React.FC<CreateUserPopupProps> = ({ props }) => {
	const { openApp } = useKernel();
	const { createUser } = useUser();

	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [verifyPassword, setVerifyPassword] = useState<string>("");
	const [permission, setPermission] = useState<Permission>(Permission.USER);

	const hasVerifiedRef = useRef(false); // prevent multiple popups

	useEffect(() => {
		let isCancelled = false;

		const verify = async () => {
			if (permission === Permission.SYSTEM) {
				// Skip verification completely
				hasVerifiedRef.current = true;
			}

			if (permission === Permission.ELEVATED && !hasVerifiedRef.current) {
				const verified = await awaitVerifyUserPass();
				if (!isCancelled) {
					if (verified) {
						hasVerifiedRef.current = true;
					} else {
						setPermission(Permission.USER); // Revert
					}
				}
			} else if (permission === Permission.USER || permission === Permission.NONE) {
				hasVerifiedRef.current = false;
			}
		};

		verify();

		return () => {
			isCancelled = true; // Prevent state updates if component unmounts
		};
	}, [permission]);


	const awaitVerifyUserPass = async (): Promise<boolean> => {
		const result = await openApp({
			config: {
				name: "Verify User",
				displayName: "Verify User",
				permissions: 0,
				icon: "",
			},
			mainComponent: (props) => 
				<VerifyUserPopup props={props} intent="Modify new user props" {...props} />
		});

		console.log(result);
		
		return result;
	};


	return (
		<Popup app={props} closeOnComplete frozenBackground width={400} height={450} allowOverflow>
			{({ complete }) => {

                // inside the render return, before JSX:
const passwordIsValid = verifyPasswordIntegrity(password);
const verifyMismatch = verifyPassword.length > 0 && password !== verifyPassword;

				const handleComplete = async () => {
					if (!passwordIsValid) return;
					
                    if (password !== verifyPassword) return;

                    await createUser({
                        username: username,
                        password: password,
                        panic: defaultPanic,
                        icon: defaultIcon,
                        permission: permission,
                        autoLogin: false,
                        systemProps: defaultSystemProps,
						browserConfig: {
							defaultLink: {
								title: "home",
								link: "/home"
							},
							proxyLinks: [],
							bookmarks: [],
						},
                        theme: {
                            window: {
                                primary: "",
                                primaryLight: "",
                                secondary: "",
                                secondaryLight: "",
                                textBase: "",
                            },
                            taskbar: [],
                            topbar: []
                        },
                        backgroundImage: defaultBG,
                        installedApps: [],
                    });

                    complete(true);
				};

				const handleCancel = () => {
					complete(false);
				};

                const hasMinLength = password.length >= 8;
                const hasUppercase = /[A-Z]/.test(password);
                const hasNumber = /[0-9]/.test(password);
                const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
                const passwordsMatch = password === verifyPassword && verifyPassword.length > 0;


				return (
					<div>
						<div className="flex flex-col border p-4 m-2 box-borde divide-y divide-solid rounded-lg gap-2">
							<div className="flex flex-row justify-between items-center">
								<h3>New User</h3>
								<select
									value={permission}
									onChange={(e) =>
										setPermission(Number(e.target.value))
									}
								>
									<option value={Permission.ELEVATED}>
										Administrator
									</option>
									<option value={Permission.USER}>
										Standard
									</option>
									<option value={Permission.NONE}>
										None :(
									</option>
								</select>
							</div>

							<div className="flex flex-row justify-between items-center gap-5">
								<h3>Username</h3>
								<Input
									onChange={(e) =>
										setUsername(e.target.value)
									}
								/>
							</div>

							<div className="flex flex-row justify-between items-center gap-5">
								<h3>Password</h3>
								<Input
									type="password"
									onChange={(e) =>
										setPassword(e.target.value)
									}
                                    style={{ borderColor: verifyMismatch ? "red" : (password && verifyPassword) ? "green" : undefined }}
								/>
							</div>
							<div
                                className="text-xs font-light"
								style={{
                                    color: 
verifyMismatch ? "red" : "gray",
									border:
										password && !passwordIsValid
											? "1px solid #ef4444"
											: "none",
									borderRadius: "0.25rem",
									padding: "0.5rem",
								}}
							>
								<p className="font-bold">
									Password requirements:
								</p>
                                <ul className="list-disc list-inside">
                                    <li style={{ color: hasMinLength ? "inherit" : "red" }}>
                                    At least 8 characters
                                    </li>
                                    <li style={{ color: hasUppercase ? "inherit" : "red" }}>
                                    One uppercase letter
                                    </li>
                                    <li style={{ color: hasNumber ? "inherit" : "red" }}>
                                    One number
                                    </li>
                                    <li style={{ color: hasSymbol ? "inherit" : "red" }}>
                                    One symbol
                                    </li>
                                    <li style={{ color: passwordsMatch ? "inherit" : "red" }}>
                                    Passwords match
                                    </li>
                                </ul>
							</div>
							<div className="flex flex-row justify-between items-center gap-6">
								<h3>Verify</h3>
								<Input
									type="password"
									onChange={(e) =>
										setVerifyPassword(e.target.value)
									}
                                    style={{ borderColor: verifyMismatch ? "red" : (password && verifyPassword) ? "green" : undefined }}
								/>
							</div>
						</div>

						<div className="flex justify-between items-center px-2 pb-2">
							<FontAwesomeIcon icon={faCircleQuestion} />
							<div className="flex flex-row gap-2">
								<Button onClick={handleCancel}>Cancel</Button>
								<Button onClick={handleComplete}>
									Create User
								</Button>
							</div>
						</div>
					</div>
				);
			}}
		</Popup>
	);
};

export default CreateUserPopup;
