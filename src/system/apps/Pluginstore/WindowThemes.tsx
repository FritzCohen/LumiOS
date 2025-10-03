import virtualFS from "../../../utils/VirtualFS";

const WindowThemes = () => {
    const applyPlugin = async (plugin: string): Promise<void> => {
        await virtualFS.updateFile("System/Plugins/", "Window", plugin, "sys");
      };
    
    const mapPlugins = (plugins: { [key: string]: string }) => {
        return Object.keys(plugins).map((pluginName, index) => (
          <div
            style={JSON.parse(plugins[pluginName])}
            onClick={() => applyPlugin(plugins[pluginName])}
            key={index}
          >
            {pluginName}
          </div>
        ));
    };
    
    const windowPlugins = {
        Default: JSON.stringify({
          
        }),
        OldLumiOS: JSON.stringify({
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "brightness(75%)",
          backdropBrightness: "75%",
          color: "white",
          cursor: "move",
          borderTopLeftRadius: "0.275rem",
        }),
        clearGlassStyle: JSON.stringify({
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          backgroundColor: "rgba(255, 255, 255, 0.2)", // Transparent white
          color: "white",
          cursor: "move",
          borderTopLeftRadius: "0.375rem",
          borderTopRightRadius: "0.375rem",
        }),
        frostedGlassStyle: JSON.stringify({
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          backgroundColor: "rgba(255, 255, 255, 0.4)", // Semi-transparent white
          color: "white",
          cursor: "move",
          borderTopLeftRadius: "0.375rem",
          borderTopRightRadius: "0.375rem",
        }),
        windows10Style: JSON.stringify({
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          backgroundColor: "#333", // Dark gray background (Windows 10)
          color: "#fff", // White text color
          cursor: "move",
          borderRadius: "3px", // Slightly rounded corners
          boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.1)", // Windows 10 shadow
        }),
        windows11Style: JSON.stringify({
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          backgroundColor: "#1f1f1f", // Dark gray background (Windows 11)
          color: "#fff", // White text color
          cursor: "move",
          borderRadius: "3px", // Slightly rounded corners
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)", // Windows 11 shadow
        }),
        macStyle: JSON.stringify({
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          backgroundColor: "rgba(48, 48, 48, 0.6)", // Dark gray similar to macOS with 0.6 opacity
          color: "white",
          cursor: "move",
          borderTopLeftRadius: "0.375rem",
          borderTopRightRadius: "0.375rem",
        }),
    };

    return (
        <>
        <h2 className="font-bold text-xl my-2">Window Plugins</h2>
        <div
          className="p-2 flex flex-col gap-4"
          style={{
            background: "var(--background-image), none",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        >
          {mapPlugins(windowPlugins)}
        </div>
        </>
     );
}
 
export default WindowThemes;