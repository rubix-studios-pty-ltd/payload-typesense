import type { PayloadHandler } from "payload";
import type Typesense from "typesense";
import type { TypesenseSearchConfig } from "../index.js";
export declare const createSearchEndpoints: (typesenseClient: Typesense.Client, pluginOptions: TypesenseSearchConfig, lastSyncTime?: number) => ({
    handler: PayloadHandler;
    method: "get";
    path: string;
} | {
    handler: PayloadHandler;
    method: "post";
    path: string;
})[];
//# sourceMappingURL=search.d.ts.map