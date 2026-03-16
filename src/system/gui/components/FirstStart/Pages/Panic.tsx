import { useFirstStartProps } from "../useFirstStart";
import Input from "../../../../lib/Input";
import { cloaks } from "../../../../../constants/constants";

const Panic: React.FC<{ userPrefab: useFirstStartProps }> = ({ userPrefab }) => {
  const { panic } = userPrefab.userData;

  // Find the index of the current preset that matches panic data
  const currentPresetIndex = cloaks.findIndex(
    (cloak) =>
      cloak.favicon === panic.favicon &&
      cloak.website === panic.website &&
      cloak.title === panic.title
  );

  const handlePreset = (presetIndex: number) => {
    const preset = cloaks[presetIndex];
    if (preset) {
      userPrefab.updateField("panic.favicon", preset.favicon);
      userPrefab.updateField("panic.website", preset.website);
      userPrefab.updateField("panic.title", preset.title);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Key */}
      <div className="flex flex-row items-center gap-2">
        <span className="font-semibold">Key:</span>
        <Input
          placeholder="Enter key"
          value={panic.key || ""}
          onChange={(e) =>
            userPrefab.updateField("panic.key", e.target.value)
          }
        />
      </div>

      {/* Favicon */}
      <div className="flex flex-row items-center gap-2">
        <span className="font-semibold">Favicon:</span>
        <Input
          placeholder="https://google.com/favicon.ico"
          value={panic.favicon || ""}
          onChange={(e) =>
            userPrefab.updateField("panic.favicon", e.target.value)
          }
        />
      </div>

      {/* Website */}
      <div className="flex flex-row items-center gap-2">
        <span className="font-semibold">Website:</span>
        <Input
          placeholder="https://google.com"
          value={panic.website || ""}
          onChange={(e) =>
            userPrefab.updateField("panic.website", e.target.value)
          }
        />
      </div>

      {/* Title */}
      <div className="flex flex-row items-center gap-2">
        <span className="font-semibold">Title:</span>
        <Input
          placeholder="Google"
          value={panic.title || ""}
          onChange={(e) =>
            userPrefab.updateField("panic.title", e.target.value)
          }
        />
      </div>

      {/* Preset Select */}
      <select
        onChange={(e) => handlePreset(Number(e.target.value))}
        value={currentPresetIndex >= 0 ? currentPresetIndex : ""}
      >
        <option value="">-- Select Preset --</option>
        {cloaks.map((cloak, index) => (
          <option value={index} key={index}>
            {cloak.title}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Panic;
