import { ReactNode, useState } from "react";
import Button from "../../lib/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

interface AppsProps {
    setMenu: (prev: number) => void
}

const Apps: React.FC<AppsProps> = ({ setMenu }) => {
    const [current, setCurrent] = useState<number>(0);
    const [link, setLink] = useState<string>("");
    
    const getCurrent = (): ReactNode => {
        switch (current) {
            case 1: return (
                <div className="flex flex-col p-4 w-full h-full">
                    <div className="flex w-full justify-between items-center">
                        <Button onClick={() => setCurrent(0)}>
                            <FontAwesomeIcon icon={faChevronLeft} /> Back
                        </Button>
                        <h3 className="font-bold text-xl">Add App from Link</h3>
                    </div>
                    <input
                        type="text"
                        placeholder="Enter app URL"
                        value={"scriptLink"}
                        onChange={(e) => setLink(e.target.value)}
                        className="input-main"
                    />
                    <Button onClick={() => {}} className="mt-4">
                        Load Script
                    </Button>
                </div>
            );
            case 2: return (
                <div className="flex flex-col gap-2 p-4 overflow-y-auto w-full h-full">
                <div className="flex flex-row justify-between items-center">
                <Button onClick={() => setCurrent(0)}>
                    <FontAwesomeIcon icon={faChevronLeft} /> Back
                </Button>
                <h3 className="font-bold text-xl">Create Your Own App</h3>
                </div>

                <div>
                <Button onClick={() => {}} className="mt-4">
                    Create App
                </Button>
                </div>
            </div>
            )
            default: return <>
            <div className="flex justify-between items-center w-full p-4">
                <Button onClick={() => setMenu(0)}>
                    <FontAwesomeIcon icon={faChevronLeft} /> Back
                </Button>
                <h3 className="font-bold text-xl p-2">Install Apps</h3>
            </div>
            <div className="script-column">
                <div onClick={() => setCurrent(1)}>
                    Add app from link
                </div>
                <div onClick={() => setCurrent(2)}>
                    Create your own app 
                </div>
            </div></>
        }
    }

    return getCurrent();
}
 
export default Apps;