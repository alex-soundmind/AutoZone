const categories = [
  "Top-Rated ⭐️",
   "Sedans",
   "Roadsters",
   "Universal",
   "Electric vehicles",
   "SUVs",
  ];

let carsCache = null;
let isInitialized = false;

console.log("Скрипт загружен");

async function fetchcars() {
  if (carsCache) return carsCache;

  console.log("Загрузка автомобилей...");
  try {
    const response = await fetch("/all_cars.json");
    if (!response.ok) throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
    const text = await response.text(); 
    await new Promise(resolve => setTimeout(resolve, 100));
    const data = JSON.parse(text);
    carsCache = data.cars;
    console.log("Автомобили успешно загружены:", carsCache.length);
    return carsCache;
  } catch (error) {
    console.error("Ошибка при загрузке данных автомобилей:", error);
    if (error instanceof SyntaxError) {
      console.error("Ошибка парсинга JSON. Проверьте файл all_cars.json на наличие ошибок в синтаксисе.");
      console.error("Полученные данные:", text); 
    }
    throw error;
  }
}

async function initializePage() {
  if (isInitialized) {
    console.log("Страница уже инициализирована");
    return;
  }

  console.log("Инициализация страницы");
  const pageType = document.body.className;
  console.log("Тип страницы:", pageType);

  try {
    switch (pageType) {
      case "cars-page":
        await initializecarsPage();
        break;
      default:
        console.log("Неизвестный тип страницы");
    }

    setupScrollAnimations();
    console.log("Инициализация страницы завершена");
    isInitialized = true;
  } catch (error) {
    console.error("Ошибка во время инициализации страницы:", error);
    displayErrorMessage("Произошла ошибка при загрузке страницы. Пожалуйста, обновите её.");
  }
}

function setupFilterDropdown() {
  const filterSelect = document.getElementById("filter-select");
  if (filterSelect) {
    filterSelect.addEventListener("change", function () {
      const selectedCategory = this.value;
      if (selectedCategory) {
        const categorySection = document.getElementById(
          `section-${getCategoryId(selectedCategory)}`
        );
        if (categorySection) {
          categorySection.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  } else {
    console.error("Элемент выбора фильтра не найден");
  }
}

function setupCarousels() {
  console.log("Настройка каруселей");
  categories.forEach((category) => {
    const categoryId = getCategoryId(category);
    const container = document.querySelector(`#${categoryId}`);
    const prevBtn = document.querySelector(`#prev-${categoryId}`);
    const nextBtn = document.querySelector(`#next-${categoryId}`);

    if (container && prevBtn && nextBtn) {
      console.log(`Настройка карусели для категории: ${category}`);

      const gap = 24;

      function getScrollAmount() {
        const cars = container.querySelectorAll(".car");
        if (cars.length > 0) {
          const car = cars[0];
          return car.offsetWidth + gap;
        }
        return 0;
      }

      function scrollCarousel(direction) {
        const scrollAmount = getScrollAmount();
        const currentScroll = container.scrollLeft;
        const maxScroll = container.scrollWidth - container.clientWidth;

        let newScrollPosition;

        if (direction === "next") {
          newScrollPosition = Math.min(currentScroll + scrollAmount, maxScroll);
          if (newScrollPosition === maxScroll || newScrollPosition === currentScroll) {
            newScrollPosition = 0;
          }
        } else {
          newScrollPosition = Math.max(currentScroll - scrollAmount, 0);
          if (newScrollPosition === 0 && currentScroll === 0) {
            newScrollPosition = maxScroll;
          }
        }

        container.scrollTo({
          left: newScrollPosition,
          behavior: "smooth",
        });
      }

      nextBtn.addEventListener("click", () => {
        console.log(`Нажата кнопка "Далее" для категории ${category}`);
        scrollCarousel("next");
      });

      prevBtn.addEventListener("click", () => {
        console.log(`Нажата кнопка "Назад" для категории ${category}`);
        scrollCarousel("prev");
      });

      container.addEventListener("scroll", (event) => {
        event.preventDefault();
        const cars = container.querySelectorAll(".car");
        cars.forEach((car) => {
          car.classList.remove("animate-on-scroll");
          car.classList.remove("animate");
        });
      });

      window.addEventListener("resize", () => {
        console.log(`Пересчёт значения прокрутки для категории ${category}`);
      });
    } else {
      console.error(`Элементы карусели не найдены для категории: ${category}`);
      if (!container) console.error(`Контейнер не найден для ${categoryId}`);
      if (!prevBtn) console.error(`Кнопка "Назад" не найдена для ${categoryId}`);
      if (!nextBtn) console.error(`Кнопка "Далее" не найдена для ${categoryId}`);
    }
  });
}

async function initializecarsPage() {
  console.log("Инициализация страницы автомобилей");
  const categoriesContainer = document.getElementById("categories");
  if (!categoriesContainer) {
    console.error("Контейнер категорий не найден");
    return;
  }

  try {
    const cars = await fetchcars();
    if (cars.length === 0) {
      throw new Error("Автомобили не были загружены");
    }

    const categorizedcars = categorizecars(cars);
    console.log("Классифицированные автомобили:", categorizedcars);

    categories.forEach((category) => {
      const categoryId = getCategoryId(category);
      const carsInCategory = categorizedcars[category];

      if (carsInCategory && carsInCategory.length > 0) {
        console.log(`Отображение категории: ${category}`);
        const categorySection = createCategorySection(category, categoryId);
        categoriesContainer.appendChild(categorySection);
        rendercars(carsInCategory, `#${categoryId}`);
      } else {
        console.log(`Нет автомобилей в категории: ${category}`);
      }
    });

    setupFilterDropdown();
    setupCarousels();

  } catch (error) {
    console.error("Ошибка при инициализации страницы автомобилей:", error);
    categoriesContainer.innerHTML = '<p class="error-message">Произошла ошибка при загрузке автомобилей. Пожалуйста, обновите страницу.</p>';
  }
}

function categorizecars(cars) {
  console.log("Классификация автомобилей");
  const categorizedcars = {};
  categories.forEach((category) => {
    categorizedcars[category] = [];
  });

  cars.forEach((car) => {
    if (car.star_rating >= 4.9 && car.rating_count >= 1000) {
      categorizedcars["Top-Rated ⭐️"].push(car);
    }

    let matchedCategory = findMatchingCategory(car.category);
    categorizedcars[matchedCategory].push(car);
  });

  return categorizedcars;
}

function findMatchingCategory(carCategory) {
  const normalizedcarCategory = carCategory
    .toLowerCase()
    .replace(/[^\w\s]/gi, "");

  return (
    categories.find((category) => {
      const normalizedCategory = category
        .toLowerCase()
        .replace(/[^\w\s]/gi, "");
      return (
        normalizedCategory.includes(normalizedcarCategory) ||
        normalizedcarCategory.includes(normalizedCategory)
      );
    })
  );
}

function rendercars(carsToRender, container) {
  console.log(`Отображение автомобилей для контейнера: ${container}`);
  const carsWrapper = document.querySelector(container);
  if (!carsWrapper) {
    console.error(`Контейнер ${container} не найден`);
    return;
  }

  carsWrapper.innerHTML = carsToRender
    .map((car, index) => createcarHTML(car, index))
    .join("");

  console.log(`Отображено ${carsToRender.length} автомобилей`);
}

function createcarHTML(car, index) {
  return `
    <div class="car animate-on-scroll" data-key="${car.title}" style="animation-delay: ${index * 0.05}s;">
      <figure class="car__img--wrapper">
        <img class="car__img" src="${car.cover_img || "/assets/no_img_car_cover.svg"}" alt="${car.title}" loading="lazy" onerror="this.onerror=null; this.src='/assets/no_img_car_cover.svg';">
      </figure>
      <div class="car__title">${car.title}</div>
      <div class="car__availability">${car.availability}</div>
      <div class="car__rating">${
        car.star_rating
          ? `${car.star_rating.toFixed(1)} ${renderStarRating(car.star_rating)} <br> (${car.rating_count.toLocaleString()})`
          : "Нет оценок"
      }</div>
      <a href="car-detail.html?title=${car.title}" target="_blank" class="btn">Детали</a>
    </div>
  `;
}

function renderStarRating(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1;
  const emptyStars = 5 - fullStars - 1;
  const starsHtml = [];
  for (let i = 0; i < fullStars; i++) {
    starsHtml.push('<span class="full-star">⭐️</span>');
  }
  if (halfStar > 0) {
    starsHtml.push('<span class="half-star" style="clip-path: inset(0 ' + (100 - halfStar * 100) + '% 0 0)">⭐️</span>');
  }
  for (let i = 0; i < emptyStars; i++) {
    starsHtml.push('<span class="empty-star">☆</span>');
  }
  return `<span class="star-rating">${starsHtml.join('')}</span>`;
}

function createGoogleAffiliateLink(car) {
  const searchTerm = car.title || `${car.title} ${car.author}`;
  return `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
}

async function initializeHomePage() {
  console.log("Инициализация главной страницы");
  const bestSellersContainer = document.querySelector("#best-sellers");
  if (!bestSellersContainer) {
    console.error("Контейнер для популярных автомобилей не найден");
    return;
  }
  
  try {
    const cars = await fetchcars();
    const topRatedcars = cars
      .filter((car) => car.star_rating >= 4.5 && car.rating_count >= 1000)
      .slice(0, 16);
    rendercars(topRatedcars, "#best-sellers");
    console.log("Главная страница инициализирована");
  } catch (error) {
    console.error("Ошибка при инициализации главной страницы:", error);
  }
}

function initializeAboutPage() {
  console.log("Инициализация страницы 'О нас'");
  const aboutContent = document.querySelector(".about-us");
  if (aboutContent) {
    aboutContent.classList.add("animate");
  } else {
    console.error("Контент страницы 'О нас' не найден");
  }
}

function initializeContactPage() {
  console.log("Инициализация страницы контактов");
  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    contactForm.classList.add("animate");
  } else {
    console.error("Форма контактов не найдена");
  }
}

function setupScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    }
  );

  document.querySelectorAll(".animate-on-scroll").forEach((element) => {observer.observe(element);
  });
}

function getCategoryId(category) {
  return category
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, ""); 
}

function createCategorySection(category, categoryId) {
  const section = document.createElement("div");
  section.className = "carousel-section";
  section.id = `section-${categoryId}`;
  section.innerHTML = `
    <h2>${category}</h2>
    <div class="carousel animate-on-scroll">
      <button class="carousel-button prev" id="prev-${categoryId}">&#10094;</button>
      <div class="carousel-container" id="${categoryId}"></div>
      <button class="carousel-button next" id="next-${categoryId}">&#10095;</button>
    </div>
  `;
  return section;
}

function displayErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  document.body.insertBefore(errorDiv, document.body.firstChild);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage);
} else {
  initializePage();
}

console.log("Инициализация скрипта завершена");
