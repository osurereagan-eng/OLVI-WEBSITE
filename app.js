// assets/app.js
// Handles navigation, scroll, local storage, order navigation, and search

document.addEventListener('DOMContentLoaded', () => {
  // --- NAV active link ---
  try {
    const navLinks = document.querySelectorAll('nav a');
    const current = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(a => {
      const href = a.getAttribute('href') || '';
      const target = href.split('/').pop() || '';
      a.classList.toggle('active', target === current || (current === '' && target === 'index.html'));
    });
  } catch (e) {}

  // --- Scroll to top button ---
  const scrollTopBtn = document.getElementById('scrollTop');
  function updateScrollTop() {
    if (!scrollTopBtn) return;
    scrollTopBtn.style.display = window.scrollY > 200 ? 'block' : 'none';
  }
  updateScrollTop();
  window.addEventListener('scroll', updateScrollTop);
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // --- Floating "open-order" buttons ---
  document.querySelectorAll('.open-order').forEach(btn => {
    btn.addEventListener('click', e => {
      if (btn.tagName.toLowerCase() === 'a' && btn.href) return;
      e.preventDefault();
      window.location.href = 'order.html';
    });
  });

  // --- Contact form (store locally) ---
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());
      if (!data.name || !data.email || !data.phone) {
        alert('Please fill name, email and phone.');
        return;
      }
      const storeKey = 'olvi_messages_v1';
      const existing = JSON.parse(localStorage.getItem(storeKey) || '[]');
      existing.push({ id: 'MSG-' + Date.now().toString(36).toUpperCase(), ...data, date: new Date().toISOString() });
      localStorage.setItem(storeKey, JSON.stringify(existing, null, 2));
      alert('Message saved locally.');
      contactForm.reset();
    });
  }

  // --- Keyboard shortcut to open order page ---
  document.addEventListener('keydown', ev => {
    if (ev.key === 'o' || ev.key === 'O') {
      window.location.href = 'order.html';
    }
  });

  // --- Local message count indicator ---
  try {
    const msgCountEl = document.querySelector('[data-local-messages-count]');
    if (msgCountEl) {
      const messages = JSON.parse(localStorage.getItem('olvi_messages_v1') || '[]');
      msgCountEl.textContent = messages.length || 0;
    }
  } catch (e) {}
});

// --- Live Product Search (Google-style) ---
async function liveSearch() {
  const query = document.getElementById("searchInput").value.trim();
  const box = document.getElementById("searchResults");
  const list = document.getElementById("productList");

  if (!query) {
    box.classList.remove("active");
    box.innerHTML = "";
    list.innerHTML = "";
    return;
  }

  try {
    const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (!data || data.length === 0) {
      box.classList.add("active");
      box.innerHTML = "<div>No results found.</div>";
      list.innerHTML = "";
      return;
    }

    box.innerHTML = data.map(p => `
      <div class="result-item" onclick="selectProduct('${p.name}', '${p.description}', '${p.price}')">
        <strong>${p.name}</strong><br>
        <small>${p.description}</small>
      </div>
    `).join("");

    // Activate fade animation
    box.classList.add("active");

  } catch (err) {
    console.error("Search error:", err);
    box.classList.add("active");
    box.innerHTML = "<div style='color:red'>Error searching for products.</div>";
  }
}
