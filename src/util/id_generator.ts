import { randomBytes } from "crypto";

/**
 * @description It generates a string of given size.
 *  Default size is 16 bytes
 * @param size non zero
 * @returns {string}
 */
export function idGenerator(size: number = 16): string {
    const bytes = randomBytes(size);
    return bytes.toString("hex");
}
