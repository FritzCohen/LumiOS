/**
 * A list of all the commands that can be executed in the system.
 *
 * All commands are async and come from providers.
 * Provides direct access to virtualFS and any other services via hooks.
 */

import { useApplications } from "../../Providers/ApplicationProvider";
import { useKernal } from "../../Providers/KernalProvider";
import { useUser } from "../../Providers/UserProvider";
import virtualFS from "../../utils/VirtualFS";

export type Command = {
  name: string;
  description: string;
  args?: string[];
  system?: boolean;
  run: (...args: any[]) => Promise<any>;
};

function isMethod(obj: any, prop: string): boolean {
  return typeof obj[prop] === "function" && prop !== "constructor";
}

export function useCommands(): Command[] {
  const app = useApplications();
  const kernal = useKernal();
  const { currentUser, setLoggedIn } = useUser();

  // Static commands first
  const baseCommands: Command[] = [
    {
      name: "whoami",
      description: "Displays the current user.",
      run: async () => currentUser?.username ?? "Unknown",
    },
    {
      name: "currentUser",
      description: "Displays the current user.",
      run: async () => {
        if (!currentUser) {
          return undefined;
        }
        return currentUser;
      },
    },
    {
      name: "logout",
      description: "Logs the current user out.",
      run: async () => {
        await setLoggedIn(false);
        return "Logged out.";
      },
    },
  ];

  // Dynamically generate virtualFS commands
  const fsPrototype = Object.getPrototypeOf(virtualFS);
  const fsCommands: Command[] = Object.getOwnPropertyNames(fsPrototype)
    .filter((name) => isMethod(fsPrototype, name))
    .map((methodName) => ({
      name: methodName,
      description: `Executes virtualFS.${methodName}()`,
      system: true,
      run: async (...args: any[]) => {
        try {
          const result = await (virtualFS as any)[methodName](...args);
          return result;
        } catch (err) {
          throw new Error(`Error in ${methodName}: ${err}`);
        }
      },
    }));

  const appCommands: Command[] = Object.keys(app)
    .filter((key) => typeof app[key as keyof typeof app] === "function")
    .map((fnName) => ({
      name: fnName,
      description: `Calls useApplications().${fnName}()`,
      system: false,
      run: async (...args: any[]) => {
        try {
          const fn = app[fnName as keyof typeof app] as (
            ...args: any[]
          ) => Promise<any>;
          return await fn(...args);
        } catch (err) {
          throw new Error(`Error running ${fnName}: ${err}`);
        }
      },
    }));

  const kernalCommands: Command[] = Object.keys(kernal)
    .filter((key) => typeof kernal[key as keyof typeof kernal] === "function")
    .map((fnName) => ({
      name: fnName,
      description: `Calls useKernal().${fnName}()`,
      system: true,
      run: async (...args: any[]) => {
        try {
          const fn = kernal[fnName as keyof typeof kernal] as (
            ...args: any[]
          ) => Promise<any>;
          return await fn(...args);
        } catch (err) {
          throw new Error(`Error running ${fnName}: ${err}`);
        }
      },
  }));

  return [...baseCommands, ...fsCommands, ...appCommands, ...kernalCommands];
}

import UserInput from "./UserInput";

export function useExecuteCommand(commands: Command[]) {
  const { addPopup, removePopup } = useKernal();

  const executeCommand = async (name: string, args: string[] = []): Promise<any> => {
    const command = commands.find(cmd => cmd.name === name);

    if (!command) {
      return `❌ Unknown command: ${name}`;
    }

    try {
      if (command.system) {
        const popupName = `Permissions-${name}-${Date.now()}`;

        const confirmed = await new Promise<boolean>((resolve) => {
          const handleConfirm = (result: boolean) => {
            resolve(result);
            removePopup(popupName);
            return;
          };

          addPopup({
            name: popupName,
            description: "Requesting sudo permissions.",
            minimized: false,
            appName: "FileExplorer",
            onAccept: async () => handleConfirm(true),
            children: <UserInput name="Permissions Error" closePopup={() => removePopup("Permissions Error")} verfified={async () => {handleConfirm(true);}} />,
          });
        });

        if (!confirmed) {
          console.log("Command cancelled by user.");
          return "❌ Command cancelled.";
        }
      }

      return await command.run(...args);
    } catch (error: any) {
      return `⚠️ Error running "${name}": ${error?.message || String(error)}`;
    }
  };

  return executeCommand;
}