import logo from "../../assets/no-bg-logo.png";
import Button from "../../system/lib/Button";

interface WelcomeProps {
    setMenu: React.Dispatch<React.SetStateAction<number>>; // Supports both number and function
}

const Welcome: React.FC<WelcomeProps> = ({ setMenu }) => {
    return ( 
        <div className="start-box glass">
            <img src={logo} className="w-1/3 aspect-square" />
            <div className="flex flex-col justify-between items-center w-1/2 h-full">
                <div className="flex flex-col flex-grow h-full text-center justify-center">
                    <h1 className="start-h1">Welcome!</h1>
                    <p>Get started on your new favorite OS!</p>
                    <p className="text-xs text-end" style={{ color: "gray" }}>By continuing, you agree to our <a href="https://github.com/LuminesenceProject/LumiOS" className="cursor-pointer" style={{ color: "lightblue" }}>terms and conditions.</a></p>
                    <button onClick={() => setMenu(4)} className="hover:bg-primary transition-colors duration-200 rounded p-1 w-fit self-end" style={{ color: "gray" }}>Skip</button>
                </div>
                <div className="flex items-center justify-center gap-2 w-full">
                    <Button disabled>Back</Button>
                    <Button onClick={() => setMenu((prev) => prev + 1)}>Next</Button>
                </div>
            </div>
        </div>
    );
}
 
export default Welcome;