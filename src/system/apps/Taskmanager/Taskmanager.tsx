import { faClose } from "@fortawesome/free-solid-svg-icons";
import ContextMenu from "../../../components/ContextMenu/ContextMenu";
import useContextMenu from "../../../components/ContextMenu/useContextMenu";
import { useKernal } from "../../../Providers/KernalProvider";
import "./Taskmanager.css";
import Button from "../../lib/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Taskmanager = () => {
    const { openedApps, removeOpenedApp } = useKernal();
    const { contextMenuPosition, contextMenuVisible, showContextMenu, hideContextMenu, contextMenuItems } = useContextMenu();

    const handleClose = (id: string) => {
        removeOpenedApp(id);
    };

    return ( 
        <div className="taskmanager" id="taskmanager">
            <div className="grid grid-cols-3 grid-rows-1 text-xl font-bold w-full">
                <span>pName</span>
                <span className="grow">pID</span>
                <span>pAction</span>
            </div>
            {openedApps.map((app, index) => (
                <div key={index} className="task-item" onContextMenu={(e) => showContextMenu(e, [
                    { name: "Close", icon: faClose, action: () => handleClose(app.name) }
                ], "#taskmanager")}>
                    <span>{ app.name }</span>
                    <Button onClick={() => handleClose(app.name)}>
                        <FontAwesomeIcon icon={faClose} />
                    </Button>
                </div>
            ))}
            {contextMenuVisible && <ContextMenu menuPosition={contextMenuPosition} menuItems={contextMenuItems} hideMenu={hideContextMenu} />}
        </div>
    );
}
 
export default Taskmanager;