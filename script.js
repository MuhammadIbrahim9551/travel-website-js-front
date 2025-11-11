async function fetchDestinations() {
  const response = await fetch('data.json');
  const data = await response.json();
  return data.destinations;
}

const searchInput = document.getElementById('search');
const resultsDiv = document.getElementById('results');

searchInput.addEventListener('input', async () => {
  const query = searchInput.value.toLowerCase();
  const destinations = await fetchDestinations();
  const filtered = destinations.filter(dest =>
    dest.name.toLowerCase().includes(query)
  );

  resultsDiv.innerHTML = filtered
    .map(
      dest => `
        <div class="card">
          <img src="${dest.image}" alt="${dest.name}">
          <h3>${dest.name}</h3>
          <p>${dest.description}</p>
        </div>
      `
    )
    .join('');
});
