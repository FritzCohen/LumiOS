import { IconDefinition, IconProp } from "@fortawesome/fontawesome-svg-core"

export type ContextMenuItem =
  | { // DROPDOWN ITEM
      name: string;
      icon?: IconDefinition | IconProp;
      gap?: boolean;
      children: ContextMenuItem[];
      action?: never;
    }
  | { // REGULAR ITEM
      name: string;
      icon?: IconDefinition | IconProp;
      gap?: boolean;
      action: () => void;
      children?: never;
    };