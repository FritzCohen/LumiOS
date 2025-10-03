function normalizePath(p: string): string {
  let result = p.replace(/\/+/g, "/"); // collapse multiple slashes
  if (!result.startsWith("/")) {
    result = "/" + result; // ensure leading slash
  }
  if (result.length > 1 && result.endsWith("/")) {
    result = result.slice(0, -1); // remove trailing slash unless root
  }
  return result;
};

export default normalizePath;