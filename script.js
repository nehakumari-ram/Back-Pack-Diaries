/* ================================================
   BACK PACK DIARIES — script.js
   All interactive features: loader, navbar, parallax,
   scroll reveal, lightbox, carousel, counters,
   form validation, scroll-to-top, and more.
   ================================================ */

'use strict';

/* ============================================
   1. LOADER
   ============================================ */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (!loader) return;
  // Give a brief moment for the cinematic effect
  setTimeout(() => {
    loader.classList.add('hidden');
    // Kick off hero reveal after loader fades
    document.querySelectorAll('.hero .reveal-up').forEach((el, i) => {
      setTimeout(() => el.classList.add('revealed'), 200 + i * 150);
    });
  }, 1200);
});


/* ============================================
   2. NAVBAR — scroll state & active link
   ============================================ */
const navbar = document.getElementById('navbar');

function updateNavbar() {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  highlightActiveSection();
}

function highlightActiveSection() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-link');
  let current = '';

  sections.forEach(sec => {
    const top = sec.offsetTop - 140;
    if (window.scrollY >= top) current = sec.getAttribute('id');
  });

  links.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', updateNavbar, { passive: true });
updateNavbar();


/* ============================================
   3. HAMBURGER MENU
   ============================================ */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close menu when a link is clicked
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// Close menu on outside click
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target)) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  }
});


/* ============================================
   4. PARALLAX HERO
   ============================================ */
const heroBg = document.getElementById('heroBg');

window.addEventListener('scroll', () => {
  if (!heroBg) return;
  const scrolled = window.scrollY;
  // Move background upward at half the scroll speed
  heroBg.style.transform = `translateY(${scrolled * 0.42}px)`;
}, { passive: true });


/* ============================================
   5. SCROLL REVEAL (IntersectionObserver)
   ============================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      // Stop observing once revealed
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

// Observe all elements that should reveal on scroll
// (Hero elements are revealed after loader, so exclude them from this pass)
document.querySelectorAll('.reveal-up:not(.hero .reveal-up)').forEach(el => {
  revealObserver.observe(el);
});


/* ============================================
   6. GALLERY LIGHTBOX
   ============================================ */
const galleryItems = Array.from(document.querySelectorAll('.g-item'));
const lightbox     = document.getElementById('lightbox');
const lbOverlay    = document.getElementById('lbOverlay');
const lbImg        = document.getElementById('lbImg');
const lbCaption    = document.getElementById('lbCaption');
const lbClose      = document.getElementById('lbClose');
const lbPrev       = document.getElementById('lbPrev');
const lbNext       = document.getElementById('lbNext');

let currentIndex = 0;

function openLightbox(index) {
  currentIndex = index;
  const item = galleryItems[index];
  const bg   = getComputedStyle(item).backgroundImage;
  lbImg.style.backgroundImage = bg;
  lbCaption.textContent = item.dataset.caption || '';
  lightbox.classList.add('active');
  lbOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  lbOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

function navigateLightbox(dir) {
  currentIndex = (currentIndex + dir + galleryItems.length) % galleryItems.length;
  const item = galleryItems[currentIndex];
  const bg   = getComputedStyle(item).backgroundImage;
  // Fade out, swap, fade in
  lbImg.style.opacity = '0';
  setTimeout(() => {
    lbImg.style.backgroundImage = bg;
    lbCaption.textContent = item.dataset.caption || '';
    lbImg.style.opacity = '1';
  }, 180);
  lbImg.style.transition = 'opacity 0.18s ease';
}

galleryItems.forEach((item, i) => {
  item.addEventListener('click', () => openLightbox(i));
});

lbClose.addEventListener('click', closeLightbox);
lbOverlay.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(-1); });
lbNext.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(1); });

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') navigateLightbox(-1);
  if (e.key === 'ArrowRight') navigateLightbox(1);
});


/* ============================================
   7. TESTIMONIAL CAROUSEL (auto-slide)
   ============================================ */
(function initCarousel() {
  const track = document.getElementById('testiTrack');
  if (!track) return;

  const cards = Array.from(track.querySelectorAll('.testi-card'));
  const dotsContainer = document.getElementById('testiDots');
  let current  = 0;
  let autoplay;

  // Decide items visible based on viewport
  function itemsVisible() {
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }

  // Build dots
  function buildDots() {
    dotsContainer.innerHTML = '';
    const visible = itemsVisible();
    const totalPages = Math.ceil(cards.length / visible);
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('button');
      dot.classList.add('testi-dot');
      dot.setAttribute('aria-label', `Go to page ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots(page) {
    document.querySelectorAll('.testi-dot').forEach((d, i) => {
      d.classList.toggle('active', i === page);
    });
  }

  function goTo(page) {
    current = page;
    const visible = itemsVisible();
    const cardWidth = cards[0].offsetWidth + 32; // card + gap
    track.style.transform = `translateX(-${page * visible * cardWidth}px)`;
    updateDots(page);
  }

  function next() {
    const visible = itemsVisible();
    const totalPages = Math.ceil(cards.length / visible);
    goTo((current + 1) % totalPages);
  }

  function startAutoplay() {
    clearInterval(autoplay);
    autoplay = setInterval(next, 4200);
  }

  buildDots();
  startAutoplay();

  // Rebuild on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      goTo(0);
      startAutoplay();
    }, 250);
  });

  // Pause on hover
  track.addEventListener('mouseenter', () => clearInterval(autoplay));
  track.addEventListener('mouseleave', startAutoplay);
})();


/* ============================================
   8. ANIMATED COUNTERS (About stats)
   ============================================ */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 2000; // ms
  const startTime = performance.now();

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.floor(easeOutExpo(progress) * target);

    // Format large numbers with commas
    el.textContent = value >= 1000
      ? value.toLocaleString()
      : value;

    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target >= 1000 ? target.toLocaleString() : target;
  }

  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num[data-target]').forEach(el => {
  counterObserver.observe(el);
});


/* ============================================
   9. NEWSLETTER FORM VALIDATION
   ============================================ */
const nlForm  = document.getElementById('nlForm');
const nlEmail = document.getElementById('nlEmail');
const nlMsg   = document.getElementById('nlMsg');

if (nlForm) {
  nlForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = nlEmail.value.trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!val) {
      showNlMsg('Please enter your email address.', 'error');
      return;
    }
    if (!emailRe.test(val)) {
      showNlMsg('Please enter a valid email address.', 'error');
      return;
    }
    // Simulate success
    showNlMsg('🎉 You\'re in! Welcome to the journey.', 'success');
    nlEmail.value = '';
  });
}

function showNlMsg(text, type) {
  nlMsg.textContent = text;
  nlMsg.style.color = type === 'error'
    ? 'rgba(255,200,180,1)'
    : 'rgba(255,255,255,0.95)';
  clearTimeout(showNlMsg._timer);
  showNlMsg._timer = setTimeout(() => { nlMsg.textContent = ''; }, 5000);
}


/* ============================================
   10. CONTACT FORM VALIDATION
   ============================================ */
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const name  = document.getElementById('cName');
    const email = document.getElementById('cEmail');
    const msg   = document.getElementById('cMsg');

    clearErrors();

    if (!name.value.trim()) {
      setError('cNameErr', 'Name is required.');
      valid = false;
    } else if (name.value.trim().length < 2) {
      setError('cNameErr', 'Name must be at least 2 characters.');
      valid = false;
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      setError('cEmailErr', 'Email is required.');
      valid = false;
    } else if (!emailRe.test(email.value.trim())) {
      setError('cEmailErr', 'Please enter a valid email.');
      valid = false;
    }

    if (!msg.value.trim()) {
      setError('cMsgErr', 'Message is required.');
      valid = false;
    } else if (msg.value.trim().length < 10) {
      setError('cMsgErr', 'Message must be at least 10 characters.');
      valid = false;
    }

    if (valid) {
      const success = document.getElementById('formSuccess');
      success.textContent = '✓ Message sent! I\'ll get back to you soon.';
      contactForm.reset();
      setTimeout(() => { success.textContent = ''; }, 6000);
    }
  });
}

function setError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearErrors() {
  ['cNameErr', 'cEmailErr', 'cMsgErr'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  const s = document.getElementById('formSuccess');
  if (s) s.textContent = '';
}


/* ============================================
   11. SCROLL-TO-TOP BUTTON
   ============================================ */
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
    scrollTopBtn.classList.add('visible');
  } else {
    scrollTopBtn.classList.remove('visible');
  }
}, { passive: true });

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ============================================
   12. SMOOTH ANCHOR SCROLLING (with offset)
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navHeight = navbar.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ============================================
   13. DESTINATION CARD — "Read More" buttons
      (simple demo behaviour — expand text)
   ============================================ */
document.querySelectorAll('.card-link').forEach(link => {
  link.addEventListener('click', (e) => {
    // Prevent default since these are placeholders
    e.preventDefault();
  });
});
