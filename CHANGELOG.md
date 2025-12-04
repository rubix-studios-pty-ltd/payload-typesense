# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
