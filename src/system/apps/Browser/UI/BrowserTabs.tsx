import { Tab } from "../types";
import Button from "../../../lib/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus, faX } from "@fortawesome/free-solid-svg-icons";

interface Props {
  tabs: Tab[];
  selectedTabId: number;
  onSelect: (id: number) => void;
  onClose: (tab: Tab) => void;
  onAdd: () => void;
}

const BrowserTabs: React.FC<Props> = ({
  tabs,
  selectedTabId,
  onSelect,
  onClose,
  onAdd,
}) => {
  return (
    <div className="flex items-end gap-1 px-2 pb-[1px]">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`tab ${selectedTabId === tab.id ? "active" : ""}`}
          onClick={() => onSelect(tab.id)}
        >
          <span className="text-white text-sm">{tab.title}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose(tab);
            }}
          >
            <FontAwesomeIcon icon={faX} className="text-white text-xs" />
          </button>
        </div>
      ))}

      <Button onClick={onAdd}>
        <FontAwesomeIcon icon={faCirclePlus} />
      </Button>
    </div>
  );
};

export default BrowserTabs;