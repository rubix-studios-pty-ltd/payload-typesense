'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useThemeConfig } from './themes/hooks.js';
const HeadlessSearchInput = ({ baseUrl, className = '', collection, collections, debounceMs = 300, enableSuggestions: _enableSuggestions = true, errorClassName = '', inputClassName = '', inputWrapperClassName = '', minQueryLength = 2, noResultsClassName = '', onResultClick, onResults, onSearch, perPage = 10, placeholder = 'Search...', renderError, renderInput, renderNoResults, renderResult, renderResultsHeader, resultItemClassName = '', resultsClassName = '', resultsContainerClassName = '', resultsHeaderClassName = '', resultsListClassName = '', showLoading = true, showResultCount = true, showSearchTime = true, theme = 'modern' })=>{
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);
    const resultsRef = useRef(null);
    const debounceRef = useRef(undefined);
    const collectionsRef = useRef(collections);
    // Theme configuration
    const themeConfig = useThemeConfig({
        theme: typeof theme === 'string' ? theme : theme.theme || 'modern',
        ...typeof theme === 'object' ? theme : {}
    });
    // Note: If neither collection nor collections is provided, the component will search all collections
    // Update collections ref when prop changes
    useEffect(()=>{
        collectionsRef.current = collections;
    }, [
        collections
    ]);
    // Debounced search function
    // Use refs to avoid recreating functions on every render
    const onResultsRef = useRef(onResults);
    const onSearchRef = useRef(onSearch);
    onResultsRef.current = onResults;
    onSearchRef.current = onSearch;
    const performSearch = useCallback(async (searchQuery)=>{
        if (searchQuery.length < minQueryLength) {
            setResults(null);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            let searchUrl;
            let searchResults;
            if (collection) {
                // Single collection search
                searchUrl = `${baseUrl}/api/search/${collection}?q=${encodeURIComponent(searchQuery)}&per_page=${perPage}`;
            } else if (collectionsRef.current && collectionsRef.current.length > 0) {
                // Multiple collections specified - use universal search and filter client-side
                searchUrl = `${baseUrl}/api/search?q=${encodeURIComponent(searchQuery)}&per_page=${perPage * 2}`;
            } else {
                // No collections specified - use universal search
                searchUrl = `${baseUrl}/api/search?q=${encodeURIComponent(searchQuery)}&per_page=${perPage}`;
            }
            const response = await fetch(searchUrl);
            if (!response.ok) {
                throw new Error(`Search failed: ${response.status} ${response.statusText}`);
            }
            searchResults = await response.json();
            // Filter results if specific collections were requested
            if (collectionsRef.current && collectionsRef.current.length > 0) {
                const filteredHits = searchResults.hits?.filter((hit)=>hit.collection && collectionsRef.current.includes(hit.collection)) || [];
                const filteredCollections = searchResults.collections?.filter((col)=>col.collection && collectionsRef.current.includes(col.collection)) || [];
                searchResults = {
                    ...searchResults,
                    collections: filteredCollections,
                    found: filteredHits.length,
                    hits: filteredHits
                };
            }
            setResults(searchResults);
            onResultsRef.current?.(searchResults);
            onSearchRef.current?.(searchQuery, searchResults);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Search failed');
            setResults(null);
        } finally{
            setIsLoading(false);
        }
    }, [
        baseUrl,
        collection,
        perPage,
        minQueryLength
    ]);
    // Debounced search effect
    useEffect(()=>{
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        if (query.length >= minQueryLength) {
            debounceRef.current = setTimeout(()=>{
                void performSearch(query);
                void onSearchRef.current?.(query, results || {
                    found: 0,
                    hits: [],
                    page: 1,
                    request_params: {
                        per_page: 10,
                        q: query
                    },
                    search_cutoff: false,
                    search_time_ms: 0
                });
            }, debounceMs);
        } else {
            setResults(null);
            setIsLoading(false);
        }
        return ()=>{
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        query,
        debounceMs,
        minQueryLength,
        performSearch
    ]);
    // Handle input change
    const handleInputChange = (e)=>{
        const value = e.target.value;
        setQuery(value);
        setIsOpen(value.length >= minQueryLength);
    };
    // Handle input focus
    const handleInputFocus = ()=>{
        if (query.length >= minQueryLength) {
            setIsOpen(true);
        }
    };
    // Handle input blur
    const handleInputBlur = (_e)=>{
        // Delay hiding results to allow clicking on them
        setTimeout(()=>{
            if (!resultsRef.current?.contains(document.activeElement)) {
                setIsOpen(false);
            }
        }, 150);
    };
    // Handle result click
    const handleResultClick = (result)=>{
        onResultClick?.(result);
        setIsOpen(false);
        setQuery('');
    };
    // Handle keyboard navigation
    const handleKeyDown = (e)=>{
        if (!isOpen || !results) {
            return;
        }
        const resultItems = resultsRef.current?.querySelectorAll('[data-result-item]');
        if (!resultItems) {
            return;
        }
        const currentIndex = Array.from(resultItems).findIndex((item)=>item === document.activeElement);
        switch(e.key){
            case 'ArrowDown':
                {
                    e.preventDefault();
                    const nextIndex = currentIndex < resultItems.length - 1 ? currentIndex + 1 : 0;
                    resultItems[nextIndex]?.focus();
                    break;
                }
            case 'ArrowUp':
                {
                    e.preventDefault();
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : resultItems.length - 1;
                    resultItems[prevIndex]?.focus();
                    break;
                }
            case 'Enter':
                e.preventDefault();
                if (currentIndex >= 0 && resultItems[currentIndex]) {
                    ;
                    resultItems[currentIndex]?.click();
                }
                break;
            case 'Escape':
                setIsOpen(false);
                inputRef.current?.blur();
                break;
        }
    };
    // Default render functions
    const defaultRenderResult = (result, _index)=>{
        // Calculate relative percentage based on the highest score in current results
        const maxScore = results?.hits?.reduce((max, hit)=>Math.max(max, hit.text_match || 0), 0) || 1;
        const relativePercentage = Math.round((result.text_match || 0) / maxScore * 100);
        return /*#__PURE__*/ React.createElement("div", {
            className: `${resultsContainerClassName}`,
            style: {
                backgroundColor: themeConfig.theme.colors.resultBackground,
                borderBottom: `1px solid ${themeConfig.theme.colors.resultBorder}`,
                cursor: 'pointer',
                padding: themeConfig.theme.spacing.itemPadding,
                transition: themeConfig.config.enableAnimations !== false ? `all ${themeConfig.theme.animations.transitionFast} ${themeConfig.theme.animations.easeInOut}` : 'none'
            }
        }, /*#__PURE__*/ React.createElement("div", {
            className: `${themeConfig.classes.resultItem} ${resultItemClassName}`,
            "data-result-item": true,
            key: result.document?.id || result.id || _index,
            onBlur: (e)=>{
                e.currentTarget.style.backgroundColor = themeConfig.theme.colors.resultBackground;
            },
            onClick: ()=>handleResultClick(result),
            onFocus: (e)=>{
                e.currentTarget.style.backgroundColor = themeConfig.theme.colors.resultBackgroundFocus;
            },
            onKeyDown: (e)=>{
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleResultClick(result);
                }
            },
            onMouseEnter: (e)=>{
                e.currentTarget.style.backgroundColor = themeConfig.theme.colors.resultBackgroundHover;
            },
            onMouseLeave: (e)=>{
                e.currentTarget.style.backgroundColor = themeConfig.theme.colors.resultBackground;
            },
            role: "button",
            tabIndex: 0
        }, /*#__PURE__*/ React.createElement("div", {
            style: {
                alignItems: 'flex-start',
                display: 'flex',
                gap: '12px'
            }
        }, /*#__PURE__*/ React.createElement("div", {
            style: {
                flexShrink: 0,
                marginTop: '4px'
            }
        }, /*#__PURE__*/ React.createElement("div", {
            style: {
                alignItems: 'center',
                backgroundColor: themeConfig.theme.colors.collectionBadge,
                borderRadius: themeConfig.theme.spacing.inputBorderRadius,
                color: themeConfig.theme.colors.collectionBadgeText,
                display: 'flex',
                fontSize: '14px',
                fontWeight: themeConfig.theme.typography.fontWeightMedium,
                height: '32px',
                justifyContent: 'center',
                width: '32px'
            }
        }, result.collection?.charAt(0).toUpperCase() || '📄')), /*#__PURE__*/ React.createElement("div", {
            style: {
                flex: 1,
                minWidth: 0
            }
        }, /*#__PURE__*/ React.createElement("div", {
            style: {
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px'
            }
        }, /*#__PURE__*/ React.createElement("h3", {
            style: {
                color: themeConfig.theme.colors.titleText,
                fontFamily: themeConfig.theme.typography.fontFamily,
                fontSize: themeConfig.theme.typography.fontSizeLg,
                fontWeight: themeConfig.theme.typography.fontWeightSemibold,
                lineHeight: themeConfig.theme.typography.lineHeightTight,
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            }
        }, result.document?.title || result.document?.name || result.title || 'Untitled'), typeof result.text_match === 'number' && !isNaN(result.text_match) && /*#__PURE__*/ React.createElement("span", {
            style: {
                alignItems: 'center',
                backgroundColor: themeConfig.theme.colors.scoreBadge,
                borderRadius: '4px',
                color: themeConfig.theme.colors.scoreBadgeText,
                display: 'inline-flex',
                fontSize: themeConfig.theme.typography.fontSizeXs,
                fontWeight: themeConfig.theme.typography.fontWeightMedium,
                marginLeft: '8px',
                padding: '2px 6px'
            }
        }, relativePercentage, "%")), (result.highlight?.title?.snippet || result.highlight?.content?.snippet) && /*#__PURE__*/ React.createElement("div", {
            dangerouslySetInnerHTML: {
                __html: result.highlight?.title?.snippet || result.highlight?.content?.snippet || ''
            },
            style: {
                color: themeConfig.theme.colors.descriptionText,
                display: '-webkit-box',
                fontSize: themeConfig.theme.typography.fontSizeSm,
                lineHeight: themeConfig.theme.typography.lineHeightNormal,
                marginTop: '4px',
                overflow: 'hidden',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2
            }
        }), /*#__PURE__*/ React.createElement("div", {
            style: {
                alignItems: 'center',
                color: themeConfig.theme.colors.metaText,
                display: 'flex',
                fontSize: themeConfig.theme.typography.fontSizeXs,
                gap: '12px',
                marginTop: '8px'
            }
        }, /*#__PURE__*/ React.createElement("span", {
            style: {
                alignItems: 'center',
                display: 'inline-flex'
            }
        }, /*#__PURE__*/ React.createElement("svg", {
            fill: "currentColor",
            style: {
                height: '12px',
                marginRight: '4px',
                width: '12px'
            },
            viewBox: "0 0 20 20"
        }, /*#__PURE__*/ React.createElement("path", {
            clipRule: "evenodd",
            d: "M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z",
            fillRule: "evenodd"
        })), result.collection), (result.document?.updatedAt || result.updatedAt) && /*#__PURE__*/ React.createElement("span", {
            style: {
                alignItems: 'center',
                display: 'inline-flex'
            }
        }, /*#__PURE__*/ React.createElement("svg", {
            fill: "currentColor",
            style: {
                height: '12px',
                marginRight: '4px',
                width: '12px'
            },
            viewBox: "0 0 20 20"
        }, /*#__PURE__*/ React.createElement("path", {
            clipRule: "evenodd",
            d: "M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z",
            fillRule: "evenodd"
        })), new Date(result.document?.updatedAt || result.updatedAt).toLocaleDateString()))), /*#__PURE__*/ React.createElement("div", {
            style: {
                flexShrink: 0,
                opacity: 0,
                transition: `opacity ${themeConfig.theme.animations.transitionNormal} ${themeConfig.theme.animations.easeInOut}`
            }
        }, /*#__PURE__*/ React.createElement("svg", {
            fill: "none",
            stroke: "currentColor",
            style: {
                color: themeConfig.theme.colors.metaText,
                height: '16px',
                width: '16px'
            },
            viewBox: "0 0 24 24"
        }, /*#__PURE__*/ React.createElement("path", {
            d: "M9 5l7 7-7 7",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2
        }))))));
    };
    const defaultRenderNoResults = (_query)=>/*#__PURE__*/ React.createElement("div", {
            className: `${noResultsClassName}`,
            style: {
                color: themeConfig.theme.colors.noResultsText,
                fontFamily: themeConfig.theme.typography.fontFamily,
                fontSize: themeConfig.theme.typography.fontSizeSm,
                padding: '40px 20px',
                textAlign: 'center'
            }
        }, /*#__PURE__*/ React.createElement("div", {
            style: {
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column'
            }
        }, /*#__PURE__*/ React.createElement("svg", {
            fill: "none",
            stroke: "currentColor",
            style: {
                color: themeConfig.theme.colors.metaText,
                height: '48px',
                marginBottom: '12px',
                width: '48px'
            },
            viewBox: "0 0 24 24"
        }, /*#__PURE__*/ React.createElement("path", {
            d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 1
        })), /*#__PURE__*/ React.createElement("h3", {
            style: {
                color: themeConfig.theme.colors.titleText,
                fontSize: themeConfig.theme.typography.fontSizeSm,
                fontWeight: themeConfig.theme.typography.fontWeightMedium,
                margin: 0,
                marginBottom: '4px'
            }
        }, "No results found"), /*#__PURE__*/ React.createElement("p", {
            style: {
                color: themeConfig.theme.colors.descriptionText,
                fontSize: themeConfig.theme.typography.fontSizeSm,
                margin: 0
            }
        }, "Try searching for something else")));
    const defaultRenderError = (error)=>/*#__PURE__*/ React.createElement("div", {
            className: `${errorClassName}`,
            style: {
                alignItems: 'center',
                backgroundColor: themeConfig.theme.colors.errorBackground,
                borderBottom: `1px solid ${themeConfig.theme.colors.resultBorder}`,
                color: themeConfig.theme.colors.errorText,
                display: 'flex',
                fontFamily: themeConfig.theme.typography.fontFamily,
                fontSize: themeConfig.theme.typography.fontSizeSm,
                gap: '8px',
                padding: '16px'
            }
        }, /*#__PURE__*/ React.createElement("svg", {
            fill: "currentColor",
            style: {
                flexShrink: 0,
                height: '20px',
                width: '20px'
            },
            viewBox: "0 0 20 20"
        }, /*#__PURE__*/ React.createElement("path", {
            clipRule: "evenodd",
            d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z",
            fillRule: "evenodd"
        })), /*#__PURE__*/ React.createElement("div", null, /*#__PURE__*/ React.createElement("h3", {
            style: {
                fontSize: themeConfig.theme.typography.fontSizeSm,
                fontWeight: themeConfig.theme.typography.fontWeightMedium,
                margin: 0
            }
        }, "Search Error"), /*#__PURE__*/ React.createElement("p", {
            style: {
                color: themeConfig.theme.colors.errorText,
                fontSize: themeConfig.theme.typography.fontSizeSm,
                margin: 0
            }
        }, error)));
    const defaultRenderResultsHeader = (found, searchTime)=>/*#__PURE__*/ React.createElement("div", {
            className: `${resultsHeaderClassName}`,
            style: {
                alignItems: 'center',
                backgroundColor: themeConfig.theme.colors.headerBackground,
                borderBottom: `1px solid ${themeConfig.theme.colors.headerBorder}`,
                color: themeConfig.theme.colors.headerText,
                display: 'flex',
                fontFamily: themeConfig.theme.typography.fontFamily,
                fontSize: themeConfig.theme.spacing.headerFontSize,
                fontWeight: themeConfig.theme.typography.fontWeightMedium,
                justifyContent: 'space-between',
                padding: themeConfig.theme.spacing.headerPadding
            }
        }, /*#__PURE__*/ React.createElement("div", {
            style: {
                alignItems: 'center',
                display: 'flex',
                gap: '8px'
            }
        }, /*#__PURE__*/ React.createElement("svg", {
            fill: "currentColor",
            style: {
                color: themeConfig.theme.colors.metaText,
                height: '16px',
                width: '16px'
            },
            viewBox: "0 0 20 20"
        }, /*#__PURE__*/ React.createElement("path", {
            clipRule: "evenodd",
            d: "M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z",
            fillRule: "evenodd"
        })), /*#__PURE__*/ React.createElement("span", {
            style: {
                color: themeConfig.theme.colors.headerText,
                fontSize: themeConfig.theme.typography.fontSizeSm,
                fontWeight: themeConfig.theme.typography.fontWeightMedium
            }
        }, found, " result", found !== 1 ? 's' : '', " found")), showSearchTime && /*#__PURE__*/ React.createElement("span", {
            style: {
                backgroundColor: themeConfig.theme.colors.inputBorder,
                borderRadius: '12px',
                color: themeConfig.theme.colors.metaText,
                fontSize: themeConfig.theme.typography.fontSizeXs,
                padding: '4px 8px'
            }
        }, searchTime, "ms"));
    return /*#__PURE__*/ React.createElement("div", {
        className: `${className}`,
        style: {
            margin: '0 auto',
            maxWidth: '600px',
            position: 'relative',
            width: '100%'
        }
    }, /*#__PURE__*/ React.createElement("div", {
        className: `${inputWrapperClassName}`,
        style: {
            position: 'relative',
            width: '100%'
        }
    }, renderInput ? renderInput({
        className: `${inputClassName}`,
        onBlur: handleInputBlur,
        onChange: handleInputChange,
        onFocus: handleInputFocus,
        onKeyDown: handleKeyDown,
        placeholder,
        ref: inputRef,
        value: query
    }) : /*#__PURE__*/ React.createElement("input", {
        "aria-label": "Search input",
        autoComplete: "off",
        className: `${inputClassName}`,
        onBlur: (e)=>{
            e.target.style.borderColor = themeConfig.theme.colors.inputBorder;
            e.target.style.boxShadow = 'none';
            handleInputBlur(e);
        },
        onChange: handleInputChange,
        onFocus: (e)=>{
            e.target.style.borderColor = themeConfig.theme.colors.inputBorderFocus;
            e.target.style.boxShadow = themeConfig.config.enableShadows !== false ? `0 0 0 3px ${themeConfig.theme.colors.inputBorderFocus}20` : 'none';
            handleInputFocus();
        },
        onKeyDown: handleKeyDown,
        placeholder: placeholder,
        ref: inputRef,
        style: {
            backgroundColor: themeConfig.theme.colors.inputBackground,
            border: `2px solid ${themeConfig.theme.colors.inputBorder}`,
            borderRadius: themeConfig.config.enableRoundedCorners !== false ? themeConfig.theme.spacing.inputBorderRadius : '0',
            boxShadow: 'none',
            color: themeConfig.theme.colors.inputText,
            fontFamily: themeConfig.theme.typography.fontFamily,
            fontSize: themeConfig.theme.spacing.inputFontSize,
            fontWeight: themeConfig.theme.typography.fontWeightNormal,
            lineHeight: themeConfig.theme.typography.lineHeightNormal,
            outline: 'none',
            padding: themeConfig.theme.spacing.inputPadding,
            transition: themeConfig.config.enableAnimations !== false ? `all ${themeConfig.theme.animations.transitionNormal} ${themeConfig.theme.animations.easeInOut}` : 'none',
            width: '100%'
        },
        title: "Search input",
        type: "text",
        value: query
    }), isLoading && showLoading && /*#__PURE__*/ React.createElement("div", {
        style: {
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)'
        }
    }, /*#__PURE__*/ React.createElement("div", {
        "data-testid": "loading-spinner",
        style: {
            animation: `spin 1s linear infinite`,
            border: `2px solid ${themeConfig.theme.colors.inputBorder}`,
            borderRadius: '50%',
            borderTop: `2px solid ${themeConfig.theme.colors.inputBorderFocus}`,
            height: '16px',
            width: '16px'
        }
    }))), isOpen && /*#__PURE__*/ React.createElement("div", {
        className: `${resultsContainerClassName}`,
        ref: resultsRef,
        style: {
            backgroundColor: themeConfig.theme.colors.resultsBackground,
            border: `1px solid ${themeConfig.theme.colors.resultsBorder}`,
            borderRadius: themeConfig.config.enableRoundedCorners !== false ? themeConfig.theme.spacing.resultsBorderRadius : '0',
            boxShadow: themeConfig.config.enableShadows !== false ? themeConfig.theme.shadows.shadowLg : 'none',
            boxSizing: 'border-box',
            display: 'flex',
            left: '0',
            marginTop: '10px',
            maxHeight: themeConfig.theme.spacing.resultsMaxHeight,
            overflow: 'hidden',
            position: 'absolute',
            right: '0',
            top: '100%',
            zIndex: 1000,
            ...themeConfig.config.enableAnimations !== false && {
                animation: `slideDown ${themeConfig.theme.animations.animationNormal} ${themeConfig.theme.animations.easeOut}`
            }
        }
    }, /*#__PURE__*/ React.createElement("div", {
        className: `relative ${resultsClassName}`,
        style: {
            minHeight: 0,
            overflowY: 'auto'
        }
    }, error && (renderError ? renderError(error) : defaultRenderError(error)), !error && results && /*#__PURE__*/ React.createElement(React.Fragment, null, showResultCount && (renderResultsHeader ? renderResultsHeader(results.found, results.search_time_ms) : defaultRenderResultsHeader(results.found, results.search_time_ms)), results.hits.length > 0 ? /*#__PURE__*/ React.createElement("div", {
        className: `${resultsListClassName}`
    }, results.hits.map((result, index)=>renderResult ? renderResult(result, index, {
            onClick: handleResultClick
        }) : defaultRenderResult(result, index))) : renderNoResults ? renderNoResults(query) : defaultRenderNoResults(query)))));
};
export default HeadlessSearchInput;
export { HeadlessSearchInput };
