import { createSearchEndpoints } from "./endpoints/search.js";
import { initializeTypesenseCollections } from "./lib/initialization.js";
import { mapPayloadDocumentToTypesense } from "./lib/schema-mapper.js";
import { createTypesenseClient } from "./lib/typesense-client.js";
export * from "./components/index.js";
export const typesenseSearch = (pluginOptions)=>(config)=>{
        if (pluginOptions.disabled) {
            return config;
        }
        // Initialize Typesense client
        const typesenseClient = createTypesenseClient(pluginOptions.typesense);
        // Add search endpoints
        config.endpoints = [
            ...config.endpoints || [],
            ...createSearchEndpoints(typesenseClient, pluginOptions, Date.now())
        ];
        // Apply hooks to individual collections
        if (pluginOptions.settings?.autoSync !== false && pluginOptions.collections) {
            config.collections = (config.collections || []).map((collection)=>{
                const collectionConfig = pluginOptions.collections?.[collection.slug];
                if (collectionConfig?.enabled) {
                    return {
                        ...collection,
                        hooks: {
                            ...collection.hooks,
                            afterChange: [
                                ...collection.hooks?.afterChange || [],
                                async ({ doc, operation, req: _req })=>{
                                    await syncDocumentToTypesense(typesenseClient, collection.slug, doc, operation, collectionConfig);
                                }
                            ],
                            afterDelete: [
                                ...collection.hooks?.afterDelete || [],
                                async ({ doc, req: _req })=>{
                                    await deleteDocumentFromTypesense(typesenseClient, collection.slug, doc.id);
                                }
                            ]
                        }
                    };
                }
                return collection;
            });
        }
        // Initialize collections in Typesense
        const incomingOnInit = config.onInit;
        config.onInit = async (payload)=>{
            if (incomingOnInit) {
                await incomingOnInit(payload);
            }
            await initializeTypesenseCollections(payload, typesenseClient, pluginOptions);
        };
        return config;
    };
// Helper function to create collection if it doesn't exist
const createCollectionIfNotExists = async (typesenseClient, collectionSlug, config)=>{
    const searchableFields = config?.searchFields || [
        "title",
        "content",
        "description"
    ];
    const facetFields = config?.facetFields || [];
    // Base fields that every collection should have
    const baseFields = [
        {
            name: "id",
            type: "string"
        },
        {
            name: "createdAt",
            type: "int64"
        },
        {
            name: "updatedAt",
            type: "int64"
        }
    ];
    // Map searchable fields
    const searchFields = searchableFields.map((field)=>({
            name: field,
            type: "string",
            facet: facetFields.includes(field)
        }));
    // Map facet-only fields (not in searchable fields)
    const facetOnlyFields = facetFields.filter((field)=>!searchableFields.includes(field)).map((field)=>({
            name: field,
            type: "string",
            facet: true
        }));
    const schema = {
        name: collectionSlug,
        fields: [
            ...baseFields,
            ...searchFields,
            ...facetOnlyFields
        ]
    };
    await typesenseClient.collections().create(schema);
// Collection created successfully
};
// Sync functions for hooks
const syncDocumentToTypesense = async (typesenseClient, collectionSlug, doc, operation, config)=>{
    try {
        // First check if the collection exists, create it if it doesn't
        try {
            await typesenseClient.collections(collectionSlug).retrieve();
        } catch (collectionError) {
            if (collectionError.httpStatus === 404) {
                // Collection not found, creating it
                await createCollectionIfNotExists(typesenseClient, collectionSlug, config);
            } else {
                throw collectionError;
            }
        }
        const typesenseDoc = mapPayloadDocumentToTypesense(doc, collectionSlug, config);
        await typesenseClient.collections(collectionSlug).documents().upsert(typesenseDoc);
    // Document synced successfully
    } catch (error) {
        // Handle document sync error
        // Log the problematic document for debugging
        if (error.message.includes("validation")) {
        // Log problematic document details
        }
    }
};
const deleteDocumentFromTypesense = async (typesenseClient, collectionSlug, docId)=>{
    try {
        // First check if the collection exists
        try {
            await typesenseClient.collections(collectionSlug).retrieve();
        } catch (collectionError) {
            if (collectionError.httpStatus === 404) {
                // Collection not found, skipping delete
                return;
            }
            throw collectionError;
        }
        // Try to delete the document
        await typesenseClient.collections(collectionSlug).documents(docId).delete();
    // Document deleted successfully
    } catch (error) {
        // Handle specific error cases
        if (error.httpStatus === 404) {
        // Document not found, already deleted
        } else {
        // Handle document deletion error
        }
    }
};
