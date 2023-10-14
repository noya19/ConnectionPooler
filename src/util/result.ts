/**
 * Modelling the Result Enum as a union of Tuple types.
 * The Ok variant is represented as [Ok,null]
 * The Err variant is represented as [null,Err]
 */
export type Result<T, E extends Error> = [T, null] | [null, E];

/**
 * Two approaches to get a Result type from a throwing function:
 * 1. HOF that invokes the function on your behalf and returns a Result
 * 2. A factory function that returns another function, which when invoked returns a Result
 */

/**
 * Approach 1
 * Synchronous Version
 */

/**
 * @description Invokes a function with its arguments an returns a {@link Result}
 * @param cb the function to be invoked
 * @param args arguments that cb should be invoked with 
 * @example
 ```ts
  function randInt(min: number, max: number) {
      min = Math.floor(min);
      max = Math.floor(max);

      const rInt = Math.floor(Math.random() * (max - min) + min);

      if (rInt % 4 === 0) throw new Error("Cannot return multiples of 4");

      return rInt;
  }

  const [result, error] = intoResult(randInt, 10, 25);
  console.log("Sync HOF");
  if (error) {
      //do error handling
      console.log("Error: ", error);
  } else {
      //parse the result
      console.log("OK", result);
  }
 ```
 */

export function intoResult<
    T extends (...args: any[]) => any,
    E extends Error = Error
>(cb: T, ...args: Parameters<T>): Result<ReturnType<T>, E> {
    try {
        const res = cb(...args) as ReturnType<T>;
        return [res, null];
    } catch (e) {
        const err = e as E;
        return [null, err];
    }
}

/**
 * Approach 1
 * Asynchronous Version
 */

/**
  * @description Invokes a async function with its arguments an returns a Promise that results into a {@link Result}
  * @param cb the function to be invoked
  * @param args arguments that cb should be invoked with
  * @example
  * ```ts
  async function randIntAsync(min: number, max: number) {
      min = Math.floor(min);
      max = Math.floor(max);

      const rInt = Math.floor(Math.random() * (max - min) + min);

      if (rInt % 4 === 0) throw new Error("Cannot return multiples of 4");

      return Math.floor(rInt);
  }

  const [result, error] = await intoResultAsync(randIntAsync, 10, 25);
  console.log("Async HOF");
  if (error) {
      //do error handling
      console.log("Error: ", error);
  } else {
      //parse the result
      console.log("OK", result);
  }
  * ```
  */
export async function intoResultAsync<
    T extends (...args: any[]) => Promise<any>,
    E extends Error = Error
>(cb: T, ...args: Parameters<T>): Promise<Result<Awaited<ReturnType<T>>, E>> {
    try {
        const res = (await cb(...args)) as Awaited<ReturnType<T>>;
        return [res, null];
    } catch (e) {
        const err = e as E;
        return [null, err];
    }
}

/**
 * Approach 2
 * Synchronous Version
 */

/**
 * @description resultify is a factory function that accepts a function and returns a new function that accepts the same argumenst as 
 * the input function, but instead of the value returned by the input function, it wraps the value in a {@link Result} and returns the result
 * @param cb input function
 * @example
 * ```ts
  function randInt(min: number, max: number) {
      min = Math.floor(min);
      max = Math.floor(max);

      const rInt = Math.floor(Math.random() * (max - min) + min);

      if (rInt % 4 === 0) throw new Error("Cannot return multiples of 4");

      return rInt;
  } 

  const resultifiedRandInt = resultify(randInt);
  const [result, error] = resultifiedRandInt(100, 125);

  if (error) {
      //do error handling
      console.log("Error: ", error);
  } else {
      //parse the result
      console.log("OK", result);
  }
 * ```
 */
export function resultify<T extends (...args: any[]) => any>(cb: T) {
    return function <E extends Error = Error>(
        ...args: Parameters<T>
    ): Result<ReturnType<T>, E> {
        try {
            const res = cb(...args);
            return [res, null];
        } catch (e) {
            const err = e as E;
            return [null, err];
        }
    };
}

/**
 * Approach 2
 * Asynchronous Version
 */

/**
 * @description resultify is a factory function that accepts an async function and returns a new function that accepts the same argumenst as 
 * the input function, but instead of the value returned by the input function, it wraps the value in a {@link Result} and returns a promise that  
 * resolves into result
 * @param cb input function
 * @example
 * ```ts
  async function randIntAsync(min: number, max: number) {
      min = Math.floor(min);
      max = Math.floor(max);

      const rInt = Math.floor(Math.random() * (max - min) + min);

      if (rInt % 4 === 0) throw new Error("Cannot return multiples of 4");

      return rInt;
  } 

  const resultifiedRandIntAsync = resultifyAsync(randInt);
  const [result, error] = await resultifiedRandInt(100, 125);

  if (error) {
      //do error handling
      console.log("Error: ", error);
  } else {
      //parse the result
      console.log("OK", result);
  }
 * ```
 */
export function resultifyAsync<T extends (...args: any[]) => Promise<any>>(
    cb: T
) {
    return async function <E extends Error = Error>(
        ...args: Parameters<T>
    ): Promise<Result<Awaited<ReturnType<T>>, E>> {
        try {
            const res = await cb(...args);
            return [res, null];
        } catch (e) {
            const err = e as E;
            return [null, err];
        }
    };
}
