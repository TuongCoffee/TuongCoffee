// function
function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    
    if (min > max) {
        throw new Error("min must be <= max");
    }
    
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
