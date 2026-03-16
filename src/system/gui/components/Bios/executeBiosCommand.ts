import { BiosCommand } from "./biosTypes";

export default function executeBiosCommand(
    command: BiosCommand,
    ctx: any
) {    
    return command.run(ctx);
}