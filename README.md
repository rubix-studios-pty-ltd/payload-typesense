# PayloadCMS + Typesense Plugin

Forked from FrontTribe’s Typesense Search Plugin, Rubix Studios implementation has been substantially re-engineered to meet stricter production, deployment, and TypeScript standards. The codebase has been streamlined for improved maintainability, enhanced type safety, and predictable behaviour under load, while preserving full compatibility with Payload CMS and Typesense.

The fork introduces meaningful architectural improvements, including more efficient caching strategies with race-condition mitigation, improved request handling, and deployment-safe defaults. The result is a lighter, more resilient integration.

With a modular, tree-shakable structure and optional support for advanced search capabilities such as vector-based querying, the plugin is designed to scale from simple content search implementations to more complex, search-driven applications without unnecessary bloat.

This project is actively maintained by Rubix Studios and is intended for production environments where performance, stability, and code quality are critical.

[![install size](https://packagephobia.com/badge?p=@rubixstudios/payload-typesense)](https://packagephobia.com/result?p=@rubixstudios/payload-typesense)
**PayloadCMS + Typesense Plugin**

[![install size](https://packagephobia.com/badge?p=typesense-search-plugin)](https://packagephobia.com/result?p=typesense-search-plugin)
**FrontTribe's Typesense Search Plugin**

[![npm version](https://img.shields.io/npm/v/@rubixstudios/payload-typesense.svg)](https://www.npmjs.com/package/@rubixstudios/payload-typesense)
![Release](https://github.com/rubix-studios-pty-ltd/payload-typesense/actions/workflows/release.yml/badge.svg)

## Installation

```sh
pnpm add @rubixstudios/payload-typesense
```

```typescript
// payload.config.ts
import { buildConfig } from 'payload/config'
import { typesenseSearch } from '@rubixstudios/payload-typesense'

export default buildConfig({
  plugins: [
    typesenseSearch({
      typesense: {
        apiKey: 'xyz',
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
          syncLimit: 500, // Overrides the default per-page sync limit of 1000
        },
      },
      // This feature is experimental
      vectorSearch: {
        enabled: true, // Enables vector-based semantic search
        embedFrom: ['title', 'content'], // Omit to fall back to collection searchFields
        embeddingModel: 'ts/all-MiniLM-L12-v2',
      },
    }),
  ],
})
```

```tsx
import { HeadlessSearchInput } from '@rubixstudios/payload-typesense'

export function GlobalSearchPage() {
  return (
    <HeadlessSearchInput
      baseUrl="http://localhost:3000"
      theme="modern" // Available themes: "modern" | "dark"
      placeholder="Search everything..."
      onResultClick={(result) => {
        console.log('Selected document:', result.document)
      }}
    />
  )
}

export function CollectionSearch() {
  return (
    <HeadlessSearchInput
      baseUrl="http://localhost:3000"
      collections={['posts', 'products']}
      placeholder="Search posts and products..."
      onResultClick={(result) => {
        console.log('Selected document:', result.document)
      }}
    />
  )
}

export function VectorSearch() {
  return (
    <HeadlessSearchInput
      baseUrl="http://localhost:3000"
      vector={true} // Vector search enabled
      collections={['posts', 'products']}
      placeholder="Search posts and products..."
      onResultClick={(result) => {
        console.log('Selected document:', result.document)
      }}
    />
  )
}
```

## Features

- **Performance**  
  Sub-millisecond search responses with optimized request handling.
- **Flexible Search**  
  Single-collection, multi-collection, or universal search using one component.
- **Vector Search**  
  Optional semantic search using embeddings, with graceful fallback to keyword search.
- **Modern UI**  
  Headless, responsive implementation compatible with Tailwind CSS.
- **Real-Time Synchronisation**  
  Continuous indexing and sync with Payload CMS.
- **Efficient Caching**  
  In-memory caching with configurable TTL and race-condition safeguards.
- **Production Ready**  
  Robust error handling, deployment-safe defaults, and platform compatibility.
- **Tree-Shakable Architecture**  
  Modular design enabling smaller bundles and selective feature usage.

## Endpoints

- `GET /api/search` - Universal search across all collections
- `GET /api/search/{collection}` - Search specific collection
- `POST /api/search/{collection}` - Advanced search with filters
- `GET /api/search/{collection}/suggest` - Search suggestions
- `GET /api/search/collections` - Collection metadata
- `GET /api/search/health` - Health check

## Components

- **HeadlessSearchInput**: Single component supporting all search patterns:
- **Collections**: `collections={['posts', 'products']}` - Smart filtering with universal search
- **Universal Search**: No collection props - Search across all collections
- **Complete UI Control**: Customizable rendering with comprehensive theme system

## Themes

The plugin includes a powerful theme system with 2 pre-built themes and unlimited customization:

### Pre-built

```tsx
// Modern theme (default)
<HeadlessSearchInput theme="modern" />

// Dark theme
<HeadlessSearchInput theme="dark" />
```

### Custom

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

<HeadlessSearchInput theme={customTheme} />
```

### Theme Features

- **2 Pre-built Themes**: Modern, Dark
- **Unlimited Customization**: Override any color, spacing, typography, or animation
- **Performance Options**: Disable animations/shadows for better performance
- **Responsive Design**: Automatic mobile optimization
- **CSS Variables**: Advanced styling with CSS custom properties
- **TypeScript Support**: Full type safety for all theme configurations

## Production

- **Race Condition Protection**: `ensureCollection` prevents startup crashes
- **Type Safety**: Proper Payload CMS types prevent runtime errors
- **Document Validation**: Filters malformed data before sync
- **Graceful Degradation**: Silent failures don't break Payload operations

## Developer

- **Smaller Components**: Easier to understand and maintain
- **Maintainable**: Single Responsibility Principle enforced
- **Well-Documented**: Clear separation of concerns

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support or inquiries:

- LinkedIn: [rubixvi](https://www.linkedin.com/in/rubixvi/)
- Website: [Rubix Studios](https://rubixstudios.com.au)

## Author

Rubix Studios Pty. Ltd.  
[https://rubixstudios.com.au](https://rubixstudios.com.au)

## Acknowledgments

- [FrontTribe](https://github.com/FrontTribe/typesense-search)
