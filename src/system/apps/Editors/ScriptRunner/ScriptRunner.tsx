import { useEffect } from "react";
import RunScript from "./RunScript";
import { Permission } from "../../../../utils/types";

interface ScriptRunnerProps {
    script?: string
}

interface Script {
    name: string
    description: string
    permission: Permission
    app: string
    script: string
}

const ScriptRunner: React.FC<ScriptRunnerProps> = ({ script }) => {

    useEffect(() => {
        const fetchScript = async () => {
            const result = await RunScript(`alert(Object.keys(await virtualFS.readdir("/")))`);
            console.log(result);
            
        };

        fetchScript();
    }, []);
    
    return ( 
        <div>
            {JSON.stringify(script)}
        </div>
    );
}
 
export default ScriptRunner;