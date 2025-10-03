import { useEffect, useRef, useState } from "react";
import { OpenedApp } from "../../../../context/kernal/kernal";
import { User } from "../../../../context/user/types";
import { useUser } from "../../../../context/user/user";
import { Permission } from "../../../../types/globals";
import Input from "../../../lib/Input";
import Popup from "./Popup";

interface VerifyUserPopupProps {
    props: OpenedApp;
    intent: string;
}

const VerifyUserPopup: React.FC<VerifyUserPopupProps> = ({ props, intent }) => {
    const { currentUser, users } = useUser();
    const [input, setInput] = useState<string>("");

    const completeRef = useRef<(success: boolean) => void>();
    const [localAdmin, setLocalAdmin] = useState<User | null>(null);

    // Find valid admin on first mount
    useEffect(() => {
        const admin =
            (currentUser?.permission ?? 0) <= Permission.ELEVATED
                ? currentUser
                : users.find(user => user.permission <= Permission.ELEVATED) ?? null;

        setLocalAdmin(admin);
    }, [currentUser, users]);

    // Verification logic
    useEffect(() => {
        if (!completeRef.current || !localAdmin) return;
        if (input.length > localAdmin.password.length) {
            completeRef.current(false);
        }
        if (input.length === localAdmin.password.length && input !== localAdmin.password) {
            completeRef.current(false);
        }
        if (input === localAdmin.password) {
            completeRef.current(true);
        }
    }, [input, localAdmin]);

    return (
        <Popup app={props} frozenBackground closeOnComplete height={275} width={300} disableClose disableMinimize>
            {({ complete }) => {
                completeRef.current = complete;

                if (!localAdmin) {
                    return (
                        <div className="p-4 flex flex-col gap-4 items-center justify-center">
                            <p className="text-red-500 text-center">
                                No elevated user available to verify.
                            </p>
                            <button
                                onClick={() => complete(false)}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Close
                            </button>
                        </div>
                    );
                }

                return (
                    <div className="flex flex-col border p-4 m-2 box-border rounded-lg gap-2">
                        <h3 className="font-bold text-xl">{localAdmin.username}</h3>
                        <hr />
                        <p className="clean-p">Allow the app to make the following changes: {intent}</p>
                        <Input
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter password"
                            type="password"
                            autoFocus
                        />
                        <p className="clean-p !m-0 cursor-pointer" onClick={() => complete(false)}>Or cancel here.</p>
                    </div>
                );
            }}
        </Popup>
    );
};

export default VerifyUserPopup;