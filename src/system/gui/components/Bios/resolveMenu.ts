import { BiosMenu } from "./biosTypes";

export function resolveMenu(
  menu: BiosMenu,
  navigate: (id: string) => void
) {
  return menu.options.map(option => ({
    id: option.id,
    label: option.label,
    action:
      ("target" in option && option.target)
        ? () => navigate(option.target)
        : option.action,
  }));
}
