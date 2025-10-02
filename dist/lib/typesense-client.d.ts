import Typesense from "typesense";
import type { TypesenseSearchConfig } from "../index.js";
export declare const createTypesenseClient: (typesenseConfig: TypesenseSearchConfig["typesense"]) => Typesense.Client;
export declare const testTypesenseConnection: (c: Typesense.Client) => Promise<boolean>;
//# sourceMappingURL=typesense-client.d.ts.map