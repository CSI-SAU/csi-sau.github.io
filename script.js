const teamProfiles = {
  technical: { title: 'Technical Team', description: 'We build campus-facing tools, prototypes, and technical experiences across web systems, automation, and hands-on coding.', leaders: [{ name: 'Arkodyuti Bhattacharyya', role: 'Team Lead', image: 'media/abhattacharyya.jpeg' }], members: ['Tanmay Madam', 'Sania Shanty', 'Abhinav Gupta', 'Nakshatra Tomar', 'Saurav', 'Aman'] },
  research: { title: 'Research & Development', description: 'We work on applied AI and data-driven research, including weather-informed prediction models for agricultural risk assessment and related problem-solving.', leaders: [{ name: 'Adivi Ananya', role: 'Team Lead', image: 'media/aadivi.jpg' }], members: ['Anuja', 'Raghav', 'Anshita', 'Madan', 'Suyash', 'Parv'] },
  finance: { title: 'Finance Team', description: 'The chapter’s finance function supports budgeting, sponsorship planning, and resource allocation for events, tools, and community activities.', leaders: [{ name: 'Yash Tomar', role: 'Team Lead', image: 'media/ytomar.jpg' }], members: ['Swarnojjwal', 'Rushil', 'Keshav', 'Akansha', 'Vipin', 'Rajnath'] },
  design: { title: 'Design & Media', description: 'We shape the chapter’s visuals and communications, from event graphics and posters to the overall digital presence of CSI-SAU.', leaders: [{ name: 'Ipsita Bajpai', role: 'Team Lead', image: 'media/ibajpai.jpg' }], members: ['Vedansh', 'Devanshi', 'Suruchi', 'Sanskriti', 'Shaurya', 'Parv', 'Aarav'] },
  pr: { title: 'Public Relations', description: 'We handle communication, outreach, and relationships across student networks, collaborators, and the wider campus community.', leaders: [{ name: 'Misbah Ul Islam', role: 'Team Lead', image: 'media/mislam.jpg' }], members: ['Sudeepta', 'Hazur', 'Swasti', 'Pankul', 'Sabhyata'] },
  events: { title: 'Event Management', description: 'We coordinate logistics, execution, and on-ground planning for competitions, workshops, and chapter events.', leaders: [{ name: 'Surya P. Singh', role: 'Team Lead', image: 'media/spsingh.jpg' }], members: ['Vipin', 'Rajnath', 'Nikhil Anand', 'Sangam', 'Prateek Yadav', 'Aniket'] },
  'documentation-outreach': { title: 'Documentation & Outreach', description: 'We document chapter activity, archive event stories, and help build continuity between members, audiences, and partners.', leaders: [{ name: 'Mukund Prasad', role: 'Team Lead', image: 'media/mprasad.jpg' }], members: ['Aniket Gupta', 'Vipul Garg', 'Ajay Singh', 'Samarth', 'Yajat', 'Madan'] }
};

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });

document.querySelectorAll('[data-reveal]').forEach((element) => revealObserver.observe(element));

const mobileMenu = document.querySelector('.mobile-menu');
const menuButton = document.querySelector('.menu-button');
const siteHeader = document.querySelector('.site-header');

const setHeaderState = () => {
  if (!siteHeader) return;
  siteHeader.classList.toggle('scrolled', window.scrollY > 12);
};

if (menuButton && mobileMenu) {
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

const navLinks = document.querySelectorAll('.top-nav a');
const sections = Array.from(document.querySelectorAll('main section[id]'));
const setActiveLink = () => {
  const scrollPosition = window.scrollY + 160;
  let activeId = '#home';
  sections.forEach((section) => {
    if (scrollPosition >= section.offsetTop) {
      activeId = '#' + section.id;
    }
  });
  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === activeId;
    link.classList.toggle('active', isActive);
  });
};
window.addEventListener('scroll', setActiveLink, { passive: true });
setActiveLink();

const modalOverlay = document.getElementById('team-modal');
const modalContent = document.getElementById('modal-content');
const closeModal = document.querySelector('.modal-close');
const certificateModal = document.getElementById('certificate-modal');
const certificateClose = document.querySelector('.certificate-close');
const certificateTrigger = document.querySelector('.certificate-trigger');

function closeModalWindow() {
  if (modalOverlay) {
    modalOverlay.classList.remove('is-open');
    modalOverlay.setAttribute('aria-hidden', 'true');
  }
  if (certificateModal) {
    certificateModal.classList.remove('is-open');
    certificateModal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
}

function renderModal(profileKey) {
  const profile = teamProfiles[profileKey];
  if (!profile || !modalContent) return;
  modalContent.innerHTML = `
    <div class="modal-content-header">
      <p class="eyebrow modal-kicker">Team</p>
      <h3 id="modal-title">${profile.title}</h3>
      <p class="modal-summary">${profile.description}</p>
    </div>
    <div class="team-profile-shell">
      <div class="modal-leader single-leader">
        <div class="modal-leader-image-wrap">
          <img src="${profile.leaders[0].image}" alt="${profile.leaders[0].name}" loading="lazy" />
        </div>
        <div class="modal-leader-info">
          <h4>${profile.leaders[0].name}</h4>
          <p>${profile.leaders[0].role}</p>
          <a class="profile-link" href="https://www.linkedin.com/company/csi-sau-student-chapter/" target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
      </div>
      <div class="member-panel">
        <p class="member-panel-title">Members</p>
        <div class="member-list">${profile.members.map((member) => `<span>${member}</span>`).join('')}</div>
      </div>
    </div>
  `;
  modalOverlay.classList.add('is-open');
  modalOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

document.querySelectorAll('.explore-btn').forEach((button) => {
  button.addEventListener('click', () => renderModal(button.dataset.team));
});

if (certificateTrigger && certificateModal) {
  certificateTrigger.addEventListener('click', () => {
    certificateModal.classList.add('is-open');
    certificateModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  });
}

if (closeModal && modalOverlay) {
  closeModal.addEventListener('click', closeModalWindow);
  modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) closeModalWindow();
  });
}

if (certificateClose && certificateModal) {
  certificateClose.addEventListener('click', closeModalWindow);
  certificateModal.addEventListener('click', (event) => {
    if (event.target === certificateModal) closeModalWindow();
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (modalOverlay && modalOverlay.classList.contains('is-open')) {
      closeModalWindow();
      return;
    }
    if (certificateModal && certificateModal.classList.contains('is-open')) {
      closeModalWindow();
    }
  }
});
