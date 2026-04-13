import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6h10v3H7v3h6v3H7v6H4V6z" />
            <path d="M17 6h3l3.5 5L27 6h3l-5 8 5 8h-3l-3.5-5L20 22h-3l5-8-5-8z" />
        </svg>
    );
}
