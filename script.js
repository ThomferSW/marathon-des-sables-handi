document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    const accessBtn = document.getElementById('accessibility-btn');
    const btnText = document.getElementById('btn-text');
    const mainTitle = document.querySelector('.title-main');
    const subTitle = document.querySelector('.title-sub');
    const images = Array.from(document.querySelectorAll('.images-container img'));
    const titleElements = [mainTitle, subTitle].filter(Boolean);
    const originalTitles = new Map(
        titleElements.map(element => [element, element.textContent.trim()])
    );
    let animationsEnabled = false;

    function updateButton() {
        if (!accessBtn || !btnText) return;

        btnText.textContent = animationsEnabled ? "Animations : ON" : "Animations : OFF";
        accessBtn.setAttribute('aria-pressed', String(animationsEnabled));
        accessBtn.setAttribute(
            'aria-label',
            animationsEnabled ? "Désactiver les animations" : "Activer les animations"
        );
        accessBtn.title = animationsEnabled ? "Désactiver les animations" : "Activer les animations";
    }

    function wrapTitle(element) {
        const text = originalTitles.get(element);
        element.setAttribute('aria-label', text);
        element.innerHTML = `<span aria-hidden="true">${text.split(' ').map(word =>
            `<span class="word-wrap" style="display:inline-block; overflow:hidden; vertical-align:bottom; padding-bottom:5px;"><span class="word-inner" style="display:inline-block; will-change:transform;">${word}&nbsp;</span></span>`
        ).join('')}</span>`;
    }

    function resetAnimations() {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        gsap.killTweensOf([...titleElements, ...images]);
        gsap.set([...titleElements, ...images], { clearProps: "all" });

        titleElements.forEach(element => {
            element.textContent = originalTitles.get(element);
            element.removeAttribute('aria-label');
        });
    }

    function startAnimations() {
        titleElements.forEach(wrapTitle);

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

        gsap.to('.title-main', {
            y: -120,
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: '.bigtitle',
                start: 'top top',
                end: '+=500',
                scrub: true
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
                scrub: true
            }
        });

        if (images.length > 0) {
            gsap.fromTo(images,
                { y: 28, opacity: 0, scale: 0.97 },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '.images-container',
                        start: 'top 88%',
                        once: true
                    }
                }
            );

            images.forEach((image, index) => {
                gsap.to(image, {
                    rotation: index % 2 === 0 ? 8 : -8,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '.images-container',
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true
                    }
                });
            });
        }

        ScrollTrigger.refresh();
    }

    function setAnimationsEnabled(enabled) {
        animationsEnabled = enabled;

        if (animationsEnabled) {
            startAnimations();
        } else {
            resetAnimations();
        }

        updateButton();
    }

    const savedPreference = localStorage.getItem('animations');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setAnimationsEnabled(savedPreference === null ? !prefersReducedMotion : savedPreference === 'true');

    if (accessBtn) {
        accessBtn.addEventListener('click', () => {
            const nextState = !animationsEnabled;
            localStorage.setItem('animations', String(nextState));
            setAnimationsEnabled(nextState);
        });
    }

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        images.forEach(image => {
            image.addEventListener('mouseenter', () => {
                if (animationsEnabled) {
                    gsap.to(image, { y: -6, scale: 1.03, duration: 0.25, ease: 'power2.out' });
                }
            });
            image.addEventListener('mouseleave', () => {
                if (animationsEnabled) {
                    gsap.to(image, { y: 0, scale: 1, duration: 0.25, ease: 'power2.out' });
                }
            });
        });
    }
});
