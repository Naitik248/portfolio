const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const year = document.querySelector("#year");
const canvas = document.querySelector("#neuralCanvas");
const ctx = canvas.getContext("2d");

year.textContent = new Date().getFullYear();

navToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));

let points = [];
let animationFrame;

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * scale);
  canvas.height = Math.floor(rect.height * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  const count = Math.max(34, Math.floor((rect.width * rect.height) / 13500));
  points = Array.from({ length: count }, () => ({
    x: Math.random() * rect.width,
    y: Math.random() * rect.height,
    vx: (Math.random() - 0.5) * 0.24,
    vy: (Math.random() - 0.5) * 0.24,
    r: Math.random() * 1.8 + 1.1,
  }));
}

function drawNetwork() {
  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);

  const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
  gradient.addColorStop(0, "rgba(154, 107, 56, 0.38)");
  gradient.addColorStop(1, "rgba(36, 35, 33, 0.18)");

  points.forEach((point, index) => {
    point.x += point.vx;
    point.y += point.vy;

    if (point.x < 0 || point.x > rect.width) point.vx *= -1;
    if (point.y < 0 || point.y > rect.height) point.vy *= -1;

    for (let otherIndex = index + 1; otherIndex < points.length; otherIndex += 1) {
      const other = points[otherIndex];
      const distance = Math.hypot(point.x - other.x, point.y - other.y);

      if (distance < 155) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(154, 107, 56, ${0.18 - distance / 1000})`;
        ctx.lineWidth = 1;
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    }
  });

  points.forEach((point) => {
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
    ctx.fill();
  });

  animationFrame = requestAnimationFrame(drawNetwork);
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function startCanvas() {
  cancelAnimationFrame(animationFrame);
  resizeCanvas();
  drawNetwork();
}

if (!reduceMotion.matches) {
  startCanvas();
  window.addEventListener("resize", startCanvas);
} else {
  resizeCanvas();
  drawNetwork();
  cancelAnimationFrame(animationFrame);
}
