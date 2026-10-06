import { useEffect } from 'react'
import { Header } from './sections/Header'
import { Hero } from './sections/Hero'
import { Scope } from './sections/Scope'
import { Services } from './sections/Services'
import { Emergency } from './sections/Emergency'
import { Projects } from './sections/Projects'
import { About } from './sections/About'
import { Contact } from './sections/Contact'
import { Footer } from './sections/Footer'
import { useLenis } from './lib/useLenis'
import { ScrollTrigger } from './lib/motion'

export default function App() {
  useLenis()

  // Fonts and lazy images change layout height; ScrollTrigger needs to know.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    if (document.fonts?.ready) document.fonts.ready.then(refresh)
    window.addEventListener('load', refresh)
    return () => window.removeEventListener('load', refresh)
  }, [])

  return (
    <>
      <a className="skip-link" href="#main">
        Przejdź do treści
      </a>
      <Header />
      <main id="main">
        <span id="top" />
        <Hero />
        <Scope />
        <Services />
        <Emergency />
        <Projects />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
