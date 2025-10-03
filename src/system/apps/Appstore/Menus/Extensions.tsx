import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../../../lib/Button";
import { useAppstoreProps } from "../appstoreTypes";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

const Extensions: React.FC<{ store: useAppstoreProps }> = ({ store }) => {
    return ( 
        <div className="flex flex-col p-5">
            <div className="flex flex-row justify-between">
                <Button onClick={() => store.goHome()}><FontAwesomeIcon icon={faChevronLeft} /> Back</Button>
                <h3 className="font-bold text-2xl">Extensions</h3>
            </div>
            <p>Stuffs</p>
        </div>
    );
}
 
export default Extensions;