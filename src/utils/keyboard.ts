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

  const activeElement = document.activeElement
  const currentIndex = activeElement instanceof HTMLElement ? items.indexOf(activeElement) : -1

  switch (event.key) {
    case 'ArrowDown': {
      event.preventDefault()

      const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
      items[nextIndex]?.focus()
      break
    }

    case 'ArrowUp': {
      event.preventDefault()

      const previousIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
      items[previousIndex]?.focus()
      break
    }

    case 'Enter': {
      if (currentIndex < 0) return

      event.preventDefault()
      items[currentIndex]?.click()
      break
    }
  }
}
