const roles = [
  { name: 'Стажёр', need: 0, desc: 'Учишь базовые процессы и стандарты смены.' },
  { name: 'Официант', need: 100, desc: 'Работаешь с гостями и заказами.' },
  { name: 'Старший официант', need: 250, desc: 'Помогаешь команде и решаешь сложные ситуации.' },
  { name: 'Администратор', need: 450, desc: 'Управляешь залом и координируешь смену.' },
  { name: 'Управляющий', need: 750, desc: 'Отвечаешь за всю точку и развитие команды.' }
];

const shifts = [
  {
    guestTitle:'Первый заказ',
    guestText:'Гость заказал бургер, картошку и морс. Выбери правильное действие.',
    items:['Бургер «Звезда Инстаграма»','Картошка фри','Морс смородина'],
    actions:['Отдать заказ без проверки','Проверить комплектность и отдать гостю','Попросить гостя подождать ещё 20 минут'],
    correct:1
  },
  {
    guestTitle:'Гость недоволен ожиданием',
    guestText:'Заказ задержался. Как лучше поступить?',
    items:['Извиниться','Уточнить статус кухни','Предложить решение'],
    actions:['Сказать: «Ну кухня же готовит»','Извиниться, уточнить статус и назвать реальное время','Игнорировать гостя'],
    correct:1
  },
  {
    guestTitle:'Запара в зале',
    guestText:'Несколько столов зовут одновременно. Что делать?',
    items:['Расставить приоритеты','Предупредить гостей','Подключить коллегу'],
    actions:['Исчезнуть на кухне','Спокойно распределить приоритеты и попросить помощь','Обслуживать только самый громкий стол'],
    correct:1
  }
];

const state = JSON.parse(localStorage.getItem('plmCareer') || '{"xp":0,"shifts":0,"role":0,"round":0}');

const screens = [...document.querySelectorAll('.screen')];
const menuScreen = document.getElementById('menuScreen');
const careerScreen = document.getElementById('careerScreen');
const shiftScreen = document.getElementById('shiftScreen');

function save(){ localStorage.setItem('plmCareer', JSON.stringify(state)); }
function show(screen){ screens.forEach(s=>s.classList.remove('active')); screen.classList.add('active'); }
function syncRole(){
  let idx = 0;
  roles.forEach((role,i)=>{ if(state.xp >= role.need) idx=i; });
  state.role = Math.max(state.role, idx);
  save();
}
function updateDashboard(){
  syncRole();
  document.getElementById('currentRoleLabel').textContent = roles[state.role].name;
  document.getElementById('xpLabel').textContent = state.xp;
  document.getElementById('shiftCountLabel').textContent = state.shifts;
}
function renderCareer(){
  syncRole();
  const wrap = document.getElementById('careerList');
  wrap.innerHTML='';
  roles.forEach((role,i)=>{
    const unlocked = state.xp >= role.need || i <= state.role;
    const card = document.createElement('div');
    card.className = `career-card ${!unlocked?'locked':''} ${i===state.role?'current':''}`;
    card.innerHTML = `
      <div class="role-index">${i+1}</div>
      <div><strong>${role.name}</strong><p>${role.desc}</p></div>
      <span class="role-status">${i===state.role?'Текущая':unlocked?'Открыта':`Нужно ${role.need} XP`}</span>`;
    wrap.appendChild(card);
  });
}
function renderShift(){
  syncRole();
  const round = shifts[state.round % shifts.length];
  document.getElementById('shiftRoleTitle').textContent = roles[state.role].name;
  document.getElementById('orderNumber').textContent = 101 + state.shifts;
  document.getElementById('guestTitle').textContent = round.guestTitle;
  document.getElementById('guestText').textContent = round.guestText;
  const items = document.getElementById('orderItems');
  items.innerHTML = round.items.map(x=>`<div class="item">${x}</div>`).join('');
  const actions = document.getElementById('actions');
  actions.innerHTML='';
  round.actions.forEach((action,i)=>{
    const btn=document.createElement('button');
    btn.className='action-btn';
    btn.textContent=action;
    btn.onclick=()=>handleAction(i,round.correct);
    actions.appendChild(btn);
  });
  const msg=document.getElementById('shiftMessage');
  msg.className='message';
  msg.textContent='Нажми правильное действие, чтобы выполнить заказ.';
}
function handleAction(index, correct){
  const msg=document.getElementById('shiftMessage');
  if(index === correct){
    state.xp += 50;
    state.shifts += 1;
    state.round += 1;
    syncRole();
    save();
    msg.className='message success';
    msg.textContent=`Отлично! +50 XP. Текущая должность: ${roles[state.role].name}.`;
    document.querySelectorAll('.action-btn').forEach(b=>b.disabled=true);
    setTimeout(()=>{ renderShift(); updateDashboard(); }, 900);
  } else {
    msg.className='message error';
    msg.textContent='Не лучший вариант. Попробуй ещё раз.';
  }
}

document.getElementById('continueBtn').onclick=()=>{ renderShift(); show(shiftScreen); };
document.getElementById('careerBtn').onclick=()=>{ renderCareer(); show(careerScreen); };
document.querySelectorAll('.back-menu').forEach(btn=>btn.onclick=()=>{ updateDashboard(); show(menuScreen); });
document.getElementById('resetBtn').onclick=()=>{
  localStorage.removeItem('plmCareer');
  Object.assign(state,{xp:0,shifts:0,role:0,round:0});
  updateDashboard(); renderCareer(); show(menuScreen);
};

updateDashboard();
