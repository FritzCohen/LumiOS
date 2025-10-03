import { ReactNode, useEffect, useState } from "react";
import desktopImg from "../../../assets/Icons/thispc.png";
import people from "../../../assets/Icons/people.png";
import security from "../../../assets/Icons/security.png";
import pen from "../../../assets/Icons/Personalisation.webp";
import appIcon from "../../../assets/Icons/Apps.webp";
import "./Settings.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import System from "./System";
import Themes from "./Themes";
import Apps from "./Apps";
import Accounts from "./Accounts";
import { useUser } from "../../../Providers/UserProvider";
import Security from "./Security";
import { useKernal } from "../../../Providers/KernalProvider";
import Input from "../../lib/Input";

const Settings = () => {
    const { optionalProperties, resetOptionalProperties } = useKernal();
    const [input, setInput] = useState("");
    const [menu, setMenu] = useState<number>(optionalProperties.menu); // Tracks the active menu
    const { currentUser } = useUser();

    useEffect(() => {
        resetOptionalProperties();
    }, []);

    const getMenu = (): ReactNode => {
        switch (menu) {
            case 0: return <System />;
            case 1: return <Themes />;
            case 2: return <Apps />;
            case 3: return <Accounts />;
            case 4: return <Security />;
            default: return <div />;
        }
    };

    const menuItems: { id: number, label: string, icon: IconDefinition | string }[] = [
        { id: 0, label: "System", icon: desktopImg },
        { id: 1, label: "Personalization", icon: pen },
        { id: 2, label: "Apps", icon: appIcon },
        { id: 3, label: "Accounts", icon: people },
        { id: 4, label: "Privacy & Security", icon: security },

    ];

    return ( 
        <div className="flex flex-row h-full w-full overflow-hidden text-text-base">
            {/* Sidebar */}
            <div className="sidebar">
                {currentUser && <div className="flex justify-between items-center h-fit max-h-16 m-1 rounded hover:bg-primary-light hover:shadow transition-colors duration-200 px-2 p-1">
                    <img alt="UserProfile" src={typeof currentUser?.svg === "string" ? currentUser.svg : ""} className="w-12 h-12" />
                    <div className="flex flex-col">
                        <h3 className="font-semibold text-lg">{ currentUser?.username }</h3>
                        <p className="text-sm font-light">Local Account</p>
                    </div>
                </div>}
                    <Input
                        type="text"
                        onChange={(e) => setInput(e.target.value)}
                        className="input-main transition-all duration-300 ease-in-out focus:outline-none focus:border-accent"
                        placeholder="Search Settings..."
                    />
                {menuItems.filter(item => item.label.toLowerCase().includes(input.toLowerCase()) || input === "").map((item) => (
                    <div
                        key={item.id}
                        className={`sidebar-item relative cursor-pointer ${
                            menu === item.id ? "active" : ""
                        }`}
                        onClick={() => setMenu(item.id)}
                    >
                        {item.icon &&
                            typeof item.icon === "string" ? (
                                // Check if the string starts with "<svg" or "<img"
                                item.icon.trim().startsWith("<svg") || item.icon.trim().startsWith("<img") ? (
                                <div
                                    className="w-full h-full p-2 invert"
                                    dangerouslySetInnerHTML={{ __html: item.icon }}
                                />
                                ) : (
                                // Otherwise, treat it as a regular image URL
                                <img src={item.icon} alt={item.label} className="w-8 h-8 p-1" />
                                )
                            ) : (
                                // If it's not a string, assume it's a FontAwesome icon object
                                <FontAwesomeIcon icon={item.icon} />
                            )
                        }
                        {item.label}

                        {/* Blue line when the item is active */}
                        {menu === item.id && (
                            <div className="absolute left-0 h-full w-1 bg-blue-500 rounded"></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Main content area with scroll */}
            <div className="flex-1 w-full flex-grow bg-white rounded-b-md overflow-auto">
                {getMenu()}
            </div>
        </div>
    );
};

export default Settings;