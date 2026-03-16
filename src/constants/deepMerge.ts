import { Directory } from "../system/api/types";

/**
 * This is for updating the virtualFS to the latest version
 * 
 * @param base Original object
 * @param override Object to be mapped onto
 * @returns Merged object
 */
function mergeDirectory(
  base: Directory,
  override: Partial<Directory>
): Directory {
  return {
    ...base,
    ...override,
    children: override.children
      ? mergeChildren(base.children, override.children)
      : base.children,
  };
}

function mergeChildren(
  base: Directory["children"],
  override: Directory["children"]
): Directory["children"] {
  const result = { ...base };

  for (const name in override) {
    const baseNode = base[name];
    const overrideNode = override[name];

    if (
      baseNode?.type === "directory" &&
      overrideNode?.type === "directory"
    ) {
      result[name] = mergeDirectory(baseNode, overrideNode);
    } else {
      // File overwrite OR directory replaced
      result[name] = overrideNode;
    }
  }

  return result;
}

export default mergeDirectory;