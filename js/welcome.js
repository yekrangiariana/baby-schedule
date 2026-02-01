// Welcome/Onboarding System for Baby Schedule App
(function () {
  const WELCOME_COMPLETED_KEY = "babylog.welcome.completed.v1";
  const WELCOME_SETTINGS_KEY = "babylog.welcome.settings.v1";

  // Check if this script should run
  if (!document.getElementById("welcomeOverlay")) {
    console.warn("Welcome overlay not found in DOM");
    return;
  }

  const welcomeOverlay = document.getElementById("welcomeOverlay");
  const slides = Array.from(document.querySelectorAll(".welcome-slide"));
  const progressDots = Array.from(
    document.querySelectorAll(".welcome-progress-dot"),
  );
  const skipBtn = document.querySelector(".welcome-skip-btn");
  const backBtn = document.querySelector(".welcome-back-btn");
  const nextBtn = document.querySelector(".welcome-next-btn");

  let currentSlide = 0;
  let welcomeSettings = {
    language: "en",
    activities: [],
    theme: "blossom",
    font: "roboto",
    startTutorial: false,
  };

  // Check if welcome has been completed
  function hasCompletedWelcome() {
    return localStorage.getItem(WELCOME_COMPLETED_KEY) === "true";
  }

  // Mark welcome as completed
  function markWelcomeCompleted() {
    localStorage.setItem(WELCOME_COMPLETED_KEY, "true");
  }

  // Save welcome settings temporarily
  function saveWelcomeSettings() {
    localStorage.setItem(WELCOME_SETTINGS_KEY, JSON.stringify(welcomeSettings));
  }

  // Get welcome settings
  function getWelcomeSettings() {
    try {
      const saved = localStorage.getItem(WELCOME_SETTINGS_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  // Show/hide overlay
  function showWelcome() {
    welcomeOverlay.classList.remove("hidden");
    goToSlide(0);
  }

  function hideWelcome() {
    welcomeOverlay.classList.add("hidden");
    markWelcomeCompleted();

    // Trigger event for main app to apply settings
    window.dispatchEvent(
      new CustomEvent("welcomeCompleted", {
        detail: welcomeSettings,
      }),
    );
  }

  // Update next button text based on current slide
  function updateNextButtonText() {
    if (!nextBtn) return;

    if (currentSlide === slides.length - 1) {
      nextBtn.textContent =
        getTranslation("welcomeGetStarted") || "🚀 Get Started!";
    } else {
      nextBtn.textContent = getTranslation("next") || "Next →";
    }
  }

  // Navigation
  function goToSlide(index) {
    if (index < 0 || index >= slides.length) return;

    // Update slides
    slides.forEach((slide, i) => {
      slide.classList.remove("active", "previous");
      if (i === index) {
        slide.classList.add("active");
      } else if (i < index) {
        slide.classList.add("previous");
      }
    });

    // Update progress dots
    progressDots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });

    currentSlide = index;

    // Update navigation buttons
    backBtn.disabled = currentSlide === 0;

    // Update next button text
    updateNextButtonText();

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(10);
  }

  function nextSlide() {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
    } else {
      completeWelcome();
    }
  }

  function previousSlide() {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  }

  function skipWelcome() {
    // Set defaults for skipped welcome
    welcomeSettings = {
      language: "en",
      activities: ["feed", "pee", "poop"], // Default activities
      theme: "blossom",
      font: "roboto",
      startTutorial: false,
    };
    completeWelcome();
  }

  function completeWelcome() {
    saveWelcomeSettings();

    // Save selected activities to the ACTION_TYPES_KEY that app.js reads
    if (welcomeSettings.activities && welcomeSettings.activities.length > 0) {
      const allAvailableActivities = [
        { id: "feed", name: "Feed", emoji: "🍼", color: "#a8d5ff" },
        { id: "pee", name: "Pee", emoji: "💧", color: "#ffe4a8" },
        { id: "poop", name: "Poop", emoji: "💩", color: "#ffb3ba" },
        { id: "sleep", name: "Sleep", emoji: "😴", color: "#c7b8ea" },
        { id: "bath", name: "Bath", emoji: "🛁", color: "#a8e6ff" },
        { id: "play", name: "Play", emoji: "🎮", color: "#ffcba8" },
        { id: "walk", name: "Walk", emoji: "🚶", color: "#b8ffb8" },
        { id: "medicine", name: "Medicine", emoji: "💊", color: "#ffb8e6" },
      ];

      const selectedTypes = allAvailableActivities.filter((type) =>
        welcomeSettings.activities.includes(type.id),
      );

      localStorage.setItem(
        "babylog.actiontypes.v1",
        JSON.stringify(selectedTypes),
      );
    }

    // Save language and other settings
    const settings = {
      language: welcomeSettings.language || "en",
      theme: welcomeSettings.theme || "blossom",
      font: welcomeSettings.font || "roboto",
    };
    localStorage.setItem("babylog.settings.v1", JSON.stringify(settings));

    // If tutorial was requested, save a flag for after reload
    if (welcomeSettings.startTutorial) {
      localStorage.setItem("babylog.startTutorialAfterWelcome", "true");
    }

    markWelcomeCompleted();

    // Reload page to apply all settings properly
    window.location.reload();
  }

  // Helper function to get translation (if available)
  function getTranslation(key) {
    if (typeof window.t === "function") {
      return window.t(key);
    }
    return null;
  }

  // Slide-specific initialization
  function initSlide1_Language() {
    const languageOptions = document.querySelectorAll(
      ".welcome-language-option",
    );

    languageOptions.forEach((option) => {
      option.addEventListener("click", function () {
        languageOptions.forEach((opt) => opt.classList.remove("selected"));
        this.classList.add("selected");
        welcomeSettings.language = this.dataset.lang;

        // Apply language immediately (will be available after translations.js loads)
        if (typeof updatePageTranslations === "function") {
          // Temporarily update settings for translation system
          const tempSettings = {
            language: welcomeSettings.language,
          };
          localStorage.setItem(
            "babylog.settings.v1",
            JSON.stringify(tempSettings),
          );
          updatePageTranslations();

          // Update next button text
          updateNextButtonText();
        }

        if (navigator.vibrate) navigator.vibrate(10);
      });
    });

    // Select default (English)
    const defaultLang = document.querySelector(
      '.welcome-language-option[data-lang="en"]',
    );
    if (
      defaultLang &&
      !document.querySelector(".welcome-language-option.selected")
    ) {
      defaultLang.classList.add("selected");
      welcomeSettings.language = "en";
    }
  }

  function initSlide2_Activities() {
    const activityOptions = document.querySelectorAll(
      ".welcome-activity-option",
    );

    activityOptions.forEach((option) => {
      option.addEventListener("click", function () {
        const activityId = this.dataset.activity;
        const isSelected = this.classList.contains("selected");

        if (isSelected) {
          this.classList.remove("selected");
          welcomeSettings.activities = welcomeSettings.activities.filter(
            (id) => id !== activityId,
          );
        } else {
          this.classList.add("selected");
          welcomeSettings.activities.push(activityId);
        }

        if (navigator.vibrate) navigator.vibrate(10);
      });
    });

    // Pre-select default activities
    const defaultActivities = ["feed", "pee", "poop"];
    defaultActivities.forEach((actId) => {
      const option = document.querySelector(
        `.welcome-activity-option[data-activity="${actId}"]`,
      );
      if (option && !option.classList.contains("selected")) {
        option.classList.add("selected");
        if (!welcomeSettings.activities.includes(actId)) {
          welcomeSettings.activities.push(actId);
        }
      }
    });
  }

  function initSlide3_Theme() {
    const themeOptions = document.querySelectorAll(".welcome-theme-option");

    themeOptions.forEach((option) => {
      option.addEventListener("click", function () {
        themeOptions.forEach((opt) => opt.classList.remove("selected"));
        this.classList.add("selected");
        welcomeSettings.theme = this.dataset.theme;

        // Apply theme immediately for preview
        if (document.body) {
          document.body.setAttribute("data-theme", welcomeSettings.theme);
        }

        if (navigator.vibrate) navigator.vibrate(10);
      });
    });

    // Select default (Blossom)
    const defaultTheme = document.querySelector(
      '.welcome-theme-option[data-theme="blossom"]',
    );
    if (
      defaultTheme &&
      !document.querySelector(".welcome-theme-option.selected")
    ) {
      defaultTheme.classList.add("selected");
      welcomeSettings.theme = "blossom";
    }
  }

  function initSlide4_Font() {
    const fontOptions = document.querySelectorAll(".welcome-font-option");

    fontOptions.forEach((option) => {
      option.addEventListener("click", function () {
        fontOptions.forEach((opt) => opt.classList.remove("selected"));
        this.classList.add("selected");
        welcomeSettings.font = this.dataset.font;

        // Apply font immediately for preview
        if (document.body) {
          document.body.setAttribute("data-font", welcomeSettings.font);
        }

        if (navigator.vibrate) navigator.vibrate(10);
      });
    });

    // Select default (Roboto)
    const defaultFont = document.querySelector(
      '.welcome-font-option[data-font="roboto"]',
    );
    if (
      defaultFont &&
      !document.querySelector(".welcome-font-option.selected")
    ) {
      defaultFont.classList.add("selected");
      welcomeSettings.font = "roboto";
    }
  }

  function initSlide5_Tutorial() {
    const tutorialOptions = document.querySelectorAll(
      ".welcome-tutorial-choice",
    );

    tutorialOptions.forEach((option) => {
      option.addEventListener("click", function () {
        tutorialOptions.forEach((opt) => opt.classList.remove("selected"));
        this.classList.add("selected");
        welcomeSettings.startTutorial = this.dataset.tutorial === "yes";

        if (navigator.vibrate) navigator.vibrate(10);
      });
    });

    // Select "Yes, Show Me Around" by default
    const yesOption = document.querySelector(
      '.welcome-tutorial-choice[data-tutorial="yes"]',
    );
    if (
      yesOption &&
      !document.querySelector(".welcome-tutorial-choice.selected")
    ) {
      yesOption.classList.add("selected");
      welcomeSettings.startTutorial = true;
    }
  }

  // Initialize all interactive elements
  function initializeWelcome() {
    // Navigation buttons
    if (skipBtn) {
      skipBtn.addEventListener("click", skipWelcome);
    }

    if (backBtn) {
      backBtn.addEventListener("click", previousSlide);
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", nextSlide);
    }

    // Initialize each slide's interactive elements
    initSlide1_Language();
    initSlide2_Activities();
    initSlide3_Theme();
    initSlide4_Font();
    initSlide5_Tutorial();

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (!welcomeOverlay.classList.contains("hidden")) {
        if (e.key === "ArrowRight" || e.key === "Enter") {
          nextSlide();
        } else if (e.key === "ArrowLeft") {
          previousSlide();
        } else if (e.key === "Escape") {
          skipWelcome();
        }
      }
    });
  }

  // Auto-start welcome if not completed
  function autoStartWelcome() {
    if (!hasCompletedWelcome()) {
      // Small delay to ensure everything is loaded
      setTimeout(() => {
        showWelcome();
      }, 300);
    } else {
      welcomeOverlay.classList.add("hidden");
    }
  }

  // Public API
  window.WelcomeSystem = {
    show: showWelcome,
    hide: hideWelcome,
    hasCompleted: hasCompletedWelcome,
    getSettings: getWelcomeSettings,
    reset: function () {
      localStorage.removeItem(WELCOME_COMPLETED_KEY);
      localStorage.removeItem(WELCOME_SETTINGS_KEY);
    },
  };

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initializeWelcome();
      autoStartWelcome();
    });
  } else {
    initializeWelcome();
    autoStartWelcome();
  }
})();
