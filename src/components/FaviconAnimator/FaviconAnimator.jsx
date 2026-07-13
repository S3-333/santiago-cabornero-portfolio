import useFaviconAnimation from "../FaviconAnimator/hooks/useFaviconAnimation";

// FIX #1: Rutas del favicon sin prefijo /public/
export default function FaviconAnimator() {
    useFaviconAnimation(
        [
            "/assets/favicon/a.webp",
            "/assets/favicon/b.webp",
            "/assets/favicon/c.webp",
            "/assets/favicon/d.webp",
            "/assets/favicon/e.webp",
            "/assets/favicon/f.webp",
            "/assets/favicon/g.webp",
            "/assets/favicon/h.webp",
            "/assets/favicon/i.webp",
            "/assets/favicon/j.webp"
        ],
        1000
    );

    return null;
}