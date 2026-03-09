/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * AnimatedBackground — Mesh Gradient Orb Layer
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Renders 3 large, blurred, slowly-drifting gradient orbs (blue, purple, cyan)
 * as a fixed background layer behind all app content. Uses CSS classes defined
 * in index.css (.animated-bg, .orb, .orb-blue, .orb-purple, .orb-cyan).
 *
 * Props:
 *   variant — 'full' (default) | 'subtle'  (subtle = reduced opacity for inner pages)
 */
export default function AnimatedBackground({ variant = 'full' }) {
    const subtleClass = variant === 'subtle' ? 'orb-subtle' : '';

    return (
        <div className="animated-bg" aria-hidden="true">
            <div className={`orb orb-blue ${subtleClass}`} />
            <div className={`orb orb-purple ${subtleClass}`} />
            <div className={`orb orb-cyan ${subtleClass}`} />
        </div>
    );
}
