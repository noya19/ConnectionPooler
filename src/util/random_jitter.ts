/**
 * Generates a random number between min and max. 
 * @param min 
 * @param max 
 * @returns number
 */
export const randomJitter = (min: number, max: number) => {
    return Math.max(min, Math.floor(Math.random() * max))
}