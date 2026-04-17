'use client'

import { useRef, useLayoutEffect, useEffect, useState } from 'react'

// useLayoutEffect fires synchronously before paint on the client.
// On the server it's a no-op (React skips it), so we fall back to useEffect
// to avoid the SSR warning — effects don't run server-side anyway.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

interface RevealOnScrollProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'none'
}

/**
 * Reveals its children with a fade-in (+ optional slide-up) animation as they
 * scroll into the viewport.
 *
 * Phase model:
 *   'pending'  – before any effect runs (SSR + first client frame).
 *                Content is fully visible so there is never a flash of
 *                invisible text on client-side navigation.
 *   'hidden'   – useIsomorphicLayoutEffect determined the element is below the
 *                fold. Transition to opacity-0 happens synchronously before the
 *                browser's first paint, so the element is never seen as visible
 *                then invisible.
 *   'visible'  – IntersectionObserver (or scroll fallback) detected the element
 *                entering the viewport. Entrance animation plays.
 */
export function RevealOnScroll({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<'pending' | 'hidden' | 'visible'>('pending')

  // ── Synchronous viewport check (before first paint) ──────────────────────
  // Runs before the browser paints so we can hide below-fold elements without
  // a visible flash. In-viewport elements go directly to 'visible'.
  useIsomorphicLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const { top, bottom } = el.getBoundingClientRect()
    if (top < window.innerHeight && bottom > 0) {
      setPhase('visible')
    } else {
      setPhase('hidden')
    }
  }, [])

  // ── IntersectionObserver + scroll fallback (async) ────────────────────────
  // Watches below-fold elements and reveals them when they enter the viewport.
  // A passive scroll listener acts as an extra safety net in case the observer's
  // initial callback fires before scroll position is fully restored on back
  // navigation.
  useEffect(() => {
    if (phase !== 'hidden') return

    const el = ref.current
    if (!el) return

    const reveal = () => setPhase('visible')

    const inView = () => {
      const { top, bottom } = el.getBoundingClientRect()
      return top < window.innerHeight && bottom > 0
    }

    // Re-check immediately inside useEffect (catches scroll restoration that
    // happens between useLayoutEffect and useEffect).
    if (inView()) {
      reveal()
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal()
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)

    // Scroll listener fallback — handles edge cases where the observer callback
    // fires with stale intersection data after client-side navigation.
    const onScroll = () => {
      if (inView()) {
        reveal()
        observer.disconnect()
        window.removeEventListener('scroll', onScroll, true)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [phase])

  const isHidden  = phase === 'hidden'
  const isVisible = phase === 'visible'

  return (
    <div
      ref={ref}
      style={(isHidden || isVisible) && delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
      className={[
        // Transition classes are only applied once we've resolved the phase so
        // we don't animate the pending → visible jump for in-viewport elements.
        isHidden || isVisible ? 'transition-all duration-700 ease-out' : '',
        isHidden ? 'opacity-0' : 'opacity-100',
        direction === 'up' ? (isHidden ? 'translate-y-6' : 'translate-y-0') : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}
