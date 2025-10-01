# PayloadCMS + Typesense Plugin

This plugin is a fork of FrontTribe's Typesense Search Plugin for Payload CMS…

A production-ready search plugin that integrates Typesense with Payload CMS, offering fast, typo-tolerant search with real-time synchronization. This fork by Rubix Studios reduces bloat and introduces targeted changes for improved performance, maintainability, and flexibility.

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
        nodes: [{ host: 'localhost', port: 8108, protocol: 'http' }],
      },
      collections: {
        posts: {
          enabled: true,
          searchFields: ['title', 'content'],
          facetFields: ['category', 'status'],
          displayName: 'Blog Posts',
          icon: '📝',
        },
      },
    }),
  ],
})
```

```tsx
import { HeadlessSearchInput } from '@rubixstudios/payload-typesense'

function SearchPage() {
  return (
    <HeadlessSearchInput
      baseUrl="http://localhost:3000"
      theme="modern" // Choose from: modern, dark
      placeholder="Search everything..."
      onResultClick={(result) => {
        console.log('Selected:', result.document)
      }}
    />
  )
}

// Multi-collection search
function MultiCollectionSearch() {
  return (
    <HeadlessSearchInput
      baseUrl="http://localhost:3000"
      collections={['posts', 'products']}
      placeholder="Search posts & products..."
      onResultClick={(result) => {
        console.log('Selected:', result.document)
      }}
    />
  )
}

// Single collection search
function PostSearch() {
  return (
    <HeadlessSearchInput
      baseUrl="http://localhost:3000"
      collection="posts"
      placeholder="Search posts..."
      onResultClick={(result) => {
        console.log('Selected:', result.document)
      }}
    />
  )
}
```

## Features

- **Performance**: Sub-millisecond response times for search queries
- **Flexible**: Single, multiple, or universal collection search with one component
- **Modern**: Responsive design implemented with Tailwind CSS
- **Optimized API**: Automatically routes requests to the most efficient endpoint
- **Real-Time**: Continuous data sync with Payload CMS
- **Caching**: In-memory cache with configurable time-to-live settings
- **Production Ready**: Robust error handling and performance optimization
- **Responsive**: Mobile-first architecture ensuring compatibility across devices

## API Endpoints

- `GET /api/search` - Universal search across all collections
- `GET /api/search/{collection}` - Search specific collection
- `POST /api/search/{collection}` - Advanced search with filters
- `GET /api/search/{collection}/suggest` - Search suggestions
- `GET /api/search/collections` - Collection metadata
- `GET /api/search/health` - Health check

## Components

- **HeadlessSearchInput**: Single component supporting all search patterns:
- **Single Collection**: `collection="posts"` - Direct API calls for optimal performance
- **Multiple Collections**: `collections={['posts', 'products']}` - Smart filtering with universal search
- **Universal Search**: No collection props - Search across all collections
- **Complete UI Control**: Customizable rendering with comprehensive theme system

## Theme System

The plugin includes a powerful theme system with 2 pre-built themes and unlimited customization:

### Pre-built Themes

```tsx
// Modern theme (default)
<HeadlessSearchInput theme="modern" />

// Dark theme
<HeadlessSearchInput theme="dark" />
```

### Custom Themes

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
