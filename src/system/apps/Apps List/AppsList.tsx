import { useState } from "react";
import useGetApps from "../../../hooks/useGetApps";
import Input from "../../lib/Input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Executable } from "../../../types/globals";
import { useKernel } from "../../../hooks/useKernal";
import "./appList.css";

const AppsList = () => {
    const apps = useGetApps();
    const { openApp, openedApps, bringToFront } = useKernel();

    const [input, setInput] = useState<string>("");

    const handleAppClick = (event: React.MouseEvent, app: Executable) => {
        event.preventDefault();
        event.stopPropagation();
        openApp(app);

        const appId = openedApps.find(ap => ap.executable.config.name === app.config.name)?.id;

        if (appId) bringToFront(appId)
    };

    return ( 
        <div className="flex flex-col gap-2 relative w-full h-full" id="install">
            <div className="relative my-2 w-full px-5 p-2">
                <Input
                    type="text"
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Search Apps..."
                    id="test"
                />
            </div>
            <div className="w-full h-full overflow-y-auto flex flex-col gap-2 px-2">
                {apps.filter(value => value.config.name.toLowerCase().includes(input.toLowerCase())).map((app, index) => (
                    <div key={index} onContextMenu={() => {}} 
                    onClick={(e) => handleAppClick(e, app)}
                    className="installed-app-item transition-colors duration-200">
                        {app.config.icon ? (
                        typeof app.config.icon === "string" ? (
                            app.config.icon.trim().startsWith("<svg") || app.config.icon.trim().startsWith("<img") ? (
                            <div
                                className="w-12 h-12 p-2 invert"
                                dangerouslySetInnerHTML={{ __html: app.config.icon }}
                            />
                            ) : (
                            <img src={app.config.icon} alt={app.config.name} className="w-12 h-12 p-1" />
                            )
                        ) : (
                            <FontAwesomeIcon icon={app.config.icon} />
                        )
                        ) : (
                        <div>{app.config.name}</div>
                        )}
                        {app.config.name}
                    </div>
                ))}
            </div>
        </div>
    );
}
 
export default AppsList;