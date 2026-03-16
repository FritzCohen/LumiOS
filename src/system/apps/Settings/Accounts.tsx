import { useRef, useState } from "react";
import { useUser } from "../../../context/user/user";
import { useKernel } from "../../../hooks/useKernal";
import { PermissionDescription } from "../../../types/globals";
import CreateUserPopup from "../../gui/components/Popups/CreateUserPopup";
import Button from "../../lib/Button";
import { User } from "../../../context/user/userTypes";
import { useOutsideClick } from "../../../hooks/useOutsideClick";
import ModifyUserPropsPopup from "../../gui/components/Popups/ModifyUserPopup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faArrowRightFromBracket,
	faUserMinus,
	faUserPen,
	faUserPlus,
} from "@fortawesome/free-solid-svg-icons";

const Accounts = () => {
	const { openApp } = useKernel();
	const { currentUser, users, modifyUserProp, logout, deleteUser } =
		useUser();

	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const accountsRef = useRef(null);
	const buttonsRef = useRef(null);

	useOutsideClick([accountsRef, buttonsRef], ({ clickedRefIndex }) => {
		if (clickedRefIndex == null) setSelectedUser(null);
	});

	const handleCreateUser = async () => {
		openApp({
			config: {
				name: "Create User",
				displayName: "Create User",
				permissions: 0,
				icon: "",
			},
			mainComponent: (props) => (
				<CreateUserPopup props={props} {...props} />
			),
		});
	};

	const handleModifyUser = async () => {
		if (!selectedUser) return;

		const modifiedUser = await openApp({
			config: {
				name: "Modify User",
				displayName: "Modify User",
				permissions: 0,
				icon: "",
			},
			mainComponent: (props) => (
				<ModifyUserPropsPopup
					props={props}
					user={selectedUser}
					{...props}
				/>
			),
		});

		Object.entries(modifiedUser).forEach(([key, value]) => {
			if (key in selectedUser) {
				modifyUserProp(
					selectedUser.username,
					key as keyof User,
					value as User[keyof User]
				);
			}
		});
	};

	const handleDeleteUser = async () => {
		if (!selectedUser || !currentUser) return;

		if (selectedUser.username === currentUser.username) {
			return;
		}

		deleteUser(selectedUser);
	};

	const handleLogout = () => logout();

	return (
		<div className="flex flex-col gap-2 p-5 overflow-y-auto w-full h-full text-text-primary">
			<h2 className="font-semibold text-xl">Accounts</h2>
			{/* Users */}
			<div
				className="flex flex-col gap-1 p-4 rounded shadow divide-y"
				ref={accountsRef}
			>
				{users.map((user, index) => (
					<div
						className={`accounts-item ${
							selectedUser?.username === user.username
								? "active"
								: ""
						}`}
						onClick={() => setSelectedUser(user)}
						key={index}
					>
						<img
							alt="UserProfile"
							src={
								typeof user?.icon === "string" ? user.icon : ""
							}
							className="w-12 h-12"
						/>
						<div className="flex flex-col">
							<h3 className="font-semibold text-lg">
								{user.username}
							</h3>
							<p className="text-sm font-light">
								{PermissionDescription[user.permission]
									.charAt(0)
									.toUpperCase() +
									PermissionDescription[
										user.permission
									].slice(1)}
							</p>
						</div>
					</div>
				))}
			</div>
			{/* Options */}
			<div
				ref={buttonsRef}
				className="grid w-full gap-2 p-2 bg-surface
	           [grid-template-columns:repeat(auto-fit,minmax(120px,1fr))]"
			>
				<Button
					className="flex flex-col items-center gap-1"
					onClick={handleModifyUser}
				>
					<FontAwesomeIcon icon={faUserPen} />
					Modify User
				</Button>

				<Button
					className="flex flex-col items-center gap-1"
					onClick={handleCreateUser}
				>
					<FontAwesomeIcon icon={faUserPlus} />
					New User
				</Button>

				<Button
					className="flex flex-col items-center gap-1"
					onClick={handleDeleteUser}
				>
					<FontAwesomeIcon icon={faUserMinus} />
					Delete User
				</Button>

				<Button
					className="flex flex-col items-center gap-1"
					onClick={handleLogout}
				>
					<FontAwesomeIcon icon={faArrowRightFromBracket} />
					Log Out
				</Button>
			</div>
		</div>
	);
};

export default Accounts;
