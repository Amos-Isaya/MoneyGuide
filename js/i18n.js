// Stable keys keep interface translations separate from lesson content and currency.
const MoneyGuideI18n = (() => {
  const words = {
    dashboard: ['Dashboard','Panel','Tableau de bord'], language: ['Language','Idioma','Langue'],
    overview: ['Learning overview','Resumen de aprendizaje','Vue d’ensemble'], workspace: ['YOUR WORKSPACE','TU ESPACIO','VOTRE ESPACE'],
    welcome: ['Welcome back, {name}','Hola de nuevo, {name}','Bon retour, {name}'],
    welcomeSub: ['A little learning today. More confidence for tomorrow.','Aprende un poco hoy. Gana confianza para mañana.','Apprenez un peu aujourd’hui. Gagnez en confiance pour demain.'],
    journey: ['YOUR MONEY JOURNEY','TU CAMINO FINANCIERO','VOTRE PARCOURS FINANCIER'],
    modules: ['Learning Modules','Módulos de aprendizaje','Modules d’apprentissage'],
    module: ['Module','Módulo','Module'], start: ['Start Module','Empezar módulo','Commencer le module'],
    resume: ['Continue Learning','Continuar aprendiendo','Continuer à apprendre'], review: ['Review Module','Repasar módulo','Revoir le module'],
    notStarted: ['Not Started','Sin empezar','Non commencé'], inProgress: ['In Progress','En curso','En cours'],
    completed: ['Completed','Completado','Terminé'], earned: ['Certificate Earned','Certificado obtenido','Certificat obtenu'],
    path: ['Recommended Learning Path','Ruta de aprendizaje recomendada','Parcours recommandé'],
    pathNote: ['Follow Modules 1–10 to build your foundation, or start anywhere. Every module is open.','Sigue los módulos 1–10 o empieza donde quieras. Todos están disponibles.','Suivez les modules 1 à 10 ou commencez où vous voulez. Tous sont accessibles.'],
    next: ['Recommended Next Module','Siguiente módulo recomendado','Prochain module recommandé'],
    allDone: ['You completed all ten modules. Keep your knowledge fresh with a review.','Completaste los diez módulos. Repasa para mantener tus conocimientos.','Vous avez terminé les dix modules. Révisez pour entretenir vos connaissances.'],
    progress: ['Financial Learning Progress','Progreso de aprendizaje financiero','Progression de l’apprentissage financier'],
    overall: ['Overall Learning Progress','Progreso general','Progression globale'],
    modulesCompleted: ['Modules Completed','Módulos completados','Modules terminés'],
    certificatesEarned: ['Certificates Earned','Certificados obtenidos','Certificats obtenus'],
    level: ['Level','Nivel','Niveau'], xp: ['XP earned','XP ganados','XP gagnés'],
    level1: ['Money Starter','Principiante financiero','Débutant financier'], level2: ['Money Explorer','Explorador financiero','Explorateur financier'],
    level3: ['Money Builder','Constructor financiero','Bâtisseur financier'], level4: ['Money Strategist','Estratega financiero','Stratège financier'], level5: ['Money Master','Experto financiero','Maître financier'],
    goal: ['YOUR NORTH STAR','TU META','VOTRE OBJECTIF'], currency: ['Preferred currency','Moneda preferida','Devise préférée'],
    certificates: ['Certificates','Certificados','Certificats'], noCertificates: ['Your first milestone is ahead. Complete the learning content and pass an assessment to earn a certificate.','Completa el contenido y aprueba una evaluación para obtener tu primer certificado.','Terminez le contenu et réussissez une évaluation pour obtenir votre premier certificat.'],
    viewCertificate: ['View Certificate','Ver certificado','Voir le certificat'],
    explore: ['More ways to build your confidence','Más formas de ganar confianza','D’autres façons de gagner en confiance'],
    games: ['Games / Challenges','Juegos / Desafíos','Jeux / Défis'], tools: ['Financial Tools','Herramientas financieras','Outils financiers'], currencyTools: ['Currency Tools','Herramientas de divisas','Outils de devises'], soon: ['Coming Soon','Próximamente','Bientôt'],
    gamesNote: ['Practice everyday decisions through future challenges.','Practica decisiones cotidianas con futuros desafíos.','Entraînez-vous aux décisions quotidiennes avec de futurs défis.'],
    toolsNote: ['Budgeting and planning tools are on the roadmap.','Las herramientas de presupuesto y planificación están previstas.','Des outils de budget et de planification sont prévus.'],
    currencyNote: ['Your currency is saved. Exchange tools are coming later.','Tu moneda está guardada. Las herramientas de cambio llegarán más adelante.','Votre devise est enregistrée. Les outils de change viendront plus tard.'],
    flashcards: ['Flashcards','Tarjetas de estudio','Cartes mémoire'], flashcardNote: ['Revisit 100 key concepts across your ten modules.','Repasa 100 conceptos en tus diez módulos.','Révisez 100 notions dans vos dix modules.'],
    chooseModule: ['Choose a module','Elige un módulo','Choisir un module'], openCards: ['Review Flashcards','Repasar tarjetas','Réviser les cartes'],
    localNote: ['Saved in this browser · Learn at your own pace','Guardado en este navegador · Aprende a tu ritmo','Enregistré dans ce navigateur · Apprenez à votre rythme'],
    back: ['Back to dashboard','Volver al panel','Retour au tableau de bord'],
    lessonLanguage: ['Lessons, examples, and questions are in English in this version. Interface language and currency are independent.','Las lecciones, ejemplos y preguntas están en inglés en esta versión. El idioma y la moneda son independientes.','Les leçons, exemples et questions sont en anglais dans cette version. La langue et la devise sont indépendantes.'],
    exampleNote: ['Examples use fictional money units, not currency conversions. Local rules and product terms vary.','Los ejemplos usan unidades monetarias ficticias, no conversiones. Las reglas locales y las condiciones varían.','Les exemples utilisent des unités monétaires fictives, sans conversion. Les règles locales et les conditions varient.'],
    objectives: ['What you’ll learn','Qué aprenderás','Ce que vous apprendrez'], lessons: ['Lessons','Lecciones','Leçons'],
    example: ['IN EVERYDAY LIFE','EN LA VIDA COTIDIANA','DANS LA VIE QUOTIDIENNE'], takeaway: ['Key Takeaway','Idea clave','À retenir'],
    markLesson: ['Mark lesson complete','Marcar lección completada','Marquer la leçon terminée'], lessonDone: ['Lesson completed','Lección completada','Leçon terminée'],
    check: ['Knowledge Check','Comprobación de conocimientos','Vérification des connaissances'], checkAnswer: ['Check answer','Comprobar respuesta','Vérifier la réponse'],
    correct: ['Correct.','Correcto.','Correct.'], tryAgain: ['Not quite. Review the explanation and try again.','Todavía no. Revisa la explicación e inténtalo de nuevo.','Pas tout à fait. Relisez l’explication et réessayez.'],
    selectAnswer: ['Choose an answer first.','Elige una respuesta primero.','Choisissez d’abord une réponse.'],
    vocabulary: ['Important vocabulary','Vocabulario importante','Vocabulaire important'],
    flip: ['Flip card','Voltear tarjeta','Retourner la carte'], previous: ['Previous','Anterior','Précédent'], nextButton: ['Next','Siguiente','Suivant'],
    cardCount: ['Card {current} of {total}','Tarjeta {current} de {total}','Carte {current} sur {total}'],
    cardsReviewed: ['{count} of 10 cards reviewed','{count} de 10 tarjetas repasadas','{count} cartes révisées sur 10'],
    cardsInstruction: ['Flip each card to reveal its meaning. Reviewing all ten completes this activity.','Voltea cada tarjeta para ver su significado. Repasa las diez para completar esta actividad.','Retournez chaque carte pour lire sa définition. Révisez les dix pour terminer cette activité.'],
    summary: ['Final Summary','Resumen final','Résumé final'], finishContent: ['Mark summary read','Marcar resumen leído','Marquer le résumé comme lu'], summaryDone: ['Summary read','Resumen leído','Résumé lu'],
    requirements: ['For a certificate: complete all 3 lessons, answer all 3 checks correctly, review all 10 cards, read the summary, and score at least 8/10.','Para obtener un certificado: completa las 3 lecciones, responde bien las 3 comprobaciones, repasa las 10 tarjetas, lee el resumen y consigue al menos 8/10.','Pour obtenir un certificat : terminez les 3 leçons, réussissez les 3 vérifications, révisez les 10 cartes, lisez le résumé et obtenez au moins 8/10.'],
    assessment: ['Final Assessment','Evaluación final','Évaluation finale'], assessmentNote: ['10 questions · Pass with 8/10 · Unlimited retakes','10 preguntas · Aprueba con 8/10 · Intentos ilimitados','10 questions · Réussite à 8/10 · Tentatives illimitées'],
    startTest: ['Start Assessment','Empezar evaluación','Commencer l’évaluation'], continueTest: ['Continue Assessment','Continuar evaluación','Continuer l’évaluation'],
    questionCount: ['Question {current} of 10','Pregunta {current} de 10','Question {current} sur 10'], submit: ['Submit Assessment','Enviar evaluación','Valider l’évaluation'],
    unanswered: ['Answer all ten questions before submitting.','Responde las diez preguntas antes de enviar.','Répondez aux dix questions avant de valider.'],
    passed: ['PASS — well done!','APROBADO — ¡bien hecho!','RÉUSSI — bravo !'], notPassed: ['NOT YET PASSED','TODAVÍA NO APROBADO','PAS ENCORE RÉUSSI'],
    encouragement: ['You’re building understanding. Review the explanations, revisit a lesson, and try again whenever you’re ready.','Estás aprendiendo. Revisa las explicaciones y las lecciones e inténtalo de nuevo cuando quieras.','Vous progressez. Relisez les explications et les leçons, puis réessayez quand vous le souhaitez.'],
    remaining: ['Assessment passed. Finish the remaining learning activities to earn your certificate.','Evaluación aprobada. Completa las actividades pendientes para obtener tu certificado.','Évaluation réussie. Terminez les activités restantes pour obtenir votre certificat.'],
    retake: ['Retake Assessment','Repetir evaluación','Repasser l’évaluation'], score: ['Assessment score','Puntuación','Résultat de l’évaluation'], best: ['Best score','Mejor puntuación','Meilleur résultat'],
    yourAnswer: ['Your answer','Tu respuesta','Votre réponse'], answer: ['Correct answer','Respuesta correcta','Bonne réponse'],
    certificateTitle: ['Certificate of Completion','Certificado de finalización','Certificat de réussite'],
    certifies: ['This certifies that','Se certifica que','Ce document certifie que'],
    hasCompleted: ['has successfully completed','ha completado satisfactoriamente','a terminé avec succès'],
    completionDate: ['Completion date','Fecha de finalización','Date de réussite'], certificateId: ['Certificate ID','ID del certificado','Identifiant du certificat'],
    issuedBy: ['Financial Literacy Learning Platform','Plataforma de educación financiera','Plateforme d’éducation financière'],
    print: ['Print Certificate','Imprimir certificado','Imprimer le certificat'], savePdf: ['Download / Save as PDF','Descargar / Guardar como PDF','Télécharger / Enregistrer en PDF'],
    pdfHelp: ['The print dialog opens. Choose “Save as PDF” as the destination to download a copy.','Se abrirá el diálogo de impresión. Elige «Guardar como PDF» como destino.','La fenêtre d’impression s’ouvre. Choisissez «Enregistrer au format PDF» comme destination.'],
    certificateMissing: ['This certificate has not been earned yet. Complete the module activities and pass its assessment first.','Todavía no has obtenido este certificado. Completa las actividades y aprueba la evaluación.','Ce certificat n’a pas encore été obtenu. Terminez les activités et réussissez l’évaluation.'],
    certificateNote: ['A MoneyGuide learning milestone · Not an accredited qualification','Un logro de aprendizaje de MoneyGuide · No es un título acreditado','Une étape d’apprentissage MoneyGuide · Pas un diplôme accrédité'],
    sources: ['Further reading','Lecturas adicionales','Pour aller plus loin'], invalidModule: ['Module not found. Choose a module from your dashboard.','Módulo no encontrado. Elige uno desde tu panel.','Module introuvable. Choisissez un module dans votre tableau de bord.'],
    storageError: ['Your browser could not save this change. Allow site storage or free space, then retry. Your previously saved progress has not been intentionally cleared.','El navegador no pudo guardar el cambio. Permite el almacenamiento o libera espacio y vuelve a intentarlo. No hemos borrado tu progreso anterior.','Le navigateur n’a pas pu enregistrer ce changement. Autorisez le stockage ou libérez de l’espace, puis réessayez. Votre progression précédente n’a pas été effacée.'],
    damagedStorage: ['Saved learning data could not be read. It has been left untouched. Contact your project developer to recover it before continuing.','No se pudieron leer los datos guardados. Se han conservado. Contacta al desarrollador para recuperarlos.','Les données enregistrées sont illisibles. Elles ont été conservées. Contactez le développeur pour les récupérer.'],
    startLearning: ['Start Learning','Empezar a aprender','Commencer à apprendre'], how: ['How it works','Cómo funciona','Comment ça marche'],
    onboardingTitle: ['Your journey starts with you.','Tu camino empieza contigo.','Votre parcours commence avec vous.'],
    onboardingSub: ['A few details to help you feel right at home.','Unos detalles para personalizar tu experiencia.','Quelques détails pour personnaliser votre expérience.'],
    firstName: ['First name','Nombre','Prénom'], primaryGoal: ['Primary financial goal','Meta financiera principal','Objectif financier principal'], knowledge: ['Financial knowledge level','Nivel de conocimientos financieros','Niveau de connaissances financières'],
    beginJourney: ['Start My Learning Journey','Comenzar mi aprendizaje','Commencer mon parcours'], localProfile: ['Your answers are saved only in this browser.','Tus respuestas se guardan solo en este navegador.','Vos réponses sont enregistrées uniquement dans ce navigateur.'],
    nameRequired: ['Please enter your first name.','Escribe tu nombre.','Veuillez saisir votre prénom.'],
    chooseCurrency: ['Choose your currency','Elige tu moneda','Choisissez votre devise'], chooseGoal: ['What would you like to work on?','¿Qué te gustaría mejorar?','Que souhaitez-vous améliorer ?'], chooseLevel: ['Choose your starting point','Elige tu punto de partida','Choisissez votre niveau'],
    beginner: ['Beginner','Principiante','Débutant'], intermediate: ['Intermediate','Intermedio','Intermédiaire'],
    goal0: ['Manage my money better','Administrar mejor mi dinero','Mieux gérer mon argent'], goal1: ['Start saving','Empezar a ahorrar','Commencer à épargner'], goal2: ['Build credit','Construir mi historial crediticio','Construire mon historique de crédit'], goal3: ['Buy a car','Comprar un coche','Acheter une voiture'], goal4: ['Manage college expenses','Gestionar gastos universitarios','Gérer les dépenses étudiantes'], goal5: ['Learn about investing','Aprender sobre inversiones','Découvrir l’investissement'],
    close: ['Close','Cerrar','Fermer'], reviewed: ['Reviewed','Repasada','Révisée'], contentProgress: ['Learning activities','Actividades de aprendizaje','Activités d’apprentissage']
  };
  const titles = {
    en: ['Money Fundamentals','Budgeting','Saving & Emergency Funds','Banking','Credit & Credit Scores','Debt & Loans','Investing Basics','Taxes & Income','Insurance & Financial Protection','Financial Planning & Wealth Building'],
    es: ['Fundamentos del dinero','Presupuesto','Ahorro y fondo de emergencia','Servicios bancarios','Crédito y puntuaciones crediticias','Deudas y préstamos','Fundamentos de inversión','Impuestos e ingresos','Seguros y protección financiera','Planificación financiera y creación de patrimonio'],
    fr: ['Les bases de l’argent','Budget','Épargne et fonds d’urgence','Services bancaires','Crédit et scores de crédit','Dettes et prêts','Les bases de l’investissement','Impôts et revenus','Assurance et protection financière','Planification financière et constitution de patrimoine']
  };
  let language = 'en';
  try { const saved = localStorage.getItem('moneyguide.language'); if (titles[saved]) language = saved; } catch (error) { /* English remains usable if storage is blocked. */ }
  function t(key, values = {}) {
    let result = words[key] ? words[key][['en','es','fr'].indexOf(language)] : key;
    Object.keys(values).forEach(name => { result = result.replaceAll('{' + name + '}', String(values[name])); });
    return result;
  }
  function apply() {
    document.documentElement.lang = language;
    document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
    document.querySelectorAll('[data-language]').forEach(select => { select.value = language; });
    document.querySelectorAll('[data-close]').forEach(button => { button.setAttribute('aria-label', t('close')); });
  }
  function setLanguage(value) {
    if (!titles[value]) return;
    localStorage.setItem('moneyguide.language', value);
    language = value;
    apply();
    document.dispatchEvent(new Event('languagechange'));
  }
  document.addEventListener('DOMContentLoaded', () => {
    apply();
    document.querySelectorAll('[data-language]').forEach(select => {
      select.addEventListener('change', () => {
        try { setLanguage(select.value); } catch (error) { select.value = language; window.alert(t('storageError')); }
      });
    });
  });
  return { t, apply, setLanguage, title: id => titles[language][id - 1], get language() { return language; } };
})();
