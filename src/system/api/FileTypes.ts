const fileTypes = {
    "txt": {
        name: "Text File",
        icon: "faTextFile",
        description: "Plain text file",
        mimeType: "text/plain"
    },
    "theme": {
        name: "Theme File",
        icon: "faThemeFile",
        description: "Plain theme file",
        mimeType: "text/plain"
    },
    "img": {
        name: "Image File",
        icon: "faImageFile",
        description: "Image file",
        mimeType: "image/*"
    },
    "exe": {
        name: "Executable File",
        icon: "faExecutableFile",
        description: "Executable application",
        mimeType: "application/x-executable"
    },
    "js": {
        name: "JavaScript File",
        icon: "faJavaScriptFile",
        description: "JavaScript source code file",
        mimeType: "application/javascript"
    },
    "css": {
        name: "CSS File",
        icon: "faCSSFile",
        description: "Cascading Style Sheets file",
        mimeType: "text/css"
    },
    "html": {
        name: "HTML File",
        icon: "faHTMLFile",
        description: "HyperText Markup Language file",
        mimeType: "text/html"
    },
    "sys": {
        name: "System File",
        icon: "faSystemFile",
        description: "System configuration file",
        mimeType: "application/x-system"
    },
    "shortcut": {
        name: "Shortcut",
        icon: "faShortcut",
        description: "File shortcut",
        mimeType: "application/x-shortcut"
    },
    "game": {
        name: "Game File",
        icon: "faGame",
        desciption: "Online Game Reference",
        mimeType: "application/x-playgame"
    },
    "swf": {
        name: "SWF File",
        icon: "faSWF",
        desciption: "Flash Game Cartridge",
        mimeType: "application/x-playgame"
    }
}

export default fileTypes;
export type FileType = keyof typeof fileTypes;