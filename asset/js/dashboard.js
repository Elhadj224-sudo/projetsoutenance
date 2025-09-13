
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM chargé, initialisation du dashboard...");

  // ✅ Vérifie la présence du token JWT
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn("Token manquant. Redirection vers login.");
    window.location.href = "login.html";
    return;
  }

  // Fonction utilitaire pour ajouter le header Authorization
  function getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("Aucun token trouvé dans le localStorage");
      window.location.href = "login.html";
      return {};
    }
    
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  // Vérification de la connexion (via ping API)
  fetch("http://localhost:3000/api/news", {
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  })
    .then(res => {
      if (!res.ok) throw new Error("Non autorisé");
      return res.json();
    })
    .then(() => {
      // Chargement initial
      afficherOnglet(newsSection);
      chargerActualites();
    })
    .catch(err => {
      console.error("Accès refusé :", err);
      window.location.href = "login.html";
    });

  // Déconnexion
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        const res = await fetch("http://localhost:3000/api/auth/logout", {
          method: "POST",
          credentials: "include",
          headers: getAuthHeaders(),
        });

        // ✅ Supprime le token côté client
        localStorage.removeItem('token');

        if (res.ok) {
          window.location.href = "login.html";
        } else {
          alert("Erreur lors de la déconnexion.");
        }
      } catch {
        alert("Erreur réseau lors de la déconnexion.");
      }
    });
  } else {
    console.error("Bouton de déconnexion non trouvé");
  }

  // Récupération des onglets et sections
  const newsTab = document.getElementById("news-tab");
  const membersTab = document.getElementById("members-tab");
  const messagesTab = document.getElementById("messages-tab");

  // ✅ AJOUT : Récupération des nouveaux onglets Expériences & Partenaires
  const experiencesTab = document.getElementById("experiences-tab");
  const partnersTab = document.getElementById("partners-tab");

  const newsSection = document.getElementById("news-section");
  const membersSection = document.getElementById("members-section");
  const messagesSection = document.getElementById("messages-section");

  // ✅ AJOUT : Récupération des nouvelles sections
  const experiencesSection = document.getElementById("experiences-section");
  const partnersSection = document.getElementById("partners-section");

  // Vérification que tous les éléments existent
  if (!newsTab || !membersTab || !messagesTab || !experiencesTab || !partnersTab ||
      !newsSection || !membersSection || !messagesSection || !experiencesSection || !partnersSection) {
    console.error("Un ou plusieurs éléments de navigation sont manquants dans le DOM");
    return;
  }

  // Gestion affichage onglet (toggle active & display)
  function afficherOnglet(section) {
    // ✅ AJOUT : Inclure les nouvelles sections
    [newsSection, membersSection, messagesSection, experiencesSection, partnersSection].forEach(sec => {
      if (!sec) {
        console.error("Section non trouvée");
        return;
      }
      if (sec === section) {
        sec.style.display = "block";
        sec.classList.add("active");
      } else {
        sec.style.display = "none";
        sec.classList.remove("active");
      }
    });
    
    // Mettre à jour l'état actif des onglets
    document.querySelectorAll('.tab-link').forEach(tab => {
      tab.classList.remove('active');
    });
    
    if (section === newsSection && newsTab) newsTab.classList.add('active');
    if (section === membersSection && membersTab) membersTab.classList.add('active');
    if (section === messagesSection && messagesTab) messagesTab.classList.add('active');
    // ✅ AJOUT : Activer les nouveaux onglets
    if (section === experiencesSection && experiencesTab) experiencesTab.classList.add('active');
    if (section === partnersSection && partnersTab) partnersTab.classList.add('active');
  }

  // Événements onglets
  if (newsTab) {
    newsTab.addEventListener("click", e => {
      e.preventDefault();
      afficherOnglet(newsSection);
      chargerActualites();
    });
  }

  if (membersTab) {
    membersTab.addEventListener("click", e => {
      e.preventDefault();
      afficherOnglet(membersSection);
      chargerMembres();
    });
  }

  if (messagesTab) {
    messagesTab.addEventListener("click", e => {
      e.preventDefault();
      afficherOnglet(messagesSection);
      chargerMessages();
    });
  }

  // ✅ AJOUT : Écouteurs pour les nouveaux onglets
  if (experiencesTab) {
    experiencesTab.addEventListener("click", e => {
      e.preventDefault();
      afficherOnglet(experiencesSection);
      chargerExperiences();
    });
  }

  if (partnersTab) {
    partnersTab.addEventListener("click", e => {
      e.preventDefault();
      afficherOnglet(partnersSection);
      chargerPartenaires();
    });
  }

  // --- Actualités ---
  async function chargerActualites() {
    const newsList = document.getElementById("news-list");
    if (!newsList) {
      console.error("Élément news-list non trouvé");
      return;
    }
    
    newsList.innerHTML = "Chargement...";

    try {
      const res = await fetch("http://localhost:3000/api/news", {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const news = await res.json();

      if (!Array.isArray(news) || news.length === 0) {
        newsList.innerHTML = "<p>Aucune actualité disponible.</p>";
        return;
      }

      newsList.innerHTML = "";

      news.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("news-item");
        div.innerHTML = `
          <h3>${item.title}</h3>
          <p>${item.content}</p>
          <small>Publié le : ${new Date(item.createdAt).toLocaleDateString()}</small><br />
          <button class="btn-edit-news" data-id="${item._id || item.id}">Modifier</button>
          <button class="btn-delete-news" data-id="${item._id || item.id}">Supprimer</button>
        `;
        newsList.appendChild(div);
      });

      // Boutons modifier actualité
      document.querySelectorAll(".btn-edit-news").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          if (!id) return;
          
          try {
            const res = await fetch(`http://localhost:3000/api/news/${id}`, {
              credentials: "include",
              headers: getAuthHeaders(),
            });
            
            if (!res.ok) throw new Error("Erreur chargement actualité");
            const newsItem = await res.json();

            // Vérification que les éléments existent avant d'y accéder
            const newsIdElem = document.getElementById("news-id");
            const titleElem = document.getElementById("title");
            const contentElem = document.getElementById("content");
            const newsImageElem = document.getElementById("newsImage");
            const formTitleElem = document.getElementById("form-title");
            const newsFormContainer = document.getElementById("news-form-container");
            const overlay = document.getElementById("overlay");

            if (newsIdElem && titleElem && contentElem && newsImageElem && 
                formTitleElem && newsFormContainer && overlay) {
              newsIdElem.value = newsItem._id || newsItem.id || "";
              titleElem.value = newsItem.title || "";
              contentElem.value = newsItem.content || "";
              newsImageElem.value = "";

              formTitleElem.textContent = "Modifier une actualité";
              newsFormContainer.style.display = "block";
              overlay.style.display = "block";
            } else {
              console.error("Un ou plusieurs éléments du formulaire d'actualité sont manquants");
            }
          } catch {
            alert("Impossible de charger l'actualité.");
          }
        });
      });

      // Boutons supprimer actualité
      document.querySelectorAll(".btn-delete-news").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          if (!id) return;
          
          if (confirm("Confirmer la suppression de cette actualité ?")) {
            try {
              const res = await fetch(`http://localhost:3000/api/news/${id}`, {
                method: "DELETE",
                credentials: "include",
                headers: getAuthHeaders(),
              });
              
              if (!res.ok) throw new Error("Erreur suppression");
              alert("Actualité supprimée.");
              chargerActualites();
            } catch {
              alert("Impossible de supprimer l'actualité.");
            }
          }
        });
      });
    } catch (err) {
      newsList.innerHTML = "<p>Erreur de chargement des actualités.</p>";
      console.error(err);
    }
  }

  // Gestion formulaire actualités
  const newsForm = document.getElementById("news-form");
  if (newsForm) {
    newsForm.addEventListener("submit", async e => {
      e.preventDefault();

      // Vérification que les éléments existent
      const newsIdElem = document.getElementById("news-id");
      const titleElem = document.getElementById("title");
      const contentElem = document.getElementById("content");
      const imageInput = document.getElementById("newsImage");

      if (!newsIdElem || !titleElem || !contentElem || !imageInput) {
        console.error("Un ou plusieurs éléments du formulaire d'actualité sont manquants");
        alert("Erreur: Formulaire incomplet");
        return;
      }

      if (!titleElem || !contentElem) {
        alert("Les éléments du formulaire sont introuvables !");
        return;
      }
      
      const title = titleElem.value.trim();
      const content = contentElem.value.trim();
      
      if (!title || !content) {
        alert("Titre et contenu sont obligatoires.");
        return;
      }
      

      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (imageInput.files.length > 0) {
        // ✅ CORRECTION: Le champ s'appelle maintenant "image" pour correspondre à Multer
        formData.append("image", imageInput.files[0]);
      }

      try {
        const id = newsIdElem.value;
        const url = id ? `http://localhost:3000/api/news/${id}` : `http://localhost:3000/api/news`;
        const method = id ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
          credentials: "include",
          headers: getAuthHeaders(),
          body: formData,
        });
        
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Erreur: ${res.status} - ${text}`);
        }

        alert("Actualité enregistrée avec succès !");
        newsForm.reset();
        newsIdElem.value = "";
        
        const newsFormContainer = document.getElementById("news-form-container");
        const overlay = document.getElementById("overlay");
        
        if (newsFormContainer && overlay) {
          newsFormContainer.style.display = "none";
          overlay.style.display = "none";
        }

        chargerActualites();
      } catch (err) {
        alert("Erreur lors de l'enregistrement : " + err.message);
        console.error(err);
      }
    });
  } else {
    console.error("Formulaire d'actualité non trouvé");
  }

  // Annuler formulaire actualités
  const newsFormCancel = document.getElementById("news-form-cancel");
  if (newsFormCancel) {
    newsFormCancel.addEventListener("click", () => {
      const newsForm = document.getElementById("news-form");
      const newsIdElem = document.getElementById("news-id");
      const newsFormContainer = document.getElementById("news-form-container");
      const overlay = document.getElementById("overlay");
      
      if (newsForm && newsIdElem && newsFormContainer && overlay) {
        newsForm.reset();
        newsIdElem.value = "";
        newsFormContainer.style.display = "none";
        overlay.style.display = "none";
      }
    });
  }

  // Bouton "➕" pour ajouter une actualité
  const addNewsBtn = document.getElementById("add-news-btn");
  if (addNewsBtn) {
    addNewsBtn.addEventListener("click", () => {
      const newsForm = document.getElementById("news-form");
      const newsIdElem = document.getElementById("news-id");
      const formTitleElem = document.getElementById("form-title");
      const newsFormContainer = document.getElementById("news-form-container");
      const overlay = document.getElementById("overlay");
      
      if (newsForm && newsIdElem && formTitleElem && newsFormContainer && overlay) {
        newsForm.reset();
        newsIdElem.value = "";
        formTitleElem.textContent = "Ajouter une actualité";
        newsFormContainer.style.display = "block";
        overlay.style.display = "block";
      }
    });
  }
  
  // Fermer le formulaire en cliquant sur l'overlay
  const overlay = document.getElementById("overlay");
  if (overlay) {
    overlay.addEventListener("click", () => {
      const newsFormContainer = document.getElementById("news-form-container");
      const memberFormContainer = document.getElementById("member-form-container");
      
      if (newsFormContainer) newsFormContainer.style.display = "none";
      if (memberFormContainer) memberFormContainer.style.display = "none";
      overlay.style.display = "none";
    });
  }

  // --- Membres ---
 // Fonction pour récupérer les headers avec le token d'authentification
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (token) {
    return {
      "Authorization": "Bearer " + token
      // Pas de Content-Type ici, car on utilise FormData
    };
  }
  return {};
}

// --- Membres ---
const addMemberBtn = document.getElementById("add-member-btn");
const memberFormContainer = document.getElementById("member-form-container");
const memberForm = document.getElementById("member-form");

if (addMemberBtn && memberFormContainer) {
  addMemberBtn.addEventListener("click", () => {
    const memberForm = document.getElementById("member-form");
    const memberIdElem = document.getElementById("member-id");
    const memberFormTitle = document.getElementById("member-form-title");
    
    if (memberForm && memberIdElem && memberFormTitle) {
      memberForm.reset();
      memberIdElem.value = "";
      memberFormTitle.textContent = "Ajouter un membre";
      memberFormContainer.style.display = "block";
    }
  });
}

async function chargerMembres() {
  const membersList = document.getElementById("members-list");
  if (!membersList) {
    console.error("Élément members-list non trouvé");
    return;
  }
  
  membersList.innerHTML = "Chargement...";

  try {
    const res = await fetch("http://localhost:3000/api/members", {
      credentials: "include",
      headers: getAuthHeaders(),
    });
    
    if (!res.ok) throw new Error(`Erreur ${res.status}`);
    const members = await res.json();

    if (!Array.isArray(members) || members.length === 0) {
      membersList.innerHTML = "<p>Aucun membre disponible.</p>";
      return;
    }

    membersList.innerHTML = "";

    members.forEach(member => {
      const div = document.createElement("div");
      div.classList.add("member-item");

      const imgSrc = member.img ? `http://localhost:3000${member.img}` : "https://via.placeholder.com/150";

      div.innerHTML = `
        <h3>${member.name || "Nom inconnu"}</h3>
        <p><strong>Bio :</strong> ${member.bio || "Bio non disponible"}</p>
        <small><strong>Rôle :</strong> ${member.role || "Rôle non défini"}</small><br />
        <img src="${imgSrc}" alt="Photo de ${member.name || 'membre'}" width="150" /><br />
        <button class="btn-edit-member" data-id="${member._id || member.id}">Modifier</button>
        <button class="btn-delete-member" data-id="${member._id || member.id}">Supprimer</button>
      `;

      membersList.appendChild(div);
    });

    // Boutons modifier membre
    document.querySelectorAll(".btn-edit-member").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (!id) return;

        try {
          const res = await fetch(`http://localhost:3000/api/members/${id}`, {
            credentials: "include",
            headers: getAuthHeaders(),
          });
          
          if (!res.ok) throw new Error("Erreur chargement membre");
          const member = await res.json();

          // Vérification que les éléments existent
          const memberIdElem = document.getElementById("member-id");
          const memberNameElem = document.getElementById("member-name");
          const memberRoleElem = document.getElementById("member-role");
          const memberBioElem = document.getElementById("member-bio");
          const memberImgElem = document.getElementById("member-img");
          const memberFormTitle = document.getElementById("member-form-title");

          if (memberIdElem && memberNameElem && memberRoleElem && 
              memberBioElem && memberImgElem && memberFormTitle && memberFormContainer) {
            memberIdElem.value = member._id || member.id || "";
            memberNameElem.value = member.name || "";
            memberRoleElem.value = member.role || "";
            memberBioElem.value = member.bio || "";
            memberImgElem.value = "";

            memberFormTitle.textContent = "Modifier un membre";
            memberFormContainer.style.display = "block";
          } else {
            console.error("Un ou plusieurs éléments du formulaire de membre sont manquants");
          }
        } catch {
          alert("Impossible de charger les informations du membre.");
        }
      });
    });

    // Boutons supprimer membre
    document.querySelectorAll(".btn-delete-member").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (!id) return;
        
        if (confirm("Confirmer la suppression de ce membre ?")) {
          try {
            const res = await fetch(`http://localhost:3000/api/members/${id}`, {
              method: "DELETE",
              credentials: "include",
              headers: getAuthHeaders(),
            });
            
            if (!res.ok) throw new Error("Erreur suppression");
            alert("Membre supprimé.");
            chargerMembres();
          } catch {
            alert("Impossible de supprimer le membre.");
          }
        }
      });
    });

  } catch (err) {
    membersList.innerHTML = "<p>Erreur de chargement des membres.</p>";
    console.error(err);
  }
}

// Gestion formulaire membre (ajout/modif)
if (memberForm) {
  memberForm.addEventListener("submit", async e => {
    e.preventDefault();

    // Vérification que les éléments existent
    const memberIdElem = document.getElementById("member-id");
    const memberNameElem = document.getElementById("member-name");
    const memberRoleElem = document.getElementById("member-role");
    const memberBioElem = document.getElementById("member-bio");
    const imgInput = document.getElementById("member-img");

    if (!memberIdElem || !memberNameElem || !memberRoleElem || !memberBioElem || !imgInput) {
      console.error("Un ou plusieurs éléments du formulaire de membre sont manquants");
      alert("Erreur: Formulaire incomplet");
      return;
    }

    const id = memberIdElem.value;
    const name = memberNameElem.value.trim();
    const role = memberRoleElem.value.trim();
    const bio = memberBioElem.value.trim();

    if (!name || !role || !bio) {
      alert("Tous les champs sauf photo sont obligatoires.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("role", role);
    formData.append("bio", bio);
    if (imgInput.files.length > 0) {
      formData.append("image", imgInput.files[0]);
    }

    try {
      const url = id ? `http://localhost:3000/api/members/${id}` : `http://localhost:3000/api/members`;
      const method = id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erreur: ${res.status} - ${text}`);
      }

      alert("Membre enregistré avec succès !");
      memberForm.reset();
      memberIdElem.value = "";
      
      if (memberFormContainer) {
        memberFormContainer.style.display = "none";
      }
      
      chargerMembres();
    } catch (err) {
      alert("Erreur lors de l'enregistrement : " + err.message);
      console.error(err);
    }
  });
} else {
  console.error("Formulaire de membre non trouvé");
}

// Bouton annuler formulaire membre
const memberFormCancel = document.getElementById("member-form-cancel");
if (memberFormCancel && memberFormContainer) {
  memberFormCancel.addEventListener("click", () => {
    const memberForm = document.getElementById("member-form");
    const memberIdElem = document.getElementById("member-id");
    
    if (memberForm && memberIdElem) {
      memberForm.reset();
      memberIdElem.value = "";
      memberFormContainer.style.display = "none";
    }
  });
}

// Au chargement initial, charge les membres
chargerMembres();

  // --- Messages ---
  async function chargerMessages() {
    const messagesList = document.getElementById("messages-list");
    if (!messagesList) {
      console.error("Élément messages-list non trouvé");
      return;
    }
    
    messagesList.innerHTML = "Chargement...";

    try {
      const res = await fetch("http://localhost:3000/api/contact/all", {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const messages = await res.json();

      if (!Array.isArray(messages) || messages.length === 0) {
        messagesList.innerHTML = "<p>Aucun message reçu.</p>";
        return;
      }

      messagesList.innerHTML = "";

      messages.forEach(msg => {
        const div = document.createElement("div");
        div.classList.add("message-item");

        div.innerHTML = `
          <h3>Nom : ${msg.nom || "Non renseigné"}</h3>
          <p><strong>Email :</strong> ${msg.email || "Non renseigné"}</p>
          <p><strong>Téléphone :</strong> ${msg.telephone || "Non renseigné"}</p>
          <p><strong>Message :</strong> ${msg.message || "Message vide"}</p>
          ${msg.fichier ? `<p><button class="voir-fichier-btn" data-fichier="${msg.fichier}">📎 Voir le fichier</button></p>` : ""}
          <p><button class="repondre-btn" data-email="${msg.email}" data-tel="${msg.telephone}">✉️ Répondre</button></p>
        `;

        messagesList.appendChild(div);
      });

      attachFichierButtons();
      attachReplyButtons();

    } catch (err) {
      messagesList.innerHTML = "<p>Erreur de chargement des messages.</p>";
      console.error(err);
    }
  }

  // --- Gestion boutons voir fichier ---
  function attachFichierButtons() {
    document.querySelectorAll(".voir-fichier-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const fichier = btn.dataset.fichier;
        if (fichier) {
          window.location.href = `voir-fichier.html?fichier=${encodeURIComponent(fichier)}`;
        }
      });
    });
  }

  // --- Gestion boutons répondre ---
  function attachReplyButtons() {
    document.querySelectorAll(".repondre-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const email = btn.dataset.email;
        const tel = btn.dataset.tel;

        if (!email && !tel) {
          alert("Aucune information de contact disponible.");
          return;
        }

        const choix = prompt(
          `Comment souhaitez-vous répondre ?\n\n` +
          `${email ? `1 - Par Email (${email})\n` : ""}` +
          `${tel ? `2 - Par SMS (${tel})\n` : ""}` +
          `\nEntrez 1 ou 2 :`
        );

        if (choix === "1" && email) {
          window.location.href = `mailto:${email}?subject=Réponse à votre message&body=Bonjour,`;
        } else if (choix === "2" && tel) {
          window.location.href = `sms:${tel}`;
        } else {
          alert("Choix invalide ou contact manquant.");
        }
      });
    });
  }

  

    // ✅ Fonctions utilitaires
    function getAuthHeaders() {
      const token = Cookies.get("token");
      return {
        Authorization: `Bearer ${token}`,
      };
    }
  
    /* ==========================
       🎯 GESTION DES EXPÉRIENCES
    ========================== */
  
    async function chargerExperiences() {
      const container = document.querySelector(".experiences-container");
      if (!container) return;
  
      container.innerHTML = "Chargement...";
  
      try {
        const res = await fetch("http://localhost:3000/api/experiences", {
          credentials: "include",
          headers: getAuthHeaders(),
        });
  
        if (!res.ok) throw new Error("Erreur chargement expériences");
  
        const experiences = await res.json();
        container.innerHTML = "";
  
        if (!Array.isArray(experiences) || experiences.length === 0) {
          container.innerHTML = "<p>Aucune expérience disponible.</p>";
          return;
        }
  
        experiences.forEach(exp => {
          const div = document.createElement("div");
          div.classList.add("experience-item");
  
          const imgSrc = exp.image ? `http://localhost:3000${exp.image}` : "https://via.placeholder.com/300x200";
  
          div.innerHTML = `
            <h3>${exp.title}</h3>
            <p>${exp.description}</p>
            <img src="${imgSrc}" alt="Image expérience" width="300" />
            <button class="btn-edit-experience" data-id="${exp._id}">Modifier</button>
            <button class="btn-delete-experience" data-id="${exp._id}">Supprimer</button>
          `;
  
          container.appendChild(div);
        });
  
        // Gestion modifier
        document.querySelectorAll(".btn-edit-experience").forEach(btn => {
          btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            const res = await fetch(`http://localhost:3000/api/experiences/${id}`, {
              credentials: "include",
              headers: getAuthHeaders(),
            });
  
            if (!res.ok) {
              alert("Erreur lors de la récupération de l'expérience");
              return;
            }
  
            const exp = await res.json();
            document.getElementById("experience-id").value = exp._id;
            document.getElementById("experience-title").value = exp.title;
            document.getElementById("experience-description").value = exp.description;
            document.getElementById("experience-form").style.display = "block";
          });
        });
  
        // Gestion suppression
        document.querySelectorAll(".btn-delete-experience").forEach(btn => {
          btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            if (confirm("Confirmer suppression ?")) {
              const res = await fetch(`http://localhost:3000/api/experiences/${id}`, {
                method: "DELETE",
                credentials: "include",
                headers: getAuthHeaders(),
              });
              if (res.ok) {
                chargerExperiences();
              } else {
                alert("Erreur lors de la suppression");
              }
            }
          });
        });
  
      } catch (err) {
        container.innerHTML = "<p>Erreur de chargement.</p>";
        console.error(err);
      }
    }
  
    // 🎯 Envoi du formulaire expérience
    const expForm = document.getElementById("experience-form");
    if (expForm) {
      expForm.addEventListener("submit", async e => {
        e.preventDefault();
  
        const id = document.getElementById("experience-id").value;
        const title = document.getElementById("experience-title").value;
        const description = document.getElementById("experience-description").value;
        const img = document.getElementById("experience-image");
  
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        if (img.files.length > 0) formData.append("image", img.files[0]);
  
        const url = id
          ? `http://localhost:3000/api/experiences/${id}`
          : `http://localhost:3000/api/experiences`;
  
        const method = id ? "PUT" : "POST";
  
        try {
          const res = await fetch(url, {
            method,
            credentials: "include",
            headers: getAuthHeaders(),
            body: formData,
          });
  
          if (res.ok) {
            expForm.reset();
            document.getElementById("experience-id").value = "";
            expForm.style.display = "none";
            chargerExperiences();
          } else {
            alert("Erreur lors de l'enregistrement");
          }
        } catch {
          alert("Erreur réseau");
        }
      });
    }
  
    // Bouton annuler expérience
    document.getElementById("experience-form-cancel").addEventListener("click", () => {
      expForm.reset();
      expForm.style.display = "none";
    });
  
    // Bouton ajouter expérience
    const addExpBtn = document.getElementById("add-experience-btn");
    if (addExpBtn) {
      addExpBtn.addEventListener("click", () => {
        document.getElementById("experience-id").value = "";
        document.getElementById("experience-title").value = "";
        document.getElementById("experience-description").value = "";
        document.getElementById("experience-image").value = "";
        expForm.style.display = "block";
      });
    }
  
    /* ==========================
       🎯 GESTION DES PARTENAIRES
    ========================== */
  
   

    async function chargerPartenaires() {
      const container = document.querySelector(".partners-container");
      if (!container) return;
    
      container.innerHTML = "Chargement...";
    
      try {
        const res = await fetch("http://localhost:3000/api/partners", {
          credentials: "include",
          headers: getAuthHeaders(),
        });
    
        if (!res.ok) throw new Error("Erreur chargement partenaires");
    
        const partners = await res.json();
        container.innerHTML = "";
    
        if (!Array.isArray(partners) || partners.length === 0) {
          container.innerHTML = "<p>Aucun partenaire disponible.</p>";
          return;
        }
    
        partners.forEach(partner => {
          const div = document.createElement("div");
          div.classList.add("partner-item");
    
          const imgSrc = partner.logo
            ? `http://localhost:3000${partner.logo}`
            : "https://via.placeholder.com/150";
    
          div.innerHTML = `
            <h3>${partner.name}</h3>
            <img src="${imgSrc}" alt="Logo partenaire" width="150" />
            <button class="btn-edit-partner" data-id="${partner._id}">Modifier</button>
            <button class="btn-delete-partner" data-id="${partner._id}">Supprimer</button>
          `;
    
          container.appendChild(div);
        });
    
        // Modifier
        document.querySelectorAll(".btn-edit-partner").forEach(btn => {
          btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            const res = await fetch(`http://localhost:3000/api/partners/${id}`, {
              credentials: "include",
              headers: getAuthHeaders(),
            });
    
            if (!res.ok) {
              alert("Erreur lors de la récupération du partenaire");
              return;
            }
    
            const partner = await res.json();
            document.getElementById("partner-id").value = partner._id;
            document.getElementById("partner-name").value = partner.name;
            document.getElementById("partner-form").style.display = "block";
          });
        });
    
        // Supprimer
        document.querySelectorAll(".btn-delete-partner").forEach(btn => {
          btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            if (confirm("Supprimer ce partenaire ?")) {
              const res = await fetch(`http://localhost:3000/api/partners/${id}`, {
                method: "DELETE",
                credentials: "include",
                headers: getAuthHeaders(),
              });
              if (res.ok) {
                chargerPartenaires();
              } else {
                alert("Erreur lors de la suppression");
              }
            }
          });
        });
    
      } catch (err) {
        container.innerHTML = "<p>Erreur de chargement.</p>";
        console.error(err);
      }
    }
    
    // 🎯 Formulaire partenaires
    const partnerForm = document.getElementById("partner-form");
    if (partnerForm) {
      partnerForm.addEventListener("submit", async e => {
        e.preventDefault();
    
        const id = document.getElementById("partner-id").value;
        const name = document.getElementById("partner-name").value;
        const logo = document.getElementById("partner-logo");
    
        const formData = new FormData();
        formData.append("name", name);
        if (logo.files.length > 0) {
          formData.append("logo", logo.files[0]); // Clé correcte : "logo"
        }
    
        const url = id
          ? `http://localhost:3000/api/partners/${id}`
          : `http://localhost:3000/api/partners`;
    
        const method = id ? "PUT" : "POST";
    
        try {
          const res = await fetch(url, {
            method,
            credentials: "include",
            headers: getAuthHeaders(),
            body: formData,
          });
    
          if (res.ok) {
            partnerForm.reset();
            document.getElementById("partner-id").value = "";
            partnerForm.style.display = "none";
            chargerPartenaires();
          } else {
            alert("Erreur lors de l'enregistrement");
          }
        } catch {
          alert("Erreur réseau");
        }
      });
    }
    
    // Bouton annuler partenaire
    document.getElementById("partner-form-cancel").addEventListener("click", () => {
      partnerForm.reset();
      partnerForm.style.display = "none";
    });
    
    // Bouton ajouter partenaire
    const addPartnerBtn = document.getElementById("add-partner-btn");
    if (addPartnerBtn) {
      addPartnerBtn.addEventListener("click", () => {
        document.getElementById("partner-id").value = "";
        document.getElementById("partner-name").value = "";
        document.getElementById("partner-logo").value = "";
        partnerForm.style.display = "block";
      });
    }
    
    // Lancer le chargement initial
    chargerPartenaires();
})    