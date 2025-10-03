import { ReactNode, useState } from "react";
import "./FirstStart.css";
import Welcome from "./Welcome";
import Themes from "./Themes";
import Background from "./Background";
import User from "./User";
import Endscreen from "./Endscreen";

interface FirstStartProps {
    setFirstStart: (prev: boolean) => void
}

const FirstStart: React.FC<FirstStartProps> = ({ setFirstStart }) => {
    const [menu, setMenu] = useState<number>(0);

    const getMenu = (): ReactNode => {
        switch (menu) {
            case 0: return <Welcome setMenu={setMenu} />
            case 1: return <Themes setMenu={setMenu} />
            case 2: return <Background setMenu={setMenu} />
            case 3: return <User setMenu={setMenu} />
            case 4: return <Endscreen setMenu={setMenu} setFirstStart={setFirstStart} />
            default: return <div />
        }
    };

    return ( 
        <div className="w-full h-full">
            <div className="w-full h-full flex justify-center items-center z-50">
                {getMenu()}
            </div>
        </div>
    );
}
 
export default FirstStart;