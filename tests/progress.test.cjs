// Run with: node tests/progress.test.cjs (no dependencies required).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
function setup(saved = {}) {
  const values = { ...saved };
  const context = vm.createContext({ crypto, Event: class {}, document: { dispatchEvent() {} }, localStorage: {
    getItem(key) { return values[key] || null; },
    setItem(key, value) { if (context.blocked) throw new Error('Storage blocked'); values[key] = value; }
  }});
  for (const file of ['modules.js', 'progress.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', file), 'utf8'), context);
  return { context, values, store: vm.runInContext('MoneyGuideProgress', context), modules: vm.runInContext('MoneyGuideModules', context) };
}
function content(store, id) {
  for (let i = 0; i < 3; i++) { store.lesson(id, i, 'Alex'); store.check(id, i, 'Alex'); }
  for (let i = 0; i < 10; i++) store.card(id, i, 'Alex');
  store.summary(id, 'Alex');
}
function assessment(store, module, correct) {
  module.assessment.forEach((q, index) => store.answer(module.id, index, index < correct ? q.answer : (q.answer + 1) % q.options.length, 'Alex'));
  store.submit(module.id, 'Alex');
}
test('all ten modules have substantive lessons, ten cards, ten valid questions', () => {
  const { modules } = setup();
  assert.equal(modules.length, 10);
  const prompts = new Set();
  modules.forEach((m,i) => {
    assert.equal(m.id, i + 1); assert.equal(m.lessons.length, 3); assert.equal(m.vocabulary.length, 10); assert.equal(m.assessment.length, 10);
    assert(m.introduction.length > 100 && m.summary.length > 100);
    m.lessons.forEach(l => { assert(l.paragraphs.join(' ').length > 200); assert(l.example.length > 60); assert(l.takeaway.length > 30); });
    m.assessment.forEach(q => { assert(q.options[q.answer]); assert(q.explanation.length > 5); assert(!prompts.has(q.prompt)); prompts.add(q.prompt); });
  });
});
test('7/10 fails; 8/10 passes; completion requires all content; XP is awarded once', () => {
  const { store, modules } = setup();
  store.start(1, 'Alex'); assessment(store, modules[0], 7);
  assert.equal(store.get(1).bestScore, 7); assert.equal(store.get(1).certificate, null);
  store.retake(1, 'Alex'); assessment(store, modules[0], 8);
  assert.equal(store.get(1).bestScore, 8); assert.equal(store.get(1).certificate, null);
  content(store, 1);
  assert(store.get(1).certificate); assert.equal(store.get(1).certificate.score, 8);
  assert.equal(store.totals().xp, 165);
  const certificate = JSON.stringify(store.get(1).certificate);
  content(store, 1); store.retake(1, 'Alex'); assessment(store, modules[0], 10);
  assert.equal(store.totals().xp, 165); assert.equal(JSON.stringify(store.get(1).certificate), certificate);
  store.retake(1, 'Alex'); assessment(store, modules[0], 0);
  assert.equal(store.get(1).bestScore, 10); assert.equal(store.totals().finished, 1);
});
test('all ten complete independently; persistence restores 1650 XP and level 5', () => {
  const { store, modules, values } = setup();
  modules.slice().reverse().forEach(m => { store.start(m.id, 'Alex'); content(store, m.id); assessment(store, m, 10); });
  const loaded = setup(values).store;
  assert.equal(loaded.totals().xp, 1650); assert.equal(loaded.totals().level, 5);
  assert.equal(loaded.totals().percent, 100); assert.equal(loaded.totals().certificates, 10);
  assert.equal(new Set(modules.map(m => loaded.get(m.id).certificate.id)).size, 10);
});
test('unanswered assessment cannot pass and blocked writes roll back', () => {
  const { store, context } = setup();
  assert.throws(() => store.submit(1, 'Alex'), /unanswered/);
  context.blocked = true;
  assert.throws(() => store.lesson(1, 0, 'Alex'));
  assert.equal(store.totals().xp, 0);
});
test('damaged data is retained without overwriting it', () => {
  const { store, values } = setup({ 'moneyguide.learning.v1': '{broken' });
  assert.equal(store.fault, true); assert.throws(() => store.start(1, 'Alex'), /damagedStorage/);
  assert.equal(values['moneyguide.learning.v1'], '{broken');
});
test('sequential changes from separate tabs preserve prior activities', () => {
  const first = setup(); first.store.lesson(2, 0, 'Alex');
  const second = setup(first.values); second.store.card(2, 0, 'Alex');
  first.values['moneyguide.learning.v1'] = second.values['moneyguide.learning.v1'];
  first.store.check(2, 0, 'Alex');
  assert.equal(first.store.get(2).lessons.length, 1); assert.equal(first.store.get(2).cards.length, 1); assert.equal(first.store.get(2).checks.length, 1);
});
