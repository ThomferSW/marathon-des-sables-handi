document.addEventListener("DOMContentLoaded", () => {
    // Enregistrement de ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    const accessBtn = document.getElementById('accessibility-btn');
    const btnText = document.getElementById('btn-text');
    let animationsEnabled = true;

    function toggleAnimations(enable) {
        if (enable) {
            ScrollTrigger.refresh();
            if (btnText) btnText.textContent = "Animations : ON";
            if (accessBtn) accessBtn.style.opacity = "1";
        } else {
            ScrollTrigger.getAll().forEach(st => st.kill());
            gsap.set(['.bigtitle', '.images-container img', '.title-main .word-inner', '.title-sub .word-inner'], { clearProps: "all" });
            if (btnText) btnText.textContent = "Animations : OFF";
            if (accessBtn) accessBtn.style.opacity = "0.7";
        }
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 800px)').matches;
    const savedPreference = localStorage.getItem('animations');

    if (savedPreference === 'false' || (savedPreference === null && prefersReducedMotion) || isMobile) {
        animationsEnabled = false;
        toggleAnimations(false);
        if (isMobile && btnText) btnText.textContent = "Animations désactivées sur mobile";
    } else {
        initAnimations();
    }

    if (accessBtn) {
        accessBtn.addEventListener('click', () => {
            animationsEnabled = !animationsEnabled;
            localStorage.setItem('animations', animationsEnabled);
            if (animationsEnabled) {
                location.reload();
            } else {
                toggleAnimations(false);
            }
        });
    }

    function initAnimations() {
        if (!animationsEnabled) return;

        // ==========================================
        // 1. GESTION ACCESSIBLE DU TITRE ET SOUS-TITRE
        // ==========================================
        const mainTitle = document.querySelector('.title-main');
        const subTitle = document.querySelector('.title-sub');

        function makeAccessibleAndWrap(element) {
            if (!element) return;
            const originalText = element.textContent.trim();

            // On masque proprement le texte découpé pour les lecteurs d'écran (aria-hidden)
            // et on force le lecteur d'écran à lire le texte complet d'un seul bloc via aria-label
            element.setAttribute('aria-label', originalText);

            const words = originalText.split(' ');
            element.innerHTML = `<span aria-hidden="true">` + words.map(word =>
                `<span class="word-wrap" style="display:inline-block; overflow:hidden; vertical-align:bottom; padding-bottom:5px;"><span class="word-inner" style="display:inline-block; will-change:transform;">${word}&nbsp;</span></span>`
            ).join('') + `</span>`;
        }

        makeAccessibleAndWrap(mainTitle);
        makeAccessibleAndWrap(subTitle);

        // Animation d'entrée : les mots sortent de leur cache en cascade
        gsap.fromTo('.bigtitle .word-inner',
            { y: 100, opacity: 0, rotate: 5 },
            {
                y: 0,
                opacity: 1,
                rotate: 0,
                duration: 1.4,
                stagger: 0.05,
                ease: 'power4.out',
                delay: 0.2
            }
        );

        // ==========================================
        // 2. EFFET DE SURVOL MAGNÉTIQUE SUR LES MOTS
        // ==========================================
        const wordInners = document.querySelectorAll('.bigtitle .word-inner');
        wordInners.forEach(word => {
            word.addEventListener('mouseenter', () => {
                if (!animationsEnabled) return;
                gsap.to(word, {
                    y: -8,
                    color: '#b85d14',
                    duration: 0.4,
                    ease: 'power2.out'
                });
            });
            word.addEventListener('mouseleave', () => {
                if (!animationsEnabled) return;
                gsap.to(word, {
                    y: 0,
                    color: '',
                    duration: 0.4,
                    ease: 'power2.out'
                });
            });
        });

        // ==========================================
        // 3. EFFET DE PARALLAXE CINÉMATIQUE AU SCROLL
        // ==========================================
        gsap.to('.title-main', {
            y: -120,
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: '.bigtitle',
                start: 'top top',
                end: '+=500',
                scrub: true,
            }
        });

        gsap.to('.title-sub', {
            y: -60,
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: '.bigtitle',
                start: 'top top',
                end: '+=400',
                scrub: true,
            }
        });

        // ==========================================
        // 4. ANIMATION DES IMAGES AU SCROLL
        // ==========================================
        const images = document.querySelectorAll('.images-container img');
        images.forEach((img, index) => {
            const rotationAngle = index % 2 === 0 ? 25 : -25;

            gsap.to(img, {
                y: -350,
                rotation: rotationAngle,
                scale: 1.25,
                opacity: 0,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.images-container',
                    start: 'top bottom',
                    end: 'center top',
                    scrub: true,
                }
            });
        });
    }
});