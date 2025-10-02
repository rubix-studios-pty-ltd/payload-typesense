import Typesense from "typesense";
let client = null;
const isOffline = ()=>{
    const evt = process.env.npm_lifecycle_event || "";
    if (evt.includes("build") || evt === "tsc") {
        return true;
    }
    if (process.argv.some((a)=>/(?:^|:|\/)(?:build|tsc)(?::|$)/i.test(a))) {
        return true;
    }
    if (process.env.CI === "true") {
        return true;
    }
    return false;
};
const createOfflineClient = ()=>{
    return {
        analytics: {
            retrieve: ()=>{
                return Promise.reject(new Error("Typesense offline"));
            }
        },
        collections: ()=>{
            return {
                retrieve: ()=>{
                    return Promise.reject(new Error("Typesense offline"));
                }
            };
        },
        health: {
            retrieve: ()=>{
                return Promise.reject(new Error("Typesense offline"));
            }
        },
        operations: {
            get: ()=>{
                return Promise.reject(new Error("Typesense offline"));
            }
        }
    };
};
export const createTypesenseClient = (typesenseConfig)=>{
    if (client) {
        return client;
    }
    if (isOffline()) {
        client = createOfflineClient();
        return client;
    }
    client = new Typesense.Client({
        apiKey: typesenseConfig.apiKey,
        connectionTimeoutSeconds: typesenseConfig.connectionTimeoutSeconds || 2,
        nodes: typesenseConfig.nodes.map((node)=>({
                ...node,
                port: typeof node.port === "string" ? parseInt(node.port, 10) : node.port
            }))
    });
    return client;
};
export const testTypesenseConnection = async (c)=>{
    try {
        const res = await c.health.retrieve();
        return typeof res?.ok === "boolean" ? !!res.ok : true;
    } catch  {
        return false;
    }
};
