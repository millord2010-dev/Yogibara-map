(() => {
  'use strict';

  const DAILY_MAX = 20;
  const ENERGY = { workout30: 3, workout60: 5, walk5000: 5 };

  const CATALOG = {
    move: {
      label: 'MOVE · 움직이기',
      items: [
        {key:'walk', icon:'🚶', name:'5,000보 걷기', mode:'walk', energy:5},
        {key:'yoga', icon:'🧘', name:'요가', mode:'duration'},
        {key:'gym', icon:'🏋️', name:'헬스 · 근력운동', mode:'duration'},
        {key:'running', icon:'🏃', name:'러닝', mode:'duration'},
        {key:'pilates', icon:'🤸', name:'필라테스', mode:'duration'},
        {key:'swimming', icon:'🏊', name:'수영', mode:'duration'},
        {key:'dance', icon:'💃', name:'댄스', mode:'duration'},
        {key:'cycling', icon:'🚲', name:'자전거', mode:'duration'},
        {key:'hiking', icon:'⛰️', name:'등산 · 오름', mode:'duration'},
        {key:'stretch', icon:'🌿', name:'스트레칭', mode:'duration'}
      ]
    },
    my: {
      label: 'MY · 나 돌보기',
      items: [
        {key:'water', icon:'💧', name:'물 충분히 마시기', mode:'fixed', energy:1},
        {key:'reading', icon:'📚', name:'독서', mode:'duration', energy30:2, energy60:4},
        {key:'meditation', icon:'◌', name:'명상 · 호흡', mode:'duration', energy30:2, energy60:4},
        {key:'healthymeal', icon:'🥗', name:'건강한 한 끼', mode:'fixed', energy:1},
        {key:'sleep', icon:'🌙', name:'충분히 자기', mode:'fixed', energy:2},
        {key:'journal', icon:'✍️', name:'감사한 일 기록하기', mode:'fixed', energy:1},
        {key:'digitalrest', icon:'📵', name:'휴대폰 내려놓기', mode:'duration', energy30:1, energy60:2},
        {key:'tidy', icon:'🧺', name:'공간 정리하기', mode:'fixed', energy:1}
      ]
    },
    heart: {
      label: 'HEART · 마음 나누기',
      items: [
        {key:'warmword', icon:'❤️', name:'따뜻한 말 한마디', mode:'fixed', energy:1},
        {key:'thankcall', icon:'📞', name:'고마운 사람에게 전화', mode:'fixed', energy:2},
        {key:'thankmsg', icon:'💌', name:'감사 메시지 보내기', mode:'fixed', energy:1},
        {key:'compliment', icon:'😊', name:'누군가 칭찬하기', mode:'fixed', energy:1},
        {key:'parentscall', icon:'🏠', name:'부모님께 전화하기', mode:'fixed', energy:2},
        {key:'checkin', icon:'🤍', name:'오래된 친구 안부 묻기', mode:'fixed', energy:2},
        {key:'listen', icon:'👂', name:'누군가의 이야기 들어주기', mode:'fixed', energy:3},
        {key:'help', icon:'🤝', name:'누군가 직접 도와주기', mode:'fixed', energy:3}
      ]
    },
    earth: {
      label: 'EARTH · 지구 돌보기',
      items: [
        {key:'tumbler', icon:'🥤', name:'텀블러 사용하기', mode:'fixed', energy:1},
        {key:'plogging', icon:'🌍', name:'플로깅', mode:'duration', energy30:3, energy60:5},
        {key:'recycle', icon:'♻️', name:'분리배출 제대로 하기', mode:'fixed', energy:1},
        {key:'ecobag', icon:'👜', name:'장바구니 사용하기', mode:'fixed', energy:1},
        {key:'transit', icon:'🚌', name:'대중교통 이용하기', mode:'fixed', energy:2},
        {key:'vegetarian', icon:'🌱', name:'채식 한 끼', mode:'fixed', energy:2},
        {key:'picktrash', icon:'🧤', name:'쓰레기 줍기', mode:'fixed', energy:2},
        {key:'reuse', icon:'🔁', name:'안 쓰는 물건 나누기', mode:'fixed', energy:3}
      ]
    },
    share: {
      label: 'SHARE · 나누기',
      items: [
        {key:'donation', icon:'♡', name:'기부 참여하기', mode:'fixed', energy:3},
        {key:'goods', icon:'📦', name:'물품 나눔하기', mode:'fixed', energy:5},
        {key:'talent', icon:'✦', name:'재능 나눔하기', mode:'fixed', energy:5},
        {key:'volunteer', icon:'🤲', name:'봉사활동', mode:'duration', energy30:3, energy60:5},
        {key:'campaign', icon:'∞', name:'좋은 캠페인 참여', mode:'fixed', energy:3},
        {key:'donationyoga', icon:'🧘‍♀️', name:'기부요가 참여', mode:'fixed', energy:5},
        {key:'marketgive', icon:'🎁', name:'중고판매 나눔 연결', mode:'fixed', energy:3}
      ]
    }
  };

  function dateKey(){ return new Date().toISOString().slice(0,10); }
  function baseCategory(group){ return group === 'move' ? 'move' : group === 'share' ? 'share' : 'good'; }
  function dailyEnergy(date=dateKey()){
    return state.entries.filter(e => e.date === date).reduce((sum,e) => sum + entryEnergy(e), 0);
  }
  function remainingEnergy(date=dateKey()){ return Math.max(0, DAILY_MAX - dailyEnergy(date)); }
  function actionDone(key,date=dateKey()){
    return state.entries.some(e => e.date === date && (e.actionKey === key || e.healthActionKey === key));
  }
  function findAction(key){
    for (const [group, data] of Object.entries(CATALOG)) {
      const item = data.items.find(x => x.key === key);
      if (item) return {...item, group};
    }
    return null;
  }
  function energyFor(item, minutes=0){
    if (item.mode === 'walk') return ENERGY.walk5000;
    if (item.mode === 'duration') {
      if (minutes >= 60) return item.energy60 ?? ENERGY.workout60;
      if (minutes >= 30) return item.energy30 ?? ENERGY.workout30;
      return 0;
    }
    return item.energy || 1;
  }
  function unitText(item, minutes){
    if (item.mode === 'walk') return '5,000보';
    if (item.mode === 'duration') return `${minutes}분`;
    return '완료';
  }

  function addAction(item, minutes=0, source='manual', meta={}){
    const d = meta.date || dateKey();
    if (actionDone(item.key,d)) {
      alert('이 행동은 오늘 이미 기록했어요. 하루에 한 항목당 1번만 기록할 수 있어요.');
      return false;
    }
    const base = energyFor(item, minutes);
    if (!base) {
      alert('운동은 30분 또는 60분 단위로 기록해주세요.');
      return false;
    }
    const remain = remainingEnergy(d);
    if (remain <= 0) {
      alert('오늘은 20 ENERGY를 모두 채웠어요. 내일 다시 이어가요.');
      return false;
    }
    const gain = Math.min(base, remain);
    const category = baseCategory(item.group);
    const e = {
      id: Date.now() + Math.floor(Math.random()*1000),
      category,
      subCategory: item.group,
      type: legacyType(category),
      date: d,
      title: item.name,
      kind: item.name,
      actionKey: item.key,
      healthActionKey: source === 'health' ? item.key : undefined,
      energy: gain,
      energyBase: base,
      min: item.mode === 'duration' ? minutes : 0,
      steps: item.mode === 'walk' ? 5000 : 0,
      note: `${unitText(item,minutes)}${gain < base ? ' · 일일 20 ENERGY 상한 적용' : ''}`,
      verification_level: source === 'health' ? 'device' : 'self',
      verification_status: source === 'health' ? 'verified' : 'unverified',
      source,
      healthMeta: source === 'health' ? meta : undefined
    };
    state.entries.push(e);
    save();
    renderAll();
    renderGoodActionHome();
    renderDailyCap();
    closeYbActionSheet();
    showComplete(e);
    return true;
  }

  function injectStyles(){
    const st = document.createElement('style');
    st.textContent = `
      .ybActionWrap{display:grid;gap:10px;margin-top:9px}.ybActionCat{background:var(--paper);border:1px solid var(--line);border-radius:18px;padding:11px 11px 10px;box-shadow:var(--shadow)}
      .ybCatHead{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}.ybCatHead b{font-size:11px}.ybMore{border:0;background:transparent;color:#6f7e3c;font-size:8px;font-weight:900;padding:4px}
      .ybActionGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.ybActionBtn{min-height:70px;border:1px solid var(--line);background:#fff;border-radius:14px;padding:8px 5px;text-align:center;color:var(--ink)}
      .ybActionBtn i{display:block;font-style:normal;font-size:18px}.ybActionBtn b{display:block;margin-top:4px;font-size:8px;line-height:1.25}.ybActionBtn small{display:block;margin-top:3px;color:var(--muted);font-size:6px}.ybActionBtn.done{background:var(--olive2);border-color:#cbd6a6;opacity:.8}
      .ybHidden{display:none!important}.ybCap{margin:9px 0 0;padding:10px 12px;background:#f4ebdf;border:1px solid var(--line);border-radius:14px}.ybCapTop{display:flex;align-items:center;justify-content:space-between}.ybCap span{font-size:8px;color:var(--muted)}.ybCap b{font-size:12px;color:#708033}.ybCapBar{height:5px;background:#eadfd2;border-radius:99px;overflow:hidden;margin-top:6px}.ybCapBar i{display:block;height:100%;background:var(--olive);border-radius:99px}
      .ybSheet{display:none;position:fixed;inset:0;z-index:800;background:rgba(49,37,28,.42);align-items:flex-end;justify-content:center}.ybSheet.open{display:flex}.ybPanel{width:min(100%,480px);max-height:88vh;overflow:auto;background:#fffaf5;border-radius:25px 25px 0 0;padding:16px 14px max(22px,env(safe-area-inset-bottom))}
      .ybHead{display:flex;justify-content:space-between;align-items:center}.ybHead h3{margin:0;font-size:17px}.ybHead button{border:0;background:#efe5dc;border-radius:50%;width:34px;height:34px;font-size:20px}.ybGroups{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:10px}
      .ybGroupBtn{border:1px solid var(--line);background:#fff;border-radius:15px;padding:12px;text-align:left;color:var(--ink)}.ybGroupBtn b{font-size:11px}.ybGroupBtn small{display:block;margin-top:3px;font-size:7px;color:var(--muted)}
      .ybPickGrid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:10px}.ybPick{border:1px solid var(--line);background:#fff;border-radius:15px;padding:11px;text-align:left;color:var(--ink)}.ybPick.done{background:var(--olive2);opacity:.7}.ybPick b{font-size:10px}.ybPick small{display:block;margin-top:3px;color:var(--muted);font-size:7px}
      .ybBack{border:0;background:transparent;color:#708033;font-size:9px;font-weight:900;padding:7px 1px 2px}.ybChoice{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.ybChoice button{border:1px solid var(--line);background:#fff;border-radius:16px;padding:16px 8px;color:var(--ink);font-weight:900}.ybChoice button strong{display:block;font-size:19px;color:#708033;margin-top:4px}.ybChoice.one{grid-template-columns:1fr}.ybNote{margin-top:10px;font-size:8px;line-height:1.55;color:var(--muted)}
      .ybHealth{margin-top:9px;padding:14px}.ybHealth h3{margin:4px 0 5px;font-size:14px}.ybHealthBtns{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:10px}.ybHealthBtns button{border:1px solid var(--line);background:#fff;border-radius:13px;padding:10px 6px;font-size:8px;font-weight:900;color:var(--ink)}.ybHealthStatus{margin-top:8px;padding:8px 9px;background:var(--olive2);border-radius:11px;color:#5f6c33;font-size:7px;line-height:1.5}
    `;
    document.head.appendChild(st);
  }

  let expanded = {};
  let selectedGroup = null;

  function actionEnergyLabel(item){
    if(item.mode === 'walk') return '+5 ENERGY';
    if(item.mode === 'duration') return '30분 +3 · 60분 +5';
    return `+${item.energy} ENERGY`;
  }

  function renderGoodActionHome(){
    const host = document.getElementById('ybGoodActions');
    if(!host) return;
    host.innerHTML = Object.entries(CATALOG).map(([group,data]) => {
      const showAll = !!expanded[group];
      return `<div class="ybActionCat">
        <div class="ybCatHead"><b>${data.label}</b><button class="ybMore" data-yb-more="${group}">${showAll?'접기 −':'더보기 +'}</button></div>
        <div class="ybActionGrid">${data.items.map((item,i)=>`
          <button class="ybActionBtn ${i>=3&&!showAll?'ybHidden':''} ${actionDone(item.key)?'done':''}" data-yb-action="${item.key}">
            <i>${item.icon}</i><b>${item.name}</b><small>${actionDone(item.key)?'오늘 완료 ✓':actionEnergyLabel(item)}</small>
          </button>`).join('')}
        </div>
      </div>`;
    }).join('');
    host.querySelectorAll('[data-yb-more]').forEach(b => b.onclick = () => {
      expanded[b.dataset.ybMore] = !expanded[b.dataset.ybMore];
      renderGoodActionHome();
    });
    host.querySelectorAll('[data-yb-action]').forEach(b => b.onclick = () => openActionChoice(b.dataset.ybAction));
  }

  function renderDailyCap(){
    const cap = document.getElementById('ybDailyCap');
    if(!cap) return;
    const n = Math.min(DAILY_MAX,dailyEnergy());
    cap.innerHTML = `<div class="ybCapTop"><span>오늘의 나눔 에너지</span><b>${n} / ${DAILY_MAX}</b></div><div class="ybCapBar"><i style="width:${n/DAILY_MAX*100}%"></i></div>`;
  }

  function installHome(){
    const oldQuick = document.querySelector('#home .quickActions');
    if(!oldQuick || document.getElementById('ybGoodActions')) return;
    const title = oldQuick.previousElementSibling;
    if(title && title.classList.contains('sectionTitle')) {
      title.innerHTML = '<b>오늘의 좋은 행동</b><small>한 항목당 하루 1번 · 하루 최대 20 ENERGY</small>';
    }
    oldQuick.style.display = 'none';
    const cap = document.createElement('div');
    cap.id = 'ybDailyCap';
    cap.className = 'ybCap';
    oldQuick.insertAdjacentElement('afterend',cap);
    const wrap = document.createElement('div');
    wrap.id = 'ybGoodActions';
    wrap.className='ybActionWrap';
    cap.insertAdjacentElement('afterend',wrap);
    renderDailyCap();
    renderGoodActionHome();
  }

  function installSheet(){
    if(document.getElementById('ybActionSheet')) return;
    const sheet = document.createElement('div');
    sheet.id='ybActionSheet';
    sheet.className='ybSheet';
    sheet.innerHTML=`<div class="ybPanel"><div class="ybHead"><h3 id="ybSheetTitle">오늘의 좋은 행동</h3><button id="ybSheetClose">×</button></div><div id="ybSheetBody"></div></div>`;
    document.body.appendChild(sheet);
    document.getElementById('ybSheetClose').onclick=closeYbActionSheet;
    sheet.onclick=e=>{if(e.target===sheet)closeYbActionSheet();};
  }

  function closeYbActionSheet(){
    document.getElementById('ybActionSheet')?.classList.remove('open');
  }
  window.closeYbActionSheet = closeYbActionSheet;

  function openYbActionSheet(group=null){
    installSheet();
    selectedGroup=group;
    document.getElementById('ybActionSheet').classList.add('open');
    if(group) renderGroup(group); else renderGroups();
  }

  function renderGroups(){
    document.getElementById('ybSheetTitle').textContent='오늘 어떤 좋은 행동을 했나요?';
    const body=document.getElementById('ybSheetBody');
    body.innerHTML=`<div class="ybCap"><div class="ybCapTop"><span>오늘의 ENERGY</span><b>${dailyEnergy()} / 20</b></div></div>
      <div class="ybGroups">${Object.entries(CATALOG).map(([g,d])=>`
      <button class="ybGroupBtn" data-group="${g}"><b>${d.label}</b><small>${d.items.slice(0,3).map(x=>x.name).join(' · ')}</small></button>`).join('')}</div>`;
    body.querySelectorAll('[data-group]').forEach(b=>b.onclick=()=>renderGroup(b.dataset.group));
  }

  function renderGroup(group){
    selectedGroup=group;
    const data=CATALOG[group];
    document.getElementById('ybSheetTitle').textContent=data.label;
    const body=document.getElementById('ybSheetBody');
    body.innerHTML=`<button class="ybBack" id="ybBackGroups">‹ 전체 카테고리</button>
      <div class="ybPickGrid">${data.items.map(item=>`
      <button class="ybPick ${actionDone(item.key)?'done':''}" data-pick="${item.key}">
        <b>${item.icon} ${item.name}</b><small>${actionDone(item.key)?'오늘 완료 ✓':actionEnergyLabel(item)}</small>
      </button>`).join('')}</div>
      <div class="ybNote">같은 항목은 하루에 한 번만 기록할 수 있고, 하루 총 ENERGY는 최대 20입니다.</div>`;
    document.getElementById('ybBackGroups').onclick=renderGroups;
    body.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>openActionChoice(b.dataset.pick));
  }

  function openActionChoice(key){
    const item=findAction(key);
    if(!item)return;
    installSheet();
    selectedGroup = item.group;
    document.getElementById('ybActionSheet').classList.add('open');
    document.getElementById('ybSheetTitle').textContent=`${item.icon} ${item.name}`;
    const body=document.getElementById('ybSheetBody');

    if(actionDone(item.key)){
      body.innerHTML=`<button class="ybBack" id="ybBackAction">‹ 돌아가기</button><div class="ybCap">오늘 이미 기록한 행동이에요 ✓</div>`;
      document.getElementById('ybBackAction').onclick=()=>renderGroup(item.group);
      return;
    }

    let choices='';
    if(item.mode==='duration') {
      choices=`<div class="ybChoice">
        <button data-min="30">30분<strong>+${item.energy30??3}</strong></button>
        <button data-min="60">60분<strong>+${item.energy60??5}</strong></button>
      </div>`;
    } else if(item.mode==='walk') {
      choices=`<div class="ybChoice one"><button data-min="0">5,000보<strong>+5</strong></button></div>`;
    } else {
      choices=`<div class="ybChoice one"><button data-min="0">오늘 완료<strong>+${item.energy}</strong></button></div>`;
    }

    body.innerHTML=`<button class="ybBack" id="ybBackAction">‹ 돌아가기</button>
      <div class="ybCap"><div class="ybCapTop"><span>오늘 남은 ENERGY</span><b>${remainingEnergy()} / 20</b></div></div>
      ${choices}
      <div class="ybNote">운동은 30분 또는 60분으로만 기록합니다. 걷기는 5,000보 1회만 인정됩니다.</div>`;
    document.getElementById('ybBackAction').onclick=()=>renderGroup(item.group);
    body.querySelectorAll('[data-min]').forEach(b=>b.onclick=()=>addAction(item,Number(b.dataset.min)||0));
  }

  function patchLaunchers(){
    if(typeof topAddBtn!=='undefined') topAddBtn.onclick=()=>openYbActionSheet();
    if(typeof bottomAddBtn!=='undefined') bottomAddBtn.onclick=()=>openYbActionSheet();
  }

  function patchTogether(){
    const challenges=[...document.querySelectorAll('#together .challenge')];
    challenges.forEach(c=>{
      const b=c.querySelector('b');
      const btn=c.querySelector('button');
      if(!b||!btn)return;

      if(btn.dataset.mission==='walk'){
        b.textContent='🚶 5,000보 걷기';
        btn.onclick=()=>openActionChoice('walk');
      } else if(btn.dataset.mission==='move'){
        b.textContent='🏃 운동 30분 · 60분';
        const s=c.querySelector('small');
        if(s)s.textContent='종목을 고르고 30분 또는 60분으로 기록해요';
        btn.onclick=()=>openYbActionSheet('move');
      } else if(btn.dataset.mission==='plogging'){
        b.textContent='🌍 플로깅 30분 · 60분';
        const s=c.querySelector('small');
        if(s)s.textContent='EARTH · 환경 행동으로 기록해요';
        btn.onclick=()=>openActionChoice('plogging');
      }
    });
  }

  function installHealthCard(){
    const me=document.getElementById('me');
    if(!me||document.getElementById('ybHealthCard'))return;
    const energy=me.querySelector('.meEnergy');
    if(!energy)return;
    const card=document.createElement('div');
    card.id='ybHealthCard';
    card.className='ybHealth card';
    card.innerHTML=`<div class="kicker">HEALTH SYNC</div>
      <h3>건강 데이터 연결</h3>
      <div class="soft">걸음 수와 운동 기록을 가져오면 YOGIBARA 기준으로 자동 환산합니다.</div>
      <div class="ybHealthBtns"><button id="ybSamsungHealth">Samsung Health</button><button id="ybAppleHealth">Apple 건강</button></div>
      <div class="ybHealthStatus">자동 연동 기준 · 걷기 5,000보 = +5 · 운동 30분 = +3 · 60분 = +5 · 같은 종목 하루 1회 · 하루 최대 20</div>`;
    energy.insertAdjacentElement('afterend',card);

    document.getElementById('ybSamsungHealth').onclick=()=>alert(
      'Samsung Health 자동 읽기는 Android 앱에서 Samsung Health Data SDK 또는 Health Connect 권한 연결이 필요합니다. 현재 웹 버전에서는 직접 읽을 수 없고, 앱 전환 시 실제 연결 버튼으로 사용할 수 있도록 인터페이스를 준비해두었습니다.'
    );
    document.getElementById('ybAppleHealth').onclick=()=>alert(
      'Apple 건강 자동 읽기는 iPhone 앱에서 HealthKit 권한 연결이 필요합니다. 현재 웹 버전에서는 직접 읽을 수 없고, 앱 전환 시 실제 연결 버튼으로 사용할 수 있도록 인터페이스를 준비해두었습니다.'
    );
  }

  // Native Android/iOS 앱에서 권한을 받고 실제 건강 데이터를 읽은 뒤 이 함수로 전달하면
  // YOGIBARA 기준에 따라 자동 기록됩니다.
  window.YOGIBARA_HEALTH = {
    dailyMax: DAILY_MAX,
    rules: {
      walkSteps:5000,
      workoutMinutes:[30,60],
      workoutEnergy:{30:3,60:5}
    },

    importDay(payload={}){
      const d=payload.date||dateKey();
      const added=[];

      if(Number(payload.steps)>=5000){
        const item=findAction('walk');
        if(!actionDone('walk',d) && remainingEnergy(d)>0){
          if(addAction(item,0,'health',{...payload,date:d,provider:payload.provider||'health'})) added.push('walk');
        }
      }

      (payload.workouts||[]).forEach(w=>{
        const key=String(w.type||'').toLowerCase();
        const alias={
          strength:'gym',
          weights:'gym',
          run:'running',
          running:'running',
          yoga:'yoga',
          pilates:'pilates',
          swim:'swimming',
          swimming:'swimming',
          dance:'dance',
          cycling:'cycling',
          bike:'cycling',
          hiking:'hiking'
        }[key]||key;

        const item=findAction(alias);
        if(!item || item.mode!=='duration' || actionDone(item.key,d) || remainingEnergy(d)<=0) return;

        const mins=Number(w.minutes)||0;
        const rounded=mins>=60?60:mins>=30?30:0;
        if(!rounded)return;

        if(addAction(item,rounded,'health',{...w,date:d,provider:payload.provider||'health'})) added.push(item.key);
      });

      return {added,energy:dailyEnergy(d),remaining:remainingEnergy(d)};
    }
  };

  // 기존 빠른 기록 버튼도 새 규칙으로 우회.
  try{
    quickRecordMission = function(id){
      if(id==='walk')return openActionChoice('walk');
      if(id==='yoga')return openActionChoice('yoga');
      if(id==='tumbler')return openActionChoice('tumbler');
      if(id==='plogging')return openActionChoice('plogging');
      if(id==='move')return openYbActionSheet('move');

      if(id==='surya'){
        const item={key:'surya',icon:'☀️',name:'수리야 나마스카라 참여',mode:'fixed',energy:5,group:'move'};
        return addAction(item,0);
      }
    };
  }catch(_){}

  const originalRenderHome = typeof renderHome==='function' ? renderHome : null;
  if(originalRenderHome){
    try{
      renderHome = function(){
        originalRenderHome();
        renderDailyCap();
        renderGoodActionHome();
      };
    }catch(_){}
  }

  injectStyles();
  installHome();
  installSheet();
  patchLaunchers();
  patchTogether();
  installHealthCard();
  renderDailyCap();
  renderGoodActionHome();
})();
