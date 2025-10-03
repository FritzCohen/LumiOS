import React, { Component, ReactNode, CSSProperties } from "react";
import "./ContextMenu.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { ContextMenuItem } from "../../utils/types";

type ContextMenuProps = {
    menuPosition: { x: number; y: number };
    menuItems: ContextMenuItem[];
    hideMenu: () => void;
};

export default class ContextMenu extends Component<ContextMenuProps> {
    private contextMenuRef = React.createRef<HTMLDivElement>();

    componentDidMount() {
        document.addEventListener("mousedown", this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener("mousedown", this.handleClickOutside);
    }

    handleClickOutside = (event: MouseEvent) => {
        if (this.contextMenuRef.current && !this.contextMenuRef.current.contains(event.target as Node)) {
            this.props.hideMenu();
        }
    };

    handleItemClick(item: ContextMenuItem) {        
        item.action();
        this.props.hideMenu();
    }

    handleInfoClick() {
        window.open("https://github.com/LuminesenceProject/LumiOS");
        this.props.hideMenu();
    };

    renderMenuItems(items: ContextMenuItem[]): ReactNode {
        return items.map((item, index) => (
            <React.Fragment key={index}>
                <div className="menu-item" onClick={() => this.handleItemClick(item)}>
                    <div>
                        {item.icon && <FontAwesomeIcon className="menu-icon" icon={item.icon} />}
                        {item.name}
                        {item.isDropdown && <FontAwesomeIcon className="menu-icon flex-grow right-0" icon={faChevronRight} />}
                    </div>
                    {item.isDropdown && item.children && (
                        <div className="dropdown glass">
                            {this.renderMenuItems(item.children)}
                        </div>
                    )}
                </div>
                {item.gap && (
                    <hr className="my-1 bg-primary w-11/12 self-center" style={{ color: "grey" }} />
                )}
            </React.Fragment>
        ));
    }

    render(): ReactNode {
        const { menuPosition, menuItems } = this.props;

        const menuStyle: CSSProperties = {
            top: `${menuPosition.y}px`,
            left: `${menuPosition.x}px`,
            position: "absolute",
            color: "white",
        };

        return (
            <div
                ref={this.contextMenuRef}
                style={menuStyle}
                className="context-menu glass"
            >
                {this.renderMenuItems(menuItems)}
                <hr className="my-1 bg-primary w-11/12 self-center" style={{ color: "grey" }} />
                <div className="menu-item" onClick={this.handleInfoClick}>
                    <div>
                        <FontAwesomeIcon className="menu-icon" icon={faInfoCircle} />
                        About
                    </div>
                </div>
            </div>
        );
    }
}