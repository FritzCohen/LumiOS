import { useState } from "react";
import Console from "./Console";
import JavascriptConsole from "./JavascriptConsole";

const Terminal = () => {
    const [currentMenu, setCurrentMenu] = useState<number>(0);

    const getCurrentMenu = () => {
        switch (currentMenu) {
            case 0: {
                return <Console setCurrentMenu={setCurrentMenu} />;
            }
            case 1: {
                return <JavascriptConsole setCurrentMenu={setCurrentMenu} />;
            }
        };
    }

    return getCurrentMenu();
}
 
export default Terminal;