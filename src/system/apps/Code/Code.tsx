// May be updated in the future


import "./code.css";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import Content from "./Content";
import { useCode } from "./useCode";
import { useUser } from "../../../context/user/user";
import { OpenedApp } from "../../../context/kernal/kernal";

interface CodeProps {
  defaultPath: string;
  props: OpenedApp;
}

const Code: React.FC<CodeProps> = ({ defaultPath, props }) => {
    const { userDirectory } = useUser();
    
    const code = useCode(defaultPath || `${userDirectory}/Code/`, props)

    return (
        <div className="code-app w-full h-full flex flex-col">
            <Topbar code={code} />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar code={code} />
                <Content code={code} />
            </div>
        </div>
    );
};

export default Code;
