import React, { type ReactNode, type RefObject } from 'react'

import { type useSearch } from '../../hooks/useSearch.js'
import { type SearchDialogProps } from '../../lib/search-dialog.js'
import { type ThemeContextValue } from '../themes/index.js'

type Props<T> = Pick<
  SearchDialogProps<T>,
  | 'dialogProps'
  | 'dialogLabel'
  | 'title'
  | 'dialogClassName'
  | 'closeOnBackdropClick'
  | 'renderDialogHeader'
  | 'dialogHeaderClassName'
  | 'closeButtonClassName'
  | 'closeLabel'
  | 'dialogContentClassName'
  | 'renderDialogContent'
> & {
  dialogId: string
  dialogRef: RefObject<HTMLDialogElement | null>
  close: () => void
  isOpen: boolean
  children: ReactNode
  query: string
  page: number
  results: ReturnType<typeof useSearch<T>>['results']
  isLoading: boolean
  error: ReturnType<typeof useSearch<T>>['error']
  themeConfig: ThemeContextValue
}

export function RenderedDialog<T = Record<string, unknown>>({
  dialogProps,
  dialogLabel,
  title = 'Search',
  dialogClassName = '',
  closeOnBackdropClick = true,
  renderDialogHeader,
  dialogHeaderClassName = '',
  closeButtonClassName = '',
  closeLabel = 'X',
  dialogContentClassName = '',
  renderDialogContent,
  dialogId,
  dialogRef,
  close,
  isOpen,
  children,
  query,
  page,
  results,
  isLoading,
  error,
  themeConfig,
}: Props<T>) {
  const classes = themeConfig.classes

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape handles keyboard dismissal.
    <dialog
      {...dialogProps}
      aria-label={
        dialogProps?.['aria-label'] ?? dialogLabel ?? (typeof title === 'string' ? title : 'Search')
      }
      className={`${classes.dialog} ${dialogClassName} ${dialogProps?.className ?? ''}`}
      id={dialogId}
      onCancel={(event) => {
        event.preventDefault()
        close()
      }}
      onClick={(event) => {
        if (!closeOnBackdropClick || event.target !== event.currentTarget) {
          return
        }

        const rect = event.currentTarget.getBoundingClientRect()

        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        ) {
          close()
        }
      }}
      onClose={() => {
        if (isOpen && !dialogRef.current?.open) {
          close()
        }
      }}
      ref={dialogRef}
    >
      {renderDialogHeader ? (
        renderDialogHeader({ title, close })
      ) : (
        <div className={`${classes.dialogHeader} ${dialogHeaderClassName}`}>
          <h2 className={classes.dialogTitle}>{title}</h2>

          <button
            className={`${classes.closeButton} ${closeButtonClassName}`}
            onClick={close}
            type="button"
          >
            {closeLabel}
          </button>
        </div>
      )}

      <div className={`${classes.dialogContent} ${dialogContentClassName}`}>
        {renderDialogContent
          ? renderDialogContent({
              children,
              close,
              query,
              page,
              results,
              isLoading,
              error,
            })
          : children}
      </div>
    </dialog>
  )
}
