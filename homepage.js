const navToggle = document.querySelector('.menu-toggle');
const mobileNav = document.getElementById('mobile-nav');

function setMenu(open) {
  mobileNav.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  navToggle.textContent = open ? '×' : '☰';
}

navToggle.addEventListener('click', () => setMenu(!mobileNav.classList.contains('open')));
mobileNav.addEventListener('click', event => {
  if (event.target.closest('a')) {
    navToggle.focus({ preventScroll: true });
    setMenu(false);
  }
});

const filters = [...document.querySelectorAll('[data-filter]')];

function showPackages(group) {
  for (const filter of filters) {
    const selected = filter.dataset.filter === group;
    filter.classList.toggle('active', selected);
    filter.setAttribute('aria-pressed', String(selected));
    document.getElementById(filter.getAttribute('aria-controls')).hidden = !selected;
  }
}

showPackages('event');
document.querySelector('.filter-group').hidden = false;

for (const filter of filters) {
  filter.addEventListener('click', () => showPackages(filter.dataset.filter));
}
for (const link of document.querySelectorAll('[data-package-group]')) {
  link.addEventListener('click', () => showPackages(link.dataset.packageGroup));
}

const inquiry = document.getElementById('inquire');
const inquiryTitle = document.getElementById('inquiry-title');
const inquiryEmail = document.getElementById('inquiry-email');

if (typeof inquiry.showModal === 'function') {
  for (const link of document.querySelectorAll('[data-inquire]')) {
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();

      const packageName = link.dataset.package;
      const occasion = link.dataset.occasion || 'an event';
      const inquiryTopic = packageName ? `the ${packageName} package` : occasion;
      inquiryTitle.textContent = packageName ? `Ask about ${packageName}.` : 'Plan your celebration.';
      const subject = encodeURIComponent(packageName ? `D’Luxe inquiry: ${packageName}` : 'D’Luxe event inquiry');
      const body = encodeURIComponent(`Hello, I’d like to ask about ${inquiryTopic}.\n\nPreferred date:\nEstimated guest count:\nAdditional details:\n`);
      inquiryEmail.href = `mailto:dluxelounge717@gmail.com?subject=${subject}&body=${body}`;
      inquiry.showModal();
    });
  }

  inquiry.addEventListener('click', event => {
    if (event.target === inquiry) {
      const rect = inquiry.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right ||
          event.clientY < rect.top || event.clientY > rect.bottom) inquiry.close();
    }
  });
}

document.getElementById('year').textContent = new Date().getFullYear();

const hero = document.querySelector('.hero');
const slides = [...hero.querySelectorAll('.hero-slide')];
const sceneButtons = [...hero.querySelectorAll('.slide-select')];
const playButton = hero.querySelector('.slide-pause');
const musicCaption = hero.querySelector('.concert-credit');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let playing = !reducedMotion.matches;
let activeSlide = 0;
let timer;
let selection = 0;
let heroVisible = true;

async function showScene(index) {
  const request = ++selection;
  try {
    await slides[index].decode();
  } catch {
    return;
  }
  if (request !== selection) return;

  activeSlide = index;
  slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
  sceneButtons.forEach((button, i) => {
    button.classList.toggle('is-active', i === index);
    button.setAttribute('aria-pressed', String(i === index));
  });
  musicCaption.hidden = index !== 1;
}

function scheduleRotation() {
  clearTimeout(timer);
  if (!playing || document.hidden || !heroVisible) return;

  timer = setTimeout(async () => {
    await showScene((activeSlide + 1) % slides.length);
    scheduleRotation();
  }, 8000);
}

function setRotation(enabled) {
  playing = enabled;
  if (!playing) selection++;
  playButton.textContent = playing ? 'Pause' : 'Play';
  playButton.setAttribute('aria-label', playing ? 'Pause rotating images' : 'Play rotating images');
  scheduleRotation();
}

sceneButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    setRotation(false);
    showScene(index);
  });
});

playButton.addEventListener('click', () => setRotation(!playing));
hero.addEventListener('focusin', event => {
  if (event.target !== playButton) setRotation(false);
});
hero.querySelector('.hero-carousel-controls').addEventListener('pointerenter', () => clearTimeout(timer));
hero.querySelector('.hero-carousel-controls').addEventListener('pointerleave', scheduleRotation);
document.addEventListener('visibilitychange', scheduleRotation);
reducedMotion.addEventListener('change', event => {
  if (event.matches) setRotation(false);
});

if ('IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    scheduleRotation();
  }, { threshold: 0.15 }).observe(hero);
}

hero.querySelector('.hero-carousel-controls').hidden = false;
setRotation(playing);
