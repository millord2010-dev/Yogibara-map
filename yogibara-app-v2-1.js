/* YOGIBARA app loader + ME dashboard patch
   Loads the last known working app bundle, then applies the ME layout requested 2026-08-26.
*/
(() => {
  'use strict';
  const LEGACY_SRC = 'https://cdn.jsdelivr.net/gh/millord2010-dev/Yogibara-map@5978504374027a16fe325e7f72b25aaaf5187236/yogibara-app-v2.js';

  const legacy = document.createElement('script');
  legacy.src = LEGACY_SRC;
  legacy.async = false;
  legacy.onload = () => {
    try { installMeDashboardPatch(); }
    catch (err) { console.error('[YOGIBARA] ME dashboard patch failed', err); }
  };
  legacy.onerror = () => console.error('[YOGIBARA] Could not load the base app bundle.');
  document.head.appendChild(legacy);

  function installMeDashboardPatch(){
    const DAILY_MAX = 20;
    const $ = (sel, root=document) => root.querySelector(sel);
    const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

    const safe = v => String(v ?? '').replace(/[&<>"']/g, ch => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[ch]));

    function dayKey(){
      try { return typeof today === 'function' ? today() : new Date().toISOString().slice(0,10); }
      catch(_) { return new Date().toISOString().slice(0,10); }
    }
    function entries(){
      try { return Array.isArray(state?.entries) ? state.entries : []; }
      catch(_) { return []; }
    }
    function energyOf(e){
      try { if(typeof entryEnergy === 'function') return Number(entryEnergy(e)) || 0; }
      catch(_) {}
      return Number(e?.energy) || 0;
    }
    function cat(e){
      try { if(typeof categoryOf === 'function') return categoryOf(e); }
      catch(_) {}
      if(e?.category) return e.category;
      if(e?.type === 'practice') return 'move';
      if(e?.type === 'share') return 'share';
      return 'good';
    }
    function totalEnergy(){
      try { if(typeof energyTotal === 'function') return Number(energyTotal()) || 0; }
      catch(_) {}
      return entries().reduce((s,e)=>s+energyOf(e),0);
    }
    let selectedMeDate = dayKey();

    function listForDate(d){
      return entries().filter(e=>e?.date===d).sort((a,b)=>(b.id||0)-(a.id||0));
    }
    function todayList(){ return listForDate(dayKey()); }
    function selectedList(){ return listForDate(selectedMeDate || dayKey()); }
    function energyForDate(d){ return Math.min(DAILY_MAX,listForDate(d).reduce((s,e)=>s+energyOf(e),0)); }
    function todayEnergy(){ return energyForDate(dayKey()); }
    function prettyDate(d){
      try{
        const x=new Date(d+'T00:00:00');
        return `${x.getMonth()+1}월 ${x.getDate()}일`;
      }catch(_){ return d; }
    }
    function shareList(){ return entries().filter(e=>cat(e)==='share'); }
    function shareAmount(){ return shareList().reduce((s,e)=>s+(Number(e?.amount)||0),0); }
    function won(n){ return `${Number(n||0).toLocaleString('ko-KR')}원`; }
    function recordLabel(e){
      const c=cat(e);
      return c==='move'?'MOVE':c==='share'?'SHARE':c==='place'?'PLACE':c==='market'?'MARKET':'GOOD';
    }

    function addStyles(){
      if($('#ybMeDashboardStyles')) return;
      const s=document.createElement('style');
      s.id='ybMeDashboardStyles';
      s.textContent=`
        #me>.meEnergy{display:block!important;margin-top:9px!important;padding:17px!important;background:linear-gradient(145deg,#eef0dc,#fff7ee)!important}
        #me>.meStats{display:grid!important;grid-template-columns:repeat(3,1fr)!important;margin-top:9px!important;border-radius:18px!important}
        #me>.meStats div{padding:12px 4px!important}
        #me>.meStats small{font-size:7px!important}
        #me>.meStats b{font-size:14px!important;line-height:1.25!important}
        .ybTotalEnergyTop{display:flex;align-items:flex-end;justify-content:space-between;gap:12px}
        .ybTotalEnergyLabel{font-size:9px;color:var(--muted)}
        .ybTotalEnergyValue{display:block;margin-top:4px;font:700 36px/1 Georgia,serif;color:#708033}
        .ybEnergyFlow{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-top:12px;padding:9px 10px;border-radius:12px;background:rgba(255,255,255,.62);font-size:8px;color:#6f655e}
        .ybEnergyFlow b{font-size:9px;color:#667635}.ybEnergyFlow i{font-style:normal;color:#9a8d81}
        .ybEnergySoon{margin-left:auto;font-size:7px;color:var(--muted)}
        .ybProfileFields{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:13px}
        .ybProfileFields label{display:block;color:var(--muted);font-size:8px}
        .ybProfileFields input{width:100%;margin-top:4px;border:1px solid var(--line);background:#fff;border-radius:11px;padding:9px;color:var(--ink)}
        .ybProfileControls{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
        .ybProfileSaveSmall{min-height:42px;border:1px solid var(--line);background:#f0e6dc;color:var(--ink);border-radius:12px;padding:9px 12px;font-size:9px;font-weight:900}
        .ybMeRemoved{display:none!important}
        #ybMeToday{margin-top:9px!important}
        .ybMeDateNav{display:flex;align-items:center;justify-content:space-between;gap:9px;margin-bottom:11px}
        .ybMeDateTitle{font-size:14px;font-weight:900}
        .ybMeDateControls{display:flex;align-items:center;gap:6px}
        .ybMeDateInput{min-width:136px;border:1px solid var(--line);background:#fff;color:var(--ink);border-radius:11px;padding:8px 9px;font-size:9px;font-weight:800}
        .ybMeTodayBtn{border:1px solid var(--line);background:var(--olive2);color:#5f6d32;border-radius:10px;padding:8px 9px;font-size:8px;font-weight:900}
        #ybMeToday .ybMeTodayMeta{grid-template-columns:repeat(3,1fr)!important}
        #ybMeToday .ybMeTodayMeta div{padding:10px 7px!important}
        #myRecent .ybTodayStory{margin-top:8px;border:1px solid var(--line);background:#f1e5da;color:var(--ink);border-radius:10px;padding:8px 10px;font-size:8px;font-weight:900}
        #myRecent .ybAmountTag{background:#e7ecd8;color:#5d6c30}
        #myRecent .ybPhotoTag{background:#eee6dd;color:#756a61}
        @media(max-width:360px){.ybProfileFields{grid-template-columns:1fr}#me>.meStats b{font-size:12px!important}.ybEnergySoon{width:100%;margin-left:0}}
      `;
      document.head.appendChild(s);
    }

    function compactProfile(){
      const profile=$('#me .profile');
      if(!profile) return;

      const saveBtn=$('#saveProfileBtn');
      const editName=$('#editName');
      const editRegion=$('#editRegion');
      const profileSettings=saveBtn?.closest('.settings');

      if(editName && editRegion && !$('#ybProfileFields',profile)){
        const fields=document.createElement('div');
        fields.id='ybProfileFields';fields.className='ybProfileFields';
        const nLabel=editName.closest('label'), rLabel=editRegion.closest('label');
        if(nLabel) fields.appendChild(nLabel);
        if(rLabel) fields.appendChild(rLabel);
        profile.appendChild(fields);
      }
      if(profileSettings) profileSettings.classList.add('ybMeRemoved');

      const row=$('.ybProfileRow',profile);
      const photoBtn=$('.ybProfilePhotoBtn',row||profile);
      if(photoBtn){
        const text=[...photoBtn.childNodes].find(n=>n.nodeType===Node.TEXT_NODE);
        if(text) text.nodeValue='프로필 사진 변경';
        const side=photoBtn.parentElement;
        if(side){
          let controls=$('.ybProfileControls',side);
          if(!controls){
            controls=document.createElement('div');
            controls.className='ybProfileControls';
            side.insertBefore(controls,photoBtn);
            controls.appendChild(photoBtn);
          }
          if(!$('#ybProfileSaveSmall',controls)){
            const small=document.createElement('button');
            small.type='button';small.id='ybProfileSaveSmall';small.className='ybProfileSaveSmall';small.textContent='프로필 저장';
            small.onclick=()=>saveBtn?.click();
            controls.appendChild(small);
          }
        }
      }

      const connectBox=$('#openConnectBtn')?.closest('.settings');
      if(connectBox) connectBox.classList.add('ybMeRemoved');
    }

    function renderImpact(){
      const energy=$('#me>.meEnergy'), stats=$('#me>.meStats');
      if(!energy||!stats) return;
      energy.innerHTML=`
        <div class="ybTotalEnergyTop">
          <div><div class="kicker">TOTAL ENERGY</div><div class="ybTotalEnergyLabel">지금까지 쌓인 ENERGY</div><strong class="ybTotalEnergyValue">${totalEnergy().toLocaleString('ko-KR')}</strong></div>
          <div class="soft" style="text-align:right">누적</div>
        </div>
        <div class="ybEnergyFlow"><b>ENERGY</b><i>→</i><span>나눔</span><i>·</i><span>혜택</span><span class="ybEnergySoon">전환 구조 준비중</span></div>`;

      stats.innerHTML=`
        <div><small>나눔 횟수</small><b>${shareList().length.toLocaleString('ko-KR')}회</b></div>
        <div><small>나눔 금액</small><b>${won(shareAmount())}</b></div>
        <div><small>오늘 ENERGY</small><b>${todayEnergy()} / ${DAILY_MAX}</b></div>`;
    }

    function renderTodaySummary(){
      const card=$('#ybMeToday');
      if(!card) return;
      const chosen=selectedMeDate || dayKey();
      const isToday=chosen===dayKey();
      const list=selectedList();
      const shares=list.filter(e=>cat(e)==='share').length;
      const moves=list.filter(e=>cat(e)==='move').length;
      const eTotal=energyForDate(chosen);
      const dateText=isToday?'오늘':prettyDate(chosen);

      card.innerHTML=`
        <div class="ybMeDateNav">
          <div>
            <small>${isToday?'오늘의 나':'날짜별 기록'}</small>
            <div class="ybMeDateTitle">오늘 뭐했나</div>
          </div>
          <div class="ybMeDateControls">
            <input id="ybMeDateInput" class="ybMeDateInput" type="date" value="${safe(chosen)}" max="${safe(dayKey())}" aria-label="기록 날짜 선택">
            ${isToday?'':'<button id="ybMeTodayBtn" class="ybMeTodayBtn" type="button">오늘</button>'}
          </div>
        </div>
        <div class="ybMeTodayTop">
          <div><small>${dateText}</small><div style="margin-top:4px;font-size:14px;font-weight:900">${list.length?`${list.length}개의 ACTION을 기록했어요.`:`${dateText} 기록이 없어요.`}</div></div>
          <div style="text-align:right"><small>${isToday?'오늘':'그날'} ENERGY</small><strong>${eTotal}</strong></div>
        </div>
        <div class="ybMeTodayMeta">
          <div><span>ACTION</span><b>${list.length}개</b></div>
          <div><span>나눔</span><b>${shares}회</b></div>
          <div><span>MOVE</span><b>${moves}회</b></div>
        </div>
        ${isToday&&!list.length?'<button id="ybStartAction2" class="wideBtn primary" style="width:100%;margin-top:10px">ACTION 시작하기</button>':''}`;

      const dateInput=$('#ybMeDateInput');
      if(dateInput) dateInput.onchange=()=>{
        selectedMeDate=dateInput.value || dayKey();
        renderTodaySummary();
        renderTodayRecords();
      };
      const todayBtn=$('#ybMeTodayBtn');
      if(todayBtn) todayBtn.onclick=()=>{
        selectedMeDate=dayKey();
        renderTodaySummary();
        renderTodayRecords();
      };
      const start=$('#ybStartAction2');
      if(start) start.onclick=()=>{ try{go('home');}catch(_){} };
    }

    function renderTodayRecords(){
      const me=$('#me'), host=$('#myRecent');
      if(!me||!host) return;
      const chosen=selectedMeDate || dayKey();
      const isToday=chosen===dayKey();
      const dateText=isToday?'오늘':prettyDate(chosen);
      const title=$$('.sectionTitle',me).find(x=>/내 최근 기록|오늘과 최근 기록|오늘의 기록|오늘 행동|선택한 날짜/.test(x.textContent||''));
      if(title) title.innerHTML=`<b>${isToday?'오늘 행동 · 나눔 기록':'선택한 날짜의 행동 · 나눔'}</b><small>${dateText} 기록</small>`;

      const list=selectedList();
      if(!list.length){
        host.innerHTML=`<div class="empty card">${dateText} 기록한 행동이 아직 없어요.</div>`;
        return;
      }
      host.innerHTML=list.map(e=>{
        const amount=Number(e?.amount)||0;
        return `<div class="recordCard card">
          <div><b>${safe(e.title||e.kind||'좋은 행동')}</b><small>${recordLabel(e)} · ${safe(e.date||'')}</small>${e.note?`<p>${safe(e.note)}</p>`:''}<button class="ybTodayStory" data-entry-id="${safe(e.id)}">Instagram · 스토리 올리기</button></div>
          <div class="recordTags"><span class="tag energy">+${energyOf(e)} ENERGY</span>${amount?`<span class="tag ybAmountTag">나눔 ${won(amount)}</span>`:''}${e.photoKey?'<span class="tag ybPhotoTag">사진 있음</span>':''}${e.verification_status==='verified'?'<span class="tag verify">VERIFIED</span>':''}</div>
        </div>`;
      }).join('');

      $$('.ybTodayStory',host).forEach(btn=>{
        btn.onclick=()=>{
          const e=entries().find(x=>String(x.id)===String(btn.dataset.entryId));
          if(e) window.YOGIBARA_MEDIA?.openStory?.(e);
        };
      });
    }

    function arrange(){
      const me=$('#me'), profile=$('#me .profile');
      if(!me||!profile) return;
      const energy=$('#me>.meEnergy');
      const stats=$('#me>.meStats');
      const health=$('#ybHealthCard');
      const todayCard=$('#ybMeToday');
      const title=$$('.sectionTitle',me).find(x=>/내 최근 기록|오늘과 최근 기록|오늘의 기록|오늘 행동/.test(x.textContent||''));
      const recent=$('#myRecent');
      let anchor=profile;
      [energy,stats,health,todayCard,title,recent].forEach(node=>{
        if(!node) return;
        anchor.insertAdjacentElement('afterend',node);
        anchor=node;
      });
    }

    function apply(){
      addStyles();
      compactProfile();
      renderImpact();
      renderTodaySummary();
      renderTodayRecords();
      arrange();
    }

    const oldRenderMe = typeof renderMe === 'function' ? renderMe : null;
    if(oldRenderMe){
      try{
        renderMe=function(){
          oldRenderMe();
          setTimeout(apply,0);
        };
      }catch(_){}
    }

    setTimeout(apply,0);
  }
})();
