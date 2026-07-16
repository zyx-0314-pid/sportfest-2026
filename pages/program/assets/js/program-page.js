const navigationToggle = document.querySelector(".navigationToggle");
const primaryNavigation = document.querySelector(".primaryNavigation");

if (!navigationToggle || !primaryNavigation) {
  throw new Error("Required mobile navigation elements are missing.");
}

navigationToggle.addEventListener("click", () => {
  const navigationIsOpen = primaryNavigation.classList.toggle("isOpen");
  navigationToggle.setAttribute("aria-expanded", String(navigationIsOpen));
});

primaryNavigation.addEventListener("click", (event) => {
  if (!(event.target instanceof HTMLAnchorElement)) {
    return;
  }

  primaryNavigation.classList.remove("isOpen");
  navigationToggle.setAttribute("aria-expanded", "false");
});
