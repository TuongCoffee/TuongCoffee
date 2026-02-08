// enums / constants
export enum MODE {
    normal = "normal",
    strict = "strict"
}

export enum OUTPUT_TYPE {
    console = "console",
    return = "return"
}

export const DEBUG = {
    invalid: {
        input: "Invalid input. (input)",
        option: "Invalid input. (option)"
    }
} as const;

// Interfaces cho Type Safety
interface AnalyzeOption {
    min?: number;
    mode?: MODE;
    output_type?: OUTPUT_TYPE;
}

interface AnalyzeResult {
    inputs: {
        input: any[];
        option: AnalyzeOption;
    };
    outputs: {
        validCount: { count: number; valid: number[] };
        invalidCount: { count: number; invalid: any[] };
        sum: number;
        average: number | null;
    };
}

const DEFAULT_OPTION: Required<AnalyzeOption> = {
    min: undefined as any,
    mode: MODE.normal,
    output_type: OUTPUT_TYPE.return
};

// main function
export function analyzeData(input: any[], option: AnalyzeOption = {}): AnalyzeResult | string | void {
    // validate input
    if (!Array.isArray(input)) return DEBUG.invalid.input;

    // validate option
    if (typeof option !== "object" || option === null || Array.isArray(option)) {
        return DEBUG.invalid.option;
    }

    // merge user option with defaults
    const finalOption: Required<AnalyzeOption> = { ...DEFAULT_OPTION, ...option };

    // validate values
    if (finalOption.min !== undefined && (typeof finalOption.min !== "number" || Number.isNaN(finalOption.min))) {
        return DEBUG.invalid.option;
    }

    const { min, mode, output_type } = finalOption;

    const data = {
        validCount: { count: 0, valid: [] as number[] },
        invalidCount: { count: 0, invalid: [] as any[] },
        sum: 0,
        average: null as number | null
    };

    for (const item of input) {
        const isNumber = typeof item === "number" && !Number.isNaN(item);
        const isAboveMin = min === undefined || (isNumber && item >= min);

        if (!isNumber || !isAboveMin) {
            if (mode === MODE.strict) {
                data.invalidCount.count++;
                data.invalidCount.invalid.push(item);
            }
            continue;
        }

        data.validCount.count++;
        data.validCount.valid.push(item);
        data.sum += item;
    }

    data.average = data.validCount.count > 0 ? data.sum / data.validCount.count : null;

    const result: AnalyzeResult = {
        inputs: { input, option: finalOption },
        outputs: data
    };

    if (output_type === OUTPUT_TYPE.console) {
        console.dir(result, { depth: null, colors: true });
        return;
    }

    return result;
}

export default analyzeData;
