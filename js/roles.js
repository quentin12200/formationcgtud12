document.addEventListener('DOMContentLoaded', function() {
  // Éléments DOM
  const roleCards = document.querySelectorAll('.role-card');
  const revealAllBtn = document.getElementById('reveal-all-btn');
  const hideAllBtn = document.getElementById('hide-all-btn');
  const explorationModeBtn = document.getElementById('exploration-mode');
  const quizModeBtn = document.getElementById('quiz-mode');
  const rolesGrid = document.querySelector('.roles-grid');
  const quizContainer = document.querySelector('.quiz-container');
  const quizText = document.getElementById('quiz-text');
  const quizOptions = document.getElementById('quiz-options');
  const quizCheckBtn = document.getElementById('quiz-check');
  const quizNextBtn = document.getElementById('quiz-next');
  const quizFeedback = document.getElementById('quiz-feedback');
  const quizTitle = document.getElementById('quiz-title');

  // Questions du quiz
  const quizQuestions = [
    {
      question: "Qui représente le syndicat auprès des employeurs et des institutions ?",
      options: ["Le Secrétaire Général", "Le Trésorier", "Le Délégué Syndical", "L'adhérent"],
      correctAnswer: 0
    },
    {
      question: "Qui est responsable de la gestion des finances du syndicat ?",
      options: ["Le Secrétaire Général", "Le Trésorier", "La Commission Exécutive", "Le Bureau Syndical"],
      correctAnswer: 1
    },
    {
      question: "Quel organe dirige le syndicat entre deux congrès ?",
      options: ["Le Bureau Syndical", "Le Secrétaire Général", "La Commission Exécutive", "L'Assemblée Générale"],
      correctAnswer: 2
    },
    {
      question: "Qui négocie les accords collectifs avec l'employeur ?",
      options: ["Le Représentant de Proximité", "L'élu au CSE", "Le Secrétaire à l'Organisation", "Le Délégué Syndical"],
      correctAnswer: 3
    },
    {
      question: "Quelle est la principale fonction du Bureau Syndical ?",
      options: ["Prendre les décisions politiques", "Assurer la gestion quotidienne du syndicat", "Collecter les cotisations", "Représenter le syndicat auprès des institutions"],
      correctAnswer: 1
    },
    {
      question: "Qui est chargé de suivre l'évolution des adhésions et la syndicalisation ?",
      options: ["Le Secrétaire à l'Organisation", "Le Trésorier", "Le Délégué Syndical", "Le Secrétaire Général"],
      correctAnswer: 0
    },
    {
      question: "Quel est le rôle principal d'un élu au CSE ?",
      options: ["Négocier les accords collectifs", "Gérer les finances du syndicat", "Présenter les réclamations des salariés à l'employeur", "Diriger le syndicat"],
      correctAnswer: 2
    },
    {
      question: "Qui fait le lien entre les salariés et les élus du CSE au niveau local ?",
      options: ["Le Secrétaire Général", "Le Délégué Syndical", "Le Représentant de Proximité", "L'adhérent"],
      correctAnswer: 2
    }
  ];

  let currentQuizQuestion = 0;
  let selectedOption = null;

  // Gestion des cartes de rôle
  roleCards.forEach(card => {
    const revealBtn = card.querySelector('.reveal-btn');
    const hideBtn = card.querySelector('.hide-btn');

    revealBtn.addEventListener('click', () => {
      card.classList.add('flipped');
    });

    hideBtn.addEventListener('click', () => {
      card.classList.remove('flipped');
    });
  });

  // Révéler toutes les cartes
  revealAllBtn.addEventListener('click', () => {
    roleCards.forEach(card => {
      card.classList.add('flipped');
    });
  });

  // Masquer toutes les cartes
  hideAllBtn.addEventListener('click', () => {
    roleCards.forEach(card => {
      card.classList.remove('flipped');
    });
  });

  // Changement de mode
  explorationModeBtn.addEventListener('click', () => {
    explorationModeBtn.classList.add('active');
    quizModeBtn.classList.remove('active');
    rolesGrid.style.display = 'grid';
    quizContainer.style.display = 'none';
  });

  quizModeBtn.addEventListener('click', () => {
    quizModeBtn.classList.add('active');
    explorationModeBtn.classList.remove('active');
    rolesGrid.style.display = 'none';
    quizContainer.style.display = 'block';
    startQuiz();
  });

  // Fonctions du quiz
  function startQuiz() {
    currentQuizQuestion = 0;
    showQuestion(currentQuizQuestion);
  }

  function showQuestion(index) {
    const question = quizQuestions[index];
    quizTitle.textContent = `Question ${index + 1}/${quizQuestions.length}`;
    quizText.textContent = question.question;
    quizOptions.innerHTML = '';
    selectedOption = null;
    
    question.options.forEach((option, i) => {
      const optionElement = document.createElement('div');
      optionElement.classList.add('quiz-option');
      optionElement.dataset.index = i;
      optionElement.textContent = option;
      
      optionElement.addEventListener('click', () => {
        // Désélectionner toutes les options
        document.querySelectorAll('.quiz-option').forEach(opt => {
          opt.classList.remove('selected');
        });
        
        // Sélectionner l'option cliquée
        optionElement.classList.add('selected');
        selectedOption = i;
      });
      
      quizOptions.appendChild(optionElement);
    });
    
    quizCheckBtn.disabled = false;
    quizNextBtn.disabled = true;
    quizFeedback.style.display = 'none';
    quizFeedback.textContent = '';
    quizFeedback.classList.remove('correct', 'incorrect');
  }

  quizCheckBtn.addEventListener('click', () => {
    if (selectedOption === null) {
      alert('Veuillez sélectionner une réponse');
      return;
    }
    
    const correctAnswer = quizQuestions[currentQuizQuestion].correctAnswer;
    const options = document.querySelectorAll('.quiz-option');
    
    options.forEach(option => {
      const index = parseInt(option.dataset.index);
      
      if (index === correctAnswer) {
        option.classList.add('correct');
      } else if (index === selectedOption) {
        option.classList.add('incorrect');
      }
    });
    
    if (selectedOption === correctAnswer) {
      quizFeedback.textContent = 'Bonne réponse ! 👍';
      quizFeedback.classList.add('correct');
    } else {
      quizFeedback.textContent = 'Réponse incorrecte. La bonne réponse est : ' + 
        quizQuestions[currentQuizQuestion].options[correctAnswer];
      quizFeedback.classList.add('incorrect');
    }
    
    quizFeedback.style.display = 'block';
    quizCheckBtn.disabled = true;
    quizNextBtn.disabled = false;
  });

  quizNextBtn.addEventListener('click', () => {
    currentQuizQuestion++;
    
    if (currentQuizQuestion < quizQuestions.length) {
      showQuestion(currentQuizQuestion);
    } else {
      // Quiz terminé
      quizText.textContent = 'Quiz terminé ! Vous pouvez revenir au mode exploration ou recommencer.';
      quizOptions.innerHTML = '';
      quizCheckBtn.disabled = true;
      quizNextBtn.disabled = true;
      quizFeedback.style.display = 'none';
      quizTitle.textContent = 'Félicitations !';
      
      // Ajouter un bouton pour recommencer
      const restartBtn = document.createElement('button');
      restartBtn.textContent = 'Recommencer le quiz';
      restartBtn.classList.add('quiz-restart');
      restartBtn.addEventListener('click', startQuiz);
      quizOptions.appendChild(restartBtn);
    }
  });

  // Animation au chargement de la page
  setTimeout(() => {
    document.querySelectorAll('.role-card').forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }, 300);
});
