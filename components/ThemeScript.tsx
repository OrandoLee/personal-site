export function ThemeScript() {
  const code = `
    (function() {
      try {
        var stored = localStorage.getItem("delee-theme");
        var theme = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
        var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        var shouldUseDark = theme === "dark" || (theme === "system" && prefersDark);
        document.documentElement.classList.toggle("dark", shouldUseDark);
        document.documentElement.dataset.theme = theme;
      } catch (error) {}
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
