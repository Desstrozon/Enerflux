export function ensureScrollTo(id: string, opts: ScrollIntoViewOptions = { behavior: "smooth", block: "start" }) {
  const tryScroll = () => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView(opts);
      return true;
    }
    return false;
  };

  // intenta ya
  if (tryScroll()) return;

  // si aún no existe, observa el DOM hasta que aparezca (con timeout)
  const observer = new MutationObserver(() => {
    if (tryScroll()) {
      observer.disconnect();
      clearTimeout(timer);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  const timer = setTimeout(() => {
    observer.disconnect();
  }, 8000); // corta a los 8s por si acaso
}
