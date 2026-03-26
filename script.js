// ===== PARTICLE EFFECT =====
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
// Fewer particles on mobile to avoid lag
const particleCount = window.innerWidth < 768 ? 40 : 100;

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = Math.random() * 0.5 - 0.25;
    this.speedY = Math.random() * 0.5 - 0.25;
    this.opacity = Math.random() * 0.5 + 0.2;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x > canvas.width)  this.x = 0;
    if (this.x < 0)             this.x = canvas.width;
    if (this.y > canvas.height) this.y = 0;
    if (this.y < 0)             this.y = canvas.height;
  }

  draw() {
    ctx.fillStyle = `rgba(255, 26, 26, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function init() {
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();

    for (let j = i; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 100) {
        ctx.strokeStyle = `rgba(255, 26, 26, ${0.1 * (1 - distance / 100)})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animate);
}

init();
animate();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});


// ===== HAMBURGER MENU =====
function toggleMenu() {
  const nav = document.getElementById('main-nav');
  const btn = document.getElementById('hamburger');
  nav.classList.toggle('open');
  btn.classList.toggle('open');
}

function closeMenu() {
  const nav = document.getElementById('main-nav');
  const btn = document.getElementById('hamburger');
  nav.classList.remove('open');
  btn.classList.remove('open');
}

// Close menu if user clicks outside of it
document.addEventListener('click', function(e) {
  const nav = document.getElementById('main-nav');
  const btn = document.getElementById('hamburger');
  if (nav.classList.contains('open') && !nav.contains(e.target) && !btn.contains(e.target)) {
    closeMenu();
  }
});


// ===== HEADER SCROLL EFFECT =====
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  if (window.scrollY > 100) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});


// ===== SCROLL REVEAL ANIMATION =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.section-title, .card, .expert-card').forEach(el => {
  observer.observe(el);
});


// ===== CAROUSEL =====
const carousel = document.getElementById('carousel');
const cards = document.querySelectorAll(".card-video");
const videos = document.querySelectorAll(".card-video video");
const positions = ["left", "center", "right"];

let userInteracted = false;
let manuallyPaused = false;

// Tap to pause / enable sound
carousel.addEventListener('click', function () {
  const activeVideo = document.querySelector('.card-video.center video');
  if (!activeVideo) return;

  if (!userInteracted) {
    activeVideo.muted = false;
    userInteracted = true;
    manuallyPaused = false;
  } else {
    if (!activeVideo.paused) {
      activeVideo.pause();
      manuallyPaused = true;
    } else {
      activeVideo.play().catch(() => {});
      manuallyPaused = false;
    }
  }
});

function updateVideoState() {
  const activeVideo = document.querySelector('.card-video.center video');

  videos.forEach(video => {
    video.loop = true;
    if (video.paused && video !== activeVideo) video.play().catch(() => {});
    video.muted = true;
  });

  if (activeVideo && userInteracted && !manuallyPaused) {
    activeVideo.muted = false;
    if (activeVideo.paused) activeVideo.play().catch(() => {});
  }
}

function changeSlide(direction) {
  cards.forEach(card => {
    let currentPos = positions.findIndex(pos => card.classList.contains(pos));
    card.classList.remove(positions[currentPos]);
    let newPos = (currentPos + direction + 3) % 3;
    card.classList.add(positions[newPos]);
  });
  setTimeout(updateVideoState, 200);
}

function goToSlide(index) {
  const order = [
    ["center", "right", "left"],
    ["left", "center", "right"],
    ["right", "left", "center"]
  ];
  cards.forEach((card, i) => {
    card.classList.remove("left", "center", "right");
    card.classList.add(order[index][i]);
  });
  setTimeout(updateVideoState, 200);
}

// Swipe gesture
let startX = 0, startY = 0, endX = 0, isSwiping = false;

carousel.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
  isSwiping = false;
});

carousel.addEventListener("touchmove", (e) => {
  endX = e.touches[0].clientX;
  if (Math.abs(endX - startX) > 10) isSwiping = true;
});

carousel.addEventListener("touchend", () => {
  if (!isSwiping) return;
  const diffX = startX - endX;
  if (Math.abs(diffX) > 50) {
    if (diffX > 0) changeSlide(1);
    else changeSlide(-1);
  }
});

// Pause center video when scrolled out of view
function checkVisibility() {
  const rect = carousel.getBoundingClientRect();
  const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;
  const centerVideo = document.querySelector('.card-video.center video');
  if (!centerVideo) return;

  if (!isVisible) {
    if (!centerVideo.paused) centerVideo.pause();
  } else {
    if (!centerVideo.paused || manuallyPaused) return;
    centerVideo.play().catch(() => {});
  }
}

window.addEventListener('scroll', checkVisibility);
window.addEventListener('resize', checkVisibility);

window.addEventListener('load', () => {
  updateVideoState();
  checkVisibility();
});


// ===== TESTIMONIALS SLIDER =====
document.addEventListener("DOMContentLoaded", () => {
  const testimonials = document.querySelectorAll(".testimonial");
  let currentTestimonial = 0;
  let autoSlide;

  function showTestimonial(index) {
    testimonials.forEach(t => t.classList.remove("active"));
    testimonials[index].classList.add("active");
  }

  function changeTestimonial(direction) {
    currentTestimonial =
      (currentTestimonial + direction + testimonials.length) %
      testimonials.length;
    showTestimonial(currentTestimonial);
    resetAutoSlide();
  }

  function startAutoSlide() {
    autoSlide = setInterval(() => changeTestimonial(1), 5000);
  }

  function resetAutoSlide() {
    clearInterval(autoSlide);
    startAutoSlide();
  }

  showTestimonial(currentTestimonial);
  startAutoSlide();

  // Mobile swipe for testimonials
  let tsStartX = 0;
  const container = document.querySelector(".testimonials-container");

  container.addEventListener("touchstart", e => {
    tsStartX = e.touches[0].clientX;
  });

  container.addEventListener("touchend", e => {
    const tsEndX = e.changedTouches[0].clientX;
    const diff = tsStartX - tsEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) changeTestimonial(1);
      else changeTestimonial(-1);
    }
  });

  // Expose globally for inline onclick buttons
  window.changeTestimonial = changeTestimonial;
});


// ===== PAYMENT MODAL =====
const plans = {
  basic:   { label: 'Basic — $10',   inr: 830  },
  pro:     { label: 'Pro — $20',     inr: 1660 },
  premium: { label: 'Premium — $35', inr: 2905 }
};

const UPI_ID   = 'aryanbangwal24@oksbi';
const UPI_NAME = 'VOID+EDITS';

function openPayment(plan) {
  const modal  = document.getElementById('paymentModal');
  const data   = plans[plan] || plans.basic;

  // Set plan badge
  document.getElementById('modal-plan-title').textContent = 'Complete Payment';
  document.getElementById('modal-plan-badge').textContent = data.label;

  // Build UPI links
  const upiBase    = `pa=${UPI_ID}&pn=${UPI_NAME}&am=${data.inr}&cu=INR&tn=VOID+EDITS+Payment`;
  const upiString  = `upi://pay?${upiBase}`;
  const qrData     = encodeURIComponent(upiString);

  document.getElementById('upi-qr').src           = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;
  document.getElementById('gpay-link').href        = `tez://upi/pay?${upiBase}`;
  document.getElementById('phonepe-link').href     = `phonepe://pay?${upiBase}`;
  document.getElementById('paytm-link').href       = `paytmmp://pay?${upiBase}`;
  document.getElementById('upi-generic-link').href = upiString;

  // Reset to UPI tab
  switchPayTab('upi', document.querySelector('.pay-tab'));

  modal.style.display = 'flex';
}

function closePayment() {
  document.getElementById('paymentModal').style.display = 'none';
}

// Close modal when clicking dark backdrop
document.getElementById('paymentModal').addEventListener('click', function(e) {
  if (e.target === this) closePayment();
});

function switchPayTab(tab, btn) {
  // Toggle panels
  document.getElementById('tab-upi').style.display    = tab === 'upi'    ? 'block' : 'none';
  document.getElementById('tab-crypto').style.display = tab === 'crypto' ? 'block' : 'none';

  // Toggle button styles
  document.querySelectorAll('.pay-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function switchCrypto(coin, btn) {
  ['btc', 'eth', 'usdt'].forEach(c => {
    document.getElementById('crypto-' + c).style.display = c === coin ? 'block' : 'none';
  });
  document.querySelectorAll('.crypto-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = original;
      btn.classList.remove('copied');
    }, 2000);
  });
}


// ===== COUNTER ANIMATION =====
document.addEventListener("DOMContentLoaded", function () {
  const counters = document.querySelectorAll('.counter');

  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startCount(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { root: null, threshold: 0.5 });

  function startCount(counter) {
    const target = +counter.getAttribute('data-target');
    const showPlus = counter.getAttribute('data-plus') === 'true';
    let current = 0;

    const updateCount = () => {
      const increment = target / 50;
      if (current < target) {
        current += increment;
        if (current > target) current = target;
        counter.innerText = Math.floor(current) + (showPlus ? '+' : '');
        requestAnimationFrame(updateCount);
      } else {
        counter.innerText = target + (showPlus ? '+' : '');
      }
    };

    updateCount();
  }

  counters.forEach(counter => counterObserver.observe(counter));
});
