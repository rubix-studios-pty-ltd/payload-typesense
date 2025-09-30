# Typesense Search Plugin for Payload CMS

A powerful, production-ready search plugin that integrates Typesense with Payload CMS, providing lightning-fast, typo-tolerant search capabilities with real-time synchronization.

```typescript
// payload.config.ts
import { buildConfig } from 'payload/config'
import { typesenseSearch } from 'typesense-search-plugin'

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
import { HeadlessSearchInput } from 'typesense-search-plugin'

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

## ✨ Features

- **⚡ Lightning Fast**: Sub-millisecond search response times
- **🔍 Flexible Search**: Single, multiple, or universal collection search with one component
- **🎨 Modern UI**: Beautiful, responsive design with Tailwind CSS
- **🎯 Smart API Selection**: Automatically chooses optimal endpoint for performance
- **🔄 Real-time Sync**: Automatic synchronization with Payload CMS
- **💾 Built-in Caching**: In-memory cache with configurable TTL
- **🛡️ Production Ready**: Comprehensive error handling and performance optimization
- **📱 Responsive**: Mobile-first design that works on all devices

## 🔧 API Endpoints

- `GET /api/search` - Universal search across all collections
- `GET /api/search/{collection}` - Search specific collection
- `POST /api/search/{collection}` - Advanced search with filters
- `GET /api/search/{collection}/suggest` - Search suggestions
- `GET /api/search/collections` - Collection metadata
- `GET /api/search/health` - Health check

## 🎨 Components

- **`HeadlessSearchInput`** - Single component supporting all search patterns:
  - **Single Collection**: `collection="posts"` - Direct API calls for optimal performance
  - **Multiple Collections**: `collections={['posts', 'products']}` - Smart filtering with universal search
  - **Universal Search**: No collection props - Search across all collections
  - **Complete UI Control**: Customizable rendering with comprehensive theme system

## 🎨 Theme System

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

## 🆕 What's New in v1.4.0

### 🎨 Theme System - Major Feature Release

- **🎨 Comprehensive Theme System**: 5 pre-built themes (Modern, Minimal, Elegant, Dark, Colorful)
- **🎨 Unlimited Customization**: Override any color, spacing, typography, or animation
- **🎨 Performance Options**: Disable animations/shadows for better performance
- **🎨 Responsive Design**: Automatic mobile optimization with theme system
- **🎨 CSS Variables**: Advanced styling with CSS custom properties (29 variables)
- **🎨 TypeScript Support**: Full type safety for all theme configurations
- **🎨 Theme Provider**: Advanced theme context management
- **🎨 React Hooks**: useTheme, useThemeConfig, useResponsiveTheme for theme management
- **🎨 Developer-Friendly**: All theme configurations within the plugin and components

### 🚀 Enhanced Features

- **🚀 Enhanced HeadlessSearchInput**: Now supports comprehensive theme system integration
- **🎯 Smart API Selection**: Automatically chooses the most efficient endpoint
- **📊 Relative Scoring**: Meaningful percentage display for search result relevance
- **🔧 Simplified Architecture**: One component handles all search patterns
- **📱 Responsive Design**: Mobile-first approach with excellent UX
- **⚡ Performance**: Optimized with client-side filtering and efficient API calls
- **📚 Complete Documentation**: Comprehensive theme system documentation with examples
- **🧪 Integrated Demo**: Theme showcase and testing interface in search demo

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Typesense](https://typesense.org/) for the amazing search engine
- [Payload CMS](https://payloadcms.com/) for the flexible headless CMS
