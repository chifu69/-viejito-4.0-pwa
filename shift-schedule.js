/* Industrial IA 5.34.6 — Fixed A/B/C/D Rotation Schedule
   Plant rotation from the supplied 2019 calendar. The AB/CD assignment repeats every 14 days.
   A/C are day shifts (07:00–19:00). B/D are night shifts (19:00–07:00 next day).
   From midnight through 06:59, the active night shift belongs to the PREVIOUS calendar day's pair.
*/
(function(root){
  'use strict';

  const DAY_START_HOUR=7;
  const NIGHT_START_HOUR=19;
  const ANCHOR_DAY=new Date(2019,0,1,12,0,0,0); // Jan 1, 2019 = CD from the plant calendar.
  const ROTATION=Object.freeze(['CD','AB','AB','CD','CD','CD','AB','AB','CD','CD','AB','AB','AB','CD']);

  function startOfLocalDay(value){
    const d=value instanceof Date?new Date(value):new Date(value);
    if(Number.isNaN(d.getTime()))return null;
    return new Date(d.getFullYear(),d.getMonth(),d.getDate(),12,0,0,0);
  }
  function dayKey(value){
    const d=value instanceof Date?value:new Date(value);
    if(Number.isNaN(d.getTime()))return '';
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  function addDays(value,days){
    const d=value instanceof Date?new Date(value):new Date(value);
    d.setDate(d.getDate()+Number(days||0));
    return d;
  }
  function assignmentForDate(value){
    const d=startOfLocalDay(value);if(!d)return null;
    const anchor=startOfLocalDay(ANCHOR_DAY);
    const days=Math.round((d-anchor)/86400000);
    const idx=((days%ROTATION.length)+ROTATION.length)%ROTATION.length;
    return ROTATION[idx];
  }
  function shiftAt(value=new Date()){
    const now=value instanceof Date?new Date(value):new Date(value);
    if(Number.isNaN(now.getTime()))return null;
    const hour=now.getHours();
    const preSeven=hour<DAY_START_HOUR;
    const workDate=preSeven?addDays(now,-1):new Date(now);
    const pair=assignmentForDate(workDate);
    const isDay=!preSeven&&hour<NIGHT_START_HOUR;
    const code=pair==='AB'?(isDay?'A':'B'):(isDay?'C':'D');
    const type=isDay?'day':'night';
    const start=new Date(workDate.getFullYear(),workDate.getMonth(),workDate.getDate(),isDay?DAY_START_HOUR:NIGHT_START_HOUR,0,0,0);
    const end=isDay
      ?new Date(workDate.getFullYear(),workDate.getMonth(),workDate.getDate(),NIGHT_START_HOUR,0,0,0)
      :new Date(workDate.getFullYear(),workDate.getMonth(),workDate.getDate()+1,DAY_START_HOUR,0,0,0);
    return {code,pair,type,workDate:dayKey(workDate),start:start.toISOString(),end:end.toISOString()};
  }
  function shiftForTimestamp(value){return shiftAt(value)?.code||null;}
  function thanksgivingDate(year){
    const y=Number(year);if(!Number.isInteger(y)||y<1900||y>2200)return null;
    const first=new Date(y,10,1,12,0,0,0);
    const firstThursday=1+((4-first.getDay()+7)%7);
    return new Date(y,10,firstThursday+21,12,0,0,0);
  }
  function dateSchedule(value){
    const d=startOfLocalDay(value);if(!d)return null;
    const pair=assignmentForDate(d);
    const dayShift=pair==='AB'?'A':'C',nightShift=pair==='AB'?'B':'D';
    return {date:dayKey(d),pair,dayShift,nightShift,dayStart:'07:00',dayEnd:'19:00',nightStart:'19:00',nightEnd:'07:00'};
  }
  function shiftWindow(workDateKey,code){
    const m=String(workDateKey||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!m)return null;
    const base=new Date(Number(m[1]),Number(m[2])-1,Number(m[3]),12,0,0,0);
    const expected=assignmentForDate(base);
    const c=String(code||'').toUpperCase();
    const valid=(expected==='AB'&&['A','B'].includes(c))||(expected==='CD'&&['C','D'].includes(c));
    if(!valid)return null;
    const isDay=c==='A'||c==='C';
    const start=new Date(base.getFullYear(),base.getMonth(),base.getDate(),isDay?DAY_START_HOUR:NIGHT_START_HOUR,0,0,0);
    const end=isDay
      ?new Date(base.getFullYear(),base.getMonth(),base.getDate(),NIGHT_START_HOUR,0,0,0)
      :new Date(base.getFullYear(),base.getMonth(),base.getDate()+1,DAY_START_HOUR,0,0,0);
    return {code:c,pair:expected,type:isDay?'day':'night',workDate:dayKey(base),start:start.toISOString(),end:end.toISOString()};
  }

  root.ViejitoShiftSchedule={DAY_START_HOUR,NIGHT_START_HOUR,ROTATION,dayKey,assignmentForDate,dateSchedule,thanksgivingDate,shiftAt,shiftForTimestamp,shiftWindow};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.ViejitoShiftSchedule;
})(typeof window!=='undefined'?window:globalThis);
