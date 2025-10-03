import { useEffect, useState } from "react";
import logo from "../../assets/Icons/themes.png";
import Button from "../../system/lib/Button";
import { Theme } from "../../utils/types";
import virtualFS from "../../utils/VirtualFS";
import applyTheme from "../../utils/Theme";

interface ThemeProps {
    setMenu: React.Dispatch<React.SetStateAction<number>>; // Supports both number and function
}

type ModifiedTheme = { name: string, value: Theme };

const Themes: React.FC<ThemeProps> = ({ setMenu }) => {
    const [themes, setThemes] = useState<ModifiedTheme[]>([]);
    const [activeTheme, setActiveTheme] = useState<string>("");

    useEffect(() => {
        const getThemes = async () => {
            const storedThemes = await virtualFS.readdir("System/Themes/");
                        
            const names = Object.keys(storedThemes);
            const values = Object.keys(storedThemes).map((value) => {
                const item = storedThemes[value];
                if (item.type === "directory") return;

                return item.content;
            });
            
            const combinedValues = names.map((value: string, index: number) => ({ name: value, value: values[index] }));
            console.log(combinedValues);
            
            setThemes(combinedValues);
        };

        getThemes();
    }, []);

    const handleThemeClick = async (theme: ModifiedTheme) => {
        setActiveTheme(theme.name);

        await applyTheme.setTheme(theme.value, true);
    };

    return ( 
        <div className="start-box glass flex flex-row gap-5 items-center justify-center h-full w-full p-4">
            <img src={logo} className="aspect-square h-24 mb-4" />
            <div className="flex flex-col w-full max-w-2xl h-full">
                <div className="flex flex-col flex-grow text-center justify-center">
                    <h1 className="text-2xl font-bold mb-4">Get started by choosing a theme.</h1>
                    <div className="flex flex-wrap gap-2 mb-5 whitespace-normal">
                        {themes.map((theme: ModifiedTheme, index) => (
                            <div
                                key={index}
                                onClick={() => handleThemeClick(theme)}
                                style={{
                                    backgroundColor: activeTheme === theme.name ? theme.value.primary : theme.value.secondary,
                                    transition: 'background-color 0.2s ease-in-out' // Add transition for smooth animation
                                }}
                                onMouseEnter={(e) => {
                                    if (activeTheme !== theme.name) {
                                        const target = e.currentTarget as HTMLDivElement;
                                        target.style.backgroundColor = theme.value.secondaryLight;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (activeTheme !== theme.name) {
                                        const target = e.currentTarget as HTMLDivElement;
                                        target.style.backgroundColor = theme.value.secondary;
                                    }
                                }}
                                className="rounded-full w-16 h-16 cursor-pointer shadow overflow-hidden flex items-center justify-center"
                            >
                                { theme.name }
                            </div>
                        ))}
                    </div>
                    <p className="text-gray-600">You'll be able to change these settings later.</p>
                </div>
                <div className="flex items-center justify-center gap-2 w-full mt-4">
                    <Button onClick={() => setMenu((prev) => prev - 1)}>Back</Button>
                    <Button onClick={() => setMenu((prev) => prev + 1)}>Next</Button>
                </div>
            </div>
        </div>
    );
}
 
export default Themes;