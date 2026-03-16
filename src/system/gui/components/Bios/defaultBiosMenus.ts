import { BiosCommand } from "./biosTypes";

export interface BiosMenuNode {
  commands: BiosCommand[];
  children?: Record<string, BiosMenuNode>;
}

export const defaultBiosMenus: BiosMenuNode = {
  commands: [
    {
      id: "exit",
      label: "Exit",
      run: ({ exitBios }) => exitBios(),
    },
  ],

  children: {
    THEME: {
      commands: [
        {
          id: "reset-theme",
          label: "Reset Theme to Default",
          run: async () => {
            console.log("Resetting theme...");
          },
        },
      ],
    },

    TROUBLESHOOT: {
      commands: [
        {
          id: "diagnostics",
          label: "Run Diagnostics",
          run: async () => {
            console.log("Running diagnostics...");
          },
        },
      ],
    },
  },
};
