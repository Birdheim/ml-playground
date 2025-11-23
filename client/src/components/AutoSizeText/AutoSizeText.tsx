import { useEffect, useRef } from 'react';
import './AutoSizeText.css';

interface AutoSizeTextProps {
    boldText: string;
    regularText: string;
}

function fitText(element: HTMLElement) {
    const container = element.parentElement;
    if (!container) return;

    const containerWidth = container.clientWidth;
    if (!containerWidth) return; // nothing to do yet

    let min = 1;
    let max = containerWidth; // can't be bigger than the width
    let best = min;

    while (min <= max) {
        const fontSize = Math.floor((min + max) / 2);
        element.style.fontSize = `${fontSize}px`;

        const fitsHorizontally = element.scrollWidth <= containerWidth;

        if (fitsHorizontally) {
            best = fontSize;
            min = fontSize + 1;  // try bigger
        } else {
            max = fontSize - 1;  // too big, go smaller
        }
    }

    element.style.fontSize = `${best}px`;
}

function AutoSizeText({ boldText, regularText }: AutoSizeTextProps) {
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = textRef.current;
        if (!element) return;

        const run = () => fitText(element);

        run(); // initial
        window.addEventListener('resize', run);

        return () => {
            window.removeEventListener('resize', run);
        };
    }, [boldText, regularText]);

    return (
        <div ref={textRef} className="auto-size-text">
            <span className="bold-text">{boldText}</span> <span className="normal-text">{regularText}</span>
        </div>
    );
}

export default AutoSizeText;