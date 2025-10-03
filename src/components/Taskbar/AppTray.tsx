import React, { useState, useEffect, useRef } from 'react';
import './AppTray.css';
import { useKernal } from '../../Providers/KernalProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';
import Button from '../../system/lib/Button';

interface AppTrayProps {
    onItemClick: (item: string | null) => void;
    visible: boolean;
}

const AppTray: React.FC<AppTrayProps> = ({ onItemClick }) => {
    const { openedApps } = useKernal();
    const [leftPosition, setLeftPosition] = useState(0);
    const trayRef = useRef<HTMLDivElement>(null);

    const updateLeftPosition = () => {
        const container = document.querySelector('.app-tray-container');
        if (container && trayRef.current) {
            const left = container.getBoundingClientRect();
            setLeftPosition(Math.min(left.left - left.width / 1.25, window.innerWidth - 200));
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        const elementToIgnore = document.querySelector('.app-tray-container');
        if (trayRef.current && !trayRef.current.contains(event.target as Node) && !elementToIgnore?.contains(event.target as Node)) {
            onItemClick(null); // Hide AppList
        }
    };

    const getBottom = (): number => {
        const container = document.querySelector('.app-tray-container');
        const bottom = container!.getBoundingClientRect();
        return bottom?.bottom - bottom.top + bottom.height - 20 || 0;
    };

    useEffect(() => {
        updateLeftPosition();
        window.addEventListener('resize', updateLeftPosition);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('resize', updateLeftPosition);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const bottom = getBottom();

    return (
        <div
            className="app-tray glass"
            ref={trayRef}
            style={{ left: `${leftPosition}px`, bottom: `${bottom}px` }}
        >
            {openedApps.filter(app => app.minimized).length > 0 ? (
                openedApps.filter(app => app.minimized).map((app, index) => (
                    <div key={index} className="app-tray-item">
                        {app.name}
                        <Button><FontAwesomeIcon icon={faX} /></Button>
                    </div>
                ))
            ) : (
                <div className="app-tray-empty">No minimized apps</div>
            )}
        </div>
    );
};

export default AppTray;