import { useState } from "react";
import { OpenedApp } from "../../../../context/kernal/kernal";
import { User } from "../../../../context/user/types";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import Popup from "./Popup";
import Input from "../../../lib/Input";
import Button from "../../../lib/Button";
import { Permission } from "../../../../types/globals";

interface ModifyUserProps {
    props: OpenedApp;
    user: User;
}

const ModifyUserPropsPopup: React.FC<ModifyUserProps> = ({ props, user }) => {
    const [username, setUsername] = useState(user.username);
    const [password, setPassword] = useState(user.password);
    const [verifyPassword, setVerifyPassword] = useState("");
    const [icon, setIcon] = useState<IconDefinition | string>(user.icon);
    const [permission, setPermission] = useState(user.permission);
    const [autoLogin, setAutoLogin] = useState(user.autoLogin);
    const [theme, setTheme] = useState(user.theme);

    const verifyMismatch = password !== verifyPassword && verifyPassword !== "";

    return (
        <Popup app={props} closeOnComplete width={420} height={500} allowOverflow>
            {({ complete }) => {
                const handleCancel = () => complete(user);
                const handleComplete = () => {
                    if (verifyMismatch) return;
                    complete({
                        ...user,
                        username,
                        password,
                        icon,
                        permission,
                        autoLogin,
                        theme,
                    });
                };

                return (
                    <div className="flex flex-col border p-4 m-2 box-border divide-y divide-solid rounded-lg gap-2">
                        {/* Header */}
                        <div className="flex flex-row justify-between items-center">
                            <h3 className="font-semibold text-lg">
                                Modify User
                            </h3>
                            <select
                                value={permission}
                                onChange={(e) =>
                                    setPermission(Number(e.target.value))
                                }
                                className="border rounded p-1"
                            >
                                <option value={Permission.ELEVATED}>
                                    Administrator
                                </option>
                                <option value={Permission.USER}>Standard</option>
                                <option value={Permission.NONE}>None</option>
                            </select>
                        </div>

                        {/* Username */}
                        <div className="flex flex-row justify-between items-center gap-5">
                            <h3>Username</h3>
                            <Input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        {/* Password */}
                        <div className="flex flex-row justify-between items-center gap-5">
                            <h3>Password</h3>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    borderColor: verifyMismatch
                                        ? "red"
                                        : password && verifyPassword
                                        ? "green"
                                        : undefined,
                                }}
                            />
                        </div>

                        {/* Verify */}
                        <div className="flex flex-row justify-between items-center gap-6">
                            <h3>Verify</h3>
                            <Input
                                type="password"
                                value={verifyPassword}
                                onChange={(e) =>
                                    setVerifyPassword(e.target.value)
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

                        {/* Auto-login */}
                        <div className="flex flex-row justify-between items-center gap-5 pt-2">
                            <h3 className="align-center">Auto-Login</h3>
                            <input
                                type="checkbox"
                                checked={autoLogin}
                                onChange={(e) =>
                                    setAutoLogin(e.target.checked)
                                }
                            />
                        </div>

                        {/* Icon */}
                        <div className="flex flex-row justify-between items-center gap-5">
                            <h3>Icon</h3>
                            <Input
                                value={String(icon)}
                                onChange={(e) => setIcon(e.target.value)}
                            />
                        </div>

                        {/* Theme */}
                        <div className="flex flex-row justify-between items-center gap-5">
                            <h3>Theme</h3>
                            <Input
                                value={JSON.stringify(theme)}
                                onChange={(e) => {
                                    try {
                                        setTheme(JSON.parse(e.target.value));
                                    } catch {
                                        // leave invalid until corrected
                                    }
                                }}
                            />
                        </div>

                        {/* Footer */}
                        <div className="flex justify-between items-center px-2 pt-2">
                            <div className="flex flex-row gap-2 ml-auto">
                                <Button onClick={handleCancel}>Cancel</Button>
                                <Button onClick={handleComplete}>
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            }}
        </Popup>
    );
};

export default ModifyUserPropsPopup;
