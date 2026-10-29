/* One universal exit. The ad server may override the inline clickTag. */
(function () {
  "use strict";
  var exit = document.querySelector(".ad-click");
  function openExit() {
    // Read at click time: some ad servers inject clickTag after this script loads.
    var destination = window.clickTag || clickTag;
    if (!/^https:\/\//i.test(destination)) return;
    window.open(destination, "_blank", "noopener,noreferrer");
  }
  exit.addEventListener("click", function (event) {
    event.preventDefault();
    openExit();
  });
  exit.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openExit();
    }
  });

  // The final frame is the HTML fallback, so a failed animation never leaves a blank ad.
  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !Element.prototype.animate
  )
    return;
  function motion(selector, frames, options) {
    var element = document.querySelector(selector);
    if (element)
      element.animate(
        frames,
        Object.assign({ fill: "backwards", easing: "ease-out" }, options),
      );
  }
  motion(
    ".brand",
    [
      { opacity: 0, transform: "translateY(-8px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    { duration: 450, delay: 100 },
  );
  motion(
    "h1",
    [
      { opacity: 0, transform: "translateY(12px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    { duration: 550, delay: 420 },
  );
  motion(
    ".burger",
    [
      { opacity: 0, transform: "translateX(30px) scale(.85)" },
      { opacity: 1, transform: "translateX(0) scale(1)" },
    ],
    { duration: 750, delay: 650 },
  );
  motion(".copy p", [{ opacity: 0 }, { opacity: 1 }], {
    duration: 400,
    delay: 1050,
  });
  motion(
    ".cta",
    [
      { opacity: 0, transform: "translateY(8px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    { duration: 450, delay: 1450 },
  );
})();
