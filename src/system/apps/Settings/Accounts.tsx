import { useState } from "react";
import { useUser } from "../../../Providers/UserProvider";
import { useKernal } from "../../../Providers/KernalProvider";
import Button from "../../lib/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import Theme from "../../../utils/Theme";

const Accounts = () => {
    const { addPopup } = useKernal();
    const { currentUser, modifyUserProp } = useUser();

    const [isOpen, setIsOpen] = useState(false);
    const [website, setWebsite] = useState(currentUser?.panic?.website ?? "https://google.com");
    const [key, setPanic] = useState(currentUser?.panic?.key ?? "\\");
    const [title, setTitle] = useState(currentUser?.panic?.title ?? "Lumi OS");
    const [favicon, setFavicon] = useState(currentUser?.panic?.favicon ?? "https://avatars.githubusercontent.com/u/101959214?v=4");
    const [autologin, setAutologin] = useState(currentUser?.autoLogin || false);

    const handleAutologin = async () => {
        if (!currentUser) return;
        const newAutologinState = !autologin;
        setAutologin(newAutologinState);

        modifyUserProp({
            ...currentUser,
            autoLogin: newAutologinState,
        }, currentUser.username);

        addPopup({
            name: `${newAutologinState ? "Enable" : "Disable"} autologin`,
            appName: "Settings",
            description: `${newAutologinState ? "Enable" : "Disable"} autologin.`,
            onAccept: async () => {},
            minimized: false,
        });
    };

    const handlePanicConfirm = async () => {
        if (!currentUser) return;
        await modifyUserProp({
            ...currentUser,
            panic: { key, website, title, favicon },
        }, currentUser.username);

        await Theme.setPanic({ key, website, title, favicon })
    };

    return (
        <div className="flex flex-col px-4 w-full h-full overflow-auto">
            {currentUser && (
                <div className="flex items-center h-fit max-h-16 my-3 rounded px-2 p-1">
                    <img
                        alt="UserProfile"
                        src={typeof currentUser?.svg === "string" ? currentUser.svg : ""}
                        className="w-12 h-12 rounded-full bg-primary mr-2"
                    />
                    <h3 className="font-semibold text-xl">{currentUser?.username}</h3>
                </div>
            )}
            <div className="border rounded shadow">
                <button
                    className="w-full flex items-center justify-between p-3 transition-all"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="text-lg font-semibold">Panic Settings</span>
                    {isOpen ? <FontAwesomeIcon icon={faChevronUp} /> : <FontAwesomeIcon icon={faChevronDown} />}
                </button>
                <div className={`flex flex-col gap-4 transition-max-height ${isOpen ? "open p-4" : ""}`}>
                    {isOpen && (
                        <>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Panic Site:</label>
                                <input
                                    type="text"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    className="input-main"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Panic Key:</label>
                                <input
                                    type="text"
                                    value={key}
                                    onChange={(e) => setPanic(e.target.value)}
                                    className="input-main"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Title:</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="input-main"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Favicon:</label>
                                <input
                                    type="text"
                                    value={favicon}
                                    onChange={(e) => setFavicon(e.target.value)}
                                    className="input-main"
                                />
                            </div>
                            <Button onClick={handlePanicConfirm}>Confirm Changes</Button>
                        </>
                    )}
                </div>
            </div>
            <div className="mt-4">
                <Button onClick={handleAutologin}>{autologin ? "Disable" : "Enable"} autologin</Button>
            </div>
        </div>
    );
};

export default Accounts;