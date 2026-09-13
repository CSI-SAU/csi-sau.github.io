const renderGallery = (container, items, activeGroup = 'all') => {
  if (!container) return;
  container.innerHTML = '';
  const filteredItems = activeGroup === 'all' ? items : items.filter((item) => item.group === activeGroup);

  filteredItems.forEach((item, index) => {
    const figure = document.createElement('figure');
    figure.className = 'gallery-item';

    const img = document.createElement('img');
    img.loading = index < 3 ? 'eager' : 'lazy';
    img.src = item.src;
    img.alt = item.alt;
    img.decoding = 'async';

    figure.appendChild(img);
    container.appendChild(figure);
  });
};

const initGallerySection = (section) => {
  const galleryId = section.dataset.galleryId;
  const container = section.querySelector('.gallery-grid');
  const tabList = section.querySelector('.tab-list');

  if (!galleryId || !container) return;

  fetch('gallery-data.json')
    .then((response) => response.json())
    .then((galleryData) => {
      const items = galleryData[galleryId] || [];
      const renderCurrent = (group = 'all') => renderGallery(container, items, group);
      renderCurrent('all');

      if (!tabList) return;
      tabList.addEventListener('click', (event) => {
        const button = event.target.closest('.tab-button');
        if (!button) return;

        tabList.querySelectorAll('.tab-button').forEach((tab) => {
          tab.classList.toggle('is-active', tab === button);
        });
        renderCurrent(button.dataset.group || 'all');
      });
    })
    .catch((error) => {
      console.error('Gallery data failed to load:', error);
    });
};

const initializeGalleries = () => {
  document.querySelectorAll('.gallery-section').forEach(initGallerySection);
};

initializeGalleries();

const mobileMenu = document.querySelector('.mobile-menu');
const menuButton = document.querySelector('.menu-button');
const header = document.querySelector('.site-header');

const setHeaderState = () => {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 12);
};

if (mobileMenu && menuButton) {
  menuButton.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    menuButton.classList.toggle('is-open', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      menuButton.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });
}

window.addEventListener('scroll', setHeaderState, { passive: true });
setHeaderState();
