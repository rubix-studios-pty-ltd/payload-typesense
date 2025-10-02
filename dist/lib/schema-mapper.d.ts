import type { Collection } from "payload";
import type { TypesenseSearchConfig } from "../index.js";
export declare const mapCollectionToTypesenseSchema: (collection: Collection, collectionSlug: string, config: NonNullable<TypesenseSearchConfig["collections"]>[string] | undefined) => {
    name: string;
    fields: ({
        name: string;
        type: "string";
    } | {
        name: string;
        type: "int64";
    })[];
};
export declare const mapPayloadDocumentToTypesense: (doc: any, collectionSlug: string, config: NonNullable<TypesenseSearchConfig["collections"]>[string] | undefined) => any;
//# sourceMappingURL=schema-mapper.d.ts.map