import React, { useEffect } from 'react';
import "@ruffle-rs/ruffle";

interface SWFPlayerProps {
    path: string;
}

const SWFPlayer: React.FC<SWFPlayerProps> = ({ path }) => {
    useEffect(() => {
        const grab = (
            url: string,
            type: XMLHttpRequestResponseType,
            success: (data: ArrayBuffer) => void,
            fail: (status: number) => void
        ) => {
            const req = new XMLHttpRequest();
            req.open("GET", url, true);
            req.overrideMimeType("text/plain; charset=x-user-defined");
            req.responseType = type;
            req.onload = () => {
                if (req.status >= 400) {
                    fail(req.status);
                } else {
                    success(req.response);
                }
            };
            req.send();
        };

        const startPlayer = (data: ArrayBuffer) => {
            if (data) {
                console.log("Initializing with " + data.byteLength + " bytes of data");
                // Create and append the flashObject element
                const flashObject = document.createElement("object");
                flashObject.classList.add("gembed");
                flashObject.type = "application/x-shockwave-flash";
                flashObject.data = URL.createObjectURL(new Blob([data]));
                const flashObjectWmode = document.createElement("param");
                flashObjectWmode.name = "wmode";
                flashObjectWmode.value = "direct";
                flashObjectWmode.style.marginTop = "100px";
                flashObjectWmode.style.overflow = "hidden";
                flashObject.appendChild(flashObjectWmode);
                const mainArea = document.getElementById("mainarea");
                if (mainArea) {
                    flashObject.style.width = "100%";
                    flashObject.style.height = "100%";
                    mainArea.appendChild(flashObject);
                }
            }
        };

        const readyForLoad = (swfPath: string) => {
            console.log("Fetching SWF from " + swfPath + "...");
            grab(swfPath, "arraybuffer", (data) => {
                console.log("Successfully fetched SWF from " + swfPath);
                startPlayer(data);
            }, (status) => {
                console.error("Received the following error: Error code: " + status);
            });
        };

        readyForLoad(path);
    }, [path]);

    return (
        <div id="mainarea" className='w-full h-full'>
            {/* The SWF player will be inserted here */}
        </div>
    );
};

export default SWFPlayer;