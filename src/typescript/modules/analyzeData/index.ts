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

//===== types =====//

export interface AnalyzeOption {
    min?: number;
    mode?: MODE;
    output_type?: OUTPUT_TYPE;
}

export interface AnalyzeResult {
    inputs: {
        input: number[];
        option: Required<Omit<AnalyzeOption, "min">> & { min?: number };
    };
    outputs: {
        validCount: {
            count: number;
            valid: number[];
        };
        invalidCount: {
            count: number;
            invalid: number[];
        };
        sum: number;
        average: number | null;
    };
}

type ReturnOption = AnalyzeOption & {
    output_type?: OUTPUT_TYPE.return;
};

type ConsoleOption = AnalyzeOption & {
    output_type: OUTPUT_TYPE.console;
};

//===== default option =====//

const DEFAULT_OPTION = {
    mode: MODE.normal,
    output_type: OUTPUT_TYPE.return
} as const;

//===== overload =====//

export function analyzeData(
    input: number[],
    option?: ReturnOption
): AnalyzeResult | string;

export function analyzeData(
    input: number[],
    option: ConsoleOption
): void | string;

//========== main function ==========//
export function analyzeData(
    input: number[],
    option: AnalyzeOption = {}
): AnalyzeResult | string | void {
    //===== validate input =====//

    if (!Array.isArray(input)) {
        return DEBUG.invalid.input;
    }

    //===== validate option =====//

    if (
        typeof option !== "object" ||
        option === null ||
        Array.isArray(option)
    ) {
        return DEBUG.invalid.option;
    }

    const finalOption = {
        ...DEFAULT_OPTION,
        ...option
    };

    const { min, mode, output_type } = finalOption;

    //===== runtime enum validation =====//

    if (mode !== MODE.normal && mode !== MODE.strict) {
        return DEBUG.invalid.option;
    }

    if (
        output_type !== OUTPUT_TYPE.return &&
        output_type !== OUTPUT_TYPE.console
    ) {
        return DEBUG.invalid.option;
    }

    if (min !== undefined && (typeof min !== "number" || Number.isNaN(min))) {
        return DEBUG.invalid.option;
    }

    //===== result container =====//

    const resultData = {
        validCount: {
            count: 0,
            valid: [] as number[]
        },
        invalidCount: {
            count: 0,
            invalid: [] as number[]
        },
        sum: 0,
        average: null as number | null
    };

    //===== analyze loop =====//

    for (const item of input) {
        const isValidNumber = typeof item === "number" && !Number.isNaN(item);

        const passMin = min === undefined || (isValidNumber && item >= min);

        if (!isValidNumber || !passMin) {
            if (mode === MODE.strict) {
                resultData.invalidCount.count++;
                resultData.invalidCount.invalid.push(item);
            }

            continue;
        }

        resultData.validCount.count++;
        resultData.validCount.valid.push(item);
        resultData.sum += item;
    }

    //===== compute average =====//

    if (resultData.validCount.count > 0) {
        resultData.average = resultData.sum / resultData.validCount.count;
    }

    const result: AnalyzeResult = {
        inputs: {
            input,
            option: {
                min,
                mode,
                output_type
            }
        },
        outputs: resultData
    };

    //===== output handling =====///<

    if (output_type === OUTPUT_TYPE.console) {
        console.dir(result, {
            depth: null,
            colors: true
        });
        return;
    }

    return result;
}

export default analyzeData;
