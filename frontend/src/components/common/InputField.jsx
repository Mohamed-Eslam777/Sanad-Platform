/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * InputField — Floating Label Input with Glow Focus & Error Shake
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Props (backward-compatible):
 *   label, id, type, placeholder, value, onChange, icon, error,
 *   dir, required, className, ...rest
 *
 * NEW props:
 *   helperText    — optional guidance text below the input
 *   endAdornment  — ReactNode rendered at the end side (e.g., password eye toggle)
 */
import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';

const shakeVariants = {
    shake: {
        x: [0, -4, 4, -4, 4, 0],
        transition: { duration: 0.4 },
    },
    idle: { x: 0 },
};

const InputField = forwardRef(({
    label,
    id,
    type = 'text',
    placeholder = ' ',   // space keeps :placeholder-shown working for float label
    value,
    onChange,
    icon: Icon,
    error,
    dir = 'rtl',
    required = false,
    className = '',
    helperText,
    endAdornment,
    ...props
}, ref) => {

    const [focused, setFocused] = useState(false);
    const hasValue = value !== undefined && value !== null && value !== '';
    const isFloating = focused || hasValue;

    /* ── Error link IDs ── */
    const errorId = id ? `${id}-error` : undefined;
    const helperId = id ? `${id}-helper` : undefined;
    const describedBy = [error ? errorId : null, helperText ? helperId : null]
        .filter(Boolean)
        .join(' ') || undefined;

    return (
        <div className={`mb-4 w-full ${className}`}>
            <div className="relative group">
                {/* Icon */}
                {Icon && (
                    <div
                        className={`absolute top-1/2 -translate-y-1/2 z-10 text-gray-500 group-focus-within:text-royal-400 transition-colors ${dir === 'rtl' ? 'right-4' : 'left-4'
                            }`}
                    >
                        <Icon className="w-4 h-4" />
                    </div>
                )}

                {/* Input */}
                <input
                    ref={ref}
                    id={id}
                    type={type}
                    dir={dir}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    aria-invalid={error ? 'true' : undefined}
                    aria-describedby={describedBy}
                    className={[
                        'peer w-full bg-navy-700/50 rounded-xl py-3.5 text-sm text-white outline-none',
                        'transition-all duration-200',
                        'placeholder:text-transparent',  // hide placeholder for float label
                        // Start padding (where icon lives)
                        Icon
                            ? dir === 'rtl' ? 'pe-11' : 'ps-11'
                            : dir === 'rtl' ? 'pe-4' : 'ps-4',
                        // End padding (where endAdornment lives)
                        endAdornment
                            ? dir === 'rtl' ? 'ps-11' : 'pe-11'
                            : dir === 'rtl' ? 'ps-4' : 'pe-4',
                        label ? 'pt-5 pb-2' : '',  // extra top padding for floating label
                        error
                            ? 'border border-danger-500 focus:ring-2 focus:ring-danger-500/20 shadow-glow-red'
                            : 'border border-glass-border focus:border-royal-500 focus:ring-2 focus:ring-royal-500/20 focus:shadow-glow-sm',
                    ].join(' ')}
                    {...props}
                />

                {/* End Adornment (e.g., password eye toggle) */}
                {endAdornment && (
                    <div
                        className={`absolute top-1/2 -translate-y-1/2 z-10 ${dir === 'rtl' ? 'left-4' : 'right-4'
                            }`}
                    >
                        {endAdornment}
                    </div>
                )}

                {/* Floating Label */}
                {label && (
                    <label
                        htmlFor={id}
                        className={[
                            'absolute transition-all duration-200 pointer-events-none',
                            'text-gray-500 peer-focus:text-royal-400',
                            error ? 'peer-focus:text-danger-400' : '',
                            Icon
                                ? dir === 'rtl' ? 'right-11' : 'left-11'
                                : dir === 'rtl' ? 'right-4' : 'left-4',
                            // Float up when focused or filled
                            isFloating || 'peer-focus:' // CSS fallback via peer
                                ? 'top-1.5 text-[10px] font-bold tracking-wider uppercase'
                                : 'top-1/2 -translate-y-1/2 text-sm',
                            'peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:tracking-wider peer-focus:uppercase',
                            'peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:tracking-wider peer-[:not(:placeholder-shown)]:uppercase',
                        ].join(' ')}
                    >
                        {label} {required && <span className="text-danger-400">*</span>}
                    </label>
                )}
            </div>

            {/* Error message with shake */}
            {error && (
                <motion.p
                    id={errorId}
                    role="alert"
                    className="mt-1.5 text-xs text-danger-400 font-medium flex items-center gap-1 ms-1"
                    variants={shakeVariants}
                    animate="shake"
                    key={error} // re-triggers shake on new error
                >
                    {error}
                </motion.p>
            )}

            {/* Helper text */}
            {helperText && !error && (
                <p id={helperId} className="mt-1.5 text-xs text-gray-500 ms-1">
                    {helperText}
                </p>
            )}
        </div>
    );
});

InputField.displayName = 'InputField';
export default InputField;
