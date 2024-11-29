
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});

function openMenu() {
  document.body.classList.add("menu--open");
}

function closeMenu() {
  document.body.classList.remove("menu--open");
}

document.addEventListener("DOMContentLoaded", function () {
  const currentLocation = location.href;
  const navLinks = document.querySelectorAll(".nav__link");
  navLinks.forEach(link => {
    if (link.href === currentLocation) {
      link.classList.add("active");
    }
  });

  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const popup = document.getElementById("popup");
      if (popup) {
        popup.style.display = "block";
        setTimeout(function () {
          popup.style.display = "none";
          contactForm.reset();
        }, 3000);
      }
    });
  }

  const carsWrapper = document.querySelector("#best-sellers");
  if (carsWrapper) {
    carsWrapper.addEventListener("click", function (event) {
      const carLink = event.target.closest("a.btn");
      if (carLink) {
        event.preventDefault();
        const href = carLink.getAttribute("href");
        console.log("Navigating to:", href);
        window.location.href = href;
      }
    });
    console.log("car details link handler initialized");
  }
});