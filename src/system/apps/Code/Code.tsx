import CodeMirror, { Extension } from '@uiw/react-codemirror';
import Button from '../../lib/Button';
import { ReactNode, useEffect, useState } from 'react';
import virtualFS from '../../../utils/VirtualFS';
import { Permission } from '../../../utils/types';
import "./Code.css";
import { useKernal } from '../../../Providers/KernalProvider';
import PopupContent from './PopupContent';
import { langs } from '@uiw/codemirror-extensions-langs';
import Select from '../../lib/Select';
import Input from '../../lib/Input';
import { useUser } from '../../../Providers/UserProvider';
import CreateApp from './CreateApp';

interface File {
    id: number;
    name: string;
    type: string;
    content: string;
    stringified: boolean
}

const Code = () => {
    const { currentUser } = useUser();
    const [directory, setDirectory] = useState<string>(`/Users/${currentUser?.username}/Code/Default/`);
    const [newDirectory, setNewDirectory] = useState<string>(`/Users/${currentUser?.username}/Code/Default/`);
    const [currentMenu, setCurrentMenu] = useState<number>(0);
    const [files, setFiles] = useState<File[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(files[0]);
    const [newFileName, setNewFileName] = useState<string>('');
    const [newFileType, setNewFileType] = useState<string>('JavaScript');
    const { addPopup, removePopup } = useKernal();

    useEffect(() => {
        fetchFiles();
        setSelectedFile(null);

        return () => {
            handleFileSave();
        };
    }, [directory]);

    const fetchFiles = async () => {
        try {
            // Get files from the virtual filesystem
            await virtualFS.initialize();
            const directoryContents = await virtualFS.readdir(directory);
            console.log(directoryContents);

            // Transform the data to match the File interface
            const filesList = Object.keys(directoryContents).length > 0 
            ? Object.keys(directoryContents).reduce((acc, fileName, index) => {
                const fileData = directoryContents[fileName];
        
                if (fileData.type === "directory") {
                    return acc; // Skip directories
                }
        
                const fileType = getFileType(fileData.fileType as string);
                
                let content = fileData.content;
                let stringified = false;

                if (typeof content !== "string") {
                    content = JSON.stringify(content);
                    stringified = true;
                }
                            
                acc.push({
                    id: index + 1, // Unique identifier
                    name: fileName,
                    type: fileType, // Map fileType to a readable type
                    content: content, // File content
                    stringified: stringified,
                });
        
                return acc;
            }, [] as Array<{ id: number; name: string; type: string; content: any, stringified: boolean }>)
            : [];        

            // Set the files state with the transformed data
            setSelectedFile(filesList[0]);
            setFiles(filesList);
        } catch (error) {
            console.error("Error fetching files:", error);
        }
    };

    const handleFileSave = async () => {
        files.map(async (file) => {
            let fixedContent = file.content;

            if (file.stringified) {
                fixedContent = JSON.parse(fixedContent);
            }

            await virtualFS.updateFile(directory, file.name, fixedContent, getNormalType(file.type));
            console.log(file);
        });
    };

    // Helper function to map file types
    const getFileType = (fileType: string): string => {
        switch (fileType) {
            case 'js':
            case 'javascript':
                return 'JavaScript';
            case 'css':
                return 'CSS';
            case 'html':
                return 'HTML';
            case "py":
                return "PYTHON";
            default:
                return "";
        }
    };

    const getNormalType = (fileType: string): string => {
        switch (fileType) {
            case 'JavaScript':
                return 'js';
            case 'CSS':
                return 'css';
            case 'HTML':
                return 'html';
            case "PYTHON":
                return "py";
            default:
                return fileType;
        }
    };

    // Handle file selection from sidebar
    const handleFileClick = (file: File) => {
        const hasChanges = files.some((f) =>
            f.id === selectedFile?.id && f.content !== selectedFile.content
        );

        // Save changes to the currently selected file before switching
        if (hasChanges) {
            console.log(files);
            
            setFiles((prevFiles) =>
                prevFiles.map((f) =>
                    f.id == selectedFile?.id ? { ...f, content: selectedFile.content } : f
                )
            );
    
            handleFileSave();
        }

        // Set the new selected file
        setCurrentMenu(1);
        setSelectedFile(file);
    };

    // Handle creating a new file
    const handleCreateNewFile = async () => {
        const newFile: File = {
            id: files.length + 1,
            name: newFileName,
            type: newFileType,
            content: '',
            stringified: false,
        };

        await virtualFS.writeFile(directory, newFileName, '', getNormalType(newFileType));

        setFiles([...files, newFile]);
        setSelectedFile(newFile);
        setNewFileName('');
    };

    // Replaces external script and link references with inline code
    const inlineExternalResources = (htmlContent: string): string => {
        let updatedContent = htmlContent;

        // Inline JavaScript files
        files.forEach((file) => {
            if (file.type === 'JavaScript') {
                const scriptTag = `<script src="./${file.name}"></script>`;
                const inlineScriptTag = `<script>${file.content}</script>`;            
                updatedContent = updatedContent.replace(scriptTag, inlineScriptTag);
            }

            // Inline CSS files
            if (file.type === 'CSS') {
                const linkTag = `<link rel="stylesheet" href="./${file.name}">`;
                const inlineStyleTag = `<style>${file.content}</style>`;
                updatedContent = updatedContent.replace(linkTag, inlineStyleTag);
            }

            // Python using brython's latest version. it uses cdn in the index.html file
            if (file.type === "PYTHON") {
                const scriptTag = `<script src="./${file.name}"></script>`;
                const inlineScriptTag = `<script type="text/python">${file.content}</script>`;
                const brythonTag = `
                    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/brython@3.12/brython.min.js"></script>
                    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/brython@3.12/brython_stdlib.js"></script>
                `;

                updatedContent = updatedContent.replace(scriptTag, inlineScriptTag);
                updatedContent = updatedContent.replace("<body", "<body onload='Brython();' ");

                updatedContent += brythonTag;
            }
        });

        return updatedContent;
    };


    // Hyperlink file names in the content and make them clickable
    const renderFileContentWithLinks = (content: string) => {
        return content.split(' ').map((word, index) => {
            const linkedFile = files.find(f => f.name === word);
            if (linkedFile) {
                return (
                    <a
                        key={index}
                        href="#"
                        className="text-blue-500 underline"
                        onClick={() => handleFileClick(linkedFile)}
                    >
                        {word}
                    </a>
                );
            } else {
                return <span key={index}>{word} </span>;
            }
        });
    };

    const changeDirectory = () => {
        handleFileSave();
        setDirectory(newDirectory);
    };

    const handleResultClick = () => {
        const hasChanges = files.some(
            (f) => f.id === selectedFile?.id && f.content !== selectedFile.content
        );

        console.log(hasChanges);
        
    
        if (hasChanges) handleFileSave();
    
        if (selectedFile?.type !== "HTML") {
            files.forEach((file) => {
                if (file.type === "HTML") {
                    setSelectedFile(file);
                    setFiles((prevFiles) =>
                        prevFiles.map((f) =>
                            f.id === selectedFile?.id
                                ? { ...f, content: selectedFile.content }
                                : f
                        )
                    );
                }
            });
        }
    
        setCurrentMenu(2);
    };    

    const handleCreateNewFolder = async () => {
        const folderName = prompt("Project name: ");

        if (folderName) {
            await virtualFS.writeDirectory("/System/Code/", folderName, Permission.USER);

            setDirectory(`/System/Code/${folderName}/`);

            const input: HTMLInputElement = document.querySelector(".file-input")!;

            if (input) {
                input.value = `/System/Code/${folderName}/`;
            }
        };
    };

    const handleOpenProject = async () => {
        const name = `File Picker`;

        addPopup({
            name: name,
            description: "",
            minimized: false,
            onAccept: async () => {},
            children: (<PopupContent direct={directory} setDirect={setDirectory} index={name} type="directory" />)
        });
    };

    const getLanguage = (type?: string): Extension => {
        switch (type) {
            case "JavaScript": return langs.javascript();
            case "HTML": return langs.html();
            case "CSS": return langs.css();
            case "PY": return langs.python();
            default: return langs.javascript();
        }
    };

    const handleCompile = async () => {
        const html = files.find(file => file.type === "HTML");

        if (!html) return;

        const code = inlineExternalResources(html.content);
        const defaultName = directory.trim().split("/")[directory.trim().split("/").length-2];
        console.log(code, defaultName);
        

        addPopup({
            name: "Create App",
            description: `Add an installed app.`,
            appName: "Visual Code",
            minimized: false,
            onAccept: async () => {},
            children: <CreateApp 
            name={"Create App"} closePopup={() => removePopup("Create App")} 
            defaultName={defaultName} html={code} />
        });
    };

    const getMenu = (): ReactNode => {
        switch (currentMenu) {
            case 0:
                return (
                    <div className="flex flex-col gap-2 px-4 py-2 overflow-y-scroll">
                        <input
                            className="input-main file-input"
                            type="text"
                            placeholder={directory}
                            defaultValue={directory}
                            onChange={(e) => setNewDirectory(e.target.value)}
                        />
                        <Button onClick={changeDirectory}>Change Directory</Button>
                        <Button onClick={handleCreateNewFolder}>New Project</Button>
                        <Button onClick={handleOpenProject}>Open Project</Button>
                        <Button onClick={handleCompile}>Compile as App</Button>
                        <h3 className="font-semibold">Notes: </h3>
                        <p style={{ color: "" }}>
                            <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
                                <li>Content is displayed through an iframe</li>
                                <li>Only one HTML file may be used; if two are provided, the last one will be displayed.</li>
                                <li>When sourcing another file, use <code>./filename.type</code>.</li>
                                <li>When creating a file, ensure the file type is included at the end, e.g., <code>index.html</code>.</li>
                            </ul>
                        </p>
                    </div>
                )
            case 1:
                return (
                    <CodeMirror
                    value={selectedFile ? selectedFile.content : ''}
                    extensions={[ getLanguage(selectedFile?.type) ]}
                    theme="dark"
                    height="100%"
                    onChange={(value) => {
                        if (selectedFile) {
                            setSelectedFile({ ...selectedFile, content: value });
                        }
                    }}
                    className="w-full h-full bg-none cursor-text overflow-y-auto"
                />
                )
            case 2:
                return (
                    <div className="w-full h-full">
                        {selectedFile?.type === 'HTML' ? (
                            // Properly render the HTML content in an iframe with inlined scripts/styles
                            <iframe srcDoc={inlineExternalResources(selectedFile.content)} className="w-full h-full" />
                        ) : (
                            <div className="p-4">
                                {selectedFile && renderFileContentWithLinks(selectedFile.content)}
                            </div>
                        )}
                    </div>
                );
        }
    };


    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === "iframeRequest") {
                console.log("Function requested by iframe:", event.data.data);
                executeFunctionOnMainPage(event.data.data);
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    const executeFunctionOnMainPage = (data: any) => {
        alert(`Function executed on main page with data: ${JSON.stringify(data)}`);
        // You can replace this with any function logic you need
    };

    const getIcon = (type: string): ReactNode => {        
        switch (type.toLowerCase()) {
            case "html": return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" className='w-6 h-6 invert'><path d="M0 32l34.9 395.8L191.5 480l157.6-52.2L384 32H0zm308.2 127.9H124.4l4.1 49.4h175.6l-13.6 148.4-97.9 27v.3h-1.1l-98.7-27.3-6-75.8h47.7L138 320l53.5 14.5 53.7-14.5 6-62.2H84.3L71.5 112.2h241.1l-4.4 47.7z"/></svg>
            case "javascript": return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className='w-6 h-6 invert'><path d="M0 32v448h448V32H0zm243.8 349.4c0 43.6-25.6 63.5-62.9 63.5-33.7 0-53.2-17.4-63.2-38.5l34.3-20.7c6.6 11.7 12.6 21.6 27.1 21.6 13.8 0 22.6-5.4 22.6-26.5V237.7h42.1v143.7zm99.6 63.5c-39.1 0-64.4-18.6-76.7-43l34.3-19.8c9 14.7 20.8 25.6 41.5 25.6 17.4 0 28.6-8.7 28.6-20.8 0-14.4-11.4-19.5-30.7-28l-10.5-4.5c-30.4-12.9-50.5-29.2-50.5-63.5 0-31.6 24.1-55.6 61.6-55.6 26.8 0 46 9.3 59.8 33.7L368 290c-7.2-12.9-15-18-27.1-18-12.3 0-20.1 7.8-20.1 18 0 12.6 7.8 17.7 25.9 25.6l10.5 4.5c35.8 15.3 55.9 31 55.9 66.2 0 37.8-29.8 58.6-69.7 58.6z"/></svg>
            case "css": return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" className='w-6 h-6 invert'><path d="M0 32l34.9 395.8L192 480l157.1-52.2L384 32H0zm313.1 80l-4.8 47.3L193 208.6l-.3 .1h111.5l-12.8 146.6-98.2 28.7-98.8-29.2-6.4-73.9h48.9l3.2 38.3 52.6 13.3 54.7-15.4 3.7-61.6-166.3-.5v-.1l-.2 .1-3.6-46.3L193.1 162l6.5-2.7H76.7L70.9 112h242.2z"/></svg>
            case "py": return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className='w-6 h-6 invert'><path d="M439.8 200.5c-7.7-30.9-22.3-54.2-53.4-54.2h-40.1v47.4c0 36.8-31.2 67.8-66.8 67.8H172.7c-29.2 0-53.4 25-53.4 54.3v101.8c0 29 25.2 46 53.4 54.3 33.8 9.9 66.3 11.7 106.8 0 26.9-7.8 53.4-23.5 53.4-54.3v-40.7H226.2v-13.6h160.2c31.1 0 42.6-21.7 53.4-54.2 11.2-33.5 10.7-65.7 0-108.6zM286.2 404c11.1 0 20.1 9.1 20.1 20.3 0 11.3-9 20.4-20.1 20.4-11 0-20.1-9.2-20.1-20.4 .1-11.3 9.1-20.3 20.1-20.3zM167.8 248.1h106.8c29.7 0 53.4-24.5 53.4-54.3V91.9c0-29-24.4-50.7-53.4-55.6-35.8-5.9-74.7-5.6-106.8 .1-45.2 8-53.4 24.7-53.4 55.6v40.7h106.9v13.6h-147c-31.1 0-58.3 18.7-66.8 54.2-9.8 40.7-10.2 66.1 0 108.6 7.6 31.6 25.7 54.2 56.8 54.2H101v-48.8c0-35.3 30.5-66.4 66.8-66.4zm-6.7-142.6c-11.1 0-20.1-9.1-20.1-20.3 .1-11.3 9-20.4 20.1-20.4 11 0 20.1 9.2 20.1 20.4s-9 20.3-20.1 20.3z"/></svg>;
            default: return <div></div>
        }
    };

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex flex-row gap-2 mb-1">
                <Button onClick={() => setCurrentMenu(0)} className={`${currentMenu == 0 ? "!bg-secondary" : ""}`}>File</Button>
                <Button onClick={() => setCurrentMenu(1)} className={`${currentMenu == 1 ? "!bg-secondary" : ""}`}>Code</Button>
                <Button onClick={handleResultClick} className={`${currentMenu == 2 ? "!bg-secondary" : ""}`}>Result</Button>
            </div>
            <div className="flex flex-row h-full">
                {/* Sidebar with file list */}
                <div className="flex flex-col w-1/4 p-2 code-sidebar">
                    <h3 className="mb-4">Files</h3>
                    <ul>
                        {files.map(file => (
                            <li
                                key={file.id}
                                className={`cursor-pointer p-2 transition-colors duration-200 flex items-center justify-start gap-1 rounded ${selectedFile?.id === file.id ? 'bg-primary' : ''}`}
                                onClick={() => handleFileClick(file)}
                            >
                                {getIcon(file.type)}
                                {file.name}
                            </li>
                        ))}
                    </ul>
                    {/* New file creation form */}
                    <div className="mt-4 flex flex-col gap-2">
                        <Input
                            type="text"
                            placeholder="File Name"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                        />
                        <Select
                            value={newFileType}
                            onChange={(e) => setNewFileType(e.target.value)}
                        >
                            <option value="JavaScript">JavaScript</option>
                            <option value="CSS">CSS</option>
                            <option value="HTML">HTML</option>
                            <option value="PYTHON">Python</option>
                        </Select>
                        <Button onClick={handleCreateNewFile}>Create New File</Button>
                    </div>
                </div>
                {/* Main editor or result view */}
                <div className="flex-1 w-full h-full overflow-y-auto">
                    {getMenu()}
                </div>
            </div>
        </div>
    );
};

export default Code;