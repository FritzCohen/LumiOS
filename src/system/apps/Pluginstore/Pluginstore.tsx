import { ReactNode, useState } from "react";
import "./Plugin.css";
import ThemeCreator from "./ThemeCreator";
import WindowThemes from "./WindowThemes";
import Bookmarklets from "./Bookmarklets";
import Button from "../../lib/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft } from "@fortawesome/free-solid-svg-icons";

const PluginStore = () => {
  const [menu, setMenu] = useState<number>(0);

  const getMenu = (): ReactNode => {
    switch (menu) {
      case 0:
        return <div className="flex flex-col items-center gap-2">
          <h3 className="font-bold text-2xl">Plugins</h3>
          <div className="flex flex-row gap-2">
            <Button onClick={() => setMenu(1)}>Themes</Button>
            <Button onClick={() => setMenu(2)}>Bookmarklets</Button>
            <Button onClick={() => setMenu(3)}>Window Themes</Button>
          </div>
        </div>

      case 1: return <ThemeCreator />
      case 2: return <Bookmarklets />
      case 3: return <WindowThemes />

      default: return <> How is this possible??? </>
    }
  };

  return (
    <div className="flex flex-col p-2 overflow-y-scroll w-full h-full">
      <Button onClick={() => setMenu(0)} className="w-fit !pb-2" style={{ visibility: menu == 0 ? "hidden" : "inherit"}}><FontAwesomeIcon icon={faCaretLeft} /> Back</Button>
      <div className="flex-grow h-full">{getMenu()}</div>
    </div>
  );
};

export default PluginStore;
