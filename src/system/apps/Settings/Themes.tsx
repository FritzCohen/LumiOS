import { useEffect, useState, useCallback } from "react";
import virtualFS from "../../../utils/VirtualFS";
import { File, SystemProps, Theme } from "../../../utils/types";
import { images } from "../../../utils/Process";
import theme from "../../../utils/Theme";
import { useKernal } from "../../../Providers/KernalProvider";
import Select from "../../lib/Select";
import { useUser } from "../../../Providers/UserProvider";

const Themes = () => {
    const [themes, setThemes] = useState<{ value: Theme; name: string }[]>([]);
    const [defaultTheme, setDefaultTheme] = useState("");
    const { systemProps: defaultProps, updateSystemProp } = useKernal();
    const { currentUser, modifyUserProp } = useUser();
    const [systemProps, setSystemProps] = useState<SystemProps>(defaultProps);

    // Load themes once
    useEffect(() => {
        let isMounted = true;

        const getThemes = async () => {
            try {
                const storedThemes = await virtualFS.readdir("System/Themes");
                const themeData = Object.keys(storedThemes).map((name) => ({
                    name,
                    value: (storedThemes[name] as File).content as Theme,
                }));
                if (isMounted) setThemes(themeData);

                const activeTheme = await virtualFS.readfile("System/", "Theme");
                if (isMounted) setDefaultTheme(await activeTheme.content);
            } catch (error) {
                console.error("Error loading themes:", error);
            }
        };

        getThemes();
        return () => { isMounted = false; };
    }, []);

    // Keep systemProps in sync without causing unnecessary re-renders
    useEffect(() => {
        setSystemProps((prev) => (prev === defaultProps ? prev : defaultProps));
    }, [defaultProps]);

    const applyImage = useCallback(
        (index: number) => {
            const selectedImage = images[index];

            // Apply the background image instantly to avoid lag
            document.documentElement.style.setProperty("--background-image", `url(${selectedImage})`);

            if (currentUser && modifyUserProp) {
                modifyUserProp({ ...currentUser, backgroundImage: selectedImage }, currentUser.username)
                    .catch((error) => console.error("Failed to update user background:", error));
            }
        },
        [currentUser, modifyUserProp]
    );

    const applyTheme = useCallback(
        async (them: Theme) => {
            await theme.setTheme(them, true, currentUser, modifyUserProp);
        },
        [currentUser, modifyUserProp]
    );

    const updateSystemProps = useCallback(
        (newProps: Partial<SystemProps>) => {
            setSystemProps((prev) => ({ ...prev, ...newProps }));
            updateSystemProp({ ...systemProps, ...newProps });
        },
        [systemProps, updateSystemProp]
    );

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = async (e: ProgressEvent<FileReader>) => {
                if (e.target?.result && currentUser) {
                    const image = e.target.result as string;
                    await modifyUserProp({ ...currentUser, backgroundImage: image }, currentUser.username)
                        .catch((error) => console.error("Failed to update user background:", error));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="p-5">
            <h2 className="text-2xl font-bold my-2">Themes</h2>
            <Select defaultValue={defaultTheme} onChange={(e) => applyTheme(themes[parseInt(e.target.value)].value)}>
                {themes.map((theme, index) => (
                    <option value={index} key={index} className="option-main">
                        {theme.name.charAt(0).toUpperCase() + theme.name.slice(1).replace("Theme", "")}
                    </option>
                ))}
            </Select>

            <h2 className="text-2xl font-bold my-2">Taskbar</h2>
            <div className="flex flex-col gap-1 w-fit">
                <Select defaultValue={systemProps.taskbar} onChange={(e) => updateSystemProps({ taskbar: e.target.value as "full" | "floating" })}>
                    <option value="full">Full</option>
                    <option value="floating">Floating</option>
                </Select>
                <Select defaultValue={systemProps.taskbarAlign} onChange={(e) => updateSystemProps({ taskbarAlign: e.target.value as "start" | "center" | "end" })}>
                    <option value="start">Start</option>
                    <option value="center">Center</option>
                    <option value="end">End</option>
                </Select>
                <Select defaultValue={String(systemProps.onHoverTaskbar)} onChange={(e) => updateSystemProps({ onHoverTaskbar: e.target.value === "true" })}>
                    <option value="false">Always seen</option>
                    <option value="true">Show on hover</option>
                </Select>
            </div>
            <h2 className="text-2xl font-bold my-2">Topbar</h2>
            <div className="flex flex-col gap-1 w-fit">
                <Select defaultValue={String(systemProps.showTopbar)} onChange={(e) => updateSystemProps({ showTopbar: e.target.value === "true" })}>
                    <option value="true">Show</option>
                    <option value="false">Hide</option>
                </Select>
                <Select defaultValue={String(systemProps.onHoverTopbar)} onChange={(e) => updateSystemProps({ onHoverTopbar: e.target.value === "true" })}>
                    <option value="false">Always seen</option>
                    <option value="true">Show on hover</option>
                </Select>
            </div>
            <h2 className="text-2xl font-bold my-2">Background for Windows</h2>
            <div className="flex flex-col gap-1 w-fit">
                <Select defaultValue={String(systemProps.enableWindowBackground)} onChange={(e) => updateSystemProps({ enableWindowBackground: e.target.value === "true" })}>
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                </Select>
            </div>
            <div className="my-2 flex flex-row justify-between items-center">
                <h2 className="text-2xl font-bold my-2">Backgrounds</h2>
                <label htmlFor="file-upload" className="custom-file-upload">
                    Upload
                </label>
                <input id="file-upload" type="file" title="Image Upload" accept="image/*" onChange={handleImageUpload} />
            </div>

            <div className="grid grid-cols-2 gap-2">
                {images.map((image, index) => (
                    <img
                        src={image}
                        alt="Default Image"
                        loading="lazy"
                        className="cursor-pointer transition-all duration-200 hover:brightness-75 hover:shadow-md shadow-sm h-full rounded"
                        key={index}
                        onClick={() => applyImage(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Themes;