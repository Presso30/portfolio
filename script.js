// ==========================================
// VARIABLES GLOBALES
// Sélection des éléments DOM principaux
// ========================================== 

// Indique que JavaScript est actif (pour animations safe)
document.documentElement.classList.add('js');

// Éléments de navigation
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Formulaire de contact
const contactForm = document.getElementById('contactForm');
const formInputs = contactForm.querySelectorAll('input, textarea');

// Barres de compétences (pour animation)
const skillBars = document.querySelectorAll('.skill-progress');

// ==========================================
// MENU HAMBURGER (Navigation mobile)
// Ouvre/ferme le menu sur mobile
// ==========================================

/**
 * Toggle le menu mobile quand on clique sur le hamburger
 * Ajoute/retire la classe 'active' pour afficher/cacher le menu
 */
hamburger.addEventListener('click', () => {
    // Bascule la classe 'active' sur le menu et le hamburger
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

/**
 * Ferme le menu mobile quand on clique sur un lien
 * Améliore l'expérience utilisateur sur mobile
 */
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// ==========================================
// NAVIGATION FLUIDE (Smooth scroll)
// Améliore le défilement vers les sections
// ==========================================

/**
 * Ajoute un comportement de scroll fluide personnalisé
 * Alternative au CSS scroll-behavior pour plus de contrôle
 */
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); // Empêche le comportement par défaut

        // Récupère l'ID de la section cible (ex: "#accueil")
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            // Calcule la position en tenant compte de la navbar fixe
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = targetSection.offsetTop - navHeight;

            // Défilement fluide vers la position calculée
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ==========================================
// ANIMATION DES BARRES DE COMPÉTENCES
// Les barres se remplissent quand elles deviennent visibles
// ==========================================

/**
 * Observer pour détecter quand les barres entrent dans le viewport
 * Utilise l'API Intersection Observer (moderne et performant)
 */
const observerOptions = {
    threshold: 0.5, // 50% de l'élément doit être visible
    rootMargin: '0px'
};

/**
 * Callback appelé quand un élément devient visible
 * @param {Array} entries - Liste des éléments observés
 */
const animateSkills = (entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // L'élément est visible, on anime la barre
            const progressBar = entry.target;
            const targetWidth = progressBar.getAttribute('data-progress');

            // Animation progressive de 0 à la valeur cible
            progressBar.style.width = targetWidth + '%';
        }
    });
};

// Créer l'observer avec les options et le callback
const skillObserver = new IntersectionObserver(animateSkills, observerOptions);

// Observer toutes les barres de compétences
skillBars.forEach(bar => {
    skillObserver.observe(bar);
});

// ==========================================
// VALIDATION DU FORMULAIRE DE CONTACT
// Vérifie les champs avant envoi
// ==========================================

/**
 * Validation en temps réel des champs du formulaire
 * Affiche les erreurs immédiatement
 */
formInputs.forEach(input => {
    // Validation à la perte du focus (quand l'utilisateur quitte le champ)
    input.addEventListener('blur', () => {
        validateField(input);
    });

    // Retire l'erreur quand l'utilisateur commence à taper
    input.addEventListener('input', () => {
        if (input.parentElement.classList.contains('error')) {
            input.parentElement.classList.remove('error');
        }
    });
});

/**
 * Valide un champ individuel
 * @param {HTMLElement} field - Le champ à valider
 * @returns {boolean} - true si valide, false sinon
 */
function validateField(field) {
    const fieldName = field.name;
    const fieldValue = field.value.trim();
    const formGroup = field.parentElement;
    const errorMessage = formGroup.querySelector('.error-message');

    // Réinitialise l'état d'erreur
    formGroup.classList.remove('error');
    errorMessage.textContent = '';

    // Validation selon le type de champ
    switch (fieldName) {
        case 'nom':
            // Le nom doit contenir au moins 2 caractères
            if (fieldValue.length < 2) {
                showError(formGroup, errorMessage, 'Le nom doit contenir au moins 2 caractères');
                return false;
            }
            break;

        case 'email':
            // Validation email avec regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(fieldValue)) {
                showError(formGroup, errorMessage, 'Veuillez entrer un email valide');
                return false;
            }
            break;

        case 'sujet':
            // Le sujet ne doit pas être vide
            if (fieldValue.length < 3) {
                showError(formGroup, errorMessage, 'Le sujet doit contenir au moins 3 caractères');
                return false;
            }
            break;

        case 'message':
            // Le message doit contenir au moins 10 caractères
            if (fieldValue.length < 10) {
                showError(formGroup, errorMessage, 'Le message doit contenir au moins 10 caractères');
                return false;
            }
            break;
    }

    return true;
}

/**
 * Affiche un message d'erreur pour un champ
 * @param {HTMLElement} formGroup - Le conteneur du champ
 * @param {HTMLElement} errorElement - L'élément pour le message d'erreur
 * @param {string} message - Le message d'erreur à afficher
 */
function showError(formGroup, errorElement, message) {
    formGroup.classList.add('error');
    errorElement.textContent = message;
}

/**
 * Gestion de la soumission du formulaire
 * Valide tous les champs et envoie si tout est OK
 */
contactForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Empêche l'envoi par défaut du formulaire

    // Valide tous les champs
    let isFormValid = true;
    formInputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });

    // Si tous les champs sont valides
    if (isFormValid) {
        // Récupération des données du formulaire
        const formData = {
            nom: document.getElementById('nom').value,
            email: document.getElementById('email').value,
            sujet: document.getElementById('sujet').value,
            message: document.getElementById('message').value
        };

        // Affichage dans la console (pour debug)
        console.log('Formulaire soumis avec succès :', formData);

        // Simulation d'envoi réussi
        //showSuccessMessage();
        emailjs.send(
            "service_cmts3fi",
            "template_3y2rf78",
            {
                from_name: formData.nom,
                from_email: formData.email,
                subject: formData.sujet,
                message: formData.message
            }
        )
            .then(() => {
                showSuccessMessage();
                contactForm.reset();
            })
            .catch((error) => {
                console.error("Erreur EmailJS :", error);
                alert("Erreur lors de l'envoi du message. Veuillez réessayer.");
            });


        // Réinitialise le formulaire
        // contactForm.reset();

        // ICI, vous pouvez ajouter le code pour envoyer vraiment le formulaire
        // Par exemple avec fetch() vers un backend ou un service email
        /*
        fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            showSuccessMessage();
            contactForm.reset();
        })
        .catch(error => {
            console.error('Erreur:', error);
            alert('Une erreur est survenue. Veuillez réessayer.');
        });
        */
    } else {
        // Si le formulaire n'est pas valide, scroll vers la première erreur
        const firstError = document.querySelector('.form-group.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
});

/**
 * Affiche un message de succès après envoi du formulaire
 * Peut être personnalisé selon vos besoins
 */
function showSuccessMessage() {
    // Création d'une notification de succès
    const successDiv = document.createElement('div');
    successDiv.className = 'success-notification';
    successDiv.innerHTML = `
        <p>✓ Message envoyé avec succès ! Je vous répondrai bientôt.</p>
    `;
    successDiv.style.cssText = `
        position: fixed;
        top: 5rem;
        right: 2rem;
        background-color: var(--primary-color);
        color: white;
        padding: 1rem 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(successDiv);

    // Supprime la notification après 4 secondes
    setTimeout(() => {
        successDiv.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(successDiv);
        }, 300);
    }, 4000);
}

// Ajoute les animations CSS pour la notification
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==========================================
// MISE EN SURBRILLANCE DU LIEN ACTIF
// Change la couleur du lien de navigation selon la section visible
// ==========================================

/**
 * Détecte quelle section est visible et met en surbrillance le lien correspondant
 */
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100; // Offset pour la navbar

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        // Vérifie si on est dans cette section
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            // Retire la classe active de tous les liens
            navLinks.forEach(link => {
                link.classList.remove('active-link');
            });

            // Ajoute la classe active au lien correspondant
            const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            if (activeLink) {
                activeLink.classList.add('active-link');
            }
        }
    });
});

// Ajoute le style pour le lien actif
const activeLinkStyle = document.createElement('style');
activeLinkStyle.textContent = `
    .nav-link.active-link {
        color: var(--primary-color);
        position: relative;
    }
    
    .nav-link.active-link::after {
        content: '';
        position: absolute;
        bottom: -5px;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: var(--primary-color);
    }
`;
document.head.appendChild(activeLinkStyle);

// ==========================================
// ANIMATIONS AU SCROLL (Fade-in)
// Les éléments apparaissent progressivement quand on scrolle
// ==========================================

/**
 * Ajoute l'animation fade-in aux éléments quand ils deviennent visibles
 */
const observeElements = document.querySelectorAll('.project-card, .hobby-card, .timeline-item');

const fadeInOptions = {
    threshold: 0.2, // 20% de l'élément visible
    rootMargin: '0px'
};

/**
 * Callback pour l'animation fade-in
 */
const fadeInOnScroll = (entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            // Une fois animé, on arrête d'observer (optimisation)
            fadeInObserver.unobserve(entry.target);
        }
    });
};

const fadeInObserver = new IntersectionObserver(fadeInOnScroll, fadeInOptions);

// Observer tous les éléments sélectionnés
//observeElements.forEach(element => {
// element.style.opacity = '0'; // Cache initialement
// fadeInObserver.observe(element);
//});

// ==========================================
// BOUTON RETOUR EN HAUT (optionnel)
// Affiche un bouton pour remonter en haut de la page
// ==========================================

/**
 * Crée et gère un bouton "retour en haut"
 * Visible uniquement après avoir scrollé
 */
function createBackToTopButton() {
    const button = document.createElement('button');
    button.innerHTML = '↑';
    button.className = 'back-to-top';
    button.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        background-color: var(--primary-color);
        color: white;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    `;

    document.body.appendChild(button);

    // Affiche le bouton après 300px de scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            button.style.opacity = '1';
            button.style.visibility = 'visible';
        } else {
            button.style.opacity = '0';
            button.style.visibility = 'hidden';
        }
    });

    // Retour en haut au clic
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Effet hover
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-5px)';
    });

    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
    });
}

// Initialise le bouton retour en haut
createBackToTopButton();

// ==========================================
// CHARGEMENT INITIAL
// Code exécuté quand la page est complètement chargée
// ==========================================

/**
 * Événement DOMContentLoaded : la page est prête
 * Bon moment pour initialiser des fonctionnalités
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Portfolio chargé avec succès ! 🚀');

    // Animations légères au scroll (sans casser le rendu si JS échoue)
    const targets = document.querySelectorAll(
        '.section-title, .project-category, .project-card, .service-card, .skill-item, .timeline-item, .hobby-card, .tool-badge, .contact-form, .contact-info, .hero-text, .hero-image'
    );

    const getAnimClass = (el) => {
        if (el.classList.contains('hero-text')) return 'anim-rise';
        if (el.classList.contains('hero-image')) return 'anim-right';
        if (el.classList.contains('section-title')) return 'anim-title';
        if (el.classList.contains('project-category')) return 'anim-category';
        if (el.classList.contains('project-card')) return 'anim-pop';
        if (el.classList.contains('service-card')) return 'anim-rise';
        if (el.classList.contains('skill-item')) return 'anim-left';
        if (el.classList.contains('timeline-item')) return 'anim-line';
        if (el.classList.contains('hobby-card')) return 'anim-tilt';
        if (el.classList.contains('tool-badge')) return 'anim-chip';
        if (el.classList.contains('contact-form')) return 'anim-left';
        if (el.classList.contains('contact-info')) return 'anim-right';
        return 'anim-rise';
    };

    targets.forEach((el, index) => {
        el.classList.add('anim', getAnimClass(el));
        el.style.transitionDelay = `${(index % 6) * 60}ms`;
    });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
        );

        targets.forEach(el => observer.observe(el));
    } else {
        targets.forEach(el => el.classList.add('in-view'));
    }
});

/**
 * Événement load : tous les assets (images, etc.) sont chargés
 */
window.addEventListener('load', () => {
    console.log('Toutes les ressources sont chargées ! ✓');

    // Masque un éventuel loader si vous en avez un
    // const loader = document.querySelector('.loader');
    // if (loader) loader.style.display = 'none';
});

// ==========================================
// FONCTIONS UTILITAIRES
// Fonctions réutilisables dans le code
// ==========================================

/**
 * Fonction de throttle pour optimiser les événements de scroll
 * Limite le nombre d'appels d'une fonction
 * @param {Function} func - La fonction à throttler
 * @param {number} delay - Délai minimum entre les appels (ms)
 */
function throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
        const now = new Date().getTime();
        if (now - lastCall < delay) {
            return;
        }
        lastCall = now;
        return func(...args);
    };
}

/**
 * Fonction de debounce pour optimiser les événements de resize
 * Attend que l'événement soit terminé avant d'exécuter
 * @param {Function} func - La fonction à debouncer
 * @param {number} delay - Délai d'attente (ms)
 */
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

// Exemple d'utilisation du debounce pour le resize
window.addEventListener('resize', debounce(() => {
    console.log('Fenêtre redimensionnée');
    // Ajoutez ici du code à exécuter au redimensionnement
}, 250));

// ==========================================
// EASTER EGG (optionnel, pour le fun !)
// Un petit secret pour les curieux
// ==========================================

/**
 * Konami Code Easter Egg
 * Tapez : ↑ ↑ ↓ ↓ ← → ← → B A
 */
let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === konamiCode[konamiIndex].toLowerCase()) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            activateEasterEgg();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateEasterEgg() {
    alert('🎉 Bravo ! Vous avez trouvé l\'Easter Egg ! 🎮\nVous êtes curieux, c\'est une qualité en data science ! 📊');
    // Ajoutez un effet visuel fun si vous voulez
    document.body.style.animation = 'rainbow 2s linear infinite';
}

// Animation rainbow pour l'easter egg
const rainbowStyle = document.createElement('style');
rainbowStyle.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(rainbowStyle);

// ==========================================
// FIN DU SCRIPT
// Tout le code JavaScript est maintenant chargé et actif
// ==========================================

console.log('Script.js entièrement chargé ! ✓');
