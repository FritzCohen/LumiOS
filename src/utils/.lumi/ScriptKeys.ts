interface Script {
    name: string;
    type: "assignment" | "class" | "method" | "function" | "control";
    getContext: (context: string[]) => string;
}

export const scripts: Script[] = [
    {
        name: "let",
        type: "assignment",
        getContext: (context: string[]) => `var ${context[0]} = ${context.slice(2).join(" ")};`
    },
    {
        name: "print",
        type: "method",
        getContext: (context: string[]) => `console.log(${context.join(" ")});`
    },
    {
        name: "if",
        type: "control",
        getContext: (context: string[]) => `if (${context.join(" ").replace(/:$/, "")}) {`
    },
    {
        name: "while",
        type: "control",
        getContext: (context: string[]) => `while (${context.join(" ").replace(/:$/, "")}) {`
    },
    {
        name: "def",
        type: "function",
        getContext: (context: string[]) => `const ${context[0]} = () => (${context.slice(1).join(", ").replace(/:$/, "").replace("=>", "")}) {`
    },
    {
        name: "lambda",
        type: "function",
        getContext: (context: string[]) => { console.log(context);
        ;return `function ${context[0]}(${context.slice(1).join(", ").replace(/:$/, "")}) {`}
    },
    {
        name: "end",
        type: "control",
        getContext: () => `}`
    }
];
