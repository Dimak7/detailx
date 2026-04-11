const services = [
  {
    title: "Interior Detailing",
    icon: "IN",
    description: "Deep vacuuming, panels, cupholders, leather care, stain attention, and a clean cabin reset.",
  },
  {
    title: "Exterior Detailing",
    icon: "EX",
    description: "Foam wash, wheel faces, safe hand contact, decontamination options, tire finish, and gloss.",
  },
  {
    title: "Ceramic Coating",
    icon: "CC",
    description: "Durable protection for gloss, easier maintenance, and a slick finish after proper prep.",
  },
  {
    title: "Window Tint",
    icon: "WT",
    description: "A refined tint request flow for privacy, heat reduction, and a cleaner vehicle profile.",
  },
  {
    title: "Polishing",
    icon: "PO",
    description: "Gloss enhancement for dull finishes, light wash marks, and a more reflective surface.",
  },
  {
    title: "Paint Correction",
    icon: "PC",
    description: "Targeted correction for swirls, haze, oxidation, and finish clarity before protection.",
  },
];

const serviceGrid = document.querySelector("#service-grid");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector("#nav-menu");
const calendarGrid = document.querySelector("#calendar-grid");
const calendarLabel = document.querySelector("#calendar-label");
const bookingDate = document.querySelector("#booking-date");
const bookingTime = document.querySelector("#booking-time");
const bookingForm = document.querySelector("#booking-form");
const formStatus = document.querySelector("#form-status");

let calendarCursor = new Date();
calendarCursor.setDate(1);

services.forEach((service) => {
  const article = document.createElement("article");
  article.className = "service-card";
  article.innerHTML = `
    <div>
      <span class="service-icon">${service.icon}</span>
      <h3>${service.title}</h3>
      <p>${service.description}</p>
    </div>
  `;
  serviceGrid.appendChild(article);
});

navToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("menu-open", isOpen);
});

navMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  });
});

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function renderCalendar() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const month = calendarCursor.getMonth();
  const year = calendarCursor.getFullYear();
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  calendarLabel.textContent = calendarCursor.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  calendarGrid.innerHTML = "";

  for (let i = 0; i < firstDay; i += 1) {
    const blank = document.createElement("span");
    blank.className = "blank";
    calendarGrid.appendChild(blank);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(year, month, day);
    const button = document.createElement("button");
    const isoDate = formatDate(date);

    button.type = "button";
    button.textContent = day;
    button.dataset.date = isoDate;
    button.disabled = date < today;
    button.setAttribute(
      "aria-label",
      `Choose ${date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })}`
    );

    if (bookingDate.value === isoDate) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      bookingDate.value = isoDate;
      calendarGrid.querySelectorAll("button").forEach((item) => item.classList.remove("selected"));
      button.classList.add("selected");
    });

    calendarGrid.appendChild(button);
  }
}

document.querySelector("[data-calendar-prev]").addEventListener("click", () => {
  const today = new Date();
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  if (calendarCursor > currentMonthStart) {
    calendarCursor.setMonth(calendarCursor.getMonth() - 1);
    renderCalendar();
  }
});

document.querySelector("[data-calendar-next]").addEventListener("click", () => {
  calendarCursor.setMonth(calendarCursor.getMonth() + 1);
  renderCalendar();
});

document.querySelectorAll("[data-time]").forEach((button) => {
  button.addEventListener("click", () => {
    bookingTime.value = button.dataset.time;
    document.querySelectorAll("[data-time]").forEach((slot) => slot.classList.remove("selected"));
    button.classList.add("selected");
  });
});

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!bookingDate.value || !bookingTime.value) {
    formStatus.textContent = "Choose a preferred date and time to request your booking.";
    return;
  }

  const formData = new FormData(bookingForm);
  const service = formData.get("service");
  const date = formData.get("date");
  const time = formData.get("time");

  formStatus.textContent = `Request received for ${service} on ${date} at ${time}. Connect this form to your booking backend when ready.`;
  bookingForm.reset();
  bookingDate.value = "";
  bookingTime.value = "";
  document.querySelectorAll(".selected").forEach((item) => item.classList.remove("selected"));
  renderCalendar();
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".section-reveal").forEach((section) => revealObserver.observe(section));

renderCalendar();
