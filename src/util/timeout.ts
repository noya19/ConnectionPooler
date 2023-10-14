/**
 * Run a setTimeout function for the number of miliseconds provided.
 * @param miliseconds
 * @returns void
 */
export const timeout = (milisecs: number) => {
    return new Promise((res, rej) => {
        setTimeout(res, milisecs);
    });
};
