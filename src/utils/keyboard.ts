import type React from 'react'

export function handleKeyboard(
  e: React.KeyboardEvent,
  options: {
    inputRef: React.RefObject<HTMLInputElement | null>
    isOpen: boolean
    results: unknown
    resultsRef: React.RefObject<HTMLDivElement | null>
  }
) {
  const { inputRef, isOpen, results, resultsRef } = options

  if (!isOpen || !results) return

  const resultItems = resultsRef.current?.querySelectorAll('[data-result-item]')
  if (!resultItems) return

  const currentIndex = Array.from(resultItems).findIndex((item) => item === document.activeElement)

  switch (e.key) {
    case 'ArrowDown': {
      e.preventDefault()
      const nextIndex = currentIndex < resultItems.length - 1 ? currentIndex + 1 : 0
      ;(resultItems[nextIndex] as HTMLElement)?.focus()
      break
    }

    case 'ArrowUp': {
      e.preventDefault()
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : resultItems.length - 1
      ;(resultItems[prevIndex] as HTMLElement)?.focus()
      break
    }

    case 'Enter': {
      e.preventDefault()
      if (currentIndex >= 0 && resultItems[currentIndex]) {
        ;(resultItems[currentIndex] as HTMLElement)?.click()
      }
      break
    }

    case 'Escape': {
      inputRef.current?.blur()
      break
    }
  }
}
