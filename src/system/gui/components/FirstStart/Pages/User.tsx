import { useState } from "react";
import Input from "../../../../lib/Input";
import { useFirstStartProps } from "../useFirstStart";
import verifyPasswordIntegrity from "../../../../../context/user/verifyPasswordIntegrity";
import { Permission } from "../../../../../types/globals";

const User: React.FC<{ userPrefab: useFirstStartProps }> = ({ userPrefab }) => {
	// verifyPassword only lives in this component
	const [verifyPassword, setVerifyPassword] = useState("");

	const { username, password } = userPrefab.userData;

	// validation checks must run inside component
	const hasMinLength = password.length >= 8;
	const hasUppercase = /[A-Z]/.test(password);
	const hasNumber = /[0-9]/.test(password);
	const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
	const passwordsMatch =
		password === verifyPassword && verifyPassword.length > 0;

	const passwordIsValid = verifyPasswordIntegrity(password);
	const verifyMismatch =
		verifyPassword.length > 0 && password !== verifyPassword;

	return (
		<form
			className="flex flex-col gap-4"
			onSubmit={(e) => e.preventDefault()}
		>
			{/* Username */}
			<div className="flex flex-row items-center gap-2">
				<span className="font-semibold">Username:</span>
				<Input
					placeholder="Enter username"
					name="username"
					autoComplete="username"
					value={username}
					onChange={(e) =>
						userPrefab.updateField("username", e.target.value)
					}
				/>
			</div>

			{/* Password */}
			<div className="flex flex-row items-center gap-2">
				<span className="font-semibold">Password:</span>
				<Input
					type="password"
					placeholder="Enter password"
					name="password"
					autoComplete="new-password" // ✅ correct attribute
					value={password}
					onChange={(e) =>
						userPrefab.updateField("password", e.target.value)
					}
					style={{
						borderColor: verifyMismatch
							? "red"
							: password && verifyPassword
							? "green"
							: undefined,
					}}
				/>
			</div>

			{/* Requirements */}
			<div
				className="text-xs font-light"
				style={{
					color: verifyMismatch ? "red" : "inherit",
					border:
						password && !passwordIsValid
							? "1px solid #ef4444"
							: "none",
					borderRadius: "0.25rem",
					padding: "0.5rem",
				}}
			>
				<p className="font-semibold">Password suggestions:</p>
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

			{/* Verify Password */}
			<div className="flex flex-row items-center gap-2">
				<span className="font-semibold">Verify:</span>
				<Input
					type="password"
					placeholder="Re-enter password"
					name="password"
					autoComplete="new-password"
					value={verifyPassword}
					onChange={(e) => setVerifyPassword(e.target.value)}
					style={{
						borderColor: verifyMismatch
							? "red"
							: password && verifyPassword
							? "green"
							: undefined,
					}}
				/>
			</div>

			{/* User permission level */}
			<div className="flex flex-row items-center gap-2">
				<span className="font-semibold">Permissions:</span>
				<select
					value={userPrefab.userData.permission}
					onChange={(e) => {
						const value = Number(e.target.value) as Permission; // cast back to enum
						userPrefab.updateField("permission", value);
					}}
				>
					{Object.keys(Permission)
						.filter((key) => isNaN(Number(key))) // keep only string keys
						.map((key) => (
							<option
								key={key}
								value={
									Permission[key as keyof typeof Permission]
								}
							>
								{key}
							</option>
						))}
				</select>
			</div>
		</form>
	);
};

export default User;
