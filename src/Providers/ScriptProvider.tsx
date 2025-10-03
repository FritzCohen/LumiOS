import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Permission } from "../utils/types";
import virtualFS from "../utils/VirtualFS";

interface Script {
    name: string;
    description: string;
    permission: Permission;
    app: string;
    script: string;
}

interface ScriptContextType {
    scripts: Script[];
    addScript: (script: Script) => Promise<void>;
    removeScript: (id: number | string) => Promise<void>;
    modifyScript: (originalName: string, script: Script) => Promise<void>;
    setScripts: (prev: Script[]) => void;
    fetchScripts: () => Promise<Script[]>;
}

const ScriptContext = createContext<ScriptContextType | undefined>(undefined);

export const ScriptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [scripts, setScripts] = useState<Script[]>([]);

    const fetchScripts = useCallback(async () => {
        await virtualFS.initialize();
        const scriptsData = await virtualFS.readdir("System/Scripts/");
        const content = Object.keys(scriptsData)
            .map((scriptName) => {
                const file = scriptsData[scriptName];
                return file.type !== "directory" ? file.content : null;
            })
            .filter((script): script is Script => script !== null);
        
        setScripts(content);
        return content;
    }, []);

    useEffect(() => {
        fetchScripts();
    }, [fetchScripts]);

    const addScript = async (script: Script) => {
        await virtualFS.writeFile("System/Scripts/", script.name, script, "sys");
        setScripts((prev) => [...prev, script]);
    };

    const removeScript = async (id: number | string) => {
        const scriptName = typeof id === "string" ? id : scripts[id]?.name;
        if (scriptName) {
            await virtualFS.deleteFile("System/Scripts/", scriptName);
            setScripts((prev) => prev.filter(script => script.name !== scriptName));
        }
    };

    const modifyScript = async (originalName: string, script: Script) => {        
        await virtualFS.updateFile("System/Scripts/", originalName, script, "sys", script.name);
        setScripts((prev) => 
            prev.map(s => s.name === originalName ? script : s)
        );
    };

    return ( 
        <ScriptContext.Provider value={{
            scripts,
            setScripts,
            fetchScripts,
            addScript,
            removeScript,
            modifyScript,
        }}>
            {children}
        </ScriptContext.Provider>
    );
};

// Custom hook for using ScriptContext
export const usePluginScript = () => {
    const context = useContext(ScriptContext);
    if (!context) {
        throw new Error("usePluginScript must be used within a ScriptProvider.");
    }
    return context;
};