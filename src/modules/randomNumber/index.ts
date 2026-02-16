// main function
function randomNumber(min: number, max: number, decimal: number = 0): number {
    // guard
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
        throw new TypeError("min and max must be finite numbers");
    }
    if (!Number.isInteger(decimal)) {
        throw new RangeError("decimal must be an integer");
    }
    if (min > max) {
        throw new RangeError("min must be <= max");
    }
    
    // main script
    const scale = 10 ** decimal;
    
    const result =
        Math.floor(Math.random() * (max * scale - min * scale + 1)) +
        min * scale;
        
    return result / scale;
    
}

export default randomNumber;
