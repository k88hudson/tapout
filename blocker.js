const url = new URL(window.location);
const data = ["url", "rule"].map(key => {
  return decodeURIComponent(url.searchParams.get(key));
});
console.log(data);
