import React, { useState, useEffect, useRef, useMemo, CSSProperties } from "react";
import { Process } from "../../utils/types";
import { Rnd, RndResizeCallback, RndDragCallback } from "react-rnd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faWindowMaximize, faX, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { useTopbarContext } from "../../Providers/TopbarProvider";
import { useKernal } from "../../Providers/KernalProvider";
import useContextMenu from "../../components/ContextMenu/useContextMenu";
import ContextMenu from "../../components/ContextMenu/ContextMenu";
import virtualFS from "../../utils/VirtualFS";

interface WindowProps {
  app: Process & { Component?: React.FC; svg: string | IconDefinition };
  activeWindow: number | null
  setActiveWindow: (prev: number | null) => void
  children: React.ReactNode;
}

const Window: React.FC<WindowProps> = ({ app, activeWindow, setActiveWindow, children }) => {
  const [maximized, setMaximized] = useState<boolean>(false);
  const [windowStyle, setWindowStyle] = useState<object>({});
  const windowRef = useRef<Rnd & { resizableElement?: HTMLElement }>(null);
  const [position, setPosition] = useState({
    x: (window.innerWidth - 600) / 2,
    y: (window.innerHeight - 450) / 2,
    width: 600,
    height: 450,
  });

  const [originalPosition, setOriginalPosition] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const [isVisible, setIsVisible] = useState(false);
  const { addToTopbar, removeFromTopbar, modifyTopbarProp } = useTopbarContext();
  const { systemProps, modifyProp, removeOpenedApp } = useKernal();
  const { contextMenuPosition, contextMenuVisible, showContextMenu, hideContextMenu, contextMenuItems } = useContextMenu();

  useEffect(() => {
    const setFadeIn = () => {
      const windowElement = windowRef.current?.resizableElement?.current; // Access the underlying DOM element
      if (!windowElement) return;

      // Fade out with opacity transition
      windowElement.style.opacity = "1";
      windowElement.style.transition = "opacity 300ms ease"; // Adjust the duration and easing as needed
    };

    setFadeIn();
  }, []);

  useEffect(() => {
    // Register topbar items for maximize, minimize, and close
    addToTopbar({
      name: `${app.name}`,
      dropdownItems: [
        { name: "Fullscreen", action: handleFullscreen },
        { name: "Minimize", action: handleMinimize },
      ]
    });

    return () => {
      removeFromTopbar(app.name);
    }
  }, []);

  useEffect(() => {
    modifyTopbarProp(app.name, {
      dropdownItems: [
        { name: "Fullscreen", action: handleFullscreen },
        { name: "Minimize", action: handleMinimize },
      ]
    });


    setIsVisible(app.minimized);
    setMaximized(app.maximized);
  }, [app.maximized, app.minimized]);

  useEffect(() => {
    getStyles();
  }, []);

  const getStyles = async () => {
    const windowStyle = await virtualFS.readfile("/System/Plugins/", "Window");
    
    if (windowStyle) {
      const content = await windowStyle.content;
      setWindowStyle(JSON.parse(await content));
    }
  };

  const handleDrag: RndDragCallback = (e, d) => {
    if (maximized) return;
    
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
    const windowElement = windowRef.current?.resizableElement?.current; // Access the underlying DOM element
    if (!windowElement) return;
    
    // Fade out with opacity transition
    windowElement.style.opacity = "0";
    windowElement.style.transition = "opacity 300ms ease"; // Adjust the duration and easing as needed

    // Slide up with translateY
    /*
    windowElement.style.transform = "translateY(20px)";
    windowElement.style.transition += ", transform 300ms ease"; // Append to the existing transition
    */
    setTimeout(() => {
      removeOpenedApp(app.id);
    }, 200);
  };
  

  const handleMinimize = () => {
    setTimeout(() => {
      setIsVisible((prev) => !prev);
      modifyProp(app.id, {
        minimized: !app.minimized,
      });
    }, 300);
  };

  const handleFullscreen = () => {  
    if (maximized) {
      // Restore the original position and size
      if (originalPosition) {
        setPosition(originalPosition);
        setOriginalPosition(null); // Clear saved position
      }
    } else {
      // Save the current position and size before maximizing
      if (!originalPosition) {
        setOriginalPosition(position);
      }
      // Maximize the window
      setPosition({
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    setMaximized(!maximized);
    modifyProp(app.id, { maximized: !maximized }); // Use local state instead of app.maximized
  };  

  const handleMouseDown = () => {
    setActiveWindow(app.id);
  };

  const windowStyleMemo: CSSProperties = useMemo(() => ({
    boxSizing: "border-box",
    position: app.maximized ? "fixed" : "absolute",
    width: maximized ? window.innerWidth : position.width,
    height: maximized ? window.innerHeight : position.height,
    pointerEvents: isVisible ? "none" : "auto",
    minHeight: "400px",
    minWidth: "500px",
    maxWidth: window.innerWidth,
    maxHeight: window.innerHeight,
    transform: isVisible ? "scale(0.0)" : "scale(1)",
    transition: isVisible || maximized ? "ease 100ms" : "",
    opacity: isVisible ? 0 : 1,
    zIndex:  activeWindow == app.id ? 40 : 39,
    filter: activeWindow != app.id ? "brightness(69%)" : "",
  }), [maximized, isVisible, activeWindow, position]);  
  
  return (
    <Rnd
      className={`rounded-sm shadow-lg flex flex-col ${Object.keys(windowStyle).length == 0 && "glass"} window
        ${
          app.maximized ? "mt-7" : ""
        }
      `}
      size={{ width: position.width, height: position.height }}
      position={{ x: position.x, y: position.y }}
      onResize={handleResize}
      onMouseDown={handleMouseDown}
      disableDragging={app.maximized}
      dragHandleClassName="drag-handle"
      ref={windowRef}
      id={app.id}
      style={windowStyleMemo}
      minHeight={200}
      minWidth={250}
      bounds={document.body}
      onDragStop={(e, d) => {
        if (maximized) return;
        setPosition((prev) => ({ ...prev, x: d.x, y: d.y }));
      }}
      onResizeStop={(e, direction, ref, delta, newPosition) => {
        setPosition({
          x: newPosition.x,
          y: newPosition.y,
          width: ref.offsetWidth,
          height: ref.offsetHeight,
        });
      }}
    >
      <div className="flex flex-col h-full" onContextMenu={(e) => showContextMenu(e, [
        { name: "About", action: () => {} },
        { name: "Minimize", icon: faMinus, action: handleMinimize, },
        { name: "Maximize", icon: faWindowMaximize, action: handleFullscreen, },
        { name: "Close", icon: faX, action: handleClose, },
      ], `#${app.id}`)}>
        {/* Topbar */}
        <div 
          className="flex flex-row items-center justify-between rounded-t-sm drag-handle cursor-move topbar" 
          style={{
            ...windowStyle
          }}
          onDoubleClick={handleFullscreen}
        >
          {app.svg ? (
            typeof app.svg === "string" ? (
              // Check if the string starts with "<svg" or "<img"
              app.svg.trim().startsWith("<svg") || app.svg.trim().startsWith("<img") ? (
                <div
                  className="w-6 h-6 p-1 invert pointer-events-none"
                  dangerouslySetInnerHTML={{ __html: app.svg }}
                />
              ) : (
                // Otherwise, treat it as a regular image URL
                <img src={app.svg} alt={app.name} className="w-6 h-6 p-1 pointer-events-none" />
              )
            ) : (
              // If it's not a string, assume it's a FontAwesome icon object
              <FontAwesomeIcon icon={app.svg} />
            )
          ) : (
            // If no icon, display the app name
            <div>{app.name}</div>
          )}
          <h1 className="flex-grow font-semibold px-2">{app.name}</h1>
          <div className="h-full flex">
            <button
              className="transition-all duration-100 active:scale-95 w-12 h-8 p-0 hover:bg-primary-light"
              onClick={handleMinimize}
            >
              <FontAwesomeIcon icon={faMinus} />
            </button>
            <button
              className="transition-all duration-100 active:scale-95 w-12 h-8 p-0 hover:bg-primary-light"
              onClick={handleFullscreen}
            >
              <FontAwesomeIcon icon={faWindowMaximize} />
            </button>
            <button
              className="transition-all duration-100 active:scale-95 w-12 h-8 p-0 hover:bg-[#ff0000]"
              onClick={handleClose}
            >
              <FontAwesomeIcon icon={faX} />
            </button>
          </div>
        </div>
        {/* Content */}
        <div className={`flex-grow overflow-hidden ${systemProps.enableWindowBackground ? "window-content" : Object.keys(windowStyle).length == 0 ? "" : "glass"}`} style={{ paddingBottom: maximized ? "80px" : "0" }}>
          {children}
        </div>
      </div>
      {contextMenuVisible && <ContextMenu menuPosition={contextMenuPosition} menuItems={contextMenuItems} hideMenu={hideContextMenu} />}
    </Rnd>
  );
};

export default Window;