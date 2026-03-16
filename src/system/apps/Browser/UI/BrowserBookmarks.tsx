import Button from "../../../lib/Button";
import { BrowserLink } from "../../../../context/user/userTypes";

interface Props {
  bookmarks: BrowserLink[];
  onNavigate: (url: string) => void;
}

const BrowserBookmarks: React.FC<Props> = ({ bookmarks, onNavigate }) => {
  if (!bookmarks.length) return null;

  return (
    <div className="browser-bar gap-2 overflow-x-auto !mb-0 pt-1">
      {bookmarks.map((bookmark, idx) => (
        <Button
          key={idx}
          onClick={() => onNavigate(bookmark.link)}
          className="text-sm px-3"
        >
          {bookmark.title}
        </Button>
      ))}
    </div>
  );
};

export default BrowserBookmarks;