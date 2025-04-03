/**
 * Formation CGT - Script principal
 * Gère la navigation entre les slides, la table des matières et les fonctionnalités d'impression
 */

// Variables globales
let current = 0;
let slides;
let totalSlides;
let modal;
let resourcesModal;
let glossaryModal;
let themeToggle;
let themeIcon;
let darkMode = localStorage.getItem('darkMode') === 'true';

// Initialisation
document.addEventListener("DOMContentLoaded", function() {
  // Initialiser les éléments DOM qui pourraient ne pas être chargés
  modal = document.getElementById("pdf-modal");
  resourcesModal = document.getElementById("resources-modal");
  glossaryModal = document.getElementById("glossary-modal");
  slides = document.querySelectorAll(".slide");
  totalSlides = slides.length;
  themeToggle = document.getElementById("checkbox");
  themeIcon = document.querySelector(".theme-icon");
  
  // Afficher la première slide au chargement
  showSlide(current);
  
  // Ajouter les écouteurs d'événements pour les touches de navigation
  document.addEventListener("keydown", handleKeyNavigation);
  
  // Configurer le modal d'impression
  setupPrintModal();
  
  // Configurer le modal des ressources
  setupResourcesModal();
  
  // Configurer le modal du glossaire
  setupGlossaryModal();
  
  // Vérifier si un hash existe dans l'URL pour la navigation directe
  checkUrlHash();
  
  // Configurer les boutons de sommaire
  const tocBtns = document.querySelectorAll('.toc-button');
  tocBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      toggleTOC();
    });
  });
  
  const closeTocBtn = document.getElementById('close-toc');
  if (closeTocBtn) {
    closeTocBtn.addEventListener('click', function() {
      const tocElement = document.getElementById('table-of-contents');
      const tocOverlay = document.getElementById('toc-overlay');
      if (tocElement) {
        tocElement.classList.remove('active');
        if (tocOverlay) {
          tocOverlay.classList.remove('active');
        }
      }
    });
  }
  
  // Gérer les clics sur les liens du sommaire
  document.querySelectorAll('.toc-link').forEach(link => {
    link.addEventListener('click', function(e) {
      // Ne pas prévenir le comportement par défaut pour les liens externes (vers d'autres pages)
      if (this.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const slideIndex = parseInt(this.getAttribute('data-slide'));
        if (!isNaN(slideIndex)) {
          showSlide(slideIndex);
          const tocElement = document.getElementById('table-of-contents');
          const tocOverlay = document.getElementById('toc-overlay');
          if (tocElement) {
            tocElement.classList.remove("active"); // Fermer le sommaire après avoir cliqué sur un lien
            if (tocOverlay) {
              tocOverlay.classList.remove("active"); // Fermer également l'overlay
            }
          }
        }
      } else {
        // Pour les liens externes, laisser le comportement par défaut (navigation vers une autre page)
        // Fermer quand même la table des matières
        const tocElement = document.getElementById('table-of-contents');
        const tocOverlay = document.getElementById('toc-overlay');
        if (tocElement) {
          tocElement.classList.remove("active");
          if (tocOverlay) {
            tocOverlay.classList.remove("active");
          }
        }
      }
    });
  });
  
  // Ajouter un gestionnaire pour fermer la TOC quand on appuie sur Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const tocElement = document.getElementById('table-of-contents');
      if (tocElement && tocElement.classList.contains('active')) {
        tocElement.classList.remove('active');
        const tocOverlay = document.getElementById('toc-overlay');
        if (tocOverlay) {
          tocOverlay.classList.remove('active');
        }
      }
    }
  });
  
  // Ajouter un gestionnaire pour fermer la TOC quand on clique ailleurs
  document.addEventListener('click', function(e) {
    // Si la TOC est ouverte et qu'on clique en dehors de la TOC
    const tocElement = document.getElementById('table-of-contents');
    if (tocElement && 
        tocElement.classList.contains('active') && 
        !tocElement.contains(e.target) && 
        !e.target.classList.contains('toc-button')) {
      tocElement.classList.remove('active');
      const tocOverlay = document.getElementById('toc-overlay');
      if (tocOverlay) {
        tocOverlay.classList.remove('active');
      }
    }
  });
  
  // Configurer le bouton de sommaire dans la barre de navigation
  const tocBtn = document.getElementById("toc-btn");
  if (tocBtn) {
    tocBtn.addEventListener("click", toggleTOC);
  }
  
  // Configurer le sélecteur de thème
  setupThemeToggle();
  
  // Configurer la navigation par numéro de slide
  setupSlideJump();
  
  // Restaurer les heures sauvegardées
  restoreSavedTimes();
});

/**
 * Affiche la slide spécifiée par l'index
 * @param {number} index - L'index de la slide à afficher
 */
function showSlide(index) {
  // Vérifier que l'index est valide
  if (index < 0) index = 0;
  if (index >= totalSlides) index = totalSlides - 1;
  
  // Mettre à jour l'index courant
  current = index;
  
  // Masquer toutes les slides et afficher celle demandée
  slides.forEach((sec, i) => {
    sec.classList.toggle("active", i === index);
  });
  
  // Mettre à jour l'URL avec l'ID de la slide
  window.location.hash = "slide-" + index;
  
  // Mettre à jour l'état des boutons de navigation
  updateNavigationButtons();
  
  // Mettre à jour l'indicateur de progression
  updateProgressBar();
  
  // Mettre à jour le compteur de slides
  updateSlideCounter();
  
  // Mettre à jour la barre de progression en haut
  updateTopProgressBar();
}

/**
 * Met à jour l'indicateur de progression
 */
function updateProgressBar() {
  const progressIndicator = document.getElementById("progress-indicator");
  if (progressIndicator) {
    const progressPercentage = ((current + 1) / totalSlides) * 100;
    progressIndicator.style.width = progressPercentage + "%";
  }
}

/**
 * Met à jour le compteur de slides
 */
function updateSlideCounter() {
  const currentSlideElement = document.getElementById("current-slide");
  const totalSlidesElement = document.getElementById("total-slides");
  
  if (currentSlideElement && totalSlidesElement) {
    currentSlideElement.textContent = current + 1;
    totalSlidesElement.textContent = totalSlides;
  }
}

/**
 * Met à jour la barre de progression en haut
 */
function updateTopProgressBar() {
  const topProgressIndicator = document.getElementById("top-progress-indicator");
  const currentSlideElement = document.getElementById("current-slide");
  const totalSlidesElement = document.getElementById("total-slides");
  
  if (topProgressIndicator) {
    const progressPercentage = ((current + 1) / totalSlides) * 100;
    topProgressIndicator.style.width = progressPercentage + "%";
  }
  
  if (currentSlideElement && totalSlidesElement) {
    currentSlideElement.textContent = current + 1;
    totalSlidesElement.textContent = totalSlides;
  }
}

/**
 * Passe à la slide suivante
 */
function next() {
  if (current < totalSlides - 1) {
    showSlide(current + 1);
  }
}

/**
 * Passe à la slide précédente
 */
function prev() {
  if (current > 0) {
    showSlide(current - 1);
  }
}

/**
 * Met à jour l'état des boutons de navigation
 */
function updateNavigationButtons() {
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  
  // Désactiver le bouton précédent si on est sur la première slide
  if (prevBtn) {
    prevBtn.disabled = current === 0;
    prevBtn.style.opacity = current === 0 ? "0.5" : "1";
  }
  
  // Désactiver le bouton suivant si on est sur la dernière slide
  if (nextBtn) {
    nextBtn.disabled = current === totalSlides - 1;
    nextBtn.style.opacity = current === totalSlides - 1 ? "0.5" : "1";
  }
}

/**
 * Calcule l'heure de fin en fonction de l'heure de début
 * @param {number} index - L'index de la slide
 */
function calcEnd(index) {
  const input = document.getElementById("startHour" + index);
  const out = document.getElementById("end-time" + index);
  
  if (!input || !input.value) return;
  
  const [h, m] = input.value.split(":").map(Number);
  const date = new Date();
  date.setHours(h);
  date.setMinutes(m + 45); // Durée standard de 45 minutes
  
  const formatted = date.toTimeString().substring(0, 5);
  out.textContent = formatted;
  
  // Sauvegarder l'heure dans le localStorage pour la retrouver à la prochaine visite
  localStorage.setItem("startHour" + index, input.value);
}

/**
 * Affiche ou masque la table des matières
 */
function toggleTOC() {
  // Utiliser les ID spécifiques pour cibler les éléments
  const tocElement = document.getElementById('table-of-contents');
  const tocOverlay = document.getElementById('toc-overlay');
  
  if (tocElement) {
    tocElement.classList.toggle("active");
    
    // Gérer l'overlay
    if (tocOverlay) {
      tocOverlay.classList.toggle("active", tocElement.classList.contains("active"));
      
      // Ajouter un gestionnaire de clic sur l'overlay pour fermer la TOC
      if (tocElement.classList.contains("active")) {
        tocOverlay.onclick = function() {
          tocElement.classList.remove("active");
          tocOverlay.classList.remove("active");
        };
      }
    }
    
    // Ajouter un gestionnaire pour la touche Escape
    if (tocElement.classList.contains("active")) {
      document.addEventListener('keydown', function closeTOCOnEscape(e) {
        if (e.key === "Escape") {
          tocElement.classList.remove("active");
          tocOverlay.classList.remove("active");
          document.removeEventListener('keydown', closeTOCOnEscape);
        }
      });
    }
  }
}

/**
 * Gère la navigation par clavier
 * @param {KeyboardEvent} e - L'événement clavier
 */
function handleKeyNavigation(e) {
  // Flèche droite ou Espace pour avancer
  if (e.key === "ArrowRight" || e.key === " ") {
    next();
    e.preventDefault();
  }
  
  // Flèche gauche pour reculer
  else if (e.key === "ArrowLeft") {
    prev();
    e.preventDefault();
  }
  
  // Échap pour fermer la table des matières ou le modal
  else if (e.key === "Escape") {
    const tocElement = document.getElementById('table-of-contents');
    if (tocElement.classList.contains("active")) {
      tocElement.classList.remove("active");
      const tocOverlay = document.getElementById('toc-overlay');
      if (tocOverlay) {
        tocOverlay.classList.remove("active");
      }
    }
    if (modal.style.display === "block") {
      closeModal();
    }
    if (glossaryModal.style.display === "block") {
      glossaryModal.classList.remove("show");
      setTimeout(() => {
        glossaryModal.style.display = "none";
      }, 300);
    }
  }
}

/**
 * Vérifie si un hash existe dans l'URL pour la navigation directe
 */
function checkUrlHash() {
  const hash = window.location.hash;
  if (hash) {
    const slideId = hash.substring(1); // Enlever le #
    const slideIndex = parseInt(slideId.split("-")[1]);
    
    if (!isNaN(slideIndex) && slideIndex >= 0 && slideIndex < totalSlides) {
      showSlide(slideIndex);
    }
  }
}

/**
 * Configure le modal d'impression
 */
function setupPrintModal() {
  const closeBtn = document.querySelector(".close-modal");
  const printBtn = document.getElementById("print-btn");
  
  // Fermer le modal au clic sur la croix
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }
  
  // Imprimer au clic sur le bouton
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
      closeModal();
    });
  }
  
  // Fermer le modal au clic en dehors
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}

/**
 * Ferme le modal
 */
function closeModal() {
  modal.style.display = "none";
}

/**
 * Ouvre le modal d'impression pour une slide spécifique
 * @param {string} slideId - L'ID de la slide à imprimer
 */
function printSlide(slideId) {
  // Afficher le modal
  modal.style.display = "block";
  
  // Stocker l'ID de la slide à imprimer
  localStorage.setItem("printSlideId", slideId);
}

/**
 * Restaure les heures de début sauvegardées
 */
function restoreSavedTimes() {
  for (let i = 0; i < totalSlides; i++) {
    const savedTime = localStorage.getItem("startHour" + i);
    if (savedTime) {
      const input = document.getElementById("startHour" + i);
      if (input) {
        input.value = savedTime;
        calcEnd(i);
      }
    }
  }
}

/**
 * Configure le sélecteur de thème
 */
function setupThemeToggle() {
  // Vérifier si le thème est déjà enregistré dans localStorage
  const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
  
  // Si un thème est enregistré, l'appliquer
  if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Si le thème est sombre, cocher la case
    if (currentTheme === 'dark') {
      themeToggle.checked = true;
      themeIcon.textContent = '☀️';
    }
  }
  
  // Ajouter un écouteur d'événements pour le changement de thème
  if (themeToggle) {
    themeToggle.addEventListener('change', function(e) {
      if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeIcon.textContent = '☀️';
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        themeIcon.textContent = '🌙';
      }
    });
  }
}

/**
 * Configure la navigation par numéro de slide
 */
function setupSlideJump() {
  const jumpBtn = document.getElementById("jump-btn");
  const slideNumberInput = document.getElementById("slide-number");
  
  if (jumpBtn && slideNumberInput) {
    // Gestionnaire pour le bouton "Aller"
    jumpBtn.addEventListener("click", function() {
      jumpToSlide();
    });
    
    // Gestionnaire pour la touche Entrée dans l'input
    slideNumberInput.addEventListener("keypress", function(e) {
      if (e.key === "Enter") {
        jumpToSlide();
      }
    });
  }
}

/**
 * Navigue vers la slide spécifiée par l'input
 */
function jumpToSlide() {
  const slideNumberInput = document.getElementById("slide-number");
  const slideNumber = parseInt(slideNumberInput.value);
  
  if (!isNaN(slideNumber) && slideNumber >= 1 && slideNumber <= totalSlides) {
    showSlide(slideNumber - 1); // Ajuster pour l'index 0-based
    slideNumberInput.value = ""; // Réinitialiser l'input
  } else {
    // Afficher un message d'erreur ou une animation
    slideNumberInput.classList.add("error");
    setTimeout(() => {
      slideNumberInput.classList.remove("error");
    }, 500);
  }
}

/**
 * Configure le modal des ressources
 */
function setupResourcesModal() {
  const resourcesBtn = document.getElementById("resources-btn");
  const closeResourcesBtn = document.getElementById("close-resources");
  
  if (resourcesBtn && resourcesModal) {
    resourcesBtn.addEventListener("click", function() {
      resourcesModal.style.display = "block";
    });
  }
  
  if (closeResourcesBtn && resourcesModal) {
    closeResourcesBtn.addEventListener("click", function() {
      resourcesModal.style.display = "none";
    });
  }
  
  // Fermer le modal si on clique en dehors du contenu
  window.addEventListener("click", function(e) {
    if (e.target === resourcesModal) {
      resourcesModal.style.display = "none";
    }
  });
  
  // Ajouter un gestionnaire pour la touche Escape
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && resourcesModal.style.display === "block") {
      resourcesModal.style.display = "none";
    }
  });
}

/**
 * Configure le modal du glossaire
 */
function setupGlossaryModal() {
  const glossaryBtn = document.getElementById("glossary-btn");
  const closeGlossaryBtn = document.getElementById("close-glossary");
  const glossaryModal = document.getElementById("glossary-modal");
  const searchInput = document.getElementById("glossary-search");
  const glossaryItems = document.querySelectorAll(".glossary-item");
  const glossaryTerms = document.querySelectorAll(".glossary-term");
  const alphabetLetters = document.querySelectorAll(".letter");
  
  // Ouvrir le modal
  glossaryBtn.addEventListener("click", function() {
    glossaryModal.style.display = "block";
    glossaryModal.classList.add("show");
    searchInput.focus();
  });
  
  // Fermer le modal avec le bouton
  closeGlossaryBtn.addEventListener("click", function() {
    glossaryModal.classList.remove("show");
    setTimeout(() => {
      glossaryModal.style.display = "none";
    }, 300);
  });
  
  // Fermer le modal en cliquant en dehors
  window.addEventListener("click", function(event) {
    if (event.target === glossaryModal) {
      glossaryModal.classList.remove("show");
      setTimeout(() => {
        glossaryModal.style.display = "none";
      }, 300);
    }
  });
  
  // Fermer le modal avec la touche Escape
  document.addEventListener("keydown", function(event) {
    if (event.key === "Escape" && glossaryModal.style.display === "block") {
      glossaryModal.classList.remove("show");
      setTimeout(() => {
        glossaryModal.style.display = "none";
      }, 300);
    }
  });
  
  // Fonction de recherche
  searchInput.addEventListener("input", function() {
    const searchTerm = this.value.toLowerCase();
    
    // Réinitialiser le filtre alphabétique
    alphabetLetters.forEach(letter => letter.classList.remove("active"));
    document.querySelector('.letter[data-letter="all"]').classList.add("active");
    
    glossaryItems.forEach(item => {
      const termText = item.textContent.toLowerCase();
      
      if (termText.includes(searchTerm)) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
  });
  
  // Filtrage alphabétique
  alphabetLetters.forEach(letter => {
    letter.addEventListener("click", function() {
      const selectedLetter = this.getAttribute("data-letter");
      
      // Réinitialiser la recherche
      searchInput.value = "";
      
      // Mettre à jour la classe active
      alphabetLetters.forEach(l => l.classList.remove("active"));
      this.classList.add("active");
      
      // Filtrer les termes
      glossaryItems.forEach(item => {
        if (selectedLetter === "all") {
          item.style.display = "block";
        } else {
          const itemLetter = item.getAttribute("data-letter");
          item.style.display = itemLetter === selectedLetter ? "block" : "none";
        }
      });
    });
  });
  
  // Ouvrir/fermer les termes au clic
  glossaryTerms.forEach(term => {
    term.addEventListener("click", function() {
      this.classList.toggle("active");
    });
  });
}

// Restaurer les heures sauvegardées au chargement
window.addEventListener("load", restoreSavedTimes);
