// ===== MOUSE-FOLLOWING STAR SPARKLES =====
(function () {
  const mc = document.getElementById('mouse-canvas');
  const mctx = mc.getContext('2d');
  let mW, mH;
  function resizeMC() { mW = mc.width = window.innerWidth; mH = mc.height = window.innerHeight; }
  window.addEventListener('resize', resizeMC);
  resizeMC();

  let particles = [];
  let mouseX = -999, mouseY = -999;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Create subtle sparkles on move
    for (let i = 0; i < 10; i++) {
      particles.push({
        x: mouseX,
        y: mouseY,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 2.5 + 1.2,
        life: 1.0,
        decay: 0.01 + Math.random() * 0.03
      });
    }
  });

  function drawSparkles() {
    mctx.clearRect(0, 0, mW, mH);
    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(i, 1);
        i--;
        continue;
      }

      const alpha = p.life;
      mctx.save();
      mctx.translate(p.x, p.y);
      mctx.beginPath();

      // Draw simple star/cross shape
      mctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
      mctx.lineWidth = 0.8;
      const s = p.size * alpha;
      mctx.moveTo(-s, 0); mctx.lineTo(s, 0);
      mctx.moveTo(0, -s); mctx.lineTo(0, s);
      mctx.stroke();

      // Glow dot
      mctx.beginPath();
      mctx.arc(0, 0, p.size * 0.4 * alpha, 0, Math.PI * 2);
      mctx.fillStyle = `rgba(91, 140, 245, ${alpha * 0.6})`;
      mctx.fill();

      mctx.restore();
    }
    requestAnimationFrame(drawSparkles);
  }
  drawSparkles();
})();

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ===== HERO NETWORK BACKGROUND =====
(function () {
  const canvas = document.getElementById('dnaCanvas');
  const ctx = canvas.getContext('2d');
  const hero = document.getElementById('home');

  let particles = [];
  const particleCount = 340;
  const connectionDist = 260;
  const mouseRadius = 180;
  let mouse = { x: -1000, y: -1000 };

  function resize() {
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  hero.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  hero.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  class Particle {
    constructor() {
      this.init();
    }
    init() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r = Math.random() * 2 + 1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;

      // Displacement from mouse
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      this.dispX = 0;
      this.dispY = 0;

      if (dist < mouseRadius) {
        const force = (mouseRadius - dist) / mouseRadius;
        this.dispX = -(dx / dist) * force * 40;
        this.dispY = -(dy / dist) * force * 40;
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x + this.dispX, this.y + this.dispY, this.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(91, 140, 245, 0.4)';
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      p1.update();
      p1.draw();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = (p1.x + p1.dispX) - (p2.x + p2.dispX);
        const dy = (p1.y + p1.dispY) - (p2.y + p2.dispY);
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionDist) {
          ctx.beginPath();
          ctx.moveTo(p1.x + p1.dispX, p1.y + p1.dispY);
          ctx.lineTo(p2.x + p2.dispX, p2.y + p2.dispY);
          const opacity = 1 - (dist / connectionDist);
          ctx.strokeStyle = `rgba(91, 140, 245, ${opacity * 0.15})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
})();

// ===== SCROLL REVEAL =====
const reveals = document.querySelectorAll('.section, .skill-card, .project-card, .timeline-item, .contact-card');
reveals.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
    }
  });
}, { threshold: 0.1 });

reveals.forEach(el => observer.observe(el));

// ===== FORM SUBMIT =====
const form = document.getElementById('contact-form');
const success = document.getElementById('form-success');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Gönderiliyor...';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Gönder 🚀';
    btn.disabled = false;
    success.style.display = 'block';
    form.reset();
    setTimeout(() => success.style.display = 'none', 4000);
  }, 1200);
});

// ===== TIMELINE TOGGLE (DAHA FAZLA) =====
function toggleTL(btn) {
  const card = btn.closest('.timeline-card');
  const full = card.querySelector('.tl-full');
  const short = card.querySelector('.tl-short');
  const isOpen = full.style.display !== 'none';
  full.style.display = isOpen ? 'none' : 'block';
  short.style.display = isOpen ? '' : 'none';
  btn.textContent = isOpen ? 'Daha fazla göster ▾' : 'Daha az göster ▴';
}

// ===== BLOG TOGGLE (DEVAMINI OKU) =====
function toggleBlog(btn) {
  const card = btn.closest('.blog-card');
  const full = card.querySelector('.blog-full');
  const excerpt = card.querySelector('.blog-excerpt');
  const isOpen = full.style.display !== 'none';
  full.style.display = isOpen ? 'none' : 'block';
  excerpt.style.display = isOpen ? 'block' : 'none';
  btn.textContent = isOpen ? 'Devamını Oku ▾' : 'Daha Az Göster ▴';
}

// ===== SMOOTH ACTIVE NAV =====
const sections = document.querySelectorAll('section[id]');
const navAs = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.getAttribute('id');
  });
  navAs.forEach(a => {
    a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--text)' : '';
  });
});

// ===== FLOATING PARTICLES =====
function createParticle() {
  const p = document.createElement('div');
  p.style.cssText = `
    position:fixed; pointer-events:none; z-index:0;
    width:3px; height:3px; border-radius:50%;
    background:var(--accent); opacity:0;
    left:${Math.random() * 100}vw; top:${Math.random() * 100}vh;
    transition:opacity 1s;
  `;
  document.body.appendChild(p);
  setTimeout(() => p.style.opacity = String(Math.random() * 0.3 + 0.05), 100);
  setTimeout(() => { p.style.opacity = '0'; setTimeout(() => p.remove(), 1000); }, 4000);
}
setInterval(createParticle, 600);
