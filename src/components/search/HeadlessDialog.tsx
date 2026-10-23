'use client'

import React, {
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

import { useDebounce } from '../../hooks/useDebounce.js'
import { useSearch } from '../../hooks/useSearch.js'
import { type SearchDialogProps } from '../../lib/search-dialog.js'
import { type SearchPaginationProps } from '../../lib/search-pagination.js'
import { type SearchResult } from '../../types.js'
import { handleKeyboard } from '../../utils/keyboard.js'
import { SearchIcon } from '../icons/index.js'
import { RenderedContent, RenderedDialog } from '../render/index.js'
import { useComponentTheme } from '../ThemeProvider.js'
import { SearchStyles } from './SearchStyles.js'

export function HeadlessSearchDialog<T = Record<string, unknown>>(
  props: SearchDialogProps<T>
): ReactElement {
  const {
    baseUrl,
    collections,
    debounceMs = 300,
    minQueryLength = 2,
    perPage = 10,
    searchMode,
    numTypos,
    vector,
    onResults,
    onSearch,
    onError,
    onLoading,
    onResultClick,
    theme,
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    initialQuery = '',
    triggerLabel,
    closeOnResultClick = true,
    clearOnClose = false,
    onPageChange,
    renderTrigger,
    placeholder = 'Search...',
    className = '',
    triggerClassName = '',
    inputClassName = '',
    triggerProps,
  } = props

  const scope = useId()
  const themeConfig = useComponentTheme(theme)

  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const [query, setQuery] = useState(initialQuery)
  const [page, setPage] = useState(1)

  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)

  const isOpen = controlledOpen ?? internalOpen
  const wasOpenRef = useRef(isOpen)

  const dialogId = props.dialogProps?.id ?? `${scope}-dialog`
  const resultsId = `${scope}-results`

  const classes = themeConfig.classes

  const debouncedQuery = useDebounce(query, debounceMs)

  const { results, error, isLoading, search, reset } = useSearch<T>({
    baseUrl,
    collections,
    enabled: isOpen,
    minQueryLength,
    perPage,
    searchMode,
    numTypos,
    vector,
    onResults,
    onSearch,
  })

  const changeOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(next)
      }

      onOpenChange?.(next)
    },
    [controlledOpen, onOpenChange]
  )

  const close = useCallback(() => changeOpen(false), [changeOpen])

  useEffect(() => {
    if (!isOpen) return

    const root = document.documentElement
    const previousOverflow = root.style.overflow

    root.style.overflow = 'hidden'

    return () => {
      root.style.overflow = previousOverflow
    }
  }, [isOpen])

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) {
      return
    }

    if (isOpen && !dialog.open) {
      openerRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : triggerRef.current

      dialog.showModal()
      inputRef.current?.focus()
    } else if (!isOpen && dialog.open) {
      dialog.close()
      openerRef.current?.focus()
    }

    if (!isOpen && wasOpenRef.current && clearOnClose) {
      setQuery('')
      setPage(1)
    }

    wasOpenRef.current = isOpen
  }, [isOpen, clearOnClose])

  useEffect(() => {
    const dialog = dialogRef.current

    return () => {
      if (dialog?.open) {
        dialog.close()
      }
    }
  }, [])

  useEffect(() => {
    if (isOpen && query === debouncedQuery) {
      void search(debouncedQuery, page)
    }
  }, [isOpen, query, debouncedQuery, page, search])

  useEffect(() => {
    if (error) {
      onError?.(error)
    }
  }, [error, onError])

  useEffect(() => {
    onLoading?.(isLoading)
  }, [isLoading, onLoading])

  const collectionKey = collections?.join(',')

  useEffect(() => {
    setPage(1)
  }, [baseUrl, collectionKey, perPage, searchMode, numTypos, vector])

  const totalPages = results ? Math.ceil(results.found / perPage) : 0

  useEffect(() => {
    if (results && !isLoading && page > Math.max(1, totalPages)) {
      setPage(Math.max(1, totalPages))
    }
  }, [results, isLoading, page, totalPages])

  const clickResult = (result: SearchResult<T>) => {
    onResultClick?.(result)

    if (closeOnResultClick) {
      close()
    }
  }

  const changePage = (next: number) => {
    if (isLoading || !Number.isInteger(next) || next < 1 || next > totalPages || next === page) {
      return
    }

    setPage(next)
    onPageChange?.(next)

    if (resultsRef.current) {
      resultsRef.current.scrollTop = 0
    }

    inputRef.current?.focus()
  }

  const inputProps = {
    'aria-label': 'Search input',
    'aria-controls': resultsId,
    'aria-busy': isLoading,
    className: `${classes.input} ${inputClassName}`,
    ref: inputRef,
    value: query,
    placeholder,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      reset()
      setQuery(event.target.value)
      setPage(1)
    },
    onFocus: () => {},
    onBlur: (_event: FocusEvent<HTMLInputElement>) => {},
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        handleKeyboard(event, { inputRef, isOpen, results, resultsRef })
      }
    },
  }

  const buttonProps = {
    ...triggerProps,
    type: 'button' as const,
    ref: triggerRef,
    'aria-label':
      triggerProps?.['aria-label'] ?? (typeof triggerLabel === 'string' ? triggerLabel : 'Search'),
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': isOpen,
    'aria-controls': dialogId,
    className: `${classes.trigger} ${triggerClassName} ${triggerProps?.className ?? ''}`,
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      triggerProps?.onClick?.(event)
      if (!event.defaultPrevented) changeOpen(true)
    },
    children: triggerLabel ?? <SearchIcon />,
  }

  const pagination: SearchPaginationProps = {
    page,
    perPage,
    found: results?.found ?? 0,
    totalPages,
    isLoading,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
    onPageChange: changePage,
  }

  return (
    <div className={`${classes.dialogRoot} ${className}`} data-search-theme={scope}>
      <SearchStyles scope={scope} themeConfig={themeConfig} />

      {renderTrigger ? renderTrigger(buttonProps) : <button {...buttonProps} />}

      <RenderedDialog<T>
        {...props}
        close={close}
        dialogId={dialogId}
        dialogRef={dialogRef}
        error={error}
        isLoading={isLoading}
        isOpen={isOpen}
        page={page}
        query={query}
        results={results}
        themeConfig={themeConfig}
      >
        <RenderedContent<T>
          {...props}
          changePage={changePage}
          clickResult={clickResult}
          error={error}
          inputProps={inputProps}
          inputRef={inputRef}
          isLoading={isLoading}
          isOpen={isOpen}
          page={page}
          pagination={pagination}
          query={query}
          results={results}
          resultsId={resultsId}
          resultsRef={resultsRef}
          themeConfig={themeConfig}
          totalPages={totalPages}
        />
      </RenderedDialog>
    </div>
  )
}
export default HeadlessSearchDialog
