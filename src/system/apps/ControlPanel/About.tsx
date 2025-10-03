import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../../lib/Button";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

interface AboutProps {
    setMenu: (prev: number) => void
    setShowBootScreen: (prev: boolean) => void
}

const About: React.FC<AboutProps> = ({ setMenu, setShowBootScreen }) => {
    return ( 
        <div className="flex flex-col p-5 w-full h-full">
            <div className="flex flex-row justify-between items-center w-full">
                <Button onClick={() => setMenu(0)}><FontAwesomeIcon icon={faChevronLeft} /> Back</Button>
                <h3 className="my-2 font-semibold text-lg">About</h3>
            </div>
            <div>
                <Button onClick={() => {
                    setShowBootScreen(true)
                }}>Bootscreeb</Button>
            </div>
        </div>
    );
}
 
export default About;