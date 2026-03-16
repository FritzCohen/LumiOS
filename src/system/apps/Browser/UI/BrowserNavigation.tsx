import Button from "../../../lib/Button";
import Input from "../../../lib/Input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faRotateRight,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

interface Props {
  addressBar: string;
  setAddressBar: (v: string) => void;
  onEnter: () => void;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onBookmark: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

const BrowserNavigation: React.FC<Props> = ({
  addressBar,
  setAddressBar,
  onEnter,
  onBack,
  onForward,
  onRefresh,
  onBookmark,
  canGoBack,
  canGoForward,
}) => {
  return (
    <div className="browser-bar">
      <Button onClick={onBack} disabled={!canGoBack}>
        <FontAwesomeIcon icon={faArrowLeft} />
      </Button>

      <Button onClick={onForward} disabled={!canGoForward}>
        <FontAwesomeIcon icon={faArrowRight} />
      </Button>

      <Button onClick={onRefresh}>
        <FontAwesomeIcon icon={faRotateRight} />
      </Button>

      <Input
        className="flex-1"
        value={addressBar}
        onChange={(e) => setAddressBar(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onEnter();
        }}
        onBlur={onEnter}
        placeholder="Enter URL..."
      />

      <Button onClick={onBookmark} className="px-2 !pr-3">
        <FontAwesomeIcon icon={faStar} />
      </Button>
    </div>
  );
};

export default BrowserNavigation;