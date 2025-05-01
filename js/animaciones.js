// js/animations.js

document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.animated');
  
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
  
    animatedElements.forEach(el => observer.observe(el));
  });
  