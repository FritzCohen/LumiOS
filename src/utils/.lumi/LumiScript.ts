import { Permission } from "../types";
import virtualFS from "../VirtualFS";

class LumiScript {
    constructor() {
        this.tokens = {};
        this.directory = "/";
    }

    private tokens: { [key: string]: { value: any } };
    private directory: string;

    // Ensure directory or file exists before operations
    private async ensureExists(path: string, name: string, isDirectory: boolean = false) {
        const exists = await virtualFS.exists(path, name);
        if (!exists) {
            if (isDirectory) {
                // Create directory if it doesn't exist
                await virtualFS.writeDirectory(path, name, Permission.ELEVATED);
            } else {
                console.warn(`File ${name} not found in ${path}`);
            }
        }
    }

    private async parseLine(line: string) {
        const tokens = line.trim().split(" ").filter(Boolean);
        const command = tokens[0];

        switch (command) {
            case "set":
                if (tokens[2] === "read" && tokens.length >= 5) {
                    const varName = tokens[1];
                    const dir = tokens[3];
                    const fileTokenOrName = tokens[4];

                    // Check if fileTokenOrName is a variable
                    const fileName = this.tokens[fileTokenOrName]?.value || fileTokenOrName;

                    await this.ensureExists(dir, fileName, false); // Ensure the file exists before reading
                    const content = await virtualFS.readfile(dir, fileName);
                    this.tokens[varName] = { value: content };
                } else if (tokens.length >= 3) {
                    const key = tokens[1];
                    const value = tokens.slice(2).join(" ");
                    this.tokens[key] = { value };
                    if (key === "dir") {
                        this.directory = value;
                    }
                } else {
                    console.warn("Invalid set command:", line);
                }
                break;

            case "mkdir":
                if (tokens.length >= 3) {
                    const tokenKey = tokens[1];
                    const name = tokens.slice(2).join(" ");
                    const path = this.tokens[tokenKey]?.value || this.directory;
                    await virtualFS.writeDirectory(path, name, Permission.ELEVATED);
                } else {
                    console.warn("Invalid mkdir command:", line);
                }
                break;

            case "cd":
                console.log(this.directory);
                
                if (tokens.length >= 2) {
                    const arg = tokens[1];
                    if (arg === "..") {
                        this.directory = this.directory.split("/").slice(0, -1).join("/") || "/";
                    } else if (arg.includes("../")) {
                        let path = this.directory;
                        const parts = arg.split("/");
                        for (const part of parts) {
                            if (part === "..") {
                                path = path.split("/").slice(0, -1).join("/") || "/";
                            } else {
                                path = `${path}/${part}`;
                            }
                        }
                        this.directory = path;
                    } else {
                        this.directory = this.tokens[arg]?.value || arg;
                    }
                }
                console.log(this.directory);
                
                break;

            case "write":
                if (tokens.length >= 4) {
                    const tokenKey = tokens[1];
                    const fileName = tokens[2];
                    let content = tokens.slice(3).join(" ");

                    // Variable substitution for $variableName
                    content = content.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, varName) => {
                        return this.tokens[varName]?.value ?? `$${varName}`;
                    });

                    const path = this.tokens[tokenKey]?.value || this.directory;
                    await this.ensureExists(path, fileName, false); // Ensure file path exists
                    await virtualFS.writeFile(path, fileName, content, "txt");
                } else {
                    console.warn("Invalid write command:", line);
                }
                break;

            case "read":
                if (tokens.length >= 3) {
                    const tokenKey = tokens[1];
                    const fileName = tokens.slice(2).join(" ");
                    const path = this.tokens[tokenKey]?.value || this.directory;
                    await this.ensureExists(path, fileName, false); // Ensure file exists before reading
                    const content = await virtualFS.readfile(path, fileName);
                    console.log(content);
                } else {
                    console.warn("Invalid read command:", line);
                }
                break;

            default:
                console.warn("Unknown command:", command);
                break;
        }
    }

    public async parseLines(lines: string[]) {
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) continue;
            try {
                await this.parseLine(trimmed);
            } catch (e) {
                console.error(e, line);
            }
        }
    }
}

const lumiScript = new LumiScript();

// Test script
const testScript = `
# Set working directory to absolute path
set dir /Documents

# Make a subdirectory "Projects" inside /Documents
mkdir dir Projects

# Change into the "Projects" subdirectory
cd dir

# Write a file "hello.txt" with some content
write dir hello.txt Hello, world from LumiScript!

# Read the content of that file (prints to console)
read dir hello.txt

# Set a new variable to hold the file content
set message read dir hello.txt

# Write another file using content from the variable
write dir copy.txt $message

# Go up one directory level
cd ..

# Create a temp folder and write a temp file
mkdir dir Temp
write dir/Temp note.txt This is a temp note

# Read the temp note to console
read dir/Temp note.txt

# Test setting a variable from a directory and file path
set test read /Documents/Projects/ hello.txt

# Test setting a variable from a directory and token filename
set fileName hello.txt
set test read /Documents/Projects/ fileName

# Output test
read dir copy.txt

`;

//await lumiScript.parseLines(testScript.split("\n"));

export default lumiScript;