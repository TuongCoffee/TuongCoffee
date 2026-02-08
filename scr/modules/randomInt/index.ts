function randomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    
    // guard
    if (min > max) {
        throw new Error("min must be <= max");
    }
    
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
        throw new TypeError("min and max must be finite numbers");
    }
    
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// export funtion
export default randomInt;
