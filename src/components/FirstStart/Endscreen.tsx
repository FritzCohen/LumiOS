import logo from "../../assets/no-bg-logo.png";
import { useKernal } from "../../Providers/KernalProvider";
import Button from "../../system/lib/Button";

interface WelcomeProps {
    setFirstStart: (prev: boolean) => void
    setMenu: React.Dispatch<React.SetStateAction<number>>; // Supports both number and function
}

const Endscreen: React.FC<WelcomeProps> = ({ setFirstStart, setMenu }) => {
    const { systemProps, updateSystemProp, removeOpenedApp } = useKernal();

    const handleFinish = () => {
        setFirstStart(false);
        updateSystemProp({
            ...systemProps,
            firstLogin: false,
        });

        removeOpenedApp("GetStarted");
    };

    return ( 
        <div className="start-box glass">
            <img src={logo} />
            <div className="flex flex-col justify-between items-center w-1/2 h-full">
                <div className="flex flex-col flex-grow h-full text-center justify-center">
                    <h1 className="start-h1 !text-2xl">Thank you for choosing Lumi OS.</h1>
                    <p className="text-xs" style={{ color: "gray" }}>Your new favorite OS.</p>
                </div>
                <div className="flex items-center justify-center gap-2 w-full">
                    <Button onClick={() => setMenu(prev => prev - 1)}>Back</Button>
                    <Button onClick={handleFinish}>Finish</Button>
                </div>
            </div>
        </div>
    );
}
 
export default Endscreen;