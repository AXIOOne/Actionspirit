document.addEventListener("DOMContentLoaded", () => {
  const current = document.body.dataset.page;
  if (!current) return;
  document.querySelectorAll(".nav-links a").forEach((link) => {
    if (link.dataset.page === current) {
      link.classList.add("active");
    }
  });
});
