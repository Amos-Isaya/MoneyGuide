import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sorting,scams,events,reserve,budgetScore,shuffled,validRecord} from '../js/game-data.js';
test('every scenario has valid choices and explanatory feedback',()=>{
 for(const cards of [sorting,scams])for(const card of cards){assert(card.title && card.text && card.why);assert(Number.isInteger(card.answer));assert(card.answer>=0 && card.answer<(card.options?.length || 2));}
 assert.equal(sorting.length,8);assert.equal(scams.length,6);assert.equal(events.length,3);
});
test('all allowed budgets conserve credits and an achievable route reaches the savings goal',()=>{
 for(let food=100;food<=250;food+=10)for(let fun=0;fun<=300;fun+=10){const balance=reserve(food,fun);assert(balance>=0);assert.equal(balance+450+food+fun,1000);}
 let balance=reserve(150,100),points=0;
 for(const event of events){const choice=event.options[0];balance-=choice.cost;points+=choice.points;}
 assert.equal(balance,150);assert.equal(budgetScore(balance,points),100);
 assert.equal(budgetScore(-400,0),0);assert.equal(budgetScore(0,3),60);assert.equal(budgetScore(1000,3),100);
});
test('shuffle preserves all unique questions without changing source data',()=>{
 const before=JSON.stringify(scams);const result=shuffled(scams,()=>0);
 assert.equal(JSON.stringify(scams),before);assert.equal(new Set(result).size,scams.length);assert.notDeepEqual(result,scams);
});
test('invalid saved scores are rejected',()=>{
 assert(validRecord({best:100,plays:2}));
 for(const value of [null,{}, {best:101,plays:2},{best:-1,plays:1},{best:10,plays:'2'},{best:10,plays:Infinity}])assert(!validRecord(value));
});
