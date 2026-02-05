// enums / constants
const MODE = Object.freeze({
    normal: "normal",
    strict: "strict"
});

const DEBUG = Object.freeze({
    invalid: Object.freeze({
        input: "Invalid input. (input)",
        option: "Invalid input. (option)"
    })
});

// output type
const OUTPUT_TYPE = Object.freeze({
    console: "console",
    return: "return"
});

// default options
const DEFAULT_OPTION = Object.freeze({
    min: undefined,
    mode: MODE.normal,
    output_type: OUTPUT_TYPE.return
});

// main function
function analyzeData(input, option = {}) {
    // validate input must be an array
    if (!Array.isArray(input)) {
        return DEBUG.invalid.input;
    }

    // validate option must be a plain object
    if (typeof option !== "object" || option === null || Array.isArray(option)) {
        return DEBUG.invalid.option;
    }

    // reject unknown option keys
    for (const key of Object.keys(option)) {
        if (!(key in DEFAULT_OPTION)) {
            return DEBUG.invalid.option;
        }
    }

    // merge user option with defaults
    const finalOption = {
        ...DEFAULT_OPTION,
        ...option
    };

    // validate minimum value if provided
    if (
        finalOption.min !== undefined &&
        (typeof finalOption.min !== "number" || Number.isNaN(finalOption.min))
    ) {
        return DEBUG.invalid.option;
    }

    // validate output_type
    if (!Object.values(OUTPUT_TYPE).includes(finalOption.output_type)) {
        return DEBUG.invalid.option;
    }

    const { min, mode, output_type } = finalOption;

    // initialize result data
    const data = {
        validCount: {
            count: 0,
            valid: []
        },
        invalidCount: {
            count: 0,
            invalid: []
        },
        sum: 0,
        average: null
    };

    // iterate through input values
    for (const item of input) {
        if (typeof item !== "number" || Number.isNaN(item)) {
            if (mode === MODE.strict) {
                data.invalidCount.count++;
                data.invalidCount.invalid.push(item);
            }
            continue;
        }

        if (min !== undefined && item < min) {
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

    data.average =
        data.validCount.count > 0
            ? data.sum / data.validCount.count
            : null;

    const result = {
        inputs: {
            input,
            option: finalOption
        },
        outputs: data
    };

    // output handler
    if (output_type === OUTPUT_TYPE.console) {
        console.log(
            typeof Deno !== "undefined"
                ? Deno.inspect(result, { depth: Infinity, colors: true })
                : result
        );
        return;
    }

    return result;
}

// expose enums and debug messages
analyzeData.mode = MODE;
analyzeData.debug = DEBUG;
analyzeData.outputType = OUTPUT_TYPE;

export default analyzeData;
