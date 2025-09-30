import Typesense from "typesense"

import type { TypesenseSearchConfig } from "../index.js"

let client: null | Typesense.Client = null

const isOffline = (): boolean => {
	const evt = process.env.npm_lifecycle_event || ""

	if (evt.includes("build") || evt === "tsc") {
		return true
	}

	if (process.argv.some((a) => /(?:^|:|\/)(?:build|tsc)(?::|$)/i.test(a))) {
		return true
	}

	if (process.env.CI === "true") {
		return true
	}

	return false
}

const createOfflineClient = (): Typesense.Client => {
	return {
		analytics: {
			retrieve: () => {
				return Promise.reject(new Error("Typesense offline"))
			},
		},
		collections: () => {
			return {
				retrieve: () => {
					return Promise.reject(new Error("Typesense offline"))
				},
			}
		},
		health: {
			retrieve: () => {
				return Promise.reject(new Error("Typesense offline"))
			},
		},
		operations: {
			get: () => {
				return Promise.reject(new Error("Typesense offline"))
			},
		},
	} as unknown as Typesense.Client
}

export const createTypesenseClient = (
	typesenseConfig: TypesenseSearchConfig["typesense"]
): Typesense.Client => {
	if (client) {
		return client
	}

	if (isOffline()) {
		client = createOfflineClient()
		return client
	}

	client = new Typesense.Client({
		apiKey: typesenseConfig.apiKey,
		connectionTimeoutSeconds: typesenseConfig.connectionTimeoutSeconds || 2,
		nodes: typesenseConfig.nodes.map((node) => ({
			...node,
			port: typeof node.port === "string" ? parseInt(node.port, 10) : node.port,
		})),
	})

	return client
}

export const testTypesenseConnection = async (
	c: Typesense.Client
): Promise<boolean> => {
	try {
		const res = await c.health.retrieve()

		return typeof (res as any)?.ok === "boolean" ? !!(res as any).ok : true
	} catch {
		return false
	}
}
