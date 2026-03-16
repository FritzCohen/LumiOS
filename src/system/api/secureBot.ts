/**
 * Checks whether or not the OS is safe from stuff
*/

import { Directory, File } from "./types";
import virtualFS from "./virtualFS";

class AhoCorasick {
    private root: any = {};
    private outputs: any = {};
    
    constructor(keywords: string[]) {
        // Build the Trie with Aho-Corasick failure links
        for (const keyword of keywords) {
            let node = this.root;
            for (const char of keyword) {
                node = node[char] || (node[char] = {});
            }
            // Store the actual keyword at the end node
            node.isEndOfKeyword = keyword;
        }

        // Build failure links (similar to KMP's partial match table)
        const queue: any[] = [];
        for (const char in this.root) {
            const node = this.root[char];
            node.fail = this.root;
            queue.push(node);
        }

        while (queue.length) {
            const node = queue.shift();
            for (const char in node) {
                if (char !== 'fail' && char !== 'isEndOfKeyword') {
                    const fail = (node.fail && node.fail[char]) || this.root;
                    node[char].fail = fail;
                    queue.push(node[char]);
                }
            }
        }
    }

    // Return matched keyword or null
    match(content: string): string | null {
        let node = this.root;
        for (const char of content) {
            while (node !== this.root && !node[char]) {
                node = node.fail;
            }

            if (node[char]) {
                node = node[char];
                // If this node is the end of a keyword, return the keyword
                if (node.isEndOfKeyword) {
                    return node.isEndOfKeyword;
                }
            } else {
                node = this.root;
            }
        }
        return null;
    }
}

interface FileCheck {
    name: string
    path: string
    file: File
}

interface SecureBot {
    checkFiles: () => Promise<boolean>;
    checkFile: (data: { name: string; path: string; file: File }, strict?: boolean) => Promise<boolean>;
    getFlaggedFiles: () => FileCheck[];
}

/**
 * Secure Bot
 * 
 * Anti-virus stuff thats built in, does it do anything?
 * No.
 * 
*/
export const secureBot: SecureBot = new (class SecureBot {
    private flaggedFiles: FileCheck[] = [];
    private ran: boolean = false;

    constructor() {
        this.init();
    }

    private async init(): Promise<void> {
        await virtualFS.initialize();

        this.ran = true;
    }

    /**
     * @method checkFiles Scans every directory for viruses
     * @returns Promise<boolean>
    */
    public async checkFiles(): Promise<boolean> {
        if (!this.ran) {
            await virtualFS.initialize();
            const root = virtualFS.getFileSystem();
            if (!root || root.type !== "directory") throw new Error("Invalid file system root.");

            this.ran = true;
            return this.traverseDirectory(root, "/");
        }
        return true;
    }

    private async traverseDirectory(directory: Directory, currentPath: string): Promise<boolean> {
        let safe: boolean = true;

        // Iterate through the children of the directory
        for (const [name, child] of Object.entries(directory.children)) {
            if (child.type === "file") {
                const file: FileCheck = {
                    name,
                    path: currentPath, // Pass only the directory path
                    file: child,
                }

                // Check the file, passing the parent directory path
                const isSafe = await this.checkFile(file);

                if (!isSafe) {
                    console.warn(`Unsafe file detected: ${currentPath}${name}`, child);
                    this.flaggedFiles.push(file);
                    safe = false; // Stop if an unsafe file is found
                }
            } else if (child.type === "directory") {
                // Recursively check subdirectories
                const childPath = `${currentPath}${name}/`;
                const isSafe = await this.traverseDirectory(child, childPath);
                if (!isSafe) {
                    safe = false; // Stop if an unsafe file is found in a subdirectory
                }
            }
        }

        return safe; // All files in this directory and subdirectories are safe
    }

    /**
     * Scans a specific file for possibly illicit data. Not well. Fix.
     * 
     * @param data Modified data tag to include name, path and file
     * @param strict Targets keywords such as https://
     * @returns Promise<boolean>
     * 
     * @source
     */
    public async checkFile(data: { name: string; path: string; file: File }, strict?: boolean): Promise<boolean> {
        const unsafeKeywords = ["eval(", "fromCharCode(", "unescape(", "setTimeout(", "setInterval(", "fetch(", "atob(", "btoa("];
    
        if (strict) {
            unsafeKeywords.push(
                "https://",
                "http",
                "skibidi",
            );
        }

        // Instantiate Aho-Corasick with the unsafe keywords
        const ahoCorasick = new AhoCorasick(unsafeKeywords);
    
        let content = data.file.content;
    
        // Ensure content is a string for keyword searching
        if (typeof content !== "string") {
            content = JSON.stringify(content);
        }
    
        // Split content into lines for tracking
        const lines = content.split(/\r?\n/);
    
        // Check each line
        for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
            const lineContent = lines[lineNumber];
    
            // Find matched keyword in the line using Aho-Corasick
            const matchedKeyword = ahoCorasick.match(lineContent);
    
            if (matchedKeyword) {
                console.warn(`Unsafe content detected in file: ${data.path}${data.name}`);
                console.warn(`Line ${lineNumber + 1}: ${lineContent.trim()}`);
                console.warn(`Unsafe keyword: ${matchedKeyword}`);
                return false; // File is unsafe
            }
        }
    
        return true; // File is safe
    }
    
    public getFlaggedFiles(): FileCheck[] {
        return this.flaggedFiles;
    }
})();

export default secureBot;