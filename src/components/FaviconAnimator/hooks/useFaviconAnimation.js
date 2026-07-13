import { useEffect } from "react";

export default function useFaviconAnimation(icons, interval = 1000) {
    useEffect(() => {
        if (!icons || icons.length === 0) return undefined;

        // Precargar todos los favicons
        const preloadedImages = icons.map((src) => {
            const img = new Image();
            img.src = src;
            return img;
        });

        let index = 0;
        let intervalId = null;

        let link = document.querySelector("link[rel='icon']");
        if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
        }

        // Mostrar el primer favicon
        link.href = icons[0];

        const changeFavicon = () => {
            index = (index + 1) % icons.length;
            link.href = icons[index];
        };

        const onVisibilityChange = () => {
            if (document.hidden) {
                if (intervalId !== null) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
            } else if (intervalId === null) {
                intervalId = setInterval(changeFavicon, interval);
            }
        };

        // Si la pestaña ya está visible al cargar, arrancar la animación
        if (!document.hidden) {
            intervalId = setInterval(changeFavicon, interval);
        }

        document.addEventListener("visibilitychange", onVisibilityChange);

        // Cleanup explícito: detiene el timer y remueve el listener
        return () => {
            if (intervalId !== null) {
                clearInterval(intervalId);
            }
            document.removeEventListener("visibilitychange", onVisibilityChange);
            void preloadedImages; // evita warning de variable no usada
        };
    }, [icons, interval]);
}