// // Hamburger
// document.getElementById('hamburger')?.addEventListener('click', () => {
//   document.querySelector('.nav-menu').classList.toggle('active');
// });

// // Navigation fluide
// document.querySelectorAll('a[href^="#"]').forEach(link => {
//   link.addEventListener('click', function(e) {
//     e.preventDefault();
//     const targetId = this.getAttribute('href').substring(1);
//     const targetSection = document.getElementById(targetId);
    
//     if (targetSection) {
//       document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
//       targetSection.classList.add('active');
//       document.querySelector('.nav-menu')?.classList.remove('active');
//       targetSection.scrollIntoView({ behavior: 'smooth' });
//     }
//   });
// });

// // Carrousel
// let slideIndex = 0;
// const slides = document.querySelectorAll('.carousel-img');
// const dots = document.querySelectorAll('.dot');

// function showSlide(n) {
//   slides.forEach((s, i) => {
//     s.classList.remove('active');
//     dots[i].classList.remove('active');
//   });
//   slides[n].classList.add('active');
//   dots[n].classList.add('active');
// }

// dots.forEach((dot, i) => {
//   dot.addEventListener('click', () => {
//     slideIndex = i;
//     showSlide(slideIndex);
//   });
// });

// setInterval(() => {
//   slideIndex = (slideIndex + 1) % slides.length;
//   showSlide(slideIndex);
// }, 5000);

// showSlide(slideIndex);

// // Formulaire
// document.getElementById('contact-form')?.addEventListener('submit', function(e) {
//   e.preventDefault();
//   alert("Merci ! Votre message a été envoyé.");
//   this.reset();
// });

// // Accueil par défaut
// document.getElementById('accueil').classList.add('active');



// let authToken = null;

// // Connexion à l'admin
// function adminLogin() {
//   const username = document.getElementById('admin-username').value;
//   const password = document.getElementById('admin-password').value;

//   console.log('Tentative de connexion:', username); // 🔍 Pour déboguer

//   fetch('/api/auth/login', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({ username, password })
//   })
//   .then(response => response.json())
//   .then(data => {
//     if (data.token) {
//       authToken = data.token;
//       document.getElementById('admin-login').style.display = 'none';
//       document.getElementById('admin-panel').style.display = 'block';
//       loadNews(); // Charge les actualités
//     } else {
//       alert("Erreur : " + data.message);
//     }
//   })
//   .catch(err => {
//     console.error("Erreur réseau ou backend :", err);
//     alert("Impossible de se connecter au serveur. Vérifie que le backend est lancé.");
//   });
// }

// // Charger les actualités
// async function loadNews() {
//   const res = await fetch('/api/news');
//   const newsList = await res.json();
//   const ul = document.getElementById('news-list');
//   ul.innerHTML = '';

//   newsList.forEach(n => {
//     const li = document.createElement('li');
//     li.innerHTML = `
//       <strong>${n.title}</strong>
//       <p>${n.content}</p>
//       <button onclick="deleteNews('${n._id}')">Supprimer</button>
//       <hr>
//     `;
//     ul.appendChild(li);
//   });
// }

// // Ajouter une actualité
// async function addNews() {
//   const title = document.getElementById('news-title').value;
//   const content = document.getElementById('news-content').value;

//   const res = await fetch('/api/news', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${authToken}`
//     },
//     body: JSON.stringify({ title, content })
//   });

//   if (res.ok) {
//     document.getElementById('news-title').value = '';
//     document.getElementById('news-content').value = '';
//     loadNews();
//   } else {
//     alert("Échec de l'ajout");
//   }
// }

// // Supprimer une actualité
// async function deleteNews(id) {
//   if (!confirm("Confirmer la suppression ?")) return;

//   const res = await fetch(`/api/news/${id}`, {
//     method: 'DELETE',
//     headers: { 'Authorization': `Bearer ${authToken}` }
//   });

//   if (res.ok) {
//     loadNews();
//   } else {
//     alert("Erreur lors de la suppression");
//   }
// }

// Hamburger
document.getElementById('hamburger')?.addEventListener('click', () => {
  document.querySelector('.nav-menu').classList.toggle('active');
});

// Navigation fluide
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);
    
    if (targetSection) {
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      targetSection.classList.add('active');
      document.querySelector('.nav-menu')?.classList.remove('active');
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Sécurité : empêcher accès à #admin si pas connecté
document.querySelectorAll('a[href="#admin"]').forEach(link => {
  link.addEventListener("click", (e) => {
    if (!authToken) {
      e.preventDefault();
      alert("Accès réservé aux administrateurs. Veuillez vous connecter.");
    }
  });
});

// Carrousel
let slideIndex = 0;
const slides = document.querySelectorAll('.carousel-img');
const dots = document.querySelectorAll('.dot');

function showSlide(n) {
  slides.forEach((s, i) => {
    s.classList.remove('active');
    dots[i].classList.remove('active');
  });
  slides[n].classList.add('active');
  dots[n].classList.add('active');
}

dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    slideIndex = i;
    showSlide(slideIndex);
  });
});

setInterval(() => {
  slideIndex = (slideIndex + 1) % slides.length;
  showSlide(slideIndex);
}, 5000);

showSlide(slideIndex);

// // Formulaire
// document.getElementById('contact-form')?.addEventListener('submit', function(e) {
//   e.preventDefault();
//   alert("Merci ! Votre message a été envoyé.");
//   this.reset();
// });

// Accueil par défaut
document.getElementById('accueil').classList.add('active');

const contactForm = document.getElementById('contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    try {
      const res = await fetch('http://localhost:3000/api/contact', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        alert('✅ Message envoyé avec succès !');
        this.reset();
      } else {
        alert('❌ Une erreur est survenue : ' + (data.message || 'Erreur inconnue'));
      }
    } catch (err) {
      console.error(err);
      alert('❌ Impossible d’envoyer le message. Veuillez réessayer.');
    }
  });
}

const socket = io('http://localhost:3000'); // connexion socket.io au backend
// ✅ Fonction pour afficher une actualité dans le DOM
function afficherActualite(actualite) {
  const container = document.querySelector('#actualites .news-container');
  if (!container) return;

  const newsItem = document.createElement('div');
  newsItem.className = 'news-item animate-card';
  newsItem.setAttribute('data-id', actualite._id);

  const img = document.createElement('img');
  
  // Gestion plus robuste du chemin image
  if (actualite.image) {
    // Si image commence déjà par /uploads, on concatène juste le host
    if (actualite.image.startsWith('/uploads')) {
      img.src = `http://localhost:3000${actualite.image}`;
    } else {
      // Sinon on ajoute /uploads/ devant
      img.src = `http://localhost:3000/uploads/${actualite.image}`;
    }
  } else {
    img.src = 'asset/images/default-news.jpg';
  }

  img.alt = actualite.title || 'Image actualité';
  img.className = 'news-img';

  const contentDiv = document.createElement('div');
  contentDiv.className = 'news-content';

  const titre = document.createElement('h4');
  let dateFormattee = '';
  if (actualite.createdAt) {
    const date = new Date(actualite.createdAt);
    dateFormattee = `[${date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })}]`;
  }
  titre.textContent = `${dateFormattee} ${actualite.title}`;

  const paragraphe = document.createElement('p');
  paragraphe.textContent = actualite.content;

  contentDiv.appendChild(titre);
  contentDiv.appendChild(paragraphe);

  newsItem.appendChild(img);
  newsItem.appendChild(contentDiv);
  //pour afficher les détails

  newsItem.addEventListener('click', () => {
    afficherDetailsActualite(actualite);
  });

    //
  container.prepend(newsItem);
}


// ✅ Charger toutes les actualités existantes au chargement
async function loadAllNews() {
  try {
    const res = await fetch('http://localhost:3000/api/news');
    const news = await res.json();

    if (Array.isArray(news)) {
      // Affiche les actualités de la plus récente à la plus ancienne
      news.reverse().forEach(actualite => afficherActualite(actualite));
    }
  } catch (err) {
    console.error('Erreur lors du chargement des actualités :', err);
  }
}

// Appel immédiat quand la page charge
loadAllNews();



// 🔴 Lorsqu'une actualité est supprimée (même via Postman)
socket.on('newsDeleted', (deletedId) => {
  const container = document.querySelector('#actualites .news-container');
  if (!container) return;

  // Trouve l'élément DOM avec un ID correspondant
  const newsToRemove = container.querySelector(`[data-id="${deletedId}"]`);
  if (newsToRemove) {
    newsToRemove.remove(); // Supprime visuellement du DOM
    console.log(`🗑️ Actualité supprimée du DOM : ID=${deletedId}`);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const adminBtn = document.getElementById("btn-admin");

  if (adminBtn) {
    adminBtn.addEventListener("click", () => {
      window.location.href = "login.html";
    });
  }
});

//afficher les détails et actualités
function afficherDetailsActualite(actualite) {
  const sectionDetails = document.getElementById('news-details');
  const titleEl = document.getElementById('details-title');
  const imageEl = document.getElementById('details-image');
  const contentEl = document.getElementById('details-content');

  titleEl.textContent = actualite.title;

  // Affiche image ou image par défaut
  if (actualite.image) {
    imageEl.src = actualite.image.startsWith('/uploads')
      ? `http://localhost:3000${actualite.image}`
      : `http://localhost:3000/uploads/${actualite.image}`;
  } else {
    imageEl.src = 'asset/images/default-news.jpg';
  }

  contentEl.textContent = actualite.content;

  // Affiche la section des détails
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  sectionDetails.style.display = 'block';
  sectionDetails.classList.add('active');

  // Optionnel : faire défiler jusqu'en haut du panneau
  sectionDetails.scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('close-details')?.addEventListener('click', () => {
  const detailsSection = document.getElementById('news-details');
  detailsSection.style.display = 'none';
  detailsSection.classList.remove('active');

  // Revenir à l'accueil ou autre section
  document.getElementById('accueil').classList.add('active');
});


// afficher les expériences

// Sélectionner tous les éléments .experience-item
document.querySelectorAll('.experience-item').forEach(item => {
  item.addEventListener('click', () => {
    const title = item.querySelector('h3')?.textContent;
    const image = item.querySelector('img')?.getAttribute('src');
    const description = item.querySelector('p')?.textContent;

    afficherDetailsExperience({ title, image, description });
  });
});

function afficherDetailsExperience(experience) {
  const section = document.getElementById('experience-details');
  const titleEl = document.getElementById('experience-title');
  const imageEl = document.getElementById('experience-image');
  const descEl = document.getElementById('experience-description');

  titleEl.textContent = experience.title || 'Détails de l’expérience';
  imageEl.src = experience.image || 'asset/images/default.jpg';
  descEl.textContent = experience.description || '';

  // Afficher la section et masquer les autres
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  section.style.display = 'block';
  section.classList.add('active');
  section.scrollIntoView({ behavior: 'smooth' });
}

// Bouton de fermeture
document.getElementById('close-experience-details')?.addEventListener('click', () => {
  const section = document.getElementById('experience-details');
  section.style.display = 'none';
  section.classList.remove('active');
});



