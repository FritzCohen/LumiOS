import { useEffect, useState, useMemo, memo } from "react";
import Button from "../../../system/lib/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useApplications } from "../../../Providers/ApplicationProvider";
import { useKernal } from "../../../Providers/KernalProvider";
import { App } from "../../../utils/types";

interface AllAppsProps {
  setMenu: (prev: number) => void;
}

const AllApps: React.FC<AllAppsProps> = ({ setMenu }) => {
  const { addOpenedApp } = useKernal();
  const { installedApps } = useApplications();
  const [fadeIn, setFadeIn] = useState(true);

  // Memoize groupedApps so that it only recalculates when apps change
  const groupedApps = useMemo(() => {
    return Object.values(installedApps).reduce((acc: Record<string, App[]>, app: App) => {
      const firstLetter = app.name.charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(app);
      return acc;
    }, {});
  }, [installedApps]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeIn(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleItemClick = (app: App) => {     
    if (!app) return;

    addOpenedApp({
        name: app.actualName,
        minimized: false,
        maximized: false,
        svg: app.svg,
        path: app.path,
        type: 'exe',
    });

    setMenu(0);
  };

  return (
    <div className="relative w-full h-full overflow-y-auto">
      <div className="flex w-full justify-between items-center py-2 px-5 shadow-md sticky top-0 z-10 bg-primary">
        <h1 className="text-xl font-bold">All Apps</h1>
        <Button onClick={() => setMenu(0)}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </Button>
      </div>
      <div className={`mt-4 px-5 ${fadeIn ? "fade-in" : ""}`}>
        {Object.keys(groupedApps).sort().map((letter) => (
          <div key={letter} className="flex flex-col gap-1">
            <h2 className="font-semibold">{letter}</h2>
            <div className="flex flex-col gap-1">
              {groupedApps[letter].map((app, index) => (
                <div
                  key={index}
                  className="row-item"
                  onClick={() => handleItemClick(app)}
                >
                  <div className="w-10 h-10 mr-4">
                    {app.svg ? (
                      typeof app.svg === "string" ? (
                        app.svg.trim().startsWith("<svg") ||
                        app.svg.trim().startsWith("<img") ? (
                          <div
                            className="w-full h-full p-2 invert"
                            dangerouslySetInnerHTML={{ __html: app.svg }}
                          />
                        ) : (
                          <img
                            src={app.svg}
                            alt={app.name}
                            className="w-full h-full p-1"
                          />
                        )
                      ) : (
                        <FontAwesomeIcon icon={app.svg} />
                      )
                    ) : (
                      <div></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-md font-medium">{app.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(AllApps);