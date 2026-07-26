import useFaviconAnimation from "../FaviconAnimator/hooks/useFaviconAnimation";

// FIX: Array movido a módulo-scope — referencia estable, nunca se recrea en cada render.
// Esto elimina el warning "dependency recreated every render" en useFaviconAnimation.
const FAVICON_ICONS = [
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
]

export default function FaviconAnimator() {
    useFaviconAnimation(FAVICON_ICONS, 1000);
    return null;
}