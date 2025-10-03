import { useEffect, useState } from "react";
import bgimage from "../../assets/background/image1.jpeg";
import { Theme as theme } from "../../utils/types";
import virtualFS from "../../utils/VirtualFS";
import { useUser } from "../../Providers/UserProvider";

interface ThemeProps {
    setActiveMenu: (menu: string | null) => void;
    setErrorText: (prev: string) => void;
}

const Theme: React.FC<ThemeProps> = ({ setActiveMenu, setErrorText }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [status, setStatus] = useState<string[]>(Array(2).fill('')); // 'success' or 'failure'
    const { currentUser, modifyUserProp } = useUser();

    interface Option {
        name: string;
        function: () => Promise<void> | void; // Can be async or sync
    }

    const options: Option[] = [
    {
        name: "Fix Theme",
        function: async () => {
            try {
                const theme: theme = {
                    primary: "#212529",
                    primaryLight: "#464f58",
                    secondary: "#343A40",
                    secondaryLight: "#737f8c",
                    textBase: "white",
                };
    
                await virtualFS.deleteFile("System/", "Theme");
                await virtualFS.writeFile("System/", "Theme", JSON.stringify(theme), "theme");

                if (!currentUser) return;
    
                modifyUserProp({ ...currentUser, theme: theme }, currentUser.username)
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
        }
    },
    {
        name: "Fix Background",
        function: () => {
            try {
                if (!currentUser) return;

                modifyUserProp({ ...currentUser, backgroundImage: bgimage }, currentUser.username);

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
        }
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
 
export default Theme;