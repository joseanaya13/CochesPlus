import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import ScrollReveal from '../../utils/ScrollReveal';

const CallToAction = ({
    title,
    description,
    primaryButtonText,
    primaryButtonLink,
    secondaryButtonText,
    secondaryButtonLink
}) => {
    return (
        <section className="bg-background-light dark:bg-primary-dark py-20 relative overflow-hidden">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-0 -left-48 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full filter blur-3xl opacity-70"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/10 dark:bg-primary/20 rounded-full filter blur-3xl opacity-70 -translate-y-1/2"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-10 shadow-xl border border-gray-100 dark:border-gray-700/30 relative overflow-hidden">
                    {/* Gráfico decorativo */}
                    <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-primary/10 dark:bg-primary/20 rounded-full"></div>
                    <div className="absolute -top-20 -left-20 w-48 h-48 bg-primary/5 dark:bg-primary/10 rounded-full"></div>

                    <ScrollReveal animation="fade-in" threshold={0.1}>
                        <div className="text-center relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-text-dark dark:text-text-light mb-6">
                                {title}
                            </h2>
                            <div className="h-1 w-24 bg-primary mx-auto mb-6 rounded-full"></div>
                            <p className="text-lg text-text-secondary dark:text-text-secondary mb-10 max-w-3xl mx-auto">
                                {description}
                            </p>

                            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                                <ScrollReveal animation="slide-up" delay={200} threshold={0.1}>
                                    <Link to={primaryButtonLink}>
                                        <Button
                                            variant="primary"
                                            className="px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                        >
                                            {primaryButtonText}
                                        </Button>
                                    </Link>
                                </ScrollReveal>

                                <ScrollReveal animation="slide-up" delay={300} threshold={0.1}>
                                    <Link to={secondaryButtonLink}>
                                        <Button
                                            variant="secondary"
                                            className="px-8 py-3 text-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                        >
                                            {secondaryButtonText}
                                        </Button>
                                    </Link>
                                </ScrollReveal>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    );
};

CallToAction.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    primaryButtonText: PropTypes.string.isRequired,
    primaryButtonLink: PropTypes.string.isRequired,
    secondaryButtonText: PropTypes.string.isRequired,
    secondaryButtonLink: PropTypes.string.isRequired
};

export default CallToAction;
