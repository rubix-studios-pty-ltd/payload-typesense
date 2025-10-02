import React from 'react';
import type { BaseSearchInputProps, SearchResult } from '../lib/types.js';
import type { ThemeConfig } from './themes/types.js';
export interface HeadlessSearchInputProps<T = Record<string, unknown>> extends BaseSearchInputProps<T> {
    /**
     * Collection to search in (for single collection search)
     */
    collection?: string;
    /**
     * Collections to search in (for multi-collection search)
     */
    collections?: string[];
    /**
     * Enable suggestions
     */
    enableSuggestions?: boolean;
    /**
     * Number of results to show per page
     */
    perPage?: number;
    /**
     * Custom render function for error state
     */
    renderError?: (error: string) => React.ReactNode;
    /**
     * Custom input element (for complete control)
     */
    renderInput?: (props: {
        className: string;
        onBlur: (e: React.FocusEvent) => void;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        onFocus: () => void;
        onKeyDown: (e: React.KeyboardEvent) => void;
        placeholder: string;
        ref: React.RefObject<HTMLInputElement | null>;
        value: string;
    }) => React.ReactNode;
    /**
     * Custom render function for loading state
     */
    renderLoading?: () => React.ReactNode;
    /**
     * Custom render function for no results
     */
    renderNoResults?: (query: string) => React.ReactNode;
    /**
     * Custom render function for results
     */
    renderResult?: (result: SearchResult<T>, index: number, handlers: {
        onClick: (result: SearchResult<T>) => void;
    }) => React.ReactNode;
    /**
     * Custom render function for results header
     */
    renderResultsHeader?: (found: number, searchTime: number) => React.ReactNode;
    /**
     * Custom CSS class for individual result items
     */
    resultItemClassName?: string;
    /**
     * Custom CSS class for the results container
     */
    resultsClassName?: string;
    /**
     * Custom CSS class for results container
     */
    resultsContainerClassName?: string;
    /**
     * Show loading state
     */
    showLoading?: boolean;
    /**
     * Show result count
     */
    showResultCount?: boolean;
    /**
     * Show search time
     */
    showSearchTime?: boolean;
    /**
     * Theme configuration
     */
    theme?: string | ThemeConfig;
}
declare const HeadlessSearchInput: <T = Record<string, unknown>>({ baseUrl, className, collection, collections, debounceMs, enableSuggestions: _enableSuggestions, errorClassName, inputClassName, inputWrapperClassName, minQueryLength, noResultsClassName, onResultClick, onResults, onSearch, perPage, placeholder, renderError, renderInput, renderNoResults, renderResult, renderResultsHeader, resultItemClassName, resultsClassName, resultsContainerClassName, resultsHeaderClassName, resultsListClassName, showLoading, showResultCount, showSearchTime, theme, }: HeadlessSearchInputProps<T>) => React.ReactElement;
export default HeadlessSearchInput;
export { HeadlessSearchInput };
//# sourceMappingURL=HeadlessSearchInput.d.ts.map