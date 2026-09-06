import { useEffect, useState } from 'react'
import { site, ctaHref } from '../data/site'
import { TextAction } from '../components/Action'

const NAV = [
  { label: 'Usługi', href: '#uslugi' },
  { label: 'Realizacje', href: '#realizacje' },
  { label: 'O nas', href: '#o-nas' },
  { label: 'Kontakt', href: '#kontakt' },
]

export function Header() {
  const [lifted, setLifted] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="header" data-lifted={lifted}>
      <div className="header__inner">
        <a className="wordmark" href="#top" aria-label={site.name}>
          <span className="wordmark__a">{site.wordmark[0]}</span>
          <span className="wordmark__b">{site.wordmark[1]}</span>
          <span className="wordmark__dot" aria-hidden="true" />
        </a>

        <nav className="header__nav" aria-label="Główna">
          {NAV.map((item) => (
            <a key={item.href} className="header__link" href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header__end">
          <TextAction href={ctaHref()} className="header__cta">
            Zapytaj o wycenę
          </TextAction>
          <button
            className="header__burger"
            type="button"
            aria-expanded={open}
            aria-controls="menu-panel"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="vh">{open ? 'Zamknij menu' : 'Otwórz menu'}</span>
            <span className="header__burger-lines" data-open={open} aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>

      <div id="menu-panel" className="menu" data-open={open} inert={!open ? true : undefined}>
        <nav className="menu__nav" aria-label="Menu mobilne">
          {NAV.map((item, i) => (
            <a key={item.href} href={item.href} className="menu__link" onClick={() => setOpen(false)}>
              <span className="menu__index">{String(i + 1).padStart(2, '0')}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <TextAction href={ctaHref()} onClick={() => setOpen(false)}>
          Zapytaj o wycenę
        </TextAction>
      </div>
    </header>
  )
}
