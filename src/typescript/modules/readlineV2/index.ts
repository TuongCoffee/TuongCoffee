import * as readline from "node:readline";

//===== types =====//
type HexColor = `#${string}`;

interface Styles {
    color?: HexColor;
    background?: HexColor;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    dim?: boolean;
    reverse?: boolean;
    strike?: boolean;
}

interface AskOptions {
    delay?: number;
    style?: Styles;
}

//===== utils =====//
function validateHex(hex: string): void {
    if (!/^#([0-9a-fA-F]{6})|([0-9a-fA-F]{3})$/.test(hex)) {
        throw new TypeError("Hex color must be format #rrggbb or #rgb.");
    }
}

function hexToAnsi(hex: string, isBg = false): string {
    const clean = hex.replace("#", "");

    // convert #RGB to #RRGGBB
    if (clean.length === 3)
        hex.split("")
            .map(c => c + c)
            .join("");

    const bigint = parseInt(clean, 16);

    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `\x1b[${isBg ? 48 : 38};2;${r};${g};${b}m`;
}

function applyStyle(text: string, style?: Styles): string {
    if (!style) return text;

    let result = "";

    if (style.bold) result += "\x1b[1m";
    if (style.dim) result += "\x1b[2m";
    if (style.italic) result += "\x1b[3m";
    if (style.underline) result += "\x1b[4m";
    if (style.reverse) result += "\x1b[7m";
    if (style.strike) result += "\x1b[9m";

    if (style.color) {
        validateHex(style.color);
        result += hexToAnsi(style.color);
    }

    if (style.background) {
        validateHex(style.background);
        result += hexToAnsi(style.background, true);
    }

    return result + text + "\x1b[0m";
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//===== main ask function =====//
export async function ask(
    rl: readline.Interface,
    question: string,
    prompt: string = "",
    options?: AskOptions
): Promise<string> {
    const delay = options?.delay ?? 0;
    const styledQuestion = applyStyle(question, options?.style);

    // apply delay if needed
    if (delay > 0) await sleep(delay);

    return new Promise(resolve => {
        rl.question(styledQuestion + `\n${prompt}`, answer => {
            resolve(answer);
        });
    });
}

export type { Styles };
