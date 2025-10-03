import { useState } from "react";
import logo from "../../assets/Icons/thispc.png";
import Button from "../../system/lib/Button";
import { images } from "../../utils/Process";
import Theme from "../../utils/Theme";
import { useUser } from "../../Providers/UserProvider";

interface BackgroundProps {
    setMenu: React.Dispatch<React.SetStateAction<number>>; // Supports both number and function
}

const Background: React.FC<BackgroundProps> = ({ setMenu }) => {
    const [activeBg, setActiveBg] = useState<number | null>(0);
    const { currentUser, modifyUserProp } = useUser();

    const handleBgClick = async (image: string, index: number) => {
        setActiveBg(index);
        await Theme.setBackground(image, true, currentUser, modifyUserProp);
    };

    return (
        <div className="start-box glass flex flex-row items-center p-4 h-full w-full">
            <img src={logo} alt="Desktop" className="w-32 h-32 mb-4" />
            <div className="h-full py-2">
                <div className="flex flex-col flex-grow text-center justify-center h-full">
                    <h1 className="text-2xl font-bold">Choose a background.</h1>
                    <div className="grid grid-cols-2 gap-4 overflow-auto max-h-48 px-2">
                        {images.map((image, index) => (
                            <img
                                key={index}
                                alt={`${index}`}
                                onClick={() => handleBgClick(image, index)}
                                src={image}
                                className={`rounded-lg w-32 h-32 object-cover shadow-sm hover:brightness-75 transition-all duration-200 cursor-pointer ${activeBg === index ? "brightness-75" : ""}`}
                            />
                        ))}
                    </div>
                    <p className="text-gray-600 mt-4">You'll be able to change these settings later.</p>
                </div>
                <div className="flex items-center justify-center gap-2 w-full mt-4">
                    <Button onClick={() => setMenu((prev) => prev - 1)}>Back</Button>
                    <Button onClick={() => setMenu((prev) => prev + 1)}>Next</Button>
                </div>
            </div>
        </div>
    );
}

export default Background;