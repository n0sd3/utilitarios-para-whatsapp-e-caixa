function setTheme(theme) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("orcamento_theme", theme);
      const dark = theme === "dark";
      themeIcon.textContent = dark ? "☀️" : "🌙";
      themeLabel.textContent = dark ? "Modo claro" : "Modo escuro";
    }

    function initTheme() {
      const saved = localStorage.getItem("orcamento_theme");
      if (saved === "light" || saved === "dark") {
        setTheme(saved);
        return;
      }
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
