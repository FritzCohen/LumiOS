import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../../lib/Button";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

interface LayoutProps {
    name: string
    back: () => void
    children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ name, back, children }) => {
    return ( 
        <div className="flex flex-col gap-2 p-5">
            <div className="flex flex-row justify-between items-center">
                <Button onClick={back}><FontAwesomeIcon icon={faChevronLeft} /> Back</Button>
                <h3 className="font-bold text-2xl">{ name }</h3>
            </div>
            {children}
        </div>
     );
}
 
export default Layout;