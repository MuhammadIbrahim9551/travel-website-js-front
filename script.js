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
let places = [];
fetch('https://muhammadibrahim9551.github.io/travel-website-js-front/travel_recommendation_api.json')
  .then(r => r.json())
  .then(data => {
      // Enable search only after places are loaded
searchBtn.disabled = false;
searchInput.disabled = false;

    console.log('Fetched places:', data);
    places = Array.isArray(data) ? data : data.destinations;

    // preload all images safely
    places.forEach(p => {
        if (p.images && p.images.length > 0) {
            p.images.forEach(img => {
                const image = new Image();
                image.src = img;
            });
        } else if (p.imageUrl) {
            const image = new Image();
            image.src = p.imageUrl;
        }
    });
  })
  .catch(err => console.error('Failed to load JSON:', err));

// ------------------ Search logic ------------------
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resetBtn = document.getElementById('resetBtn');

function normalizeTerm(s) { return (s || '').toLowerCase().trim(); }

function matchesKeyword(place, keyword) {
    const k = normalizeTerm(keyword);
    if (!k) return false;
    if (k.includes('beach')) { return place.type && place.type.toLowerCase().includes('beach'); }
    if (k.includes('temple')) { return place.type && place.type.toLowerCase().includes('temple'); }
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
        const card = document.createElement('article'); 
        card.className = 'card';

        // Safe multiple images
        let imagesHTML = '';
        if (p.images && p.images.length > 0) {
            imagesHTML = p.images
                .filter(img => !!img)
                .map(img => `<img src="${img}" alt="${p.name}" style="margin-bottom:8px">`)
                .join('');
        } else if (p.imageUrl) {
            imagesHTML = `<img src="${p.imageUrl}" alt="${p.name}">`;
        }

        card.innerHTML = `
          ${imagesHTML}
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
    const filtered = places.filter(p => matchesKeyword(p, normalized));
    renderResults(filtered);
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

