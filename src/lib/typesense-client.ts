import Typesense from "typesense"

import type { TypesenseSearchConfig } from "../index.js"

let client: null | Typesense.Client = null

export const createTypesenseClient = (
	typesenseConfig: TypesenseSearchConfig["typesense"]
): Typesense.Client => {
	if (!client) {
		const isBuild = process.argv.some(
			(arg) => arg.includes("build") || arg.includes("tsc")
		)

		if (isBuild) {
			client = {
				collections: () => ({
					retrieve: () => Promise.resolve([]),
				}),
				health: { retrieve: () => Promise.resolve({ ok: false }) },
			} as unknown as Typesense.Client
		} else {
			client = new Typesense.Client({
				apiKey: typesenseConfig.apiKey,
				connectionTimeoutSeconds: typesenseConfig.connectionTimeoutSeconds || 2,
				nodes: typesenseConfig.nodes.map((node) => ({
					...node,
					port: typeof node.port === "string" ? parseInt(node.port) : node.port,
				})),
			})
		}
	}
	return client
}

export const testTypesenseConnection = async (
	client: Typesense.Client
): Promise<boolean> => {
	try {
		await client.health.retrieve()
		return true
	} catch {
		return false
	}
}
