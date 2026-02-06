# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.3](https://github.com/rubix-studios-pty-ltd/payload-typesense/compare/v1.4.2...v1.4.3) (2026-02-06)


### Bug Fixes

* **deps:** raise Next.js peer minimums to patched versions (CVE) ([a94a318](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/a94a318ac7fc18fe75f2897baaa892702733533f))

## [1.4.2](https://github.com/rubix-studios-pty-ltd/payload-typesense/compare/v1.4.1...v1.4.2) (2026-01-30)


### Bug Fixes

* update @biomejs/biome to version 2.3.13 in package.json and pnpm-lock.yaml ([0ada17d](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/0ada17d5cdb4f70d76d6a52cb498b8df0100b319))
* update biome schema version to 2.3.13 and bump pnpm version to 10.28.2 ([e70504b](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/e70504b95f3f599d67f2f39b346644f81b92bd4a))
* update package.json and pnpm-lock.yaml for @types/react, axios, and undici versions ([8cfeb8d](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/8cfeb8de2aaf248217e7c0a8f55a2cc17305be2c))

## [1.4.1](https://github.com/rubix-studios-pty-ltd/payload-typesense/compare/v1.4.0...v1.4.1) (2026-01-26)


### Bug Fixes

* force push for undici ([4e3ec4b](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/4e3ec4bd7770cd9876be483b4c15252f7a411e73))

# [1.4.0](https://github.com/rubix-studios-pty-ltd/payload-typesense/compare/v1.3.3...v1.4.0) (2026-01-24)


### Features

* force minor release ([3f54425](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/3f544258f6d919b671862913239b6a22e600703b))

## [1.3.3](https://github.com/rubix-studios-pty-ltd/payload-typesense/compare/v1.3.2...v1.3.3) (2026-01-18)


### Bug Fixes

* prevent upsert of undefined document in syncDocumentToTypesense ([6f06871](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/6f06871c7f242baace30b58dd40e13794a66603e))
* streamline document mapping and connection validation in Typesense integration ([52d0ca1](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/52d0ca140124199e5622888ab96e33949ee7615d))

## [1.3.2](https://github.com/rubix-studios-pty-ltd/payload-typesense/compare/v1.3.1...v1.3.2) (2026-01-17)


### Bug Fixes

* simplify connection check in initializeTypesense by removing warning log ([c3a1b6f](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/c3a1b6f3f6a953bf4751411240a228f3896322f8))

## [1.3.1](https://github.com/rubix-studios-pty-ltd/payload-typesense/compare/v1.3.0...v1.3.1) (2026-01-17)


### Bug Fixes

* remove 'id' field from baseFields in mapCollectionToTypesense ([888133f](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/888133f23a98000c41896108d157a2fb6a52e544))
* remove comment about excluding 'id' field from baseFields in mapCollectionToTypesense ([8fbb8ac](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/8fbb8accc5b88df78144ffeaba54d03bdd5cb4c7))

# [1.3.0](https://github.com/rubix-studios-pty-ltd/payload-typesense/compare/v1.2.4...v1.3.0) (2026-01-17)


### Bug Fixes

* update cache key assignment in getAllCollections for improved caching ([ed8cd95](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/ed8cd95c4e71f7af5c28a7c89a315dba441e0acd))
* update key assignment in HeadlessSearchInput and refine document type in SearchResult ([9de2b88](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/9de2b88b9f82aeb3df19de9ccf264f001b3e78d1))


### Features

* add support for filtering by collections in search functionality ([275bc48](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/275bc48ea0d66c008046c720667c3d9a3d6e870b))
* add vector search functionality with API and UI support ([86db6cd](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/86db6cdaa3ee66f6c59ff26c12d55da9685a17f2))
* enhance README and implement vector search capabilities with improved caching and request handling ([3811bec](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/3811bece2b493fd23d490d56db862e37c9145148))
* fix search result count and improve code quality ([8851099](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/885109956da20c4c51c6e9b3bfcfc15e6e88fe77))

## [1.2.4](https://github.com/rubix-studios-pty-ltd/payload-typesense/compare/v1.2.3...v1.2.4) (2026-01-15)


### Bug Fixes

* update @types/node dependency to version 25.0.9 ([77e8cd1](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/77e8cd145b18cd0973ac53f13a95b197d5d9d14d))
* update node engine version to support 24.x and 25.x ([876a02d](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/876a02df61c9bac4abd2af47ab8000a636cb8bdf))
* update prettier to version 3.8.0 and adjust node engine requirement ([bc28deb](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/bc28deb6f00d192cb3551a80ceed29731eba7887))

## [1.2.3](https://github.com/rubix-studios-pty-ltd/payload-typesense/compare/v1.2.2...v1.2.3) (2026-01-14)


### Bug Fixes

* update payload dependency to version 3.70.0 ([5199172](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/5199172baf14571a97aa5fd79517869f3899eb69))

## [1.2.2](https://github.com/rubix-studios-pty-ltd/payload-typesense/compare/v1.2.1...v1.2.2) (2026-01-04)


### Bug Fixes

* update copyright year for Rubix Studios in LICENSE ([ce1033b](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/ce1033b61cc31ff6de2d008ab56b03f9fcd02ac8))
* update packageManager to pnpm@10.26.2 ([2b223cd](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/2b223cda9c36910d928a5642117504df182e8827))
* update packageManager to pnpm@10.27.0 ([a388306](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/a3883069a9ed53b2789aae8a28622eaa33d8f841))
* update zod dependency to version 4.3.5 ([eacc490](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/eacc4903bc530614019d5cfaa1c4aa6b20b9a88b))

## [1.2.1](https://github.com/rubix-studios-pty-ltd/payload-typesense/compare/v1.2.0...v1.2.1) (2025-12-04)


### Bug Fixes

* **security:** update prettier to version 3.7.4 and other dependencies ([932ffce](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/932ffceeec291bde0da116e3c01a76d4bd322a94))

# [1.2.0](https://github.com/rubix-studios-pty-ltd/payload-typesense/compare/v1.1.8...v1.2.0) (2025-11-30)


### Features

* **sync:** implement pagination and configurable sync limit for document synchronization ([ccfe345](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/ccfe345392e4bd67b66c66a4562988118b53aded))

## [1.1.8](https://github.com/rubix-studios-pty-ltd/payload-typesense/compare/v1.1.7...v1.1.8) (2025-11-30)


### Bug Fixes

* **search:** trigger release with cleaned HeadlessSearchInput structure ([3cdd668](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/3cdd6686103d9fd262ca25267e2dfc9911cd1238))

## [1.1.7](https://github.com/rubix-studios-pty-ltd/payload-typesense/compare/v1.1.6...v1.1.7) (2025-11-29)


### Bug Fixes

* remove unused semantic-release dependencies from package.json and pnpm-lock.yaml ([95a3668](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/95a36680b4fb2c4707e2edfa137af4c0f9055abc))
* update devDependencies in package.json and pnpm-lock.yaml to use caret (^) for versioning ([28f7cd4](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/28f7cd4c3c4a687d30ac6b8985baa4c20371465f))

## [1.1.6](https://github.com/rubix-studios-pty-ltd/payload-typesense/compare/v1.1.5...v1.1.6) (2025-11-29)


### Bug Fixes

* add npm upgrade step for OIDC compatibility in release workflow ([9e0cb5e](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/9e0cb5e30728ed2ef21a56a14617e396b2ed4b8c))

## [1.1.5](https://github.com/rubix-studios-pty-ltd/payload-typesense/compare/v1.1.4...v1.1.5) (2025-11-29)


### Bug Fixes

* update release workflow for improved npm provenance handling ([60002af](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/60002afcc94586626ec6e50cde18b8be1163904b))

## [1.1.4](https://github.com/rubix-studios-pty-ltd/payload-typesense/compare/v1.1.3...v1.1.4) (2025-11-29)


### Bug Fixes

* update @types/react and related dependencies to latest versions ([ab5be3d](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/ab5be3d559115554f96b0f898a85b12d95d04220))
* update packageManager version to pnpm@10.24.0 ([ce8bab3](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/ce8bab3f2be76db2330ab1086f8e1df7318322aa))
* update payload and prettier to latest versions ([8fe0805](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/8fe08052389506ec15ef3718725909cfc0fc2f6f))
* update release workflow and configuration for npm provenance ([f80ad51](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/f80ad51d9a921ac2241ecf705df89e5fee70f4e2))

## [1.1.3](https://github.com/rubix-studios-pty-ltd/payload-typesense/compare/v1.1.2...v1.1.3) (2025-11-16)


### Bug Fixes

* enable '@typescript-eslint/unbound-method' rule in ESLint configuration ([f5b19f2](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/f5b19f279e8de2d587bd4fbed2aeba442edee7fa))

## [1.1.2](https://github.com/rubix-studios-pty-ltd/payload-typesense/compare/v1.1.1...v1.1.2) (2025-11-16)


### Bug Fixes

* enforce required fields in BaseDocument interface and improve document filtering in syncExistingDocuments function ([0f78a1d](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/0f78a1da2c49791d4315515e06e063b6e7bcb156))
* improve type checking for document ID in delete hook ([5b0b475](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/5b0b4756069fa9fea87c7369e4b25832163a2117))
* simplify null check for document fields in mapToTypesense function ([a41783a](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/a41783a85a7cf5a8ab52f01b3c4ea05c2cd988ba))

## [1.1.1](https://github.com/rubix-studios-pty-ltd/payload-typesense/compare/v1.1.0...v1.1.1) (2025-10-31)


### Bug Fixes

* force release ([d3351b3](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/d3351b3b19754f357a4b7937f2cf993d600381a3))

# [1.1.0](https://github.com/rubix-studios-pty-ltd/payload-typesense/compare/v1.0.11...v1.1.0) (2025-10-10)


### Bug Fixes

* increase padding in HeadlessSearchInput component for better layout ([8d6305a](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/8d6305ad301e4e8a372ef3aad58dbe998c926fca))
* update eslint-config version references for consistency ([4fd2fe6](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/4fd2fe69031e5eff6ed1b0beadc476ed9b73d5ba))


### Features

* enhance functionality and improve performance ([5aee198](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/5aee198aa5a6163f9c99cb8ad2159150df954acc))

## [1.0.11](https://github.com/rubix-studios-pty-ltd/payload-typesense/compare/v1.0.10...v1.0.11) (2025-10-04)


### Bug Fixes

* restore renderDate and renderMatchPercentage props in HeadlessSearchInputProps interface ([59ad62e](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/59ad62ec77e6560311b8513181a3b7fd09a60986))

## [1.0.10](https://github.com/rubix-studios-pty-ltd/payload-typesense/compare/v1.0.9...v1.0.10) (2025-10-02)


### Bug Fixes

* remove 'dist/**' from release assets in semantic release configuration ([117e43f](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/117e43f0a858daba3c1389e3fa591e6889fb6f25))

## [1.0.9](https://github.com/rubix-studios-pty-ltd/payload-typesense/compare/v1.0.8...v1.0.9) (2025-10-02)


### Bug Fixes

* move pnpm install step to before the build process in release workflow ([0fa6c88](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/0fa6c88276f4a92802d29467964d364c5b76d23a))
* rename 'dev' branch to 'development' and update release assets ([d8df879](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/d8df8795babf261dc29b0dadde722c0a9c68975c))

## [1.0.8](https://github.com/rubix-studios-pty-ltd/payload-typesense/compare/v1.0.7...v1.0.8) (2025-10-02)


### Bug Fixes

* update email link in security policy for reporting vulnerabilities ([e00c2a4](https://github.com/rubix-studios-pty-ltd/payload-typesense/commit/e00c2a4e03c1801aec3b67cd7aef0e0b928cd5c4))
