import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const ScrollReveal = ({
    children,
    className = '',
    threshold = 0.1,
    animation = 'fade', 
    delay = 0,
    duration = 500,
    once = true,
    distance = '30px'
}) => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const currentRef = ref.current;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once) {
                        observer.unobserve(currentRef);
                    }
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            {
                root: null,
                rootMargin: '0px',
                threshold
            }
        );

        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [threshold, once]);

    const getAnimationStyle = () => {
        if (!isVisible) {
            let transform = '';

            switch (animation) {
                case 'slide-up':
                    transform = `translateY(${distance})`;
                    break;
                case 'slide-right':
                    transform = `translateX(-${distance})`;
                    break;
                case 'zoom':
                    transform = 'scale(0.8)';
                    break;
                case 'bounce':
                    transform = 'scale(0.8)';
                    break;
                default:
                    break;
            }

            return {
                opacity: 0,
                transform,
                transition: 'none'
            };
        }

        return {
            opacity: 1,
            transform: 'none',
            transition: `opacity ${duration}ms, transform ${duration}ms`,
            transitionDelay: `${delay}ms`,
            transitionTimingFunction: animation === 'bounce' ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' : 'ease-out'
        };
    };

    return (
        <div
            ref={ref}
            className={className}
            style={getAnimationStyle()}
        >
            {children}
        </div>
    );
};

ScrollReveal.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    threshold: PropTypes.number,
    animation: PropTypes.oneOf(['fade', 'slide-up', 'slide-right', 'zoom', 'bounce']),
    delay: PropTypes.number,
    duration: PropTypes.number,
    once: PropTypes.bool,
    distance: PropTypes.string
};

export default ScrollReveal;