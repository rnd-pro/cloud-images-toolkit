export function sortData(data) {
  return Object.fromEntries(Object.entries(data).sort((a, b) => {
    return a[0].localeCompare(b[0]);
  }));
}

