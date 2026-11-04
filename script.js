    window.addEventListener('scroll', function() {
        let scrollPosition = window.scrollY;
    let title = document.querySelector('.bigtitle');

    title.style.transform = `translateY(${scrollPosition * 0.4}px)`;
    });
