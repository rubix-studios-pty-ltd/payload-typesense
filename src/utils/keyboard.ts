import { type KeyboardEvent, type RefObject } from 'react'

export function handleKeyboard(
  event: KeyboardEvent,
  options: {
    inputRef: RefObject<HTMLInputElement | null>
    isOpen: boolean
    results: unknown
    resultsRef: RefObject<HTMLDivElement | null>
  }
): void {
  const { inputRef, isOpen, results, resultsRef } = options

  if (event.key === 'Escape') {
    if (isOpen) {
      inputRef.current?.blur()
    }

    return
  }

  if (!isOpen || !results) return

  const items = Array.from(
    resultsRef.current?.querySelectorAll<HTMLElement>('[data-result-item]') ?? []
  )

  if (!items.length) return

  const active = document.activeElement
  const current = active instanceof HTMLElement ? items.indexOf(active) : -1

  switch (event.key) {
    case 'ArrowDown': {
      event.preventDefault()

      const nextIndex = current < items.length - 1 ? current + 1 : 0
      items[nextIndex]?.focus()
      break
    }

    case 'ArrowUp': {
      event.preventDefault()

      const previousIndex = current > 0 ? current - 1 : items.length - 1
      items[previousIndex]?.focus()
      break
    }

    case 'Enter': {
      if (current < 0) return

      event.preventDefault()
      items[current]?.click()
      break
    }
  }
}
