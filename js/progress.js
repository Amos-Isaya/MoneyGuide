// All progress rules live here so a future Flask API can replace browser storage.
const MoneyGuideProgress = (() => {
  const KEY = 'moneyguide.learning.v1';
  let fault = false;
  let data = { version: 1, modules: {}, lastModule: null };
  function blankModule() {
    return { started: false, lessons: [], checks: [], cards: [], summary: false, answers: [], question: 0, lastResult: null, bestScore: null, certificate: null };
  }
  function contentDone(progress) {
    return progress.lessons.length === 3 && progress.checks.length === 3 && progress.cards.length === 10 && progress.summary;
  }
  function completed(progress) { return contentDone(progress) && progress.bestScore >= 8; }
  function validIndices(value, maximum) {
    return Array.isArray(value) ? [...new Set(value.filter(index => Number.isInteger(index) && index >= 0 && index < maximum))] : [];
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.version !== 1 || !saved.modules || typeof saved.modules !== 'object') throw new Error('Invalid learning data');
      const modules = {};
      MoneyGuideModules.forEach(module => {
        const item = saved.modules[module.id];
        if (!item || typeof item !== 'object') return;
        const progress = Object.assign(blankModule(), {
          started: item.started === true,
          lessons: validIndices(item.lessons, 3), checks: validIndices(item.checks, 3), cards: validIndices(item.cards, 10),
          summary: item.summary === true,
          question: Number.isInteger(item.question) && item.question >= 0 && item.question < 10 ? item.question : 0,
          answers: Array.isArray(item.answers) ? Array.from({ length: 10 }, (_, i) => Number.isInteger(item.answers[i]) && item.answers[i] >= 0 && item.answers[i] < module.assessment[i].options.length ? item.answers[i] : null) : [],
          bestScore: Number.isInteger(item.bestScore) && item.bestScore >= 0 && item.bestScore <= 10 ? item.bestScore : null
        });
        if (item.lastResult && Array.isArray(item.lastResult.answers) && item.lastResult.answers.length === 10 && item.lastResult.answers.every((a,i) => Number.isInteger(a) && a >= 0 && a < module.assessment[i].options.length)) {
          progress.lastResult = { answers: item.lastResult.answers, score: score(module, item.lastResult.answers) };
        }
        if (completed(progress) && item.certificate && typeof item.certificate.id === 'string' && typeof item.certificate.name === 'string' && Number.isFinite(Date.parse(item.certificate.date)) && Number.isInteger(item.certificate.score) && item.certificate.score >= 8 && item.certificate.score <= 10) {
          progress.certificate = item.certificate;
        }
        modules[module.id] = progress;
      });
      data = { version: 1, modules, lastModule: MoneyGuideModules.some(m => m.id === saved.lastModule) ? saved.lastModule : null };
      fault = false;
    } catch (error) { fault = true; }
  }
  function score(module, answers) { return module.assessment.reduce((total, question, i) => total + (answers[i] === question.answer ? 1 : 0), 0); }
  function get(id) { return data.modules[id] || blankModule(); }
  function totals() {
    let xp = 0, finished = 0, certificates = 0, activities = 0;
    MoneyGuideModules.forEach(module => {
      const p = get(module.id);
      xp += p.lessons.length * 10 + p.checks.length * 5 + p.cards.length * 2;
      if (p.bestScore >= 8) xp += 50;
      if (completed(p)) { xp += 50; finished++; }
      if (p.certificate) certificates++;
      activities += p.lessons.length + p.checks.length + p.cards.length + (p.summary ? 1 : 0) + (p.bestScore >= 8 ? 1 : 0);
    });
    const thresholds = [0, 300, 650, 1000, 1400];
    const level = thresholds.filter(threshold => xp >= threshold).length;
    return { xp, level, finished, certificates, percent: Math.round(activities / 180 * 100) };
  }
  function transact(id, name, change) {
    if (fault) throw new Error('damagedStorage');
    const previous = JSON.stringify(data);
    try {
      // Read the latest saved version first, so another open tab's progress is preserved.
      load();
      if (fault) throw new Error('damagedStorage');
      const p = data.modules[id] || blankModule();
      change(p);
      if (completed(p) && !p.certificate) {
        const unique = globalThis.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
        p.certificate = { id: 'MG-' + String(id).padStart(2, '0') + '-' + unique, name, date: new Date().toISOString(), score: p.bestScore };
      }
      data.modules[id] = p;
      const total = totals();
      data.xp = total.xp;
      data.level = total.level;
      localStorage.setItem(KEY, JSON.stringify(data));
      document.dispatchEvent(new Event('progresschange'));
      return p;
    } catch (error) {
      data = JSON.parse(previous);
      throw error;
    }
  }
  function addOnce(list, value) { if (!list.includes(value)) list.push(value); }
  load();
  return {
    get, totals, contentDone, completed, score, load,
    get fault() { return fault; }, get lastModule() { return data.lastModule; },
    start(id, name) { return transact(id, name, p => { p.started = true; data.lastModule = id; }); },
    lesson(id, index, name) { return transact(id, name, p => addOnce(p.lessons, index)); },
    check(id, index, name) { return transact(id, name, p => addOnce(p.checks, index)); },
    card(id, index, name) { return transact(id, name, p => addOnce(p.cards, index)); },
    summary(id, name) { return transact(id, name, p => { p.summary = true; }); },
    answer(id, index, value, name) { return transact(id, name, p => { p.answers[index] = value; p.question = index; }); },
    position(id, index, name) { return transact(id, name, p => { p.question = index; }); },
    submit(id, name) {
      const module = MoneyGuideModules.find(m => m.id === id);
      return transact(id, name, p => {
        if (!Array.from({length:10}, (_, i) => p.answers[i]).every((answer, i) => Number.isInteger(answer) && answer >= 0 && answer < module.assessment[i].options.length)) throw new Error('unanswered');
        const result = score(module, p.answers);
        p.lastResult = { score: result, answers: [...p.answers] };
        p.bestScore = Math.max(p.bestScore || 0, result);
      });
    },
    retake(id, name) { return transact(id, name, p => { p.answers = []; p.question = 0; p.lastResult = null; }); }
  };
})();
