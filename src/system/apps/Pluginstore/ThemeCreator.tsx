import { useState } from "react";
import { useUser } from "../../../Providers/UserProvider";
import Theme from "../../../utils/Theme";
import virtualFS from "../../../utils/VirtualFS";
import Input from "../../lib/Input";
import Button from "../../lib/Button";

const ThemeCreator = () => {
    const [input, setInput] = useState<string>("");
    const [customTheme, setCustomTheme] = useState({
      primary: '#ffffff',
      primaryLight: '#f0f0f0',
      secondary: '#000000',
      secondaryLight: '#333333',
      textBase: 'black', // Default text color
    });

    const { currentUser, modifyUserProp } = useUser();  

    const handleColorChange = (property: string, color: string) => {
        setCustomTheme({
          ...customTheme,
          [property]: color,
        });
    };
    
    const handleApplyTheme = async () => {
        await Theme.setTheme(customTheme, true, currentUser, modifyUserProp);
        await virtualFS.writeFile("System/Themes/", input, customTheme, "theme");
    }

    return ( 
    <div className="flex flex-col gap-2 items-center">
        <h3 className="font-semibold text-2xl">Create Theme</h3>
        <Input placeholder="Theme name..." onChange={(e) => setInput(e.target.value)} />
        <div className="grid grid-cols-2 gap-4 justify-start">
            <label className="inputLabel">
                Primary Color:
                <input
                type="color"
                value={customTheme.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="inputColor"
                />
            </label>
            <label className="inputLabel">
                Primary Light Color:
                <input
                type="color"
                value={customTheme.primaryLight}
                onChange={(e) => handleColorChange('primaryLight', e.target.value)}
                className="inputColor"
                />
            </label>
            <label className="inputLabel">
                Secondary Color:
                <input
                type="color"
                value={customTheme.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="inputColor"
                />
            </label>
            <label className="inputLabel">
                Textbase Color:
                <input
                type="color"
                value={customTheme.textBase}
                onChange={(e) => handleColorChange('textBase', e.target.value)}
                className="inputColor"
                />
            </label>
        </div>
        <Button onClick={handleApplyTheme}>Apply Theme</Button>
    </div>
    );
}
 
export default ThemeCreator;