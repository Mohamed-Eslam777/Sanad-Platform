import logo from '../../assets/logo.png';

/**
 * GlobalWatermark
 *
 * Renders a subtle, full-screen logo watermark behind all page content.
 * Uses a radial gradient mask so the edges fade to transparent.
 * pointer-events: none so it never blocks user interactions.
 */
export default function GlobalWatermark() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden"
      style={{
        backgroundImage: `url(${logo})`,
        backgroundSize: '95vh',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        opacity: 0.08,
        mixBlendMode: 'screen',
        maskImage: 'radial-gradient(circle, black 20%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(circle, black 20%, transparent 70%)',
      }}
      aria-hidden="true"
    />
  );
}
