document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Change icon
            const icon = menuToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });

    // Smooth Scrolling for anchor links (polyfill support not needed for modern browsers but good for fallback)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Scroll Animations (Intersection Observer)
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply animation class to elements
    const elementsToAnimate = document.querySelectorAll('section > h2, .about-card, .timeline-item, .project-card, .skill-badge');

    // Add CSS for animation dynamically
    const style = document.createElement('style');
    style.innerHTML = `
        .fade-in-up {
            animation: fadeInUp 0.8s ease forwards;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Initial state hidden for elements connected to observer */
        section > h2, .about-card, .timeline-item, .project-card, .skill-badge {
            opacity: 0; 
            /* Let the animation handle the visibility */
        }
    `;
    document.head.appendChild(style);

    elementsToAnimate.forEach(el => observer.observe(el));

    // Language Toggle Logic
    const langToggle = document.getElementById('lang-toggle');
    const langText = langToggle.querySelector('.lang-text');
    let currentLang = localStorage.getItem('language') || 'es';

    // Function to update content
    function updateContent(lang) {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                element.textContent = translations[lang][key];
            }
        });

        // Update button text
        langText.textContent = lang.toUpperCase();

        // Update html lang attribute
        document.documentElement.lang = lang;
    }

    // Initialize logic
    if (langToggle) {
        // Set initial state
        updateContent(currentLang);

        langToggle.addEventListener('click', () => {
            currentLang = currentLang === 'es' ? 'en' : 'es';
            localStorage.setItem('language', currentLang);
            updateContent(currentLang);

            // Add a small rotation animation to the globe
            const icon = langToggle.querySelector('.fa-globe');
            icon.style.transform = 'rotate(180deg)';
            setTimeout(() => {
                icon.style.transform = 'rotate(0deg)';
            }, 300);
        });
    }

    // Image Long Press Interaction
    const projectImages = document.querySelectorAll('.project-img');
    let pressTimer;

    // Create Modal Elements if they don't exist
    if (!document.querySelector('.image-modal-overlay')) {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'image-modal-overlay';
        modalOverlay.innerHTML = `
            <div class="modal-close"><i class="fas fa-times"></i></div>
            <img src="" alt="Full size" class="image-modal-content">
        `;
        document.body.appendChild(modalOverlay);

        // Close modal events
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay || e.target.closest('.modal-close')) {
                modalOverlay.classList.remove('active');
                setTimeout(() => {
                    modalOverlay.style.display = 'none';
                }, 400);
            }
        });
    }

    const modalOverlay = document.querySelector('.image-modal-overlay');
    const modalImg = modalOverlay.querySelector('.image-modal-content');

    function startPress(e, img) {
        // Create indicator
        const container = img.parentElement;
        if (!container.querySelector('.holding-indicator')) {
            const indicator = document.createElement('div');
            indicator.className = 'holding-indicator';
            container.appendChild(indicator);
        }
        const indicator = container.querySelector('.holding-indicator');
        indicator.classList.add('active');

        pressTimer = setTimeout(() => {
            indicator.classList.remove('active');
            openModal(img.src);
        }, 1000); // 1 second hold
    }

    function cancelPress(img) {
        clearTimeout(pressTimer);
        const indicator = img.parentElement.querySelector('.holding-indicator');
        if (indicator) {
            indicator.classList.remove('active');
        }
    }

    function openModal(src) {
        modalImg.src = src;
        modalOverlay.style.display = 'flex';
        // Force reflow
        modalOverlay.offsetHeight;
        modalOverlay.classList.add('active');
    }

    projectImages.forEach(img => {
        // Mouse Events
        img.addEventListener('mousedown', (e) => startPress(e, img));
        img.addEventListener('mouseup', () => cancelPress(img));
        img.addEventListener('mouseleave', () => cancelPress(img));

        // Touch Events
        img.addEventListener('touchstart', (e) => {
            startPress(e, img);
        }, { passive: true });
        img.addEventListener('touchend', () => cancelPress(img));
        img.addEventListener('touchcancel', () => cancelPress(img));

        // Disable context menu on long press for these images
        img.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    });
});
