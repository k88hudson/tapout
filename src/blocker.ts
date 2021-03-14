function main() {
  const pageUrl = new URL(window.location.href);
  const [url] = ["url", "rule"].map((key) => {
    const value = pageUrl.searchParams.get(key);
    return value ? decodeURIComponent(value) : null;
  });
  if (url) {
    const { hostname } = new URL(url);
    (<HTMLElement>(
      document.getElementById("message")
    )).textContent = `${hostname} is blocked in this container right now.`;
  }
}
main();
