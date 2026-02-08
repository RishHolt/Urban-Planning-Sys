import { useEffect, useRef } from 'react';

interface RecaptchaProps {
    siteKey: string;
    onChange: (token: string | null) => void;
    onError?: () => void;
    className?: string;
}

declare global {
    interface Window {
        grecaptcha: {
            render: (container: HTMLElement, options: {
                sitekey: string;
                callback: (token: string) => void;
                'error-callback': () => void;
                'expired-callback': () => void;
            }) => number;
            reset: (widgetId: number) => void;
            getResponse: (widgetId: number) => string;
        };
    }
}

export default function Recaptcha({ siteKey, onChange, onError, className }: RecaptchaProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (!containerRef.current || !window.grecaptcha) {
            return;
        }

        const renderRecaptcha = () => {
            if (containerRef.current && window.grecaptcha) {
                widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
                    sitekey: siteKey,
                    callback: (token: string) => {
                        onChange(token);
                    },
                    'error-callback': () => {
                        onChange(null);
                        onError?.();
                    },
                    'expired-callback': () => {
                        onChange(null);
                    },
                });
            }
        };

        // Wait for grecaptcha to be ready
        if (window.grecaptcha && window.grecaptcha.render) {
            renderRecaptcha();
        } else {
            const checkInterval = setInterval(() => {
                if (window.grecaptcha && window.grecaptcha.render) {
                    clearInterval(checkInterval);
                    renderRecaptcha();
                }
            }, 100);

            // Cleanup after 10 seconds if grecaptcha doesn't load
            setTimeout(() => {
                clearInterval(checkInterval);
            }, 10000);
        }

        return () => {
            if (widgetIdRef.current !== null && window.grecaptcha) {
                // Reset the widget on unmount
                try {
                    window.grecaptcha.reset(widgetIdRef.current);
                } catch (e) {
                    // Ignore errors during cleanup
                }
            }
        };
    }, [siteKey, onChange, onError]);

    const reset = () => {
        if (widgetIdRef.current !== null && window.grecaptcha) {
            window.grecaptcha.reset(widgetIdRef.current);
            onChange(null);
        }
    };

    // Expose reset method via ref (if needed)
    useEffect(() => {
        if (containerRef.current) {
            (containerRef.current as any).reset = reset;
        }
    }, []);

    return <div ref={containerRef} className={className} />;
}
