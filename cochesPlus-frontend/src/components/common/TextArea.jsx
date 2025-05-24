const TextArea = ({ placeholder, label, error, className, ...props }) => {
    return (
        <div className="flex flex-col gap-2">
            {label && (
                <label className="text-sm font-medium text-text-dark dark:text-text-light">
                    {label}
                </label>
            )}
            <textarea
                placeholder={placeholder}
                className={`p-3 border rounded-md  focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background-light dark:bg-primary-dark text-text-dark dark:text-text-light border-secondary-dark dark:border-primary-light ${className}`}
                {...props}
            />
            {error && (
                <span className="text-sm text-error">
                    {error}
                </span>
            )}
        </div>
    );
};

export default TextArea;