import { useEffect, useState } from "react";
import { Rnd, RndDragCallback, RndResizeCallback } from "react-rnd";
import { Popup as popup } from "../../utils/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faX } from "@fortawesome/free-solid-svg-icons";
import { useKernal } from "../../Providers/KernalProvider";
import Button from "./Button";

interface PopupProps {
  popup: popup;
}

const Popup: React.FC<PopupProps> = ({ popup }) => {
  const [minimized, setMinimized] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [position, setPosition] = useState({
    x: (window.innerWidth - 240) / 2,
    y: (window.innerHeight - 220) / 2,
    width: 240,
    height: 220,
  });
  const [isVisible, setIsVisible] = useState(true);
  const { removePopup, modifyPopupProp } = useKernal();

  const handleDrag: RndDragCallback = (e, d) => {
    setPosition((prevPosition) => ({
      ...prevPosition,
      x: d.x,
      y: d.y,
    }));
  };

  const handleResize: RndResizeCallback = (e, direction, ref, delta, newPosition) => {
    setPosition({
      x: newPosition.x,
      y: newPosition.y,
      width: ref.offsetWidth,
      height: ref.offsetHeight,
    });
  };

  const handleClose = () => {
    removePopup(popup.id);
  };

  const handleMinimize = () => {
    setIsVisible(false);
    setTimeout(() => {
      modifyPopupProp(popup.id, { minimized: !isVisible });
      setMinimized(!minimized);
    }, 300); // Delay for transition effect (optional, adjust as needed)
  };

  const handleConfirm = async () => {
    try {
      await popup.onAccept();
      setTimeout(() => {
        removePopup(popup.id);
      }, 300);
    } catch (e) {
      setError(e as string);
    }
  };

  // Ensure the window is visible if unminimized
  useEffect(() => {
    if (!popup.minimized) {
      setIsVisible(true);
    }
  }, [popup.minimized]);

  // Only render when visible
  if (!isVisible) return null;

  return (
    <Rnd
      className={`rounded-sm shadow-lg z-40 transition-opacity flex flex-col glass window popup`}
      size={{ width: position.width, height: position.height }}
      position={{ x: position.x, y: position.y }}
      dragHandleClassName="drag-handle"
      onDragStop={handleDrag}
      onResize={handleResize}
      style={{
        boxSizing: "border-box",
        minHeight: "100px",
        minWidth: "125px",
        maxWidth: window.innerWidth,
        maxHeight: window.innerHeight,
      }}
      minHeight={100}
      minWidth={125}
      enableResizing={popup.children !== undefined}
      bounds={document.body}
    >
      <div className="flex flex-col h-full">
        {/* Topbar */}
        <div className="flex flex-row items-center justify-between rounded-t-sm drag-handle cursor-move topbar">
          <h1 className="flex-grow font-semibold px-2">{popup.name}</h1>
          <div className="h-full flex">
            <button
              className="transition-all duration-100 active:scale-95 w-12 h-8 p-0 hover:bg-primary-light"
              onClick={handleMinimize}
            >
              <FontAwesomeIcon icon={faMinus} />
            </button>
            <button
              className="transition-all duration-100 active:scale-95 w-12 h-8 p-0 hover:bg-[#ff0000]"
              onClick={handleClose}
            >
              <FontAwesomeIcon icon={faX} />
            </button>
          </div>
        </div>
        <div className="flex flex-grow flex-col overflow-hidden p-4 text-sm">
          { !popup.children ? <>{ popup.appName && `${popup.appName} would like to make the following changes: `}
          <p className="font-bold" style={{ color: error !== "" ? "red" : "" }}>{ error === "" ? popup.description : error }</p>
          <div className="w-full flex justify-center items-center my-2">
            <Button onClick={() => handleConfirm()}>Confirm?</Button>
          </div>
          </> : popup.children }
        </div>
      </div>
    </Rnd>
  );
};

export default Popup;