import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import manageIcon from "../../../assets/Icons/ControlPanel/manageScript.png";
import downloadIcon from "../../../assets/Icons/ControlPanel/down-sm.png";
import updatesIcon from "../../../assets/Icons/ControlPanel/updates.webp";
import infoIcon from "../../../assets/Icons/ControlPanel/info.png";
// import configIcon from "../../../assets/Icons/Settings/configuration.ico";
import appsIcon from "../../../assets/Icons/Personalisation.webp";
import panicIcon from "../../../assets/Icons/security.png";
import "./controlPanel.css";
import Layout from "./Layout";
import InstallScript from "./Pages/InstallScripts";
import ManageScripts from "./Pages/ManageScripts";
import Commands from "./Pages/Commands";
import Cloaking from "../Cloaking/Cloaking";
//import ControlThemes from "./Pages/Themes";

const ControlPanel = () => {
    const [menu, setMenu] = useState<number>(0);
    const [overrideBack, setOverrideBack] = useState<(() => void) | undefined>(undefined);

    // Allow back button to be reused
    const back = () => setMenu(0);

    const MENUS: Record<number, { title: string; element: ReactNode }> = {
        1: { title: "Manage Scripts", element: <ManageScripts /> },
        2: { title: "Install Scripts", element: <InstallScript /> },
        3: { title: "Commands", element: <Commands setLayoutBack={setOverrideBack} /> },
        4: { title: "Cloaking", element: <Cloaking /> },
        5: { title: "Manage Themes", element: <>Still under construction...</> },
        6: { title: "About", element: <></> }
    };

    const getMenu = (): ReactNode => {
        const item = MENUS[menu];

        if (!item) {
            return (
                <div className="flex flex-col items-center justify-center w-full h-full">
                    <h3 className="font-bold text-2xl">Control Panel</h3>

                    <div className="control-panel-grid">
                        <div onClick={() => setMenu(1)}>Manage Scripts <img src={manageIcon} className="config-icon" /></div>
                        <div onClick={() => setMenu(2)}>Install Scripts <img src={downloadIcon} className="config-icon" /></div>
                        <div onClick={() => setMenu(3)}>Commands <img src={updatesIcon} className="config-icon" /></div>
                        <div onClick={() => setMenu(4)}>Cloaking <img src={panicIcon} className="config-icon" /></div>
                        <div onClick={() => setMenu(5)}>Manage Themes <img src={appsIcon} className="config-icon" /></div>
                        <div onClick={() => setMenu(6)}>About <img src={infoIcon} className="config-icon" /></div>
                    </div>
                </div>
            );
        }

        return (
            <Layout name={item.title} back={back} overrideBack={overrideBack}>
                {item.element}
            </Layout>
        );
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={menu}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.10, ease: "easeInOut" }}
                className="w-full h-full overflow-auto"
            >
                {getMenu()}
            </motion.div>
        </AnimatePresence>
    )
}
 
export default ControlPanel;