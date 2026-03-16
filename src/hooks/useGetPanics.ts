import { useState } from "react";
import { ColorTheme } from "../context/user/userTypes";
import { useFolderWatcher } from "../system/api/useFolderWatcher";
import { File } from "../system/api/types";

/**
 * A short hook to remove the duplicate logic in Themes.tsx and the CreateUserPopup n'shit
 * 
 * @returns Themes
 */
const useGetPanics = (): ColorTheme[] => {
    const [themes, setThemes] = useState<ColorTheme[]>([]);

    useFolderWatcher("System/DefaultPanics/", (entries) => {
        const themes = Object.values(entries)
            .filter(
                (entry): entry is File =>
                    entry.type === "file" && entry.fileType === "theme"
            )
            .map((file) => file.content as ColorTheme);

        setThemes(themes);
    });

    return themes;
};

export default useGetPanics;