import { useState, useEffect } from "react";
import Desktop from "./system/Desktop";
import Theme from "./utils/Theme";
import virtualFS from "./utils/VirtualFS";
import Loading from "./components/Loading/Loading";
import { useUser } from "./Providers/UserProvider";
import FirstStart from "./components/FirstStart/FirstStart";
import Login from "./components/Login/Login";
import BootScreen from "./components/Bootscreen/BootScreen";

/**
 * App Comopnent
 * 
 * Holds and manages login, desktop, etc...
 */
function App() {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [firstStart, setFirstStart] = useState<boolean>(false);
  const [bootscreen, setBootscreen] = useState<boolean>(false);
  const [fadeOut, setFadeOut] = useState(false);
  const { users, currentUser, loggedIn, setLoggedIn, setCurrentUser } = useUser();

  const setStyles = async () => {
  if (!currentUser) return;    

    await Theme.setTheme(currentUser.theme, false, currentUser);
    await Theme.setBackground(currentUser.backgroundImage, false, currentUser);
  };

  useEffect(() => {
    // if (loaded) return;
    
    // Autologin stuffs
    const autoUser = users.find((user) => user.autoLogin);
    
    if (autoUser) {
      setTimeout(() => {
        setCurrentUser(autoUser);
        setStyles();
        setLoggedIn(true);
      }, 300)
      
      Theme.setPanic(autoUser.panic);
    }
  }, [loading, users]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (currentUser && currentUser.panic && event.key === currentUser.panic.key) {
        window.location.href = currentUser.panic.website;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentUser?.panic]);

  useEffect(() => {
    if (!loading) {
      setFadeOut(true);
    }
  }, [loading]);

  const handleAnimationEnd = () => {
    if (fadeOut) {
      setFadeOut(false); // Ensure animation finishes before hiding completely
    }
  };

  useEffect(() => {
    if (loaded) return;  

    const applyBg = async () => {
      await virtualFS.initialize();
      try {
        if (loaded) return;
        if (!currentUser) return;

        await virtualFS.initialize();
        /*
        // Old version for using the Theme and BGimage files not user preference
        const fetchedTheme = await virtualFS.readfile("System/", "Theme");
        const fetchedBG = await virtualFS.readfile("System/", "BackgroundImage");
        
        if (fetchedTheme.content) {          
          await Theme.setTheme(await fetchedTheme.content, false);
        }
        if (fetchedBG.content) {
          await Theme.setBackground(await fetchedBG.content, false);
        }

        console.log(fetchedTheme, fetchedBG);
        */

        // Set the styles
        setStyles();

        setLoaded(true);
      } catch (error) {
        console.error("Error applying background or theme:", error);
      }
    };

    applyBg();
  }, [loaded, currentUser]);

  return (
    <div className="w-full h-full relative">
      {/* Keep the loading screen div rendered but remove it after fade out */}
      <div 
        className={`loading-screen ${fadeOut ? "fade-out" : ""}`} 
        onAnimationEnd={handleAnimationEnd}
      >
        {!fadeOut && <Loading setLoading={setLoading} />}
      </div>
      {loading && (
        <div className="group group-hover:scale-100 absolute bottom-0 right-0" style={{ color: "white", zIndex: 1000 }}>
          <button className="scale-0 group-hover:scale-100" onClick={() => setBootscreen(true)}>Bootscreen</button>
        </div>
      )}
      {/* Render other components once loading is complete */}
      {!loading && (
        <>
          {firstStart ? (
            <FirstStart setFirstStart={setFirstStart} />
          ) : loggedIn ? (
            bootscreen ? (
              <BootScreen setShowBootScreen={setBootscreen} />
            ) : (
              <Desktop setShowBootScreen={setBootscreen} />
            )
          ) : (
            <Login />
          )}
        </>
      )}
    </div>
  );
}

export default App;