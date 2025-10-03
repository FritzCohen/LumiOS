import { useState, useEffect } from "react";
import logo from "../../assets/no-bg-logo.png";
import virtualFS from "../../utils/VirtualFS";
import Theme from "../../utils/Theme";
import { usePluginScript } from "../../Providers/ScriptProvider";
import RunScript from "../../system/apps/Editors/ScriptRunner/RunScript";
import { secureBot } from "../../utils/secureBot";
import { useKernal } from "../../Providers/KernalProvider";
import Button from "../../system/lib/Button";
import Api from "../../system/Api";

interface LoadingFunction {
  func: () => Promise<boolean>;
  successMessage: string;
  failureMessage: string;
}

// Utility function to introduce delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const Loading: React.FC<{ setLoading: (value: boolean) => void }> = ({ setLoading }) => {
  const [loading, setLoadingState] = useState(0);
  const [ran, setRan] = useState(false);
  const [canContinue, setCanContinue] = useState(true);
  //const [show, setShow] = useState<boolean>(virtualFS.getMethod() !== "fileStorage");
  const [messages, setMessages] = useState<string[]>([]); // To hold all messages
  const { addPopup } = useKernal();
  const { fetchScripts } = usePluginScript();

  const functions: LoadingFunction[] = [
  {
      func: async () => {
      try {
          const onlineVersion = await fetch("https://raw.githubusercontent.com/LuminesenceProject/LumiOS/main/Info.json");
          const version = await onlineVersion.json();
          const storedVersion = await virtualFS.readfile("System/", "Version");
          const content = storedVersion.content;
          const onlineContent = version[0];

          if (content.version !== onlineContent.version) return false;
          
          return true;
      } catch (error) {
          console.error(error);
          return false;
      }

      },
      successMessage: "Official supported version of Lumi OS.",
      failureMessage: "Old version of Lumi OS. Upgrade needed.",
  },
  {
      func: async () => {
      try {
          await virtualFS.initialize();
          return true;
      } catch (error) {
          console.error(error);
          return false;
      }
      },
      successMessage: "Virtual FS initialized successfully!",
      failureMessage: "Failed to initialize Virtual FS.",
  },
  {
      func: async () => {
      try {
          const backgroundImage = await virtualFS.readfile("System/", "BackgroundImage");
          await Theme.setBackground(await backgroundImage.content, false);
          return true;
      } catch (error) {
          console.error(error);
          return false;
      }
      },
      successMessage: "Background image applied.",
      failureMessage: "Background image not found... (404)",
  },
  {
      func: async () => {
      try {
          const theme = await virtualFS.readfile("System/", "Theme");
          await Theme.setTheme(await theme.content, false);
          return true;
      } catch (error) {
          console.error(error);
          return false;
      }
      },
      successMessage: "Found theme file. (202)",
      failureMessage: "Theme could not be located.",
  },
  {
      func: async () => {
          let ran = true;
          const s = await fetchScripts();

          // Use for...of to ensure scripts run sequentially
          for (const script of s) {
              try {
                  await RunScript(await script.script);  // Ensure RunScript is awaited                  
              } catch (error) {
                  console.error(error);
                  ran = false;
                  break;  // If one script fails, stop executing further
              }
          }
  
          return ran;
      },
      successMessage: "Scripts were loaded successfully",
      failureMessage: "Failed to execute one or more scripts.",
  },
  {
    func: async () => {
      const secure = await secureBot.checkFiles();

      if (!secure) {
        const files = secureBot.getFlaggedFiles();

        /*const description: string = files
        .map((file) => `
          ${file.name} contains dangerous code at path ${file.path}.
        `)
        .join('');
      
        addPopup({
          name: "Malicious Files",
          description: description,
          minimized: false,
          onAccept: async () => {
              files.forEach(async (file) => {
                await virtualFS.deleteFile(file.path, file.name);
              });
          },
        });*/

        files.forEach(async (file) => {
          addPopup({
            name: "Malicious File",
            description: `${file.name} contains dangerous code at path ${file.path}. Delete?`,
            minimized: false,
            onAccept: async () => {
              await virtualFS.deleteFile(file.path, file.name);
            }
          });
        })
      }

      return secure;
    },
    successMessage: "SecureBot found no issues.",
    failureMessage: "SecureBot detected problem(s)",
  },
  {
    func: async () => {
    return window.navigator.onLine ? true : false;
    },
    successMessage: "Wifi is enabled.",
    failureMessage: "Enable wifi to access the appstore.",
},
  // Add more functions as needed
  ];

  const api = Api();

  useEffect(() => {
    const totalFunctions = functions.length;
    const progressPerFunction = 100 / totalFunctions;
    const delayTime = 250; // Delay time in milliseconds between functions
    const finalDelayTime = 350; // Final delay time in milliseconds after last function
    let errCount = 0;

    const executeFunctions = async () => {
      await virtualFS.initialize();
      
      for (const { func, successMessage, failureMessage } of functions) {
        try {
          await delay(delayTime); // Introduce delay before executing the function
          const result = await func();
          if (result) {
            setMessages((prevMessages) => [...prevMessages, successMessage]);
          } else {
            setMessages((prevMessages) => [...prevMessages, failureMessage]);

            errCount++;
          }
          setLoadingState((prevLoading) => {
            const newLoading = prevLoading + progressPerFunction;
            return newLoading >= 100 ? 100 : newLoading;
          });
        } catch (error) {
          setMessages((prevMessages) => [...prevMessages, failureMessage]);
          console.error(error);
          errCount++;
          // Continue with the next function
        }
      }

      if (functions.length/2-2 <= errCount) {
        setMessages((prevMessages) => [...prevMessages, "Multiple errors have been detected. Please type, 'lumiplus' in that order to reset to fix these errors."]);
        setCanContinue(false);
      } else {
        // Add a final delay after the last function completes
        setMessages((prevMessages) => [...prevMessages, "Loading complete!"]);
        await delay(finalDelayTime);
        setLoading(false);
        setRan(true);
      }
    };
    
    // Only execute when the user interacts with the page - and file is correct
    if ((virtualFS.getInteracted() && !virtualFS.getAborted() || virtualFS.getMethod() !== "fileStorage") && !ran) {
      if (!ran) {
        executeFunctions();
      }
    }
  }, [virtualFS.getInteracted()]);

  const handleInteract = async () => {

  };

  return (
    <div
      className="relative flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0"
      style={{
        color: "white",
        backgroundColor: "#181818",
        backgroundSize: "cover",
        overflow: "hidden",
      }}
    >
      {/* eslint-disable-next-line no-constant-condition */}
      {true ?
      <div className="flex flex-col items-center justify-center z-10">
        {/* Main content */}
        <img className="w-24 h-24 mb-4" src={logo} alt="logo" />
        <div
          className="flex h-5 overflow-hidden my-2 border p-1"
          role="progressbar"
          aria-valuenow={loading}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{ width: "150px" }}
        >
          <div
            className="flex flex-col justify-center overflow-hidden text-xs text-white text-center whitespace-nowrap transition-all ease-linear duration-500"
            style={{ width: `${loading}%`, backgroundColor: "white" }}
          ></div>
        </div>
        <div style={{ color: "#8C8C8C" }}>
            {messages[messages.length - 1]} 
        </div>
        {!canContinue && (
          <div onClick={() => {setCanContinue(true); setLoading(false); setRan(true)}}>
            <Button className="!bg-primary-light">Continue anyways?</Button>
          </div>
        )}
        <div>
            <a href="https://discord.com/invite/TyacaNY3GK">Join the Discord!</a>
        </div>
      </div> :
      <div onClick={handleInteract} className="w-full h-full flex flex-col items-center justify-center z-10">
        <h3>Click anywhere on this page to continue.</h3>
        <p className="text-xs font-extralight">Select the currently opened file when prompted.</p>
      </div>
      }
    </div>
  );
};

export default Loading;