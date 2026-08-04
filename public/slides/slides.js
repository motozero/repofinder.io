function showSlide(number) {
        document.querySelectorAll(".slide").forEach((slide) => slide.classList.toggle("active", slide.dataset.slide === String(number)));
        document.querySelectorAll("[data-go]").forEach((button) => button.setAttribute("aria-current", String(button.dataset.go === String(number))));
      }
      document.querySelectorAll("[data-go]").forEach((button) => button.addEventListener("click", () => showSlide(button.dataset.go)));
      window.showSlide = showSlide;
