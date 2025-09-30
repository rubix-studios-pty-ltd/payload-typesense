import Typesense from "typesense"

import type { TypesenseSearchConfig } from "../index.js"

const isBuildPhase =
	process.env.NEXT_PHASE === "build" ||
	process.env.BUILD_PHASE === "build" ||
	process.env.CI === "true"

export const createTypesenseClient = (
	typesenseConfig: TypesenseSearchConfig["typesense"]
) => {
	if (isBuildPhase) {
		return {
			collections: () => ({
				retrieve: () => Promise.resolve([]),
			}),
			health: { retrieve: () => Promise.resolve({ ok: false }) },
		} as any
	}

	return new Typesense.Client({
		apiKey: typesenseConfig.apiKey,
		connectionTimeoutSeconds: typesenseConfig.connectionTimeoutSeconds || 2,
		nodes: typesenseConfig.nodes.map((node) => ({
			...node,
			port: typeof node.port === "string" ? parseInt(node.port) : node.port,
		})),
	})
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
