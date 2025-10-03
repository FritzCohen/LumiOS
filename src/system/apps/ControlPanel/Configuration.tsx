import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../../lib/Button";
import { useEffect, useState } from "react";
import virtualFS from "../../../utils/VirtualFS";
import { File } from "../../../utils/types";

interface ConfigurationProps {
    setMenu: (prev: number) => void
}

interface FileName extends File {
    name: string
}

const Configuration: React.FC<ConfigurationProps> = ({ setMenu }) => {
    const [configs, setConfigs] = useState<FileName[]>([]);
    const [selectedConfig, setSelectedConfig] = useState<FileName | null>(null);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        const systemFiles = await virtualFS.readdir("System/");
        const files = Object.keys(systemFiles)
            .map((name) => {
                return {
                    ...systemFiles[name],
                    name: name,
                }
            }).filter((file) => file.type === "file");

        setConfigs(files);        
    };

    const updateFile = async (file: FileName) => {
        await virtualFS.updateFile("System/", file.name, "", file.fileType as string);
    };

    return ( 
        <div className="flex flex-col p-5 w-full h-full">
            <div className="flex flex-row justify-between items-center w-full">
                <Button onClick={() => setMenu(0)}><FontAwesomeIcon icon={faChevronLeft} /> Back</Button>
                <h3 className="my-2 font-semibold text-lg">Configuration</h3>
            </div>
            <p>Ill do this later tbh</p>
            <div className="script-column">
                {configs.map((file, index) => (
                    <div className="" key={index}>
                        {file.name}
                    </div>
                ))}
            </div>
        </div>
    );
}
 
export default Configuration;