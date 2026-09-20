const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const context=vm.createContext({module:{exports:{}}});
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../js/calculators.js'),'utf8'),context);
const c=Object.fromEntries(Object.entries(context.module.exports).map(([key,fn])=>[key,(...args)=>JSON.parse(JSON.stringify(fn(...args)))]));
const near=(a,b)=>assert(Math.abs(a-b)<0.000001,`${a} != ${b}`);
test('savings goals, already met goals, and zero target',()=>{
  near(c.savings(5000,500,12).monthly,375);
  assert.equal(c.savings(100,150,12).remaining,0);
  assert.equal(c.savings(0,0,12).percent,100);
});
test('budget separates spending and savings, including zero income and deficit',()=>{
  assert.deepEqual(c.budget(1500,[500,200,100,100,50,100],150),{spent:1050,allocated:1200,remaining:300});
  assert.equal(c.budget(0,[100],50).remaining,-150);
});
test('compound interest agrees with closed-form annuity and zero rate',()=>{
  const r=.05/12, months=120;
  const expected=1000*(1+r)**months+100*((1+r)**months-1)/r;
  near(c.growth(1000,100,5,months).balance,expected);
  assert.equal(c.growth(1000,100,0,12).balance,2200);
  near(c.growth(1000,100,12,1).balance,1110);
  assert.equal(c.growth(0,0,5,13).schedule.length,2);
});
test('loan example, zero interest, tiny rate, and amortization balance',()=>{
  near(c.loan(100000,4,360).payment,477.4152954654538);
  const result=c.loan(1200,0,12);
  assert.equal(result.payment,100);assert.equal(result.interest,0);
  const loan=c.loan(10000,6,36);
  near(loan.schedule.reduce((s,r)=>s+r.principal,0),10000);
  near(loan.schedule.reduce((s,r)=>s+r.interest,0),loan.interest);
  assert.equal(loan.schedule.at(-1).balance,0);
  near(c.loan(1200,1e-10,12).payment,100);
});
test('manual conversions and rejected inputs',()=>{
  assert.equal(c.convert(100,1400),140000);
  assert.equal(c.convert(0,1),0);
  for(const action of [()=>c.savings(100,0,0),()=>c.savings(100,0,1.5),()=>c.loan(10,101,12),()=>c.growth(-1,100,5,12),()=>c.convert(100,0),()=>c.convert(Infinity,1),()=>c.budget(100,[NaN],0)])assert.throws(action);
});
