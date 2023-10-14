export type poolOptions = {
    /**
     * @description Defines the maximum number of connection to be available in the pool. (non zero)
     */
    readonly maxPoolSize: number;

    /**
     * @description It defines the mode of connection creation. Default `eager`
     *
     * - __eager__                    It creates the connections and fill the pool defined by the `maxPoolSize`
     * - __lazy__                     It will create the connection whenever a connection is till the `maxPoolSize`
     */
    readonly mode?: "eager" | "lazy";

    /**
     * @description: The number of times to retry if there is an error in Connection Establishment.
     */
    readonly maxRetries?: number
};
