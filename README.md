# Typesense Plugin for Payload CMS

This plugin is a fork of FrontTribe's Typesense Search Plugin for Payload CMS…

A production-ready search plugin that integrates Typesense with Payload CMS, offering fast, typo-tolerant search with real-time synchronization. This fork by Rubix Studios reduces bloat and introduces targeted changes for improved performance, maintainability, and flexibility.

## Installation

```sh
pnpm add @rubixstudios/typesense
```

```typescript
// payload.config.ts
import { buildConfig } from 'payload/config'
import { typesenseSearch } from '@rubixstudios/typesense'

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
// 4. Use the search component
import { HeadlessSearchInput } from '@rubixstudios/typesense'

function SearchPage() {
  return (
    <HeadlessSearchInput
      baseUrl="http://localhost:3000"
      theme="modern" // Choose from: modern, minimal, elegant, dark, colorful
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
- **Flexible Search**: Single, multiple, or universal collection search with one component
- **Modern Interface**: Responsive design implemented with Tailwind CSS
- **Optimized API**: Automatically routes requests to the most efficient endpoint
- **Real-Time Sync**: Continuous data sync with Payload CMS
- **Built-in Caching**: In-memory cache with configurable time-to-live settings
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

- **`HeadlessSearchInput`** - Single component supporting all search patterns:
  - **Single Collection**: `collection="posts"` - Direct API calls for optimal performance
  - **Multiple Collections**: `collections={['posts', 'products']}` - Smart filtering with universal search
  - **Universal Search**: No collection props - Search across all collections
  - **Complete UI Control**: Customizable rendering with comprehensive theme system

## Theme System

The plugin includes a powerful theme system with 5 pre-built themes and unlimited customization:

### Pre-built Themes

```tsx
// Modern theme (default) - Clean and professional
<HeadlessSearchInput theme="modern" />

// Minimal theme - Flat design with minimal styling
<HeadlessSearchInput theme="minimal" />

// Elegant theme - Sophisticated with gradients
<HeadlessSearchInput theme="elegant" />

// Dark theme - Perfect for dark mode
<HeadlessSearchInput theme="dark" />

// Colorful theme - Vibrant and modern
<HeadlessSearchInput theme="colorful" />
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

- **5 Pre-built Themes**: Modern, Minimal, Elegant, Dark, Colorful
- **Unlimited Customization**: Override any color, spacing, typography, or animation
- **Performance Options**: Disable animations/shadows for better performance
- **Responsive Design**: Automatic mobile optimization
- **CSS Variables**: Advanced styling with CSS custom properties
- **TypeScript Support**: Full type safety for all theme configurations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- [FrontTribe](https://github.com/FrontTribe/typesense-search)
- [Typesense](https://typesense.org/)
- [Payload CMS](https://payloadcms.com/)
