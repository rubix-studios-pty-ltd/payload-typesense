import type Typesense from "typesense"

import type { TypesenseSearchConfig } from "../index.js"

import { mapPayloadDocumentToTypesense } from "./schema-mapper.js"

export const setupHooks = (
	typesenseClient: Typesense.Client,
	pluginOptions: TypesenseSearchConfig,
	existingHooks?: any
) => {
	const hooks = { ...existingHooks }

	if (pluginOptions.collections) {
		for (const [collectionSlug, config] of Object.entries(
			pluginOptions.collections
		)) {
			if (config?.enabled) {
				// After create/update hook
				hooks.afterChange = {
					...hooks.afterChange,
					[collectionSlug]: [
						...(hooks.afterChange?.[collectionSlug] || []),
						async ({
							doc,
							operation,
							req: _req,
						}: {
							doc: any
							operation: any
							req: any
						}) => {
							await syncDocumentToTypesense(
								typesenseClient,
								collectionSlug,
								doc,
								operation,
								config
							)
						},
					],
				}

				// After delete hook
				hooks.afterDelete = {
					...hooks.afterDelete,
					[collectionSlug]: [
						...(hooks.afterDelete?.[collectionSlug] || []),
						async ({ doc, req: _req }: { doc: any; req: any }) => {
							await deleteDocumentFromTypesense(
								typesenseClient,
								collectionSlug,
								doc.id
							)
						},
					],
				}
			}
		}
	}

	return hooks
}

const syncDocumentToTypesense = async (
	typesenseClient: Typesense.Client,
	collectionSlug: string,
	doc: any,
	operation: "create" | "update",
	config: NonNullable<TypesenseSearchConfig["collections"]>[string] | undefined
) => {
	try {
		const typesenseDoc = mapPayloadDocumentToTypesense(
			doc,
			collectionSlug,
			config
		)

		await typesenseClient
			.collections(collectionSlug)
			.documents()
			.upsert(typesenseDoc)

		// Document synced successfully
	} catch (error: any) {
		// Handle document sync error

		// Log the problematic document for debugging
		if (error.message.includes("validation")) {
			// Log problematic document details
		}
	}
}

const deleteDocumentFromTypesense = async (
	typesenseClient: Typesense.Client,
	collectionSlug: string,
	docId: string
) => {
	try {
		await typesenseClient.collections(collectionSlug).documents(docId).delete()

		// Document deleted successfully
	} catch (_error) {
		// Handle document deletion error
	}
}
