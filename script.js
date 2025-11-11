// Simple single-page navigation and navbar switching
const sections = document.querySelectorAll('main section');
const navHome = document.getElementById('nav-home');
const navSimple = document.getElementById('nav-simple');
const resultsEl = document.getElementById('results');
const noResults = document.getElementById('no-results');

function showSection(name) {
    sections.forEach(s => s.classList.remove('active'));
    const target = document.getElementById(name);
    if (target) target.classList.add('active');
    // show/hide navbars: search only on home
    if (name === 'home') {
        navHome.style.display = '';
        navSimple.style.display = 'none';
    } else {
        navHome.style.display = 'none';
        navSimple.style.display = '';
    }
    // update active link styles
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.toggle('active', a.getAttribute('data-link') === name));
}

function handleHash() {
    const hash = location.hash.replace('#', '') || 'home';
    showSection(hash);
}
window.addEventListener('hashchange', handleHash);
handleHash();

document.getElementById('year').textContent = new Date().getFullYear();

// ------------------ Fetch data from JSON ------------------
// Expected JSON format: an array of objects like {
//   "name":"Bondi Beach", "type":"beach", "country":"Australia", "imageUrl":"images/beach1.jpg", "description":"Popular surf beach"
// }

let places = [];
fetch('travel_recommendation_api.json')
    .then(r => r.json())
    .then(data => {
    console.log('Fetched places:', data);
    places = data.destinations || data; // handles both {destinations:[...]} and [...] formats
    // optionally preload thumbnails (best-effort)
    places.forEach(p => {
        const img = new Image();
        img.src = p.image || p.imageUrl; // supports either "image" or "imageUrl"
    });
})

    .catch(err => console.error('Failed to load JSON:', err));

// ------------------ Search logic ------------------
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resetBtn = document.getElementById('resetBtn');

function normalizeTerm(s) { return (s || '').toLowerCase().trim(); }

function matchesKeyword(place, keyword) {
    // normalize keywords and place properties
    const k = normalizeTerm(keyword);
    if (!k) return false;
    // Accept variations: 'beach' 'beaches' and case-insensitive
    if (k.includes('beach')) { return place.type && place.type.toLowerCase().includes('beach'); }
    if (k.includes('temple')) { return place.type && place.type.toLowerCase().includes('temple'); }
    // otherwise treat as country/name match
    if (place.country && place.country.toLowerCase().includes(k)) return true;
    if (place.name && place.name.toLowerCase().includes(k)) return true;
    if (place.tags && place.tags.join(' ').toLowerCase().includes(k)) return true;
    return false;
}

function renderResults(list) {
    resultsEl.innerHTML = '';
    if (!list || list.length === 0) { noResults.style.display = ''; return; }
    noResults.style.display = 'none';
    list.forEach(p => {
        const card = document.createElement('article'); card.className = 'card';
        card.innerHTML = `
          <img src="${p.imageUrl}" alt="${p.name}">
          <div class="body">
            <h4>${p.name}</h4>
            <div>${p.description || ''}</div>
            <div class="tags">
              <div class="tag">${p.type || ''}</div>
              <div class="tag">${p.country || ''}</div>
            </div>
          </div>`;
        resultsEl.appendChild(card);
    });
}

searchBtn.addEventListener('click', () => {
    const q = searchInput.value;
    const normalized = normalizeTerm(q);
    if (!normalized) { alert('Please enter a search term (e.g., beach, temple, Japan)'); return; }
    // filter places using matchesKeyword
    const filtered = places.filter(p => matchesKeyword(p, normalized));
    renderResults(filtered);
    // switch to Home view to show results
    location.hash = 'home';
});

resetBtn.addEventListener('click', () => {
    searchInput.value = '';
    resultsEl.innerHTML = '';
    noResults.style.display = '';
});

// ------------------ Contact form (demo) ------------------
document.getElementById('contactForm').addEventListener('submit', e => {
    e.preventDefault();
    document.getElementById('contactResponse').style.display = '';
    e.target.reset();
});

// keyboard: press Enter in search input triggers search
searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); searchBtn.click(); } });

