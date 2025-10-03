import { useEffect, useState } from "react";
import Button from "../../lib/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfinity } from "@fortawesome/free-solid-svg-icons";
import { useKernel } from "../../../hooks/useKernal";
import { useUser } from "../../../context/user/user";
import virtualFS from "../../api/virtualFS";
import TextPopup from "../../gui/components/Popups/TextPopup";
import { useWindow } from "../../../context/window/WindowProvider";
import logo from "../../../assets/no-bg-logo.png";

const System = () => {
    const { openApp } = useKernel();
    const { currentUser } = useUser();
    const { systemProps } = useWindow();

    const [indexedDBUsage, setIndexedDBUsage] = useState<string | null>(null);
    const [maxUsage, setMaxUsage] = useState<string | null>(null);
    const [secure, setSecure] = useState<boolean>(false);

    useEffect(() => {        
        const fetchLink = async () => {
            try {
                const response = await fetch("https://raw.githubusercontent.com/LuminesenceProject/LumiOS/main/Info.json");

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                
                const secured: boolean = (Number(data[0].version) >= 0 - 1) && (Number(data[0].version) <= 0 + 1);                

                setSecure(secured);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchLink();

        const getUsage = async () => {
            const storageMethod = virtualFS.getMethod();
            let usage: number = 0;
            let quota: number = 0;
          
            // Helper function to format bytes with appropriate units (KB, MB, or GB)
            const formatBytes = (bytes: number | undefined | null) => {
              if (!bytes) return '0 bytes';
          
              const units = ['bytes', 'KB', 'MB', 'GB'];
              let value = bytes;
              let unitIndex = 0;
          
              while (value >= 1000 && unitIndex < units.length - 1) {
                value /= 1000;
                unitIndex++;
              }
          
              return `${parseFloat(value.toPrecision(2))} ${units[unitIndex]}`;
            };
          
            // Handle different storage methods
            if (storageMethod === 'fileStorage') {
                // Extract data for file storage from an element with ID "virtualFS"
                const fileDataElement = document.getElementById("virtualFS");
                
                if (fileDataElement && fileDataElement.textContent) {
                  try {
                    // Parse the JSON content stored in the text of the element
                    const parsedData = JSON.parse(fileDataElement.textContent);
                    usage = parsedData.usage || 0;
                    quota = parsedData.quota || 0;
                  } catch (error) {
                    console.error("Error parsing JSON from virtualFS:", error);
                  }
                }              
            } else if (storageMethod === 'indexedDB') {
              const storageEstimate = await navigator.storage.estimate();
              usage = storageEstimate.usage || 0;
              quota = storageEstimate.quota || 0;
            } else if (storageMethod === 'localStorage') {
              usage = new Blob(Object.values(localStorage)).size;
              quota = 5 * 1024 * 1024; // Approximate quota for localStorage (5MB)
            } else if (storageMethod === 'OPFS') {
              // OPFS storage estimate (requires OPFS API support)
              const storageEstimate = await navigator.storage.estimate();
              usage = storageEstimate.usage || 0;
              quota = storageEstimate.quota || 0;
            }
          
            // Format usage and quota
            const mbUsage = formatBytes(usage);
            const maxUsage = formatBytes(quota);
          
            // Update the UI or state with the results
            setIndexedDBUsage(mbUsage);
            setMaxUsage(maxUsage);
        };
          
        getUsage();
    }, [systemProps.system.version]);

    const browserName = () => {
        const userAgent = navigator.userAgent;
        if (userAgent.indexOf("Firefox") !== -1) return "Firefox";
        if (userAgent.indexOf("Chrome") !== -1) return "Chrome";
        if (userAgent.indexOf("Safari") !== -1) return "Safari";
        if (userAgent.indexOf("MSIE") !== -1) return "Internet Explorer";
        return "Unknown";
    };

    const osInfo = () => {
        const userAgent = navigator.userAgent;
        let osType = "Unknown";
        let osVersion = "Unknown";
    
        if (userAgent.indexOf("Mac") !== -1) {
            osType = "Mac OS";
            const match = /Mac OS X (\d+[._]\d+[._]\d+)/.exec(userAgent);
            if (match) {
                osVersion = match[1].replace(/_/g, ".");
            }
        } else if (userAgent.indexOf("Windows") !== -1) {
            osType = "Windows";
            const match = /Windows NT (\d+[._]\d+)/.exec(userAgent);
            if (match) {
                osVersion = match[1].replace(/_/g, ".");
            }
        } else if (userAgent.indexOf("Linux") !== -1) {
            osType = "Linux";
            const match = /Linux/.exec(userAgent);
            if (match) {
                osVersion = "Unknown"; // It's difficult to determine the version of Linux from user agent
            }
        }
    
        return {
            type: osType,
            version: osVersion
        };
    };    

    const updateFile = async () => {
    };

    const updateFileSystem = async () => {
        await virtualFS.updateSpecificDirectory(`/Users/${currentUser?.username}/Apps/`, `/Users/Default/`, true);
        await virtualFS.updateSpecificDirectory("System/", "System/", false);
        await virtualFS.updateSpecificDirectory("System/Plugins/", "System/Plugins/", false);

        await openApp({
			config: {
				name: "Update",
				displayName: "Notification",
				icon: "",
				permissions: 0,
			},
			mainComponent: (props) => <TextPopup {...props} text="Please reload to initialize changes." onComplete={() => window.location.reload()} />,
		});
    };

    const handleReset = async () => {
        if (window.confirm("Are you sure you want to reset? \nAll stored data will be gone, forever.")) {
            await virtualFS.deleteFileSystem().then(() => {
                window.location.reload();
            });
        }
    };

    return (
        <div className="flex flex-col gap-2 p-5 !overflow-y-scroll overflow-scroll w-full h-full">
            <h2 className="font-bold text-xl">System</h2>
            <div className="p-2 border rounded shadow">
                <div className="flex flex-row justify-between items-center">
                    <h4 className="font-bold text-md">LumiOS v{systemProps.system.version}</h4>
                    <img src={logo} alt="logo" className="w-10 h-10" />
                </div>
                <div className="flex flex-row justify-between items-center my-2">
                    Update
                    <Button className="hover:bg-primary-light" onClick={updateFileSystem}>Update</Button>
                </div>
            </div>
            <h2 className="font-bold text-xl">Your Device</h2>
            <div className="p-2 border rounded shadow">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-row justify-between items-center">
                        <strong>Operating System:</strong> <div className="flex flex-row gap-1">{Object.values(osInfo()).map((value, index) => <span key={index}>{value}</span>)}</div>
                    </div>
                    <div className="flex flex-row justify-between items-center">
                        <strong>Web Browser:</strong> {browserName()}
                    </div>
                    <div className="flex flex-row justify-between items-center">
                        <strong>Device Type:</strong> {navigator.platform}
                    </div>
                    <div className="flex flex-row justify-between items-center">
                        <strong>Web Protocol:</strong> {window.location.protocol}
                    </div>
                    <div className="flex flex-row justify-between items-center">
                        <strong>Web Host:</strong> {window.location.host}
                    </div>
                </div>
            </div>
            <h2 className="font-bold text-xl">LumiOS Information</h2>
            <div className="p-2 border rounded shadow">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-row justify-between items-center">
                        <strong>Storage Used:</strong> <div className="flex items-center justify-center">{indexedDBUsage !== null ? `${indexedDBUsage}/${maxUsage != null ? maxUsage : ''}` : "Loading..."} {maxUsage == null && <FontAwesomeIcon icon={faInfinity} />}</div>
                    </div>
                    <div className="flex flex-row justify-between items-center">
                        <strong>Current Version:</strong> {systemProps.system.version}
                    </div>
                    <div className="flex flex-row justify-between items-center">
                        <strong>Supported Version:</strong> {secure ? "Yes" : "No"}
                    </div>
                </div>
            </div>
            <div className="p-2 border rounded shadow flex flex-row justify-between items-center">
                Update (beta)
                <Button onClick={updateFile}>Update File</Button>
            </div>
            <div className="p-2 border rounded shadow flex flex-row justify-between items-center">
                Reset <Button onClick={handleReset} className="hover:bg-primary-light">Confirm</Button>
            </div>
        </div>
    );
};

export default System;