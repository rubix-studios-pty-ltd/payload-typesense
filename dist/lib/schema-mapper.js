// Helper function to extract text content from richText structure
const extractTextFromRichText = (richText)=>{
    if (!richText || !richText.root) {
        return "";
    }
    const extractText = (node)=>{
        if (typeof node === "string") {
            return node;
        }
        if (node && typeof node === "object") {
            if (node.text) {
                return node.text;
            }
            if (node.children && Array.isArray(node.children)) {
                return node.children.map(extractText).join("");
            }
        }
        return "";
    };
    return extractText(richText.root);
};
export const mapCollectionToTypesenseSchema = (collection, collectionSlug, config)=>{
    const searchableFields = config?.searchFields || [
        "title",
        "content",
        "description"
    ];
    const facetFields = config?.facetFields || [];
    // Map schema for collection
    // Base fields that every collection should have
    // Note: 'id' field is automatically created by Typesense, so we don't include it
    const baseFields = [
        {
            name: "slug",
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
    // Process search fields
    // Map facet-only fields (not in searchable fields)
    const facetOnlyFields = facetFields.filter((field)=>!searchableFields.includes(field)).map((field)=>({
            name: field,
            type: "string",
            facet: true
        }));
    const finalSchema = {
        name: collectionSlug,
        fields: [
            ...baseFields,
            ...searchFields,
            ...facetOnlyFields
        ]
    };
    // Return final schema
    return finalSchema;
};
export const mapPayloadDocumentToTypesense = (doc, collectionSlug, config)=>{
    const searchableFields = config?.searchFields || [
        "title",
        "content",
        "description"
    ];
    const facetFields = config?.facetFields || [];
    // Validate required fields
    if (!doc.id) {
        throw new Error(`Document missing required 'id' field: ${JSON.stringify(doc)}`);
    }
    if (!doc.createdAt) {
        // Use current time for missing createdAt
        doc.createdAt = new Date();
    }
    if (!doc.updatedAt) {
        // Use current time for missing updatedAt
        doc.updatedAt = new Date();
    }
    // Base document structure with safe date handling
    const typesenseDoc = {
        id: String(doc.id),
        slug: doc.slug || "",
        createdAt: new Date(doc.createdAt).getTime(),
        updatedAt: new Date(doc.updatedAt).getTime()
    };
    // Add searchable fields with validation
    searchableFields.forEach((field)=>{
        // Handle array fields with dot notation (e.g., 'technologies.name', 'tags.tag')
        if (field.includes(".")) {
            const [arrayField, subField] = field.split(".", 2);
            if (arrayField && subField && Array.isArray(doc[arrayField]) && doc[arrayField].length > 0) {
                typesenseDoc[field] = doc[arrayField].map((item)=>item?.[subField] || "").join(" ");
            } else {
                typesenseDoc[field] = "";
            }
        } else if (doc[field] !== undefined && doc[field] !== null) {
            // Handle richText fields specially
            if ((field === "content" || field === "description") && typeof doc[field] === "object" && doc[field].root) {
                // Extract text from richText structure
                typesenseDoc[field] = extractTextFromRichText(doc[field]);
            } else {
                // Convert to string for other fields
                typesenseDoc[field] = String(doc[field]);
            }
        } else {
            // Set empty string for missing fields
            typesenseDoc[field] = "";
        }
    });
    // Add facet fields with validation - ensure all facet fields are present
    facetFields.forEach((field)=>{
        if (doc[field] !== undefined && doc[field] !== null) {
            // Convert to string for facet fields
            typesenseDoc[field] = String(doc[field]);
        } else {
            // Add default value for missing facet fields
            typesenseDoc[field] = "unknown";
        }
    });
    // Validate that we have at least one searchable field
    const hasSearchableContent = searchableFields.some((field)=>typesenseDoc[field] && typesenseDoc[field].trim().length > 0);
    if (!hasSearchableContent) {
        // Add placeholder for missing content
        typesenseDoc.title = typesenseDoc.title || `Document ${doc.id}`;
    }
    return typesenseDoc;
};
