/**
 * Kancelaria Adwokacka adw. Bartłomiej Tutak
 * Main JavaScript file
 */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ===== VARIABLES =====
    const header = document.getElementById('header');
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');
    const navLinks = document.querySelectorAll('.nav__link');
    const contactForm = document.getElementById('contact-form');
    const sections = document.querySelectorAll('section[id]');

    // ===== MOBILE MENU =====
    function openMenu() {
        navMenu.classList.add('show-menu');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        navMenu.classList.remove('show-menu');
        document.body.style.overflow = '';
    }

    // Toggle menu
    if (navToggle) {
        navToggle.addEventListener('click', openMenu);
    }

    if (navClose) {
        navClose.addEventListener('click', closeMenu);
    }

    // Close menu when clicking on nav links
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close menu when clicking outside
    navMenu.addEventListener('click', function(e) {
        if (e.target === navMenu) {
            closeMenu();
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('show-menu')) {
            closeMenu();
        }
    });

    // ===== STICKY HEADER =====
    function handleScroll() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on load

    // ===== ACTIVE LINK ON SCROLL =====
    function scrollActive() {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 150;
            const sectionId = section.getAttribute('id');
            const link = document.querySelector(`.nav__link[href*="${sectionId}"]`);

            if (link) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            }
        });
    }

    window.addEventListener('scroll', scrollActive);

    // ===== SMOOTH SCROLL =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#" or empty
            if (href === '#' || href === '') return;
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                const headerHeight = header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== SCROLL ANIMATIONS =====
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll(
            '.about__content, .contact__card, .contact__form-wrapper, .fade-in'
        );
        
        const staggerElements = document.querySelectorAll('.fade-in-stagger');

        // Add fade-in class to non-stagger elements
        animatedElements.forEach(el => {
            if (!el.classList.contains('fade-in')) {
                el.classList.add('fade-in');
            }
        });

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => {
            observer.observe(el);
        });
        
        staggerElements.forEach(el => {
            observer.observe(el);
        });
    }

    initScrollAnimations();
    
    // ===== COUNTER ANIMATION =====
    function initCounters() {
        const counters = document.querySelectorAll('.counter');
        
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.getAttribute('data-target'));
                    const duration = 2000; // 2 seconds
                    const step = target / (duration / 16); // 60fps
                    let current = 0;
                    
                    const updateCounter = () => {
                        current += step;
                        if (current < target) {
                            counter.textContent = Math.floor(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.textContent = target;
                        }
                    };
                    
                    updateCounter();
                    counterObserver.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }
    
    initCounters();
    
    // ===== SCROLL TO TOP BUTTON =====
    const scrollTopBtn = document.getElementById('scroll-top');
    
    function toggleScrollTopBtn() {
        if (scrollTopBtn) {
            if (window.scrollY > 500) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        }
    }
    
    window.addEventListener('scroll', toggleScrollTopBtn);
    toggleScrollTopBtn();

    // ===== FORM VALIDATION =====
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form fields
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const phone = document.getElementById('phone');
            const message = document.getElementById('message');
            const privacy = document.getElementById('privacy');
            
            // Clear previous errors
            clearErrors();
            
            let isValid = true;
            
            // Validate name
            if (!name.value.trim()) {
                showError(name, 'Proszę podać imię i nazwisko');
                isValid = false;
            }
            
            // Validate email
            if (!email.value.trim()) {
                showError(email, 'Proszę podać adres e-mail');
                isValid = false;
            } else if (!isValidEmail(email.value)) {
                showError(email, 'Proszę podać poprawny adres e-mail');
                isValid = false;
            }
            
            // Validate phone (optional but must be valid if provided)
            if (phone.value.trim() && !isValidPhone(phone.value)) {
                showError(phone, 'Proszę podać poprawny numer telefonu');
                isValid = false;
            }
            
            // Validate message
            if (!message.value.trim()) {
                showError(message, 'Proszę wpisać wiadomość');
                isValid = false;
            } else if (message.value.trim().length < 10) {
                showError(message, 'Wiadomość musi mieć co najmniej 10 znaków');
                isValid = false;
            }
            
            // Validate privacy checkbox
            if (!privacy.checked) {
                showError(privacy, 'Proszę zaakceptować politykę prywatności');
                isValid = false;
            }
            
            if (isValid) {
                // Pokaż stan ładowania
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wysyłanie...';
                submitBtn.disabled = true;
                
                // Wyślij formularz przez AJAX
                const formData = new FormData(contactForm);
                
                fetch('send-mail.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showFormMessage('success', data.message);
                        contactForm.reset();
                    } else {
                        showFormMessage('error', data.message || 'Wystąpił błąd. Spróbuj ponownie.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showFormMessage('error', 'Wystąpił błąd połączenia. Spróbuj ponownie lub zadzwoń.');
                })
                .finally(() => {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                });
            }
        });
        
        // Real-time validation
        const inputs = contactForm.querySelectorAll('.form__input');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('form__input--error')) {
                    validateField(this);
                }
            });
        });
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        // Accept Polish phone formats
        const phoneRegex = /^[\d\s\-\+\(\)]{9,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    function showError(field, message) {
        field.classList.add('form__input--error');
        
        // Remove existing error message if any
        const existingError = field.parentNode.querySelector('.form__error');
        if (existingError) {
            existingError.remove();
        }
        
        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form__error';
        errorDiv.style.cssText = 'color: #dc3545; font-size: 0.75rem; margin-top: 0.25rem;';
        errorDiv.textContent = message;
        
        if (field.type === 'checkbox') {
            field.parentNode.appendChild(errorDiv);
        } else {
            field.parentNode.insertBefore(errorDiv, field.nextSibling);
        }
    }

    function clearErrors() {
        const errorInputs = document.querySelectorAll('.form__input--error');
        errorInputs.forEach(input => {
            input.classList.remove('form__input--error');
        });
        
        const errorMessages = document.querySelectorAll('.form__error');
        errorMessages.forEach(msg => msg.remove());
        
        const formMessages = document.querySelectorAll('.form__message');
        formMessages.forEach(msg => msg.remove());
    }

    function validateField(field) {
        // Clear previous error for this field
        field.classList.remove('form__input--error');
        const existingError = field.parentNode.querySelector('.form__error');
        if (existingError) {
            existingError.remove();
        }
        
        const value = field.value.trim();
        
        switch (field.id) {
            case 'name':
                if (!value) {
                    showError(field, 'Proszę podać imię i nazwisko');
                }
                break;
            case 'email':
                if (!value) {
                    showError(field, 'Proszę podać adres e-mail');
                } else if (!isValidEmail(value)) {
                    showError(field, 'Proszę podać poprawny adres e-mail');
                }
                break;
            case 'phone':
                if (value && !isValidPhone(value)) {
                    showError(field, 'Proszę podać poprawny numer telefonu');
                }
                break;
            case 'message':
                if (!value) {
                    showError(field, 'Proszę wpisać wiadomość');
                } else if (value.length < 10) {
                    showError(field, 'Wiadomość musi mieć co najmniej 10 znaków');
                }
                break;
        }
    }

    function showFormMessage(type, message) {
        // Remove existing messages
        const existingMessages = contactForm.querySelectorAll('.form__message');
        existingMessages.forEach(msg => msg.remove());
        
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `form__message form__message--${type}`;
        messageDiv.textContent = message;
        
        // Insert at the beginning of the form
        contactForm.insertBefore(messageDiv, contactForm.firstChild);
        
        // Scroll to message
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    // ===== PHONE NUMBER FORMATTING =====
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Remove non-numeric characters except + at the beginning
            let value = this.value.replace(/[^\d+]/g, '');
            
            // Ensure + is only at the beginning
            if (value.indexOf('+') > 0) {
                value = value.replace(/\+/g, '');
            }
            
            // Format Polish number: XXX XXX XXX
            if (value.startsWith('+48')) {
                const numbers = value.slice(3);
                if (numbers.length > 0) {
                    let formatted = '+48 ';
                    for (let i = 0; i < numbers.length && i < 9; i++) {
                        if (i > 0 && i % 3 === 0) {
                            formatted += ' ';
                        }
                        formatted += numbers[i];
                    }
                    this.value = formatted;
                }
            } else if (!value.startsWith('+')) {
                // Format without country code
                let formatted = '';
                const numbers = value.replace(/\D/g, '');
                for (let i = 0; i < numbers.length && i < 9; i++) {
                    if (i > 0 && i % 3 === 0) {
                        formatted += ' ';
                    }
                    formatted += numbers[i];
                }
                this.value = formatted;
            }
        });
    }

    // ===== LAZY LOADING IMAGES =====
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lozad.js/1.16.0/lozad.min.js';
        script.onload = function() {
            const observer = lozad();
            observer.observe();
        };
        document.body.appendChild(script);
    }

    // ===== CURRENT YEAR IN FOOTER =====
    const yearSpan = document.querySelector('.footer__bottom p');
    if (yearSpan) {
        const currentYear = new Date().getFullYear();
        yearSpan.innerHTML = yearSpan.innerHTML.replace(/\d{4}/, currentYear);
    }

    // ===== PERFORMANCE: Debounce scroll events =====
    function debounce(func, wait = 10) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Apply debounce to scroll handlers
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('scroll', scrollActive);
    window.addEventListener('scroll', debounce(handleScroll));
    window.addEventListener('scroll', debounce(scrollActive));

    console.log('Website initialized successfully');
});
