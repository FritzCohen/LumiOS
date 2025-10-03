import React, { useState } from "react";
import Button from "../../lib/Button";
import { useApplications } from "../../../Providers/ApplicationProvider";
import { useUser } from "../../../Providers/UserProvider";

const AppCreator = () => {
  const [appDescription, setAppDescription] = useState("");
  const [message, setMessage] = useState("");
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pinned, setPinned] = useState(false);
  const [shortcut, setShortcut] = useState(false);

  const { currentUser } = useUser();
  const { addInstalledApp, addTaskbarApp, addDesktopApp } = useApplications();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, setFile: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setFile(file);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Upload HTML file to the "apps" folder
    if (htmlFile) {
      const htmlReader = new FileReader();
      htmlReader.onload = async () => {
        try {
            // Upload Image file to the "apps" folder
            if (imageFile) {
              const imageReader = new FileReader();
              imageReader.onload = async () => {
              // You can do something with the image if needed
              await addInstalledApp({
                  name: htmlFile.name,
                  actualName: htmlFile.name,
                  description: appDescription,
                  userInstalled: true,
                  path: `Users/${currentUser?.username}/Apps/`,
                  svg: imageReader.result,
                  fileContent: typeof htmlReader.result === "string"
                  ? htmlReader.result
                  : htmlReader.result instanceof ArrayBuffer
                  ? new TextDecoder().decode(htmlReader.result)
                  : ""
              });
                
              if (pinned) {
                await addTaskbarApp({
                    name: htmlFile.name,
                    actualName: htmlFile.name,
                    description: appDescription,
                    userInstalled: true,
                    svg: imageReader.result,
                    path: `Users/${currentUser?.username}/Apps/`,
                  });
              }
              if (shortcut) {
                await addDesktopApp({
                    name: htmlFile.name,
                    actualName: htmlFile.name,
                    description: appDescription,
                    userInstalled: true,
                    svg: imageReader.result,
                    path: `Users/${currentUser?.username}/Apps/`,
                  })
              }};

              imageReader.readAsDataURL(imageFile);
            }
          setMessage("App created successfully!");
        } catch (error) {
          console.error("Error creating app:", error);
          setMessage("Error creating app");
        }
      };
      htmlReader.readAsText(htmlFile);
    }
  };

  return (
    <div className="p-8 overflow-y-auto w-full h-full">
      <form className="flex flex-col gap-4 max-w-md mx-auto p-6 bg-gray-100 rounded-md overflow-y-auto" onSubmit={handleFormSubmit}>
        <h3 className="font-bold text-2xl">App Creator</h3>
        <div>
          <label htmlFor="file-upload" className="custom-file-upload">
            Choose HTML File
          </label>
          <input
            type="file"
            id="file-upload"
            accept=".html"
            className="hidden"
            onChange={(e) => handleFileChange(e, setHtmlFile)}
            required
          />
        </div>
        <div>
          <label htmlFor="image-upload" className="custom-file-upload">
            Choose Image File
          </label>
          <input
            type="file"
            id="image-upload"
            accept=".svg, .jpg, .jpeg, .png"
            className="hidden"
            onChange={(e) => handleFileChange(e, setImageFile)}
            required
          />
        </div>

        <label className="text-lg font-semibold mb-1">
          App Description:
        </label>
        <textarea
          className="p-2 border rounded-md focus:outline-none focus:ring"
          value={appDescription}
          style={{ color: "black" }}
          onChange={(e) => setAppDescription(e.target.value)}
          required
        />

        <div className="inline-flex items-center">
          <input
            type="checkbox"
            id="pinned"
            checked={pinned}
            onChange={() => setPinned(!pinned)}
            className="p-2 border rounded-md focus:outline-none focus:ring"
          />
          <label htmlFor="pinned" className="ml-2">
            Pinned when installed
          </label>
        </div>

        <div className="inline-flex items-center">
          <input
            type="checkbox"
            id="shortcut"
            checked={shortcut}
            onChange={() => setShortcut(!shortcut)}
            className="p-2 border rounded-md focus:outline-none focus:ring"
          />
          <label htmlFor="shortcut" className="ml-2">
            Shortcut when installed
          </label>
        </div>

        <Button type="submit">
          Create App
        </Button>
      </form>
      <p className="text-sm">{message}</p>
    </div>
  );
};

export default AppCreator;