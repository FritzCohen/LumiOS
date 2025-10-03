import { useTopbarContext } from "../../Providers/TopbarProvider";
import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight, faEye, faEyeSlash, faFileCirclePlus, faFolderPlus, faInfoCircle, faPowerOff, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import logo from "../../assets/no-bg-logo.png";
import "./Topbar.css";
import useContextMenu from "../ContextMenu/useContextMenu";
import ContextMenu from "../ContextMenu/ContextMenu";
import { useKernal } from "../../Providers/KernalProvider";
import appstoreIcon from "../../assets/Icons/app-store.png";
import settingsIcon from "../../assets/Icons/settings.png";
import toolsIcon from "../../assets/Icons/web-tools.png";
import FileInput from "../../system/lib/FileInput";
import { useUser } from "../../Providers/UserProvider";
//import virtualFS from "../../utils/VirtualFS";

// Define the TopbarItem interface
interface TopbarItem {
    name: string;
    icon?: IconDefinition;
    gap?: boolean;
    action?: (() => Promise<void>) | (() => void);
    dropdownItems?: Omit<TopbarItem[], 'id'>;
}

const Topbar = () => {
    const [items, setItems] = useState<TopbarItem[]>([]);
    const [selectedMenu, setSelectedMenu] = useState<number | null>(null);
    //const [topbarStyle, setTopbarStyle] = useState<object>({}); 
    const { array } = useTopbarContext();
    const { contextMenuPosition, contextMenuVisible, showContextMenu, hideContextMenu, contextMenuItems } = useContextMenu();
    const { systemProps, updateSystemProp, setOptionProperties, addOpenedApp, removeOpenedApp, openedApps, addPopup, removePopup } = useKernal();
    const { currentUser, setLoggedIn } = useUser();
    const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [fullscreened, setFullscreened] = useState<boolean>(false);
    const [seen, setSeen] = useState<boolean>(false);

    useEffect(() => {
        setItems(array);
    }, [array]);

    useEffect(() => {
        setSeen(systemProps.onHoverTopbar);
    }, [systemProps.onHoverTopbar]);

    const handleClickOutside = (event: MouseEvent) => {
        if (!dropdownRefs.current.some(ref => ref?.contains(event.target as Node))) {
            setSelectedMenu(null);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    /*
    useEffect(() => {
        getStyles();
    }, []);
    
    const getStyles = async () => {
        const windowStyle = await virtualFS.readfile("/System/Plugins/", "Topbar");
        const content = await windowStyle.content;
        setTopbarStyle(JSON.parse(await content));
    };
    */
    const getTime = () => {
        const use24hrs = false;
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: !use24hrs,
        };

        return now.toLocaleString("en-US", options);
    };

    const handleMenuToggle = (index: number) => {
        setSelectedMenu(selectedMenu === index ? null : index); // Toggle dropdown on click
    };

    const renderDropdownItems = (dropdownItems: Omit<TopbarItem[], 'id'>) => {
        const handleItemClick = (item: TopbarItem) => {
            if (item.action) {
                item.action();
            }
        };

        return dropdownItems.map((dropdownItem, dropdownIndex) => (
            <React.Fragment key={dropdownIndex}>
                <div
                    onClick={() => handleItemClick(dropdownItem)}
                    className="topbar-dropdown-item"
                >
                    {dropdownItem.icon && (
                        <FontAwesomeIcon icon={dropdownItem.icon} className="pr-2" />
                    )}
                    <span>{ dropdownItem.name }</span>
                    {dropdownItem.dropdownItems && (
                        <FontAwesomeIcon icon={faCaretRight} className="submenu-arrow" />
                    )}
                </div>
                {dropdownItem.gap && (
                    <hr className="my-1 mx-auto bg-primary w-11/12 self-center snap-center" style={{ color: "grey" }} />
                )}
            </React.Fragment>
        ));
    };

    const renderTopbarItems = (item: TopbarItem, index: number) => {
        return (
            <div key={index} className="topbar-section">
                <div
                    onClick={() => handleMenuToggle(index)}
                    className="topbar-title w-full"
                >
                    {item.icon && <FontAwesomeIcon icon={item.icon} />}
                    { item.name }
                </div>
                {/* Only display dropdown items when this menu is selected */}
                {item.dropdownItems && selectedMenu === index && (
                    <div className="topbar-dropdown absolute" ref={el => dropdownRefs.current[index] = el}>
                        {renderDropdownItems(item.dropdownItems)}
                    </div>
                )}
            </div>
        );
    };

    const handleTopbarToggle = () => {
        updateSystemProp({
            ...systemProps,
            showTopbar: !systemProps.showTopbar,
        });
    };

    const handleTopbarHoverToggle = () => {
        updateSystemProp({
            ...systemProps,
            onHoverTopbar: !systemProps.onHoverTopbar,
        });
    };

    // Optional props etc for settings and appstore
    const handleOpenSettings = () => {
        setOptionProperties((prev) => {
            return {
                ...prev,
                path: "System",
            }
        });

        addOpenedApp({
            name: "Settings",
            minimized: false,
            maximized: false,
            type: "exe",
            path: `/Users/${currentUser?.username}/Apps/`,
            svg: settingsIcon,
        });
    };

    const handleOpenAppstore = () => {
        setOptionProperties((prev) => {
            return {
                ...prev,
                path: "System",
            }
        });

        addOpenedApp({
            name: "AppStore",
            minimized: false,
            maximized: false,
            type: "exe",
            path: `/Users/${currentUser?.username}/Apps/`,
            svg: appstoreIcon,
        });
    };

    const handleOpenTools = () => {
        addOpenedApp({
            name: "Webtools",
            minimized: false,
            maximized: false,
            type: "exe",
            path: `/Users/${currentUser?.username}/Apps/`,
            svg: toolsIcon,
        });
    };

    const handleFullscreen = () => {
        if (!fullscreened) {
          document.body.requestFullscreen()
        } else {
          document
          .exitFullscreen()
          .then(() => {})
          .catch((err) => console.error(err));
        }
  
        setFullscreened(!fullscreened);      
    };

    const handleClose = () => {
        openedApps.forEach((app) => {
            removeOpenedApp(app.id);
        });
    };

    const handleAddFolder = async () => {
        const newFolderName = "Folder Name";

        addPopup({
            name: newFolderName,
            description: "Create a new folder.",
            minimized: false,
            onAccept: async () => {},
            children: <FileInput type='directory' name={newFolderName} closePopup={() => removePopup(newFolderName)} />
        });        
    };

    const handleAddFile = async () => {
        const newFileName = "File Name";

        addPopup({
            name: newFileName,
            description: "Create a new file.",
            minimized: false,
            onAccept: async () => {},
            children: <FileInput type='file' name={newFileName} closePopup={() => removePopup(newFileName)} />
        });        
    };

    return (
        <div id="topbar" className={`${seen ? `opacity-0 hover:opacity-100 transition-opacity duration-100` : ""}`} style={{
            display:  systemProps.showTopbar ? "" : "none",
        }} onContextMenu={(e) => showContextMenu(e, [
            { name: `${systemProps.showTopbar ? "Hide" : "Show"}`, icon: systemProps.showTopbar ? faEyeSlash : faEye, action: handleTopbarToggle },
            { name: `${!systemProps.onHoverTopbar ? "Require hover" : "Always shown"}`, icon: !systemProps.onHoverTopbar ? faEyeSlash : faEye, action: handleTopbarHoverToggle },
        ], "#topbar")}>
            <div
                onClick={() => setSelectedMenu(0)} // Handle "test" dropdown menu
                className="topbar-section cursor-pointer"
            >
                <div
                    className="topbar-title"
                >
                    <img alt="logo" src={logo} className="aspect-square w-6" />
                </div>
                {selectedMenu == 0 && (
                    <div className="topbar-dropdown absolute" ref={el => dropdownRefs.current[0] = el}>
                        {renderDropdownItems([
                            { name: "About This System", icon: faInfoCircle, gap: true, action: () => window.document.location = "https://github.com/LuminesenceProject/LumiOS" },
                            { name: "System Settings", action: handleOpenSettings },
                            { name: "App Store", gap: true, action: handleOpenAppstore },
                            { name: "Logout", icon: faPowerOff, action: () => setLoggedIn(false) }
                        ])}
                    </div>
                )}
            </div>
            <div
                onClick={() => setSelectedMenu(1)} // Handle "test" dropdown menu
                className="topbar-section cursor-pointer"
            >
                <div
                    className="topbar-title"
                >
                    File
                </div>
                {selectedMenu == 1 && (
                    <div className="topbar-dropdown absolute" ref={el => dropdownRefs.current[1] = el}>
                        {renderDropdownItems([
                            { name: "New Folder", icon: faFolderPlus, action: handleAddFolder },
                            { name: "New File", icon: faFileCirclePlus, action: handleAddFile },
                        ])}
                    </div>
                )}
            </div>
            <div
                onClick={() => setSelectedMenu(2)} // Handle "test" dropdown menu
                className="topbar-section cursor-pointer"
            >
                <div
                    className="topbar-title"
                >
                    Window
                </div>
                {selectedMenu == 2 && (
                    <div className="topbar-dropdown absolute" ref={el => dropdownRefs.current[2] = el}>
                        {renderDropdownItems([
                            { name: `${fullscreened ? "Exit Fullscreen" : "Fullscreen"}`, action: handleFullscreen },
                            { name: "Close All", action: handleClose, gap: true },
                            { name: "Developer Tools", action: handleOpenTools }
                        ])}
                    </div>
                )}
                
            </div>
            {items.map((item, index) => renderTopbarItems(item, index + 3))}
            <div className="w-full rounded flex-grow text-right font-bold">
                {getTime().replace(",", "")}
            </div>
            {contextMenuVisible && <ContextMenu menuItems={contextMenuItems} menuPosition={contextMenuPosition} hideMenu={hideContextMenu} />}
        </div>
    );
};

export default Topbar;