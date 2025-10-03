import { useCallback, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpFromBracket, faArrowUpRightFromSquare, faChevronLeft, faChevronRight, faThumbTack, faTrash } from "@fortawesome/free-solid-svg-icons";
import Button from "../../lib/Button";
import { Executable } from "../../../types/globals";
import useGetApps from "../../../hooks/useGetApps";
import { Directory, File } from "../../api/types";
import { useFolderWatcher } from "../../api/useFolderWatcher";
import { useUser } from "../../../context/user/user";
import { useKernel } from "../../../hooks/useKernal";
import virtualFS from "../../api/virtualFS";

const Apps = () => {
    const [selectedApp, setSelectedApp] = useState<Executable | null>(null);
    const [taskbarItems, setTaskbarItems] = useState<
        Record<string, File | Directory>
    >({});
    const [desktopItems, setDesktopItems] = useState<
        Record<string, File | Directory>
    >({});
    const previousTaskbarItemsRef = useRef<Record<string, File | Directory>>({});
    const previousDesktopItemsRef = useRef<Record<string, File | Directory>>({});

    const { openedApps, openApp, modifyProp, bringToFront } = useKernel();
    const { userDirectory } = useUser();

    const smartSetItems = useCallback(
        (type: "desktop" | "taskbar", newItems: Record<string, File | Directory>) => {
            const old = type === "desktop" ?  
            previousDesktopItemsRef.current : previousTaskbarItemsRef.current;

            const oldKeys = Object.keys(old).sort().join(",");
            const newKeys = Object.keys(newItems).sort().join(",");

            if (oldKeys === newKeys) return; // Only check keys, for simplicity

            if (type === "desktop") {
            previousDesktopItemsRef.current = { ...newItems };
            setDesktopItems(newItems);
            } else {
            previousTaskbarItemsRef.current = { ...newItems };
            setTaskbarItems(newItems);
            }
        },
        []
    );

    useFolderWatcher(`${userDirectory}/Taskbar/`, (items) => smartSetItems("taskbar", items));
    useFolderWatcher(`${userDirectory}/Desktop/`, (items) => smartSetItems("desktop", items));

    const apps = useGetApps();

    const handleOpenApp = () => {
        if (!selectedApp) return;

        const app = openedApps.find(
            (app) => app.executable.config.name === selectedApp.config.name
        );

        if (app) {
            modifyProp(app.id, "minimized", !app.minimized);
            bringToFront(app.id);
        } else {
            openApp(selectedApp);
            const opened = openedApps.find(
                (app) => app.executable.config.name === selectedApp.config.name
            );

            if (!opened) return;

            bringToFront(opened.id);
        }

    };

    const pin = async () => {
        if (!selectedApp) return;

        const appCopy = { ...selectedApp, mainComponent: undefined };

        if (taskbarItems[selectedApp.config.name || selectedApp.config.displayName]) {
            await virtualFS.deleteFile(`${userDirectory}/Taskbar/`, selectedApp.config.name);
        } else {
            await virtualFS.writeFile(
                `${userDirectory}/Taskbar/`,
                selectedApp.config.name,
                appCopy,
                "exe"
            );
        }

        setSelectedApp(null);
    };

    const shortcut = async () => {
        if (!selectedApp) return;

        const appCopy = { ...selectedApp, mainComponent: undefined };

        if (desktopItems[selectedApp.config.name || selectedApp.config.displayName]) {
            await virtualFS.deleteFile(`${userDirectory}/Desktop/`, selectedApp.config.name);
        } else {
            await virtualFS.writeFile(
                `${userDirectory}/Desktop/`,
                selectedApp.config.name,
                appCopy,
                "exe"
            );
        }

        setSelectedApp(null);
    };

    const deleteApp = async (): Promise<void> => {
        setSelectedApp(null);
    }

    return (
        <div className="flex flex-col gap-2 px-4 overflow-y-auto py-4">
            {/* Since its already flex-col, no need to repeat it */}
{selectedApp ? (
  <>
    <div className="w-full flex justify-between items-center px-5">
      <Button onClick={() => setSelectedApp(null)}>
        <FontAwesomeIcon icon={faChevronLeft} /> Back
      </Button>
      <div className="flex flex-row gap-2 items-center justify-center">
        {!selectedApp.config.icon
          ? undefined
          : typeof selectedApp.config.icon === "string"
          ? selectedApp.config.icon.trim().startsWith("<svg") ||
            selectedApp.config.icon.trim().startsWith("<img") ? (
            <div
              className="w-8 h-8 p-2 invert"
              dangerouslySetInnerHTML={{ __html: selectedApp.config.icon }}
            />
          ) : (
            <img
              src={selectedApp.config.icon}
              alt={selectedApp.config.name}
              className="w-8 h-8 p-1 pointer-events-none"
            />
          )
          : (
            <FontAwesomeIcon icon={selectedApp.config.icon} />
          )}
        <h1>{selectedApp.config.name}</h1>
      </div>
    </div>

    <div className="flex-grow flex flex-col gap-2 my-5 h-full">
      <p className="text-sm">{selectedApp?.config.description}</p>
      <Button onClick={handleOpenApp}>
        <FontAwesomeIcon icon={faArrowUpFromBracket} className="pr-1" />
        Open
      </Button>

      {(() => {
        const appName = selectedApp.config.name || selectedApp.config.displayName;
        const isPinned = !!taskbarItems[appName];

        return (
          <Button onClick={pin}>
            <FontAwesomeIcon icon={faThumbTack} className="pr-1" />
            {isPinned ? "Unpin" : "Pin"}
          </Button>
        );
      })()}

      <Button onClick={shortcut}>
        <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="pr-1" />
        Shortcut
      </Button>

      <Button onClick={deleteApp}>
        <FontAwesomeIcon icon={faTrash} className="pr-1" />
        Delete {selectedApp.config.name}
      </Button>
    </div>
  </>
)

            :
            <>
            {apps.map((app, index) => (
                <div 
                key={index}
                onClick={() => setSelectedApp(app)}
                className="flex flex-row justify-between items-center bg-primary rounded p-2 hover:bg-primary-light transition-colors duration-200 cursor-pointer"
                >
                    <div className="flex justify-center items-center gap-4">
                        {!app.config.icon ? undefined : typeof app.config.icon === "string" ? (
                            // Check if the string starts with "<svg" or "<img"
                            app.config.icon.trim().startsWith("<svg") || app.config.icon.trim().startsWith("<img") ? (
                            <div
                                className="w-8 h-8 p-2 invert"
                                dangerouslySetInnerHTML={{ __html: app.config.icon }}
                            />
                            ) : (
                            // Otherwise, treat it as a regular image URL
                            <img src={app.config.icon} alt={app.config.name} className="w-8 h-8 p-1 pointer-events-none" />
                            )
                        ) : (
                            // If it's not a string, assume it's a FontAwesome svg object
                            <FontAwesomeIcon icon={app.config.icon} />
                        )}
                        <h3 className="font-semibold">{ app.config.name }</h3>
                    </div>
                    <FontAwesomeIcon icon={faChevronRight} />
                </div>
            ))}
            </>
            }
        </div>
    );
}
 
export default Apps;