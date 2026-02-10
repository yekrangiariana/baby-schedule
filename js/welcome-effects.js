// Theme effects for welcome screen
(function () {
  const effectsEl = document.getElementById("welcomeThemeEffects");
  if (!effectsEl) return;

  let clearTimer = null;

  // Per-theme effect tuning for the welcome preview.
  const config = {
    blossom: {
      type: "fall",
      emoji: "🌸",
      count: 22,
      duration: [2600, 3600],
      drift: 36,
    },
    comet: {
      type: "comet",
      count: 10,
      duration: [2200, 3000],
      arc: [40, 120],
    },
    meadow: {
      type: "leaf",
      emoji: "🍃",
      count: 20,
      duration: [2600, 3800],
      drift: 28,
    },
    midnight: {
      type: "star",
      emoji: "✨",
      count: 30,
      duration: [4200, 6000],
      drift: 14,
    },
  };

  // Simple random helper to keep animations organic.
  const rand = (min, max) => Math.random() * (max - min) + min;

  // Remove any existing particles and reset overlay state.
  const clearEffects = () => {
    effectsEl.innerHTML = "";
    effectsEl.className = "welcome-theme-effects";
    if (clearTimer) {
      clearTimeout(clearTimer);
      clearTimer = null;
    }
  };

  // Spawn an emoji-based particle for fall/float themes.
  const spawnParticle = (themeCfg) => {
    const span = document.createElement("span");
    span.className = "welcome-particle";
    span.textContent = themeCfg.emoji;
    span.style.setProperty("--x", rand(-5, 105).toFixed(2));
    const size = themeCfg.type === "star" ? rand(12, 18) : rand(14, 22);
    span.style.setProperty("--size", `${size.toFixed(0)}px`);
    span.style.setProperty(
      "--drift",
      `${rand(-themeCfg.drift, themeCfg.drift).toFixed(0)}px`,
    );
    span.style.setProperty(
      "--duration",
      `${rand(themeCfg.duration[0], themeCfg.duration[1]).toFixed(0)}ms`,
    );
    span.style.setProperty("--delay", `${rand(0, 500).toFixed(0)}ms`);

    if (themeCfg.type === "star") {
      span.style.setProperty("--y", rand(8, 92).toFixed(2));
      span.style.setProperty("--float-x", `${rand(-16, 16).toFixed(0)}px`);
      span.style.setProperty("--float-y", `${rand(-18, 18).toFixed(0)}px`);
    }

    if (themeCfg.type === "leaf") {
      span.style.setProperty("--y", rand(10, 90).toFixed(2));
      span.style.setProperty("--wind-y", `${rand(-30, 30).toFixed(0)}px`);
      span.style.setProperty("--wind-x", `${rand(-40, 40).toFixed(0)}px`);
      span.style.setProperty("--spin-start", `${rand(-40, 60).toFixed(0)}deg`);
      span.style.setProperty("--spin-mid", `${rand(120, 220).toFixed(0)}deg`);
      span.style.setProperty("--spin-end", `${rand(260, 420).toFixed(0)}deg`);
    }
    return span;
  };

  // Spawn a single comet streak.
  const spawnComet = (themeCfg) => {
    const comet = document.createElement("span");
    comet.className = "welcome-comet";
    comet.style.setProperty("--y", rand(10, 60).toFixed(2));
    comet.style.setProperty(
      "--duration",
      `${rand(themeCfg.duration[0], themeCfg.duration[1]).toFixed(0)}ms`,
    );
    comet.style.setProperty("--delay", `${rand(0, 200).toFixed(0)}ms`);
    comet.style.setProperty(
      "--arc",
      `${rand(themeCfg.arc[0], themeCfg.arc[1]).toFixed(0)}`,
    );
    return comet;
  };

  // Run a short effect burst for the selected theme.
  const runEffect = (theme) => {
    const themeCfg = config[theme];
    if (!themeCfg) return;

    clearEffects();
    effectsEl.classList.add(`theme-${theme}`);

    if (themeCfg.type === "comet") {
      for (let i = 0; i < themeCfg.count; i += 1) {
        effectsEl.appendChild(spawnComet(themeCfg));
      }
    } else {
      for (let i = 0; i < themeCfg.count; i += 1) {
        const particle = spawnParticle(themeCfg);
        if (themeCfg.type === "leaf") particle.classList.add("leaf");
        if (themeCfg.type === "star") particle.classList.add("star");
        effectsEl.appendChild(particle);
      }
    }

    clearTimer = setTimeout(() => {
      clearEffects();
    }, themeCfg.duration[1] + 800);
  };

  window.triggerWelcomeThemeEffect = runEffect;
})();
