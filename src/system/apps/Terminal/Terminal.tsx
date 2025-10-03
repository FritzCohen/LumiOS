import { useState } from "react";
import Console from "./Console";
import JavascriptConsole from "./JavascriptConsole";


interface TerminalProps {

}

const Terminal: React.FC<TerminalProps> = () => {
    const [currentMenu, setCurrentMenu] = useState<number>(0);
    const [updatedMenuPosition, setUpdatedMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

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

    const terminalContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
    
        // Get the position relative to the window
        const x = event.clientX;
        const y = event.clientY;
    
        // Get the bounding client rect of the parent component
        const rect = document.getElementById("terminal");
        const bounds = rect?.getBoundingClientRect();
    
        if (bounds) {
            // Calculate the relative position within the bounding rectangle
            const relativeX = x - bounds.left;
            const relativeY = y - bounds.top;
    
            // Update the state variable with the adjusted menu position
            setUpdatedMenuPosition({ x: relativeX, y: relativeY });
        }



        event.stopPropagation();
    }

    return ( 
        <div className="w-full h-full" id="terminal" onContextMenu={(e) => terminalContextMenu(e)}>
            {getCurrentMenu()}
        </div>
    );
}
 
export default Terminal;