export interface BiosContext {
    setCurrentMenu: (menuId: string) => void;
    exitBios: () => void;
}

interface BiosCommandBase {
    id: string;
    label: string;
    description?: string;
}

/** Executes logic */
export interface BiosActionCommand extends BiosCommandBase {
    run: (ctx: BiosContext) => Promise<void> | void;
}

// Originally there was a BiosNavigationCommand, but navigating folders is better than a flat map
export type BiosCommand = BiosActionCommand;

export const serializeCommand = (cmd: BiosCommand): Omit<BiosCommand, "run"> & { run: string } => {
    return {
        ...cmd,
        run: cmd.run.toString(),
    };
};

export const deserializeCommand = (stored: any): BiosCommand => {
    return {
        ...stored,
        run: new Function(
            "ctx",
            `return (${stored.run})(ctx);`
        ),
    };
};