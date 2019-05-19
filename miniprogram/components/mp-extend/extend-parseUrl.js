// 解析url中的参数，返回一个对象
function parseUrl(url) {
  let query = {};
  let path = url;
  let search;
  if (path.indexOf('?') == -1) {
    return { path, query };
  }

  [path, search] = url.split('?');

  if (!search) return query;
  for (const item of search.split('&')) {
    const map = item.split('=');
    query[map[0]] = decodeURIComponent(map[1]);
  }
  return { path, query };
}
export default parseUrl;