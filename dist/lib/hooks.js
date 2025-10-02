import { mapPayloadDocumentToTypesense } from "./schema-mapper.js";
export const setupHooks = (typesenseClient, pluginOptions, existingHooks)=>{
    const hooks = {
        ...existingHooks
    };
    if (pluginOptions.collections) {
        for (const [collectionSlug, config] of Object.entries(pluginOptions.collections)){
            if (config?.enabled) {
                // After create/update hook
                hooks.afterChange = {
                    ...hooks.afterChange,
                    [collectionSlug]: [
                        ...hooks.afterChange?.[collectionSlug] || [],
                        async ({ doc, operation, req: _req })=>{
                            await syncDocumentToTypesense(typesenseClient, collectionSlug, doc, operation, config);
                        }
                    ]
                };
                // After delete hook
                hooks.afterDelete = {
                    ...hooks.afterDelete,
                    [collectionSlug]: [
                        ...hooks.afterDelete?.[collectionSlug] || [],
                        async ({ doc, req: _req })=>{
                            await deleteDocumentFromTypesense(typesenseClient, collectionSlug, doc.id);
                        }
                    ]
                };
            }
        }
    }
    return hooks;
};
const syncDocumentToTypesense = async (typesenseClient, collectionSlug, doc, operation, config)=>{
    try {
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
        await typesenseClient.collections(collectionSlug).documents(docId).delete();
    // Document deleted successfully
    } catch (_error) {
    // Handle document deletion error
    }
};
