/* ==========================================================================
   Aliagui Home — comportements interactifs
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. Écran de chargement ---------- */
  const preloader = document.getElementById('preloader');
  document.body.classList.add('loading');

  function hidePreloader() {
    if (!preloader) return;
    preloader.classList.add('hide');
    document.body.classList.remove('loading');
    setTimeout(() => preloader.remove(), 700);
  }
  // On laisse le temps au nom de la marque de s'afficher avant de fermer l'écran
  window.addEventListener('load', () => setTimeout(hidePreloader, 1200));
  // Sécurité : si "load" tarde trop, on ferme quand même
  setTimeout(hidePreloader, 3500);

  /* ---------- Notification (toast) ---------- */
  const toast = document.getElementById('toast');
  let toastTimer = null;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  /* ----------  2. Animations au défilement ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    // Repli si IntersectionObserver n'est pas supporté
    revealEls.forEach(el => el.classList.add('show'));
  }

  /* ---------- Catalogue : moteur de filtrage commun ----------
     Utilisé à la fois par la navigation par catégorie (Nos draps /
     Parures de lit / Tables) et par la recherche en direct. */
  const cards = Array.from(document.querySelectorAll('.card'));
  const productsEmptyEl = document.getElementById('products-empty');
  const productsSection = document.getElementById('produits');
  const productsTitleEl = document.getElementById('products-title');

  function applyCardFilter(matchFn, emptyMessageHtml) {
    let anyVisible = false;
    cards.forEach(card => {
      const match = matchFn(card);
      card.style.display = match ? '' : 'none';
      if (match) anyVisible = true;
    });

    if (!productsEmptyEl) return anyVisible;

    if (anyVisible) {
      productsEmptyEl.style.display = 'none';
      productsEmptyEl.innerHTML = '';
    } else {
      productsEmptyEl.style.display = 'block';
      productsEmptyEl.innerHTML = emptyMessageHtml;
      const showAllBtn = document.getElementById('show-all-products');
      if (showAllBtn) showAllBtn.addEventListener('click', resetCatalog);
    }
    return anyVisible;
  }

  function resetCatalog() {
    applyCardFilter(() => true, '');
    document.querySelectorAll('.nav-left a').forEach(a => a.classList.remove('active'));
    if (productsTitleEl) productsTitleEl.textContent = 'Nos parures en pagne du moment';
    if (searchInput) searchInput.value = '';
  }

  /* ---------- Navigation (Nos draps / Parures de lit / Tables) ---------- */
  const catLinks = document.querySelectorAll('.nav-left a[data-category], footer a[data-category]');
  const categoryLabels = {
    draps: 'Nos draps',
    'parures-lit': 'Parures de lit',
    tables: 'Tables'
  };

  catLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const category = link.dataset.category;

      document.querySelectorAll('.nav-left a').forEach(a => a.classList.remove('active'));
      const matchingTopLink = document.querySelector(`.nav-left a[data-category="${category}"]`);
      if (matchingTopLink) matchingTopLink.classList.add('active');

      if (searchInput) searchInput.value = '';

      applyCardFilter(
        card => (card.dataset.category || '').split(' ').includes(category),
        'Aucun article dans cette catégorie pour le moment. <button type="button" id="show-all-products" class="link-btn">Voir tous nos produits</button>'
      );

      if (productsTitleEl && categoryLabels[category]) {
        productsTitleEl.textContent = categoryLabels[category];
      }

      productsSection.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---------- Recherche (filtrage en direct) ---------- */
  const searchBox = document.getElementById('search-box');
  const btnSearch = document.getElementById('btn-search');
  const searchInput = document.getElementById('search-input');

  function runSearch(rawQuery) {
    const query = rawQuery.trim().toLowerCase();

    if (query === '') {
      resetCatalog();
      return;
    }

    document.querySelectorAll('.nav-left a').forEach(a => a.classList.remove('active'));
    if (productsTitleEl) productsTitleEl.textContent = `Résultats pour « ${rawQuery.trim()} »`;

    applyCardFilter(
      card => {
        const name = (card.dataset.name || '').toLowerCase();
        const desc = (card.querySelector('.card-desc')?.textContent || '').toLowerCase();
        return name.includes(query) || desc.includes(query);
      },
      `Aucun produit ne correspond à « ${rawQuery.trim()} ». <button type="button" id="show-all-products" class="link-btn">Voir tous nos produits</button>`
    );

    productsSection.scrollIntoView({ behavior: 'smooth' });
  }

  if (btnSearch && searchBox && searchInput) {
    btnSearch.addEventListener('click', () => {
      const isOpen = searchBox.classList.toggle('open');
      btnSearch.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) searchInput.focus();
    });

    searchInput.addEventListener('input', (e) => {
      runSearch(e.target.value);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        resetCatalog();
        searchBox.classList.remove('open');
        btnSearch.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('click', (e) => {
      if (!searchBox.contains(e.target) && searchBox.classList.contains('open') && searchInput.value.trim() === '') {
        searchBox.classList.remove('open');
        btnSearch.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Compte ---------- */
  document.getElementById('btn-account').addEventListener('click', () => {
    showToast('Espace compte — connexion bientôt disponible');
  });

  /* ---------- 4. Panneau Contact ---------- */
  const btnContact = document.getElementById('btn-contact');
  const contactPanel = document.getElementById('contact-panel');
  const contactClose = document.getElementById('contact-close');

  function openContact() {
    closeCart();
    contactPanel.classList.add('open');
    overlay.classList.add('show');
  }
  function closeContact() {
    contactPanel.classList.remove('open');
    if (!cartPanelIsOpen()) overlay.classList.remove('show');
  }
  function cartPanelIsOpen() {
    return cartPanel.classList.contains('open');
  }

  if (btnContact) btnContact.addEventListener('click', openContact);
  if (contactClose) contactClose.addEventListener('click', closeContact);

  /* ---------- Panier ---------- */
  const cart = [];
  const cartBtn = document.getElementById('btn-cart');
  const cartCount = document.getElementById('cart-count');
  const cartPanel = document.getElementById('cart-panel');
  const cartItemsEl = document.getElementById('cart-items');
  const cartTotalEl = document.getElementById('cart-total');
  const overlay = document.getElementById('overlay');

  function formatFCFA(n) {
    return n.toLocaleString('fr-FR') + ' F';
  }

  function renderCart() {
    cartItemsEl.innerHTML = '';
    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<p class="cart-empty">Votre panier est vide.</p>';
    } else {
      cart.forEach(item => {
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `<span>${item.name}</span><span>${formatFCFA(item.price)}</span>`;
        cartItemsEl.appendChild(row);
      });
    }
    const total = cart.reduce((sum, i) => sum + i.price, 0);
    cartTotalEl.textContent = 'Total : ' + formatFCFA(total);
    cartCount.textContent = cart.length;
    cartCount.classList.toggle('show', cart.length > 0);
  }

  function openCart() {
    closeContact();
    cartPanel.classList.add('open');
    overlay.classList.add('show');
  }
  function closeCart() {
    cartPanel.classList.remove('open');
    if (!contactPanel.classList.contains('open')) overlay.classList.remove('show');
  }

  cartBtn.addEventListener('click', openCart);
  document.getElementById('cart-close').addEventListener('click', closeCart);
  overlay.addEventListener('click', () => { closeCart(); closeContact(); });

  /* ---------- Boutons "Ajouter" des produits ---------- */
  document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.card');
      const name = card.dataset.name;
      const price = parseInt(card.dataset.price, 10);
      cart.push({ name, price });
      renderCart();
      showToast(`${name} ajouté au panier`);

      const original = btn.textContent;
      btn.textContent = 'Ajouté ✓';
      btn.classList.add('added');
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove('added');
      }, 1200);
    });
  });

  /* ---------- Bouton principal : découvrir la collection ---------- */
  document.getElementById('cta-decouvrir').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('produits').scrollIntoView({ behavior: 'smooth' });
  });

  /* ---------- Boutons WhatsApp ---------- */
  const whatsappNumber = '2250700000000'; // à remplacer par le vrai numéro
  document.querySelectorAll('.js-whatsapp').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.open(`https://wa.me/${whatsappNumber}`, '_blank');
    });
  });

  /* ---------- Newsletter ---------- */
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterMsg = document.getElementById('newsletter-msg');
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = newsletterForm.querySelector('input[type="email"]');
    const email = input.value.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValid) {
      newsletterMsg.textContent = 'Merci de saisir un e-mail valide.';
      newsletterMsg.style.color = '#e3a08a';
      return;
    }
    newsletterMsg.textContent = 'Merci ! Vous êtes bien inscrit(e).';
    newsletterMsg.style.color = 'var(--sable)';
    input.value = '';
  });

});