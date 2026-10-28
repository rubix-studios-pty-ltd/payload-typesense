# Payload CMS + Typesense

A Typesense search plugin for Payload CMS, maintained by [Rubix Studios](https://rubixstudios.com.au). It provides automatic document synchronisation, configurable search endpoints, optional vector search, and a React search component with customisable themes.

[![npm version](https://img.shields.io/npm/v/@rubixstudios/payload-typesense.svg)](https://www.npmjs.com/package/@rubixstudios/payload-typesense)
[![Release](https://github.com/rubix-studios-pty-ltd/payload-typesense/actions/workflows/release.yml/badge.svg)](https://github.com/rubix-studios-pty-ltd/payload-typesense/actions/workflows/release.yml)

## Installation

```sh
pnpm add @rubixstudios/payload-typesense
```

Add the plugin to your Payload configuration and specify the collections you want indexed.

```typescript
// payload.config.ts
import { buildConfig } from 'payload'
import { typesenseSearch } from '@rubixstudios/payload-typesense'

export default buildConfig({
  plugins: [
    typesenseSearch({
      typesense: {
        apiKey: process.env.TYPESENSE_API_KEY!,
        nodes: [
          {
            host: 'localhost',
            port: 8108,
            protocol: 'http',
          },
        ],
      },
      collections: {
        posts: {
          enabled: true,
          searchFields: ['title', 'content'],
          facetFields: ['category', 'status'],
          displayName: 'Blog Posts',
          icon: '📝',
          syncLimit: 500,
        },
      },
    }),
  ],
})
```

The plugin initialises enabled collections in Typesense and synchronises existing documents during startup. Subsequent document changes and deletions are handled through Payload collection hooks when automatic synchronisation is enabled.

### React search component

`HeadlessSearchInput` provides a configurable search interface with keyboard navigation, loading states, result callbacks, and custom rendering support.

```tsx
'use client'

import { HeadlessSearchInput } from '@rubixstudios/payload-typesense'

export function GlobalSearch() {
  return (
    <HeadlessSearchInput
      baseUrl="http://localhost:3000"
      theme="modern"
      placeholder="Search everything..."
      onResultClick={(result) => {
        console.log('Selected document:', result.document)
      }}
    />
  )
}
```

Search all enabled collections by default, or use the `collections` prop to restrict results.

```tsx
;<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  collections={['posts', 'products']}
  placeholder="Search posts and products..."
/>
```

Vector search can also be requested using the `vector` prop when embedding support is configured.

## Features

The plugin supports keyword search across individual or multiple collections, with configurable searchable fields, filtering, sorting, faceting, and highlighting through Typesense. Search endpoints include in-memory caching to reduce repeated requests.

Document synchronisation is handled through Payload hooks, while existing documents are indexed during initialisation. Optional vector search enables embedding-based queries through supported models and Typesense configuration.

The included React component provides modern and dark themes, responsive styling, and custom rendering options without requiring a separate search UI library.

## API endpoints

Search endpoints are registered under Payload's `/api` path by default.

| Method | Endpoint                           | Purpose                     |
| ------ | ---------------------------------- | --------------------------- |
| GET    | `/api/search`                      | Search across collections   |
| GET    | `/api/search/{collection}`         | Search a collection         |
| POST   | `/api/search/{collection}`         | Advanced search             |
| GET    | `/api/search/{collection}/suggest` | Search suggestions          |
| GET    | `/api/search/collections`          | Available collections       |
| GET    | `/api/search/health`               | Health status               |
| GET    | `/api/search/health/detailed`      | Detailed health information |

Requests support pagination and the relevant Typesense search parameters. Vector search is available through the `vector=true` query parameter when enabled.

## Vector search

Vector search is optional and experimental. Configure an embedding model and the fields used to generate embeddings.

```typescript
vectorSearch: {
  enabled: true,
  embedFrom: ['title', 'content'],
  embeddingModel: 'azure/text-embedding-ada-002',
  modelConfig: {
    api_key: process.env.EMBEDDING_API_KEY!,
    url: 'https://modelendpoint.com/openai',
  },
},
```

When `embedFrom` is omitted, the plugin uses the collection's configured search fields. Embedding model credentials and endpoint settings depend on the selected provider.

To request vector search from the React component, pass `vector={true}`.

## Themes

Two themes are included, `modern` (default) and `dark`. Both can be customised using theme configuration options for colours, spacing, typography, shadows, and animations.

```tsx
const customTheme = {
  theme: 'modern',
  colors: {
    inputBorderFocus: '#10b981',
    inputBackground: '#f0fdf4',
    resultsBackground: '#f0fdf4',
  },
  spacing: {
    inputPadding: '1rem 1.25rem',
    inputBorderRadius: '1.5rem',
  },
  enableAnimations: true,
  enableShadows: true,
}

<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  theme={customTheme}
/>
```

The component also supports custom class names and rendering callbacks for more control over the search interface.

## Support

For issues, questions, or feature requests, visit [GitHub Issues](https://github.com/rubix-studios-pty-ltd/payload-typesense/issues) or contact [Rubix Studios](https://rubixstudios.com.au).

## License

Licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Credits

Developed and maintained by [Rubix Studios](https://rubixstudios.com.au). Based on the original [FrontTribe Typesense Search](https://github.com/FrontTribe/typesense-search) project.
