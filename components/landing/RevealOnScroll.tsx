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

export function RevealOnScroll({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useIsomorphicLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    // Immediately reveal if the element is already in (or near) the viewport.
    // This handles client-side navigation and back-button restores where the
    // browser paints before useEffect would normally fire.
    const { top, bottom } = el.getBoundingClientRect()
    if (top < window.innerHeight && bottom > 0) {
      setVisible(true)
      return
    }

    // Element is below the fold — observe it and reveal on scroll.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
      className={[
        'transition-all duration-700 ease-out',
        visible ? 'opacity-100' : 'opacity-0',
        direction === 'up' ? (visible ? 'translate-y-0' : 'translate-y-6') : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}
