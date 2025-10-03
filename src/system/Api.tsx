import { useApplications } from "../Providers/ApplicationProvider";
import { useKernal } from "../Providers/KernalProvider";
import { usePluginScript } from "../Providers/ScriptProvider";
import { useTopbarContext } from "../Providers/TopbarProvider";
import { useUser } from "../Providers/UserProvider";
import defaultFS from "../utils/defaultFS";
import { MIMETypes } from "../utils/MIMETypes";
import secureBot from "../utils/secureBot";
import Theme from "../utils/Theme";
import { File, Directory } from "../utils/types";
import virtualFS from "../utils/VirtualFS";
import PopupContent from "./apps/Code/PopupContent";
import UserInput from "./lib/UserInput";

export const Api = () => {
  const application = useApplications();
  const user = useUser();
  const scripts = usePluginScript();
  const kernal = useKernal();
  const topbar = useTopbarContext();

  /**
   * LumiOS API
   * 
   * This API provides access to the core functionalities of LumiOS.
   * It includes OS properties, user information, virtual file system,
   * and default configurations.
   */
  const api = {
    /**
     * OS Properties
     * 
     * Includes the name, version, security status, and kernal.
     * 
     * See {@link secureBot} for the security bot.
     * See {@link kernal} for the kernal functions.
     */
    os: {
      name: "LumiOS",
      version: "12.5.0",
      security: secureBot,
      kernal: kernal,
    },
    scripts: scripts,
    user: {
      theme: Theme,
      apps: application,
      topbar: topbar,
      ...user,
    },
    virtualFS: virtualFS,
    defaults: {
      fileSystem: defaultFS,
      MimeTypes: MIMETypes,
      requestPermissions: async (
        item: File | Directory,
        onAccept: () => Promise<void>,
        onReject: () => Promise<void>
      ): Promise<boolean> => {
        return new Promise((resolve) => {
            const verifyFunction = async (good: boolean) => {
                api.os.kernal.removePopup("Permissions Error");

                if (!good) {
                    resolve(false);
                    await onReject();
                    return false;
                }

                await onAccept();
                resolve(true);
                return true;
            };

            const currentUser = api.user.currentUser;
            if (currentUser && (item.permission > currentUser.permission)) {
                api.os.kernal.addPopup({
                    name: "Permissions Error",
                    description: "Requesting sudo permissions.",
                    minimized: false,
                    appName: "FileExplorer",
                    onAccept: async () => {}, // no-op here
                    children: (
                        <UserInput
                        name="Permissions Error"
                        closePopup={() => api.os.kernal.removePopup("Permissions Error")}
                        verified={verifyFunction}
                        />
                    ),
                });
            } else {
              onReject().then(() => resolve(true)).catch(() => resolve(false));
            }
        });
      },
      requestUserFileInput: async (
        onAccept: (file: File) => Promise<void>,
        onReject: () => Promise<void>,
        defaultPath: string = "/"
      ): Promise<File | null> => {
        return new Promise((resolve) => {
          let selectedFile: File | null = null;

          const setDirect = (newPath: string) => {
            const parts = newPath.split("/").filter(part => part !== "");
            const name = parts.pop() || "";
            const path = "/" + parts.join("/");

            virtualFS.readfile(path, name).then(file => {
              selectedFile = file;
            }).catch(() => {
              selectedFile = null;
            });
          };

          const handleAccept = async () => {
            console.log("Selected file:", selectedFile);

            if (selectedFile) {
              await onAccept(selectedFile);
              resolve(selectedFile);
            } else {
              await onReject();
              resolve(null);
            }
          };

          const handleReject = async () => {
            await onReject();
            resolve(null);
          };

          api.os.kernal.addPopup({
            name: "FilePicker",
            minimized: false,
            onAccept: handleAccept,
            onReject: handleReject,
            description: "",
            children: (
              <PopupContent
                setDirect={handleAccept}
                direct={defaultPath}
                index="FilePicker"
                type="file"
              />
            ),
          });
        });
      },
      create: async (jsxString: string): Promise<any> => {
          const urls = {
    react: 'https://unpkg.com/react@18/umd/react.development.js',
    reactDOM: 'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
    babel: 'https://unpkg.com/babel-standalone@6/babel.min.js',
  };

  const loadScript = (src: string) =>
    new Promise<void>((resolve, reject) => {
      if ([...document.scripts].some(s => s.src.includes(src))) return resolve();
      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });

  await loadScript(urls.react);
  await loadScript(urls.reactDOM);
  await loadScript(urls.babel);
  if (!(window as any).Babel || !(window as any).React || !(window as any).ReactDOM) {
    throw new Error("React, ReactDOM, or Babel is not loaded.");
  }

  const babel = (window as any).Babel;

  // Wrap the string in a return statement for evaluation
  const wrapped = `(() => (${jsxString}))()`;

  const transpiled = babel.transform(wrapped, { presets: ["react"] }).code;

  return eval(transpiled); // This returns the actual React element
      }
    },
  };

  // Expose the API globally
  (window as any).lumi = api;

  return api;
}

export default Api;