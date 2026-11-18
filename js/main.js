(function () {
  "use strict";

  var root = document.documentElement;
  var themeToggle = document.querySelector("[data-theme-toggle]");
  var themeMeta = document.getElementById("meta-theme-color");
  var favicon = document.getElementById("favicon");
  var systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  var themeColors = { light: "#ffffff", dark: "#111111" };
  var favicons = { light: "img/favicon-green.svg", dark: "img/favicon-orange.svg" };

  function storedTheme() {
    try {
      return localStorage.getItem("theme");
    } catch (error) {
      return null;
    }
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      themeToggle.setAttribute("aria-label", theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему");
    }
    if (themeMeta) {
      themeMeta.setAttribute("content", themeColors[theme]);
    }
    if (favicon) {
      favicon.setAttribute("href", favicons[theme]);
    }
  }

  applyTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light");

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem("theme", next);
      } catch (error) {
        return;
      }
    });
  }

  systemTheme.addEventListener("change", function (event) {
    if (!storedTheme()) {
      applyTheme(event.matches ? "dark" : "light");
    }
  });

  var header = document.querySelector(".header");
  var nav = document.querySelector(".nav");
  var burger = document.querySelector(".burger");
  var navLinks = document.querySelectorAll(".nav__link, .nav__cta");
  var desktopQuery = window.matchMedia("(min-width: 1024px)");

  function lockPage() {
    document.body.classList.add("page--locked");
  }

  function unlockPage() {
    if (!document.querySelector(".modal[open]") && !nav.classList.contains("nav--open")) {
      document.body.classList.remove("page--locked");
    }
  }

  function openNav() {
    if (!nav || !burger) {
      return;
    }
    nav.classList.add("nav--open");
    burger.classList.add("burger--active");
    burger.setAttribute("aria-expanded", "true");
    lockPage();
  }

  function closeNav() {
    if (!nav || !burger) {
      return;
    }
    nav.classList.remove("nav--open");
    burger.classList.remove("burger--active");
    burger.setAttribute("aria-expanded", "false");
    unlockPage();
  }

  if (burger && nav) {
    burger.addEventListener("click", function () {
      if (nav.classList.contains("nav--open")) {
        closeNav();
      } else {
        openNav();
      }
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("nav--open")) {
        return;
      }
      if (!event.target.closest(".header")) {
        closeNav();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("nav--open")) {
        closeNav();
      }
    });

    desktopQuery.addEventListener("change", function (event) {
      if (event.matches) {
        closeNav();
      }
    });
  }

  function updateHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle("header--scrolled", window.scrollY > 8);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  var spyLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
  var spySections = spyLinks
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && spySections.length) {
    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          spyLinks.forEach(function (link) {
            link.classList.toggle("nav__link--active", link.getAttribute("href") === "#" + entry.target.id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    spySections.forEach(function (section) {
      spyObserver.observe(section);
    });
  }

  function formatPhone(value) {
    var digits = value.replace(/\D/g, "");
    if (!digits) {
      return "";
    }
    if (digits.charAt(0) === "8" || digits.charAt(0) === "7") {
      digits = digits.slice(1);
    }
    digits = digits.slice(0, 10);
    var result = "+7";
    if (digits.length) {
      result += " (" + digits.slice(0, 3);
    }
    if (digits.length >= 3) {
      result += ")";
    }
    if (digits.length > 3) {
      result += " " + digits.slice(3, 6);
    }
    if (digits.length > 6) {
      result += "-" + digits.slice(6, 8);
    }
    if (digits.length > 8) {
      result += "-" + digits.slice(8, 10);
    }
    return result;
  }

  document.querySelectorAll('input[type="tel"]').forEach(function (input) {
    input.addEventListener("input", function () {
      input.value = formatPhone(input.value);
    });
    input.addEventListener("focus", function () {
      if (!input.value) {
        input.value = "+7 (";
      }
    });
    input.addEventListener("blur", function () {
      if (input.value.replace(/\D/g, "").length <= 1) {
        input.value = "";
      }
    });
  });

  function validateField(input) {
    var field = input.closest(".field");
    var valid;

    if (input.type === "checkbox") {
      valid = input.checked;
    } else if (input.type === "tel") {
      valid = input.value.replace(/\D/g, "").length === 11;
    } else if (input.hasAttribute("minlength")) {
      valid = input.value.trim().length >= Number(input.getAttribute("minlength"));
    } else {
      valid = input.value.trim().length > 0;
    }

    if (field) {
      field.classList.toggle("field--invalid", !valid);
    }
    input.setAttribute("aria-invalid", valid ? "false" : "true");
    return valid;
  }

  function clearInvalid(event) {
    var field = event.target.closest(".field");
    if (field) {
      field.classList.remove("field--invalid");
      event.target.removeAttribute("aria-invalid");
    }
  }

  function resetForm(form) {
    form.reset();
    form.classList.remove("form--sent");
    form.querySelectorAll(".field--invalid").forEach(function (field) {
      field.classList.remove("field--invalid");
    });
    form.querySelectorAll("[aria-invalid]").forEach(function (input) {
      input.removeAttribute("aria-invalid");
    });
  }

  document.querySelectorAll("[data-form]").forEach(function (form) {
    var submit = form.querySelector('[type="submit"]');

    form.addEventListener("input", clearInvalid);
    form.addEventListener("change", clearInvalid);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var fields = Array.prototype.slice.call(form.querySelectorAll("[required]"));
      var valid = true;

      fields.forEach(function (input) {
        if (!validateField(input)) {
          valid = false;
        }
      });

      if (!valid) {
        var firstInvalid = form.querySelector(".field--invalid .field__input, .field--invalid .field__checkbox");
        if (firstInvalid) {
          firstInvalid.focus();
        }
        return;
      }

      if (submit) {
        submit.disabled = true;
        submit.setAttribute("aria-busy", "true");
      }

      window.setTimeout(function () {
        if (submit) {
          submit.disabled = false;
          submit.removeAttribute("aria-busy");
        }
        form.classList.add("form--sent");
      }, 500);
    });
  });

  document.querySelectorAll("[data-form-reset]").forEach(function (button) {
    button.addEventListener("click", function () {
      var form = button.closest("form");
      if (!form) {
        return;
      }
      resetForm(form);
      var firstInput = form.querySelector(".field__input");
      if (firstInput) {
        firstInput.focus();
      }
    });
  });

  var modal = document.getElementById("request-modal");

  if (modal) {
    var modalDialog = modal.querySelector(".modal__dialog");
    var modalForm = modal.querySelector("[data-form]");
    var lastFocused = null;

    function openModal() {
      if (typeof modal.showModal !== "function") {
        return;
      }
      closeNav();
      lastFocused = document.activeElement;
      modal.showModal();
      lockPage();
      var firstInput = modal.querySelector(".field__input");
      if (firstInput) {
        window.setTimeout(function () {
          firstInput.focus();
        }, 50);
      }
    }

    document.querySelectorAll("[data-modal-open]").forEach(function (button) {
      button.addEventListener("click", openModal);
    });

    document.querySelectorAll("[data-modal-close]").forEach(function (button) {
      button.addEventListener("click", function () {
        modal.close();
      });
    });

    modal.addEventListener("click", function (event) {
      if (modalDialog && !modalDialog.contains(event.target)) {
        modal.close();
      }
    });

    var modalObserver = new MutationObserver(function () {
      if (modal.open) {
        return;
      }
      if (modalForm && modalForm.classList.contains("form--sent")) {
        resetForm(modalForm);
      }
      unlockPage();
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    });

    modalObserver.observe(modal, { attributes: true, attributeFilter: ["open"] });
  }

  document.querySelectorAll("[data-year]").forEach(function (element) {
    element.textContent = String(new Date().getFullYear());
  });

  var cookie = document.querySelector("[data-cookie]");
  var cookieAccept = document.querySelector("[data-cookie-accept]");
  var cookieNecessary = document.querySelector("[data-cookie-necessary]");
  var cookieClose = document.querySelector("[data-cookie-close]");

  function storedConsent() {
    try {
      return localStorage.getItem("cookie-consent");
    } catch (error) {
      return null;
    }
  }

  function saveConsent(value) {
    try {
      localStorage.setItem("cookie-consent", value);
    } catch (error) {
      return;
    }
  }

  function closeCookie(value) {
    if (!cookie) {
      return;
    }
    cookie.hidden = true;
    saveConsent(value);
  }

  if (cookie) {
    if (!storedConsent()) {
      cookie.hidden = false;
    }

    if (cookieAccept) {
      cookieAccept.addEventListener("click", function () {
        closeCookie("accepted");
      });
    }

    if (cookieNecessary) {
      cookieNecessary.addEventListener("click", function () {
        closeCookie("necessary");
      });
    }

    if (cookieClose) {
      cookieClose.addEventListener("click", function () {
        closeCookie("dismissed");
      });
    }
  }
})();
