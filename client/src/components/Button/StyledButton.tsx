import './StyledButton.css'

interface StyledButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
    variant?: 'primary' | 'secondary' | 'danger' | 'hero';
}

function StyledButton({
    children,
    variant = 'primary',
    className,
    ...props
}: StyledButtonProps) {
    return (
        <button
            className={`btn btn-${variant} ${className || ''}`}
            {...props}>
            {children}
        </button>
    )
}

export default StyledButton