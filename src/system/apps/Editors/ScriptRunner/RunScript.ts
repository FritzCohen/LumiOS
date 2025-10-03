import virtualFS from "../../../../utils/VirtualFS";

export default async function RunScript(script: string): Promise<string> {
    // Get the variable name of the virtualFS instance
    const virtualFSInstanceName = Object.keys({virtualFS})[0];

    // Replace virtualFS method calls with corresponding methods from virtualFS
    let transformedScript = script.replace(/virtualFS\.(\w+)\((.*?)\)/g, (match, fnName, args) => {
        // Replace with the corresponding method call in virtualFS
        return `${virtualFSInstanceName}.${fnName}(${args})`;
    });

    // Return the transformed script as a string
    
    const finalScript = `
        (async function main() {
        ${transformedScript}
        })();
    `;

    eval(finalScript);
    const scriptBody = document.createElement("script");
    scriptBody.textContent = finalScript;
    document.head.appendChild(scriptBody);

    return finalScript;
}