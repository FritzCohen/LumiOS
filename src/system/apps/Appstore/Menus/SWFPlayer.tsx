import React, { useEffect } from "react";
import "@ruffle-rs/ruffle";
import virtualFS from "../../../api/virtualFS";

interface SWFPlayerProps {
	name: string;
	path: string;
}

function isValidHttpUrl(string: string) {
	try {
		const url = new URL(string);
		return url.protocol === "http:" || url.protocol === "https:";
	} catch {
		return false;
	}
}

const SWFPlayer: React.FC<SWFPlayerProps> = ({ name, path }) => {
	useEffect(() => {
		const grab = (
			url: string,
			type: XMLHttpRequestResponseType,
			success: (data: ArrayBuffer) => void,
			fail: (status: number) => void
		) => {
			const req = new XMLHttpRequest();
			req.open("GET", url, true);
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
			if (!data) return;

			console.log(
				"Initializing with " + data.byteLength + " bytes of data"
			);

			const flashObject = document.createElement("object");
			flashObject.classList.add("gembed");
			flashObject.type = "application/x-shockwave-flash";
			flashObject.data = URL.createObjectURL(new Blob([data]));

			const flashObjectWmode = document.createElement("param");
			flashObjectWmode.name = "wmode";
			flashObjectWmode.value = "direct";
			flashObject.appendChild(flashObjectWmode);

			const mainArea = document.getElementById("mainarea");
			if (mainArea) {
				flashObject.style.width = "100%";
				flashObject.style.height = "100%";
				mainArea.innerHTML = ""; // clear old embeds
				mainArea.appendChild(flashObject);
			}
		};

		const readyForLoad = async (swfPath: string) => {
			console.log("Fetching SWF from " + swfPath + "...");

			if (isValidHttpUrl(swfPath)) {
				grab(
					swfPath,
					"arraybuffer",
					(data) => {
						console.log("Successfully fetched SWF from " + swfPath);
						startPlayer(data);
					},
					(status) => {
						console.error("Error fetching SWF: " + status);
					}
				);
			} else {
				const file = await virtualFS.readfile(path, name);

				if (
					file &&
					file.fileType === "swf" &&
					file.content instanceof Uint8Array
				) {
					// .buffer is ArrayBufferLike, cast it to ArrayBuffer for startPlayer
					startPlayer(file.content.buffer as ArrayBuffer);
				} else {
					console.error(
						"Invalid SWF file format in virtualFS:",
						file
					);
				}
			}
		};

		readyForLoad(path);
	}, [path, name]);

	return <div id="mainarea" className="w-full h-full" />;
};

export default SWFPlayer;
