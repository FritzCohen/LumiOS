import { ReactNode, useState } from "react";
import "./ControlPanel.css";
import Scripts from "./Scripts";
import InstallScript from "./InstallScript";
import manageIcon from "../../../assets/Icons/ControlPanel/manageScript.png";
import downloadIcon from "../../../assets/Icons/ControlPanel/down-sm.png";
import updatesIcon from "../../../assets/Icons/ControlPanel/updates.webp";
import infoIcon from "../../../assets/Icons/ControlPanel/info.png";
import configIcon from "../../../assets/Icons/Settings/configuration.ico";
import appsIcon from "../../../assets/Icons/Apps.webp";
import Updates from "./Updates";
import Configuration from "./Configuration";
import About from "./About";
import Apps from "./Apps";

const ControlPanel: React.FC<{ setShowBootScreen: (prev: boolean) => void }> = ({ setShowBootScreen }) => {
    const [menu, setMenu] = useState<number>(0);

    const getMenu = (): ReactNode => {
        switch (menu) {
            case 1: return <Scripts setMenu={setMenu} />
            case 2: return <InstallScript setMenu={setMenu} />
            case 3: return <Updates setMenu={setMenu} />
            case 4: return <Configuration setMenu={setMenu} />
            case 5: return <Apps setMenu={setMenu} />
            case 6: return <About setMenu={setMenu} setShowBootScreen={setShowBootScreen} />

            default: return (
                <div className="flex flex-col items-center justify-center w-full h-full">
                    <h3 className="font-bold text-2xl">Control Panel</h3>
                    <div className="control-panel-grid">
                        <div onClick={() => setMenu(1)}>Manage Scripts <img src={manageIcon} className="config-icon" alt="manage" /></div>
                        <div onClick={() => setMenu(2)}>Install Scripts <img src={downloadIcon} className="config-icon" alt="install" /></div>
                        <div onClick={() => setMenu(3)}>Updates <img src={updatesIcon} className="config-icon" alt="updates" /></div>
                        <div onClick={() => setMenu(4)}>Configuration <img src={configIcon} className="config-icon" alt="config" /></div>
                        <div onClick={() => setMenu(5)}>Install Apps <img src={appsIcon} className="config-icon" alt="config" /></div>
                        <div onClick={() => setMenu(6)}>About <img src={infoIcon} className="config-icon" alt="info? not really" /></div>
                    </div>
                </div>
            )
        }
    };

    return getMenu();
}
 
export default ControlPanel;