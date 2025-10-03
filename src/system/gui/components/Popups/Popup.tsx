import { ReactNode, useLayoutEffect } from "react";
import { OpenedApp } from "../../../../context/kernal/kernal";
import { useKernel } from "../../../../hooks/useKernal";
import popupIcon from "../../../../assets/Icons/new-window.png";
import "./popups.css";

interface PopupProps {
  app: OpenedApp;
  children: ReactNode | ((utils: { id: string; complete: (result?: any) => void }) => ReactNode);
  width?: number;
  height?: number;
  disableClose?: boolean;
  disableMinimize?: boolean;
  closeOnComplete?: boolean;
  frozenBackground?: boolean;
  allowOverflow?: boolean;
}

const Popup: React.FC<PopupProps> = ({
  app,
  children,
  width = 250,
  height = 175,
  disableClose = false,
  disableMinimize = false,
  closeOnComplete = false,
  frozenBackground = false,
  allowOverflow = false,
}) => {
  const { closeApp, modifyProp, bringToFront } = useKernel();

  useLayoutEffect(() => {
    if (!app?.id) return;

    bringToFront(app.id);

    modifyProp(app.id, "width", width);
    modifyProp(app.id, "height", height);
    modifyProp(app.id, "disableClose", disableClose);
    modifyProp(app.id, "disableMinimize", disableMinimize);
    modifyProp(app.id, "executable", {
      ...app.executable,
      config: {
        ...app.executable.config,
        icon: popupIcon
      }
    })

    if (frozenBackground) {
      modifyProp(app.id, "freezeBackground", true);
    }
  }, [width, height, app?.width, app?.height]);

  const complete = (result?: any) => {
    // Safely check for config
    const handler = app.executable?.config?.onCompleteHandler;
    if (typeof handler === "function") {
      handler(result);
    }

    if (closeOnComplete) {
      closeApp(app.id);
    }
  };

  // If children is a function, call it with complete, else render children as-is
  const content = typeof children === "function"
    ? children({ id: app.id, complete })
    : children;

  return (
    <>
      <div style={{ position: "relative", background: "", zIndex: 9999 }} className={`w-full h-full ${allowOverflow ? "overflow-auto" : ""}`}>
        {content}
      </div>
    </>
  );
};

export default Popup;