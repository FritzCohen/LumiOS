import React, { useEffect, useState } from 'react';
import { Process } from "../../../../utils/types";
import Button from '../../../lib/Button';
import { useKernal } from '../../../../Providers/KernalProvider.old';

interface ConfigEditorProps {
    app: Process;
}

const ConfigEditor: React.FC<ConfigEditorProps> = ({ app }) => {
    // Create state to hold the modified app values
    const [modifiedApp, setModifiedApp] = useState<Process>(app);
    const { addPopup } = useKernal();

    // Update state when app changes
    useEffect(() => {
        setModifiedApp(app);
    }, [app]);

    // Handle input change
    const handleChange = (key: string, value: string) => {
        setModifiedApp((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSave = async () => {
        addPopup({
            name: 'test',
            minimized: false,
            description: '',
            onAccept: async () => {},
            children: <div>test</div>
        })
    };

    return (
        <div className="flex flex-col gap-2 px-5 py-5 overflow-y-auto mb-5 w-full h-full">
            {Object.entries(modifiedApp).map(([key, value], index) => (
                <div key={index}>
                    <label>
                        <h3>{key}:</h3>
                        <input
                            type="text"
                            className="input-main"
                            defaultValue={value}
                            onChange={(e) => handleChange(key, e.target.value)}
                        />
                    </label>
                </div>
            ))}
            <button onClick={handleSave} className='button-main'>Save Changes</button>
        </div>
    );
};

export default ConfigEditor;