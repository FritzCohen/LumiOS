import React, { useEffect, useState } from 'react';
import virtualFS from '../../utils/VirtualFS';
import defaultFS from '../../utils/defaultFS';
import logo from "../../assets/no-bg-logo.png";

interface TroubleshootProps {
    setActiveMenu: (menu: string | null) => void;
    setErrorText: (prev: string) => void;
};

interface versionInterface {
    name: string;
    image: string;
    version: string;
    secure: boolean;
}

const Troubleshoot: React.FC<TroubleshootProps> = ({ setActiveMenu, setErrorText }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [status, setStatus] = useState<string[]>(Array(2).fill('')); // 'success' or 'failure'
    const [version, setVersion] = useState<versionInterface>({
        name: "Lumi OS",
        image: logo || "https://avatars.githubusercontent.com/u/101959214?v=4",
        version: "7",
        secure: true,
    });

    interface Option {
        name: string;
        function: () => Promise<void> | void; // Can be async or sync
    }


    useEffect(() => {        
        const fetchLink = async () => {
            try {
                const response = await fetch("https://raw.githubusercontent.com/LuminesenceProject/LumiOS/main/Info.json");

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();

                // Assuming data[0] contains the relevant version information
                const fetchedVersion: versionInterface = {
                    name: "Lumi OS",
                    image: logo || "https://avatars.githubusercontent.com/u/101959214?v=4",
                    version: data[0].version,
                    secure: data[0].version === version.version,
                };                

                setVersion(fetchedVersion);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchLink();
    }, [version.version]);

    const options: Option[] = [
        {
            name: "Reset OS",
            function: async () => {
                try {
                    await virtualFS.deleteFileSystem();

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
            name: "Reset Virtual FS",
            function: async () => {
                try {
                    await virtualFS.initialize();
                    // @ts-expect-error Since virtualFS is private my g
                    virtualFS.root = defaultFS.root;
                    await virtualFS.updateFile("", "", "", ""); // Force it to save i guess

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
            name: "Reset System Files",
            function: async () => {
                try {
                    // @ts-expect-error This is fucking stupid
                    virtualFS.root.children.System.children = defaultFS.root.children.System.children;
                    await virtualFS.updateFile("", "", "", "");
                    await virtualFS.updateFile("", "", "", ""); // Force it to save i guess

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
        {
            name: "Allow View System Files",
            function: async () => {
                try {
                    await virtualFS.deleteFile("System/", "ViewSystemFiles");
                    await virtualFS.writeFile("System/", "ViewSystemFiles", "true", "sys");

                    setStatus(prev => {
                        const newStatus = [...prev];
                        newStatus[3] = 'success';
                        return newStatus;
                    });
                } catch (error) {
                    setStatus(prev => {
                        const newStatus = [...prev];
                        newStatus[3] = 'failure';
                        return newStatus;
                    });

                    setErrorText(error instanceof Error ? error.message : String(error));
                }
            },
        },
        {
            name: "Update OS",
            function: async () => {
                try {
                    // Request file access (assuming user has selected the file previously)
                    // You should get the file handle from a file picker or a file input in a real-world application.
                    const [fileHandle] = await (window as any).showOpenFilePicker({
                        types: [{
                            description: 'HTML files',
                            accept: { 'text/html': ['.html'] }
                        }]
                    });
            
                    // Fetch the new content from the server
                    const response = await fetch(`https://raw.githubusercontent.com/LuminesenceProject/LumiOS/main/LumiOS.v${version.version}.html`);
                    if (!response.ok) throw new Error('Network response was not ok');
                    const newContent = await response.text();
            
                    // Create a writable stream to the file
                    const writable = await fileHandle.createWritable();
            
                    // Write the new content to the file
                    await writable.write(newContent);
            
                    // Close the file and save changes
                    await writable.close();
            
                    console.log('File updated successfully!');
                    setStatus(prev => {
                        const newStatus = [...prev];
                        newStatus[4] = 'success';
                        return newStatus;
                    });
                } catch (error) {
                    setStatus(prev => {
                        const newStatus = [...prev];
                        newStatus[4] = 'failure';
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
};

export default Troubleshoot;