import { useEffect, useState } from "react";
import virtualFS from "../../utils/VirtualFS";
import { Permission, User as user } from "../../utils/types";
import image8 from "../../assets/background/image1.jpeg";;
import { Game } from '../../utils/types';
import defaultFS from "../../utils/defaultFS";
import userIcon from "../../assets/no-bg-logo.png";
import { useUser } from "../../Providers/UserProvider";

interface UserProps {
    setActiveMenu: (menu: string | null) => void;
    setErrorText: (prev: string) => void;
}

const User: React.FC<UserProps> = ({ setActiveMenu, setErrorText }) => {
    const [text, setText] = useState<string>("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [status, setStatus] = useState<string[]>(Array(2).fill('')); // 'success' or 'failure'
    const { createUser } = useUser();

    interface Option {
        name: string;
        function: () => Promise<void> | void; // Can be async or sync
    }

    const options: Option[] = [
        {
            name: "Enable Autologin",
            function: async () => {
                try {
                    await virtualFS.deleteFile("System/", "Autologin");
                    await virtualFS.writeFile("System/", "Autologin", JSON.stringify(true), "sys");

                    setStatus(prev => {
                        const newStatus = [...prev];
                        newStatus[0] = 'success';
                        return newStatus;
                    });
                } catch (error) {
                    setStatus(prev => {
                        const newStatus = [...prev];
                        newStatus[0] = 'failure';
                        return newStatus;
                    });

                    setErrorText(error instanceof Error ? error.message : String(error));
                }
            },
        },
        {
            name: "Reset Password",
            function: async () => {
                try {
                    setText("Password is 'User'.");
                    const defaultUser: user = {
                        username: "Default",
                        password: "User",
                        svg: userIcon,
                        permission: 2,
                        autoLogin: true,
                        theme: {
                            primary: "#212529",
                            primaryLight: "#464f58",
                            secondary: "#343A40",
                            secondaryLight: "#737f8c",
                            textBase: "white",
                        },
                        backgroundImage: image8,
                    };
        
                    const system = await virtualFS.readdir("System/");
                    if (
                        system == null ||
                        system == undefined ||
                        !Object.keys(system).includes("children") ||
                        !Object.keys(system.children).includes("Users")
                    ) {
                        await virtualFS.writeDirectory("System/", "Users", Permission.SYSTEM);
                    }
        
                    await createUser(defaultUser);

                    setStatus(prev => {
                        const newStatus = [...prev];
                        newStatus[1] = 'success';
                        return newStatus;
                    });
                } catch (error) {
                    setStatus(prev => {
                        const newStatus = [...prev];
                        newStatus[1] = 'failure';
                        return newStatus;
                    });

                    setErrorText(error instanceof Error ? error.message : String(error));
                }
            },
        },
        {
            name: "Reset all apps",
            function: async () => {
                try {
                    const apps = Object.keys(await virtualFS.readdir("Apps/"));
                    const defaultApps = Object.keys(defaultFS.root.children.Apps.type === "folder" && defaultFS.root.children.Apps.children);
                    const fetchedContent = await fetch("https://raw.githubusercontent.com/LuminesenceProject/LumiOS/main/Data.json");
                    const json: Game[] = await fetchedContent.json();

                    const newApps = apps.filter(app => !defaultApps.includes(app));

                    const handleAppUpdate = async (app: string) => {
                        await virtualFS.initialize();
                        await virtualFS.deleteFile("Apps/", app);
                        
                
                        const file = json.find(game => game.name === app);
                        const fileContent = await fetch(file?.path || "");
                        const text = await fileContent.text();
                
                        await virtualFS.writeFile("Apps/", app, JSON.stringify({
                            name: file?.name,
                            description: "blah blah blah",
                            userInstalled: true,
                            svg: file?.image,
                            fileContent: text,
                        }), "html");
                        await virtualFS.writeFile("System/Taskbar/", app, JSON.stringify({
                            name: file?.name,
                            svg: file?.image,
                        }), "pinn");
                    };

                    newApps.forEach((app: string) => {
                        handleAppUpdate(app);
                    });

                    setStatus(prev => {
                        const newStatus = [...prev];
                        newStatus[2] = 'success';
                        return newStatus;
                    });
                } catch (error) {
                    setStatus(prev => {
                        const newStatus = [...prev];
                        newStatus[2] = 'failure';
                        return newStatus;
                    });

                    setErrorText(error instanceof Error ? error.message : String(error));
                }
            },
        },
    ]; // Example options

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowUp') {
                setSelectedIndex((prev) => (prev - 1 + options.length + 1) % (options.length + 1));
            } else if (event.key === 'ArrowDown') {
                setSelectedIndex((prev) => (prev + 1) % (options.length + 1));
            } else if (event.key === 'Enter') {
                if (selectedIndex === options.length) {
                    setActiveMenu(null); // Go back to main menu
                } else {
                    // Handle other options
                    setText("");
                    options[selectedIndex].function();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedIndex, options.length, setActiveMenu]);

    return (
        <div
            className="fixed inset-0 flex items-center justify-center"
            style={{ backgroundColor: 'black', color: 'green', outline: 'none' }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                }}
                tabIndex={-1}
            >
                {text && <div
                    tabIndex={0} // Make div focusable
                    style={{
                        padding: '10px',
                        color: 'green',
                        cursor: 'default',
                        display: 'inline-block',
                        outline: 'none',
                    }}
                >
                    { text }
                </div>}
                {options.map((option, index) => (
                    <div
                        key={index}
                        tabIndex={0} // Make div focusable
                        style={{
                            padding: '10px',
                            cursor: 'default',
                            fontWeight: selectedIndex === index ? 'bold' : 'normal',
                            border: selectedIndex === index ? status[index] === 'success' ? '1px solid blue' : status[index] === 'failure' ? "1px solid red"  : '1px solid green' : 'none',
                            outline: 'none',
                            color: selectedIndex === index
                            ? status[index] === 'success'
                                ? 'blue'
                                : status[index] === 'failure'
                                    ? 'red'
                                    : 'green'
                            : status[index] === 'success'
                            ? 'blue'
                            : status[index] === 'failure'
                                ? 'red'
                                : 'inherit', // Highlight color
                        }}
                        onMouseDown={(event) => event.preventDefault()} // Prevent default mouse interactions
                    >
                        {index === selectedIndex ? `[${option.name}]` : option.name}
                    </div>
                ))}
                <div
                    tabIndex={0} // Make div focusable
                    style={{
                        padding: '10px',
                        color: 'green',
                        border: selectedIndex === options.length ? '1px solid green' : "none",
                        cursor: 'default',
                        display: 'inline-block',
                        fontWeight: selectedIndex === options.length ? 'bold' : 'normal',
                        outline: 'none',
                    }}
                >
                    {selectedIndex === options.length ? `[Back]` : 'Back'}
                </div>
            </div>
        </div>
    );
}
 
export default User;