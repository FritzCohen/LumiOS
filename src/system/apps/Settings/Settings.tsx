import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import System from "./System";
import Themes from "./Themes";
import Apps from "./Apps";
import Accounts from "./Accounts";
import Security from "./Security";
import { OpenedApp } from "../../../context/kernal/kernal";
import "./Settings.css";

interface SettingsProps {
    props: OpenedApp;
}

const Settings: React.FC<SettingsProps> = ({ props }) => {
    const [menu, setMenu] = useState<number>(props.executable?.config?.defaultPath || 0);

    const getMenu = (): ReactNode => {
        switch (menu) {
            case 0:
                return <System />;
            case 1:
                return <Themes />;
            case 2:
                return <Apps />;
            case 3:
                return <Accounts />;
            case 4:
                return <Security />;
            default:
                return <div />;
        }
    };

    return (
        <div className="flex flex-row h-full w-full overflow-hidden">
            <Sidebar menu={menu} setMenu={setMenu} />
            <div className="flex-1 w-full flex-grow rounded-b-md overflow-auto">{getMenu()}</div>
        </div>
    );
};

export default Settings;