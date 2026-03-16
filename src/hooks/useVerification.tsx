import { useState } from "react";
import { Permission } from "../types/globals";
import { User } from "../context/user/userTypes";
import { useKernel } from "./useKernal";
import VerifyUserPopup from "../system/gui/components/Popups/VerifyUserPopup";

interface VerificationState {
    permission: Permission;
	isVerified: boolean;
	isVerifying: boolean;
}

/**
 * A hook that manages the logic with verifying a user's permissions
 * before doing a high-level action. 
 * 
 * @param {User | null} currentUser
 * @returns {VerificationState}
 */
const useVerification = (currentUser: User | null) => {
	const [verificationState, setVerificationState] =
		useState<VerificationState>({
			isVerified: false,
			isVerifying: false,
            permission: currentUser?.permission || 3
		});

    const { openApp } = useKernel();

	const verifyUser = async (
		intent: string = "Elevate access to modify item"
	): Promise<boolean> => {
		setVerificationState((prev) => ({ ...prev, isVerifying: true }));

		try {
			const result = await openApp({
				config: {
					name: "Verify User",
					displayName: "Verify User",
					permissions: 0,
					icon: "",
				},
				mainComponent: (props) => (
					<VerifyUserPopup props={props} intent={intent} {...props} />
				),
			});

			if (result) {
				setVerificationState({ isVerified: true, isVerifying: false, permission: verificationState.permission });
			}
			return result;
		} catch {
			setVerificationState({ isVerified: false, isVerifying: false, permission: verificationState.permission });
			return false;
		}
	};

	const requiresVerification = (
		requiredPermission: Permission = Permission.USER
	): boolean => {
		return (
			!verificationState.isVerified &&
			(!currentUser || currentUser.permission < requiredPermission)
		);
	};

	return {
		verificationState,
		verifyUser,
		requiresVerification,
		resetVerification: () =>
			setVerificationState({ isVerified: false, isVerifying: false, permission: currentUser?.permission || 3 }),
	};
};

export default useVerification;