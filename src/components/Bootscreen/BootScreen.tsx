import React, { useState, useEffect, useMemo } from 'react';
import Troubleshoot from './Troubleshoot'; // Import your components
import User from './User';
import Theme from './Theme';
import Button from '../../system/lib/Button';

interface BootScreenProps {
    setShowBootScreen: (prev: boolean) => void;
}

const BootScreen: React.FC<BootScreenProps> = ({ setShowBootScreen }) => {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [errorText, setErrorText] = useState<string>("");
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const options = useMemo(() => ['Troubleshooting', 'User', 'Theme', 'Exit'], []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (activeMenu === null) {
                // Handle main menu navigation
                if (event.key === 'ArrowUp') {
                    setSelectedIndex((prev) => (prev - 1 + options.length) % options.length);
                } else if (event.key === 'ArrowDown') {
                    setSelectedIndex((prev) => (prev + 1) % options.length);
                } else if (event.key === 'Enter') {
                    setActiveMenu(options[selectedIndex]);
                }
            } else {
                // Handle submenu navigation
                if (event.key === 'ArrowUp') {
                    setSelectedIndex((prev) => (prev - 1 + options.length + 1) % (options.length + 1));
                } else if (event.key === 'ArrowDown') {
                    setSelectedIndex((prev) => (prev + 1) % (options.length + 1));
                } else if (event.key === 'Enter') {
                    if (selectedIndex === options.length) {
                        setActiveMenu(null); // Go back to main menu
                        setSelectedIndex(0); // Reset selection                        
                    }
                } else if (event.key === 'Escape') {
                    setActiveMenu(null); // Go back to main menu
                    setSelectedIndex(0); // Reset selection
                }
            }
        };

        setErrorText("");

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedIndex, options, activeMenu]);

    const renderMenu = () => {
        switch (activeMenu) {
            case 'Troubleshooting':
                return <Troubleshoot setActiveMenu={setActiveMenu} setErrorText={setErrorText} />;
            case 'User':
                return <User setActiveMenu={setActiveMenu} setErrorText={setErrorText} />;
            case 'Theme':
                return <Theme setActiveMenu={setActiveMenu} setErrorText={setErrorText} />;
            case 'Exit': {
                setShowBootScreen(false);
                break;
            }
            default:
                return null;
        }
    };

    const copyError = async () => {
        await navigator.clipboard.writeText(errorText);
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50"
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
                tabIndex={-1} // Ensure that this div itself is not focusable
            >
                <h3 style={{ color: "green" }} className='text-2xl my-4 font-bold'>BIOS</h3>
                {activeMenu === null ? (
                    options.map((option, index) => (
                        <div
                            key={option}
                            tabIndex={0} // Make div focusable
                            style={{
                                padding: '10px',
                                cursor: 'default',
                                fontWeight: selectedIndex === index ? 'bold' : 'normal',
                                border: selectedIndex === index ? '1px solid green' : 'none',
                                outline: 'none',
                                color: selectedIndex === index ? 'green' : 'inherit', // Highlight color
                            }}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    setActiveMenu(option);
                                }
                            }}
                            onMouseDown={(event) => event.preventDefault()} // Prevent default mouse interactions
                        >
                            {index === selectedIndex ? `[${option}]` : option}
                        </div>
                    ))
                ) : (
                    <div>
                        {renderMenu()}
                        {errorText && 
                            <div className="flex flex-col gap-2 translate-y-32">
                                <h3 style={{ color: "red" }}>ERROR TEXT: </h3>
                                <input 
                                    value={errorText} 
                                    readOnly // Use `readOnly` for non-editable input instead of `contentEditable={false}`
                                    className="border border-gray-300 rounded px-2 py-1"
                                    style={{ color: "black" }}
                                />
                                <div>
                                    <Button onClick={copyError}>Copy</Button>
                                </div>
                            </div>
                        }
                    </div>
                )}
            </div>
        </div>
    );
};

export default BootScreen;