// Attendre que tout le contenu de la page soit chargé avant d'exécuter le script
document.addEventListener("DOMContentLoaded", (event) => {

    // Enregistrement du plugin ScrollTrigger auprès de GSAP
    gsap.registerPlugin(ScrollTrigger);

    // Sélection des éléments pour le bouton d'accessibilité
    const accessBtn = document.getElementById('accessibility-btn');
    const btnText = document.getElementById('btn-text');
    let animationsEnabled = true;

    // Fonction pour activer ou désactiver les animations
    function toggleAnimations(enable) {
        if (enable) {
            ScrollTrigger.refresh();
            if (btnText) btnText.textContent = "Animations : ON";
            if (accessBtn) accessBtn.style.opacity = "1";
        } else {
            // Coupe toutes les animations GSAP et remet les éléments dans leur état d'origine
            ScrollTrigger.getAll().forEach(st => st.kill());
            gsap.set(['.bigtitle', '.images-container img'], { clearProps: "all" });
            if (btnText) btnText.textContent = "Animations : OFF";
            if (accessBtn) accessBtn.style.opacity = "0.7";
        }
    }

    // 1. Vérification des préférences d'accessibilité (système ou choix enregistré)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const savedPreference = localStorage.getItem('animations');

    if (savedPreference === 'false' || (savedPreference === null && prefersReducedMotion)) {
        animationsEnabled = false;
        toggleAnimations(false);
    } else {
        initAnimations();
    }

    // 2. Gestion du clic sur le bouton d'accessibilité manuel
    if (accessBtn) {
        accessBtn.addEventListener('click', () => {
            animationsEnabled = !animationsEnabled;
            localStorage.setItem('animations', animationsEnabled);
            if (animationsEnabled) {
                location.reload(); // Recharge la page proprement pour relancer GSAP
            } else {
                toggleAnimations(false);
            }
        });
    }

    // 3. Fonction d'initialisation des animations GSAP
    function initAnimations() {
        if (!animationsEnabled) return;

        // A. Effet de parallaxe fluide sur le grand titre
        gsap.to('.bigtitle', {
            y: () => window.scrollY * 0.4,
            ease: 'none',
            scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: 'bottom top',
                scrub: true, // Synchronisé avec la molette
            }
        });

        // B. Animation des photos au scroll : déclenchement dès qu'elles sont entièrement dans l'écran
        const images = document.querySelectorAll('.images-container img');
        images.forEach((img, index) => {
            // Rotation alternée (gauche / droite) selon la position de l'image
            const rotationAngle = index % 2 === 0 ? 25 : -25;

            gsap.to(img, {
                y: -350,                 // Distance de remontée (augmentée pour aller plus haut et plus vite)
                rotation: rotationAngle, // Rotation légère
                scale: 1.25,             // Zoom progressif
                opacity: 0,              // Disparition progressive
                ease: 'none',
                scrollTrigger: {
                    trigger: '.images-container',
                    start: 'top bottom',    // L'animation commence dès que le haut de la zone touche le bas de l'écran (entièrement visible)
                    end: 'center top',      // L'effet se termine plus rapidement lorsque le conteneur arrive au milieu de l'écran
                    scrub: true,            // Suivi fluide et direct de la molette
                }
            });
        });
    }
});