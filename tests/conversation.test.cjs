const {test}=require('node:test');
const assert=require('node:assert/strict');
const {mode,entities,ConversationEngine}=require('../conversation-engine.js');

test('negations and hypothetical requests never become actions',()=>{
  for(const text of ['no cambiar swrap a 180','no quiero que cambies swrap a 180',"don't set swrap to 180"]){assert.equal(mode(text),'negated',text);}
  for(const text of ['¿y si pongo S-Wrap a 175?','what if I change swrap to 180'])assert.equal(mode(text),'simulation',text);
  assert.equal(mode('¿cómo guardar proceso?'),'query');
  assert.equal(mode('cambia swrap a 180'),'action');
  assert.equal(mode('guardar proceso'),'training');
});
test('entities preserve labels, decimal commas and units',()=>{
  assert.deepEqual(entities('Secondary 8,5 Primary 100 W2 515 W1 520 10 minutos'),{primaryRPM:100,secondaryRPM:8.5,w1:520,w2:515,minutes:10});
  assert.deepEqual(entities('530 lb 7000 ft mandrel 51'),{weight:530,length:7000,mandrel:51});
});
test('memory survives reload and stays isolated by line and demo',()=>{
  const data=new Map(),storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
  const a=new ConversationEngine(storage);
  a.remember('real::line1','estado linea 2',{message:'Line 2',explanation:'Measured data'},2);
  const b=new ConversationEngine(storage);
  assert.equal(b.session('real::line1').line,2);
  assert.equal(b.session('real::line2').lastAnswer,null);
  assert.equal(b.session('demo::line1').lastAnswer,null);
  b.remember('real::line1','por que',{message:'explanation',dialogueTransient:true},2);
  assert.equal(b.session('real::line1').lastAnswer.message,'Line 2');
});
test('corrupt storage does not break dialogue',()=>{
  const engine=new ConversationEngine({getItem:()=>'{bad',setItem:()=>{throw Error('quota');}});
  assert.equal(engine.session('real::line1').topic,null);
  assert.doesNotThrow(()=>engine.remember('real::line1','hola',{message:'Hola'},1));
});
