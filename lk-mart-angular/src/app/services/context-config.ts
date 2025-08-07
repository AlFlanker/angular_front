export const CONTEXT_PATH = (() => {
  const m = window.location
    .pathname.match(/^\/([^\/]+)\//);
  return m ? `/${m[1]}` : '';
})();
export const CONTEXT_PATH_URL = `${CONTEXT_PATH}`;
