import type { Payload } from "payload"
import type Typesense from "typesense"

import type { TypesenseSearchConfig } from "../index.js"

import { validateConfig } from "./config-validation.js"
import {
	mapCollectionToTypesenseSchema,
	mapPayloadDocumentToTypesense,
} from "./schema-mapper.js"
import { testTypesenseConnection } from "./typesense-client.js"

export const initializeTypesenseCollections = async (
	payload: Payload,
	typesenseClient: Typesense.Client,
	pluginOptions: TypesenseSearchConfig
) => {
	// Validate configuration first
	const validation = validateConfig(pluginOptions)
	if (!validation.success) {
		throw new Error("Invalid plugin configuration")
	}

	// Test Typesense connection first
	const isConnected = await testTypesenseConnection(typesenseClient)
	if (!isConnected) {
		return
	}

	// Initialize Typesense collections
	if (pluginOptions.collections) {
		for (const [collectionSlug, config] of Object.entries(
			pluginOptions.collections
		)) {
			if (config?.enabled) {
				try {
					await initializeCollection(
						payload,
						typesenseClient,
						collectionSlug,
						config
					)
				} catch (_error) {
					// Handle collection initialization error
				}
			}
		}
	}
}

const initializeCollection = async (
	payload: Payload,
	typesenseClient: Typesense.Client,
	collectionSlug: string,
	config: NonNullable<TypesenseSearchConfig["collections"]>[string] | undefined
) => {
	// Get the collection config from Payload
	const collection = payload.collections[collectionSlug]
	if (!collection) {
		return
	}

	// Create Typesense schema
	const schema = mapCollectionToTypesenseSchema(
		collection,
		collectionSlug,
		config
	)

	try {
		// Check if collection exists
		await typesenseClient.collections(collectionSlug).retrieve()
	} catch (_error) {
		// Collection doesn't exist, create it
		try {
			await typesenseClient.collections().create(schema)
		} catch (_createError) {
			return
		}
	}

	// Sync existing documents
	await syncExistingDocuments(payload, typesenseClient, collectionSlug, config)
}

const syncExistingDocuments = async (
	payload: Payload,
	typesenseClient: Typesense.Client,
	collectionSlug: string,
	config: NonNullable<TypesenseSearchConfig["collections"]>[string] | undefined
) => {
	try {
		const { docs } = await payload.find({
			collection: collectionSlug,
			depth: 0,
			limit: 1000,
		})

		if (docs.length === 0) {
			return
		}

		// Batch sync documents
		const batchSize = 100
		for (let i = 0; i < docs.length; i += batchSize) {
			const batch = docs.slice(i, i + batchSize)
			const typesenseDocs = batch.map((doc) =>
				mapPayloadDocumentToTypesense(doc, collectionSlug, config)
			)

			try {
				const _importResult = await typesenseClient
					.collections(collectionSlug)
					.documents()
					.import(typesenseDocs, { action: "upsert" })

			} catch (batchError: any) {

				// Log detailed import results if available
				if (batchError.importResults) {
					// Try to sync documents individually to identify problematic ones
					// Attempt individual document sync
					for (let j = 0; j < typesenseDocs.length; j++) {
						try {
							await typesenseClient
								.collections(collectionSlug)
								.documents()
								.upsert(typesenseDocs[j])
							// Individual sync successful
						} catch (_individualError: any) {
							// Handle individual sync error
						}
					}
				}
			}
		}

		// Successfully synced documents
	} catch (_error) {
		// Handle document sync error
	}
}
