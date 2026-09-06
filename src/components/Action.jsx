import { forwardRef } from 'react'

const Arrow = ({ diagonal = false }) => (
  <svg viewBox="0 0 20 20" width="15" height="15" fill="none" aria-hidden="true">
    {diagonal ? (
      <path d="M6 14 14 6M7.5 6H14v6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
    ) : (
      <path d="M3 10h13M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
    )}
  </svg>
)

/**
 * Primary action: a solid ink body with a visually separate arrow zone. The
 * arrow leads on hover and the label picks up a hairline of cold blue — no
 * glow, no scaling.
 */
export const Action = forwardRef(function Action(
  { children, href = '#kontakt', tone = 'ink', className = '', ...rest },
  ref
) {
  return (
    <a ref={ref} href={href} className={`action action--${tone} ${className}`.trim()} {...rest}>
      <span className="action__body">{children}</span>
      <span className="action__arrow" aria-hidden="true">
        <Arrow />
      </span>
    </a>
  )
})

/** Secondary action: a text link, never a second filled button. */
export function TextAction({ children, href = '#kontakt', diagonal = false, className = '', ...rest }) {
  return (
    <a href={href} className={`text-action ${className}`.trim()} {...rest}>
      <span className="text-action__label">{children}</span>
      <span className="text-action__arrow" aria-hidden="true">
        <Arrow diagonal={diagonal} />
      </span>
    </a>
  )
}
