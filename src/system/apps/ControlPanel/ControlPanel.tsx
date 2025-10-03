import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import manageIcon from "../../../assets/Icons/ControlPanel/manageScript.png";
import downloadIcon from "../../../assets/Icons/ControlPanel/down-sm.png";
import updatesIcon from "../../../assets/Icons/ControlPanel/updates.webp";
import infoIcon from "../../../assets/Icons/ControlPanel/info.png";
import configIcon from "../../../assets/Icons/Settings/configuration.ico";
import appsIcon from "../../../assets/Icons/Apps.webp";
import "./controlPanel.css";
import Layout from "./Layout";
import InstallScript from "./Pages/InstallScripts";
import ManageScripts from "./Pages/ManageScripts";

const ControlPanel = () => {
    const [menu, setMenu] = useState<number>(0);

    const back = () => setMenu(0);

    const getMenu = (): ReactNode => {
        switch (menu) {
            case 1: return <Layout name="Manage Scripts" back={back}><ManageScripts /></Layout>
            case 2: return <Layout name="Install Scripts" back={back}><InstallScript /></Layout>

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