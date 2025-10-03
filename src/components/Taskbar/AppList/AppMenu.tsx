import { memo, ReactNode, useEffect, useRef, useState } from "react";
import AppList from "./AppList";
import AllApps from "./AllApps";
import { useKernal } from "../../../Providers/KernalProvider";

interface AppMenuProps {
    onItemClick: (item: string | null) => void;
    visible: boolean; // Prop to control visibility
}

const AppMenu: React.FC<AppMenuProps> = ({ onItemClick, visible }) => {
    const [menu, setMenu] = useState<number>(0);
    const { systemProps } = useKernal();
    const trayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleClickOutside = (event: MouseEvent) => {
        const elementToIgnore = document.querySelector('.app-list-container');
        if (trayRef.current && !trayRef.current.contains(event.target as Node) && !elementToIgnore?.contains(event.target as Node)) {
            onItemClick(null); // Hide AppList
        }
    };

    const getMenu = (): ReactNode => {
        switch (menu) {
            case 0: return <AppList onItemClick={onItemClick} setCurrentMenu={setMenu} />
            case 1: return <AllApps setMenu={setMenu} />
        }
    };

    const getBottom = (): number => {
        const container = document.querySelector('.app-list-container');
        const bottom = container!.getBoundingClientRect();
        return bottom?.bottom - bottom.top + bottom?.height || 0;
    };

    if (!visible) return null;

    const bottom = getBottom();    

    return ( 
        <div className={`app-list glass w-full h-full ${systemProps.taskbar === 'floating' ? 'self-center' : ''} ${systemProps.taskbarAlign === "start" ? "left-0" : systemProps.taskbarAlign === "end" ? "right-0" : ""}`} ref={trayRef}
        style={{ bottom: `${bottom}px`, height: window.innerHeight/2 }}
        >
            {getMenu()}
        </div>
    );
}
 
export default memo(AppMenu);