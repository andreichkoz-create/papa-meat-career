const ROLES=[
{name:'Официант',need:0,icon:'🍔'},{name:'Старший официант',need:100,icon:'⭐'},{name:'Администратор',need:240,icon:'📋'},{name:'Управляющий кафе',need:450,icon:'🏪'},{name:'Территориальный',need:800,icon:'🗺️'},{name:'Управляющий сетью',need:1250,icon:'👑'}];
const DEV_MODE=true, KEY='plmCareerV2';
const base={role:0,xp:0,day:1,money:0,business:0,service:80,reputation:50,authority:10,skills:{service:1,leadership:1,management:1,finance:1,marketing:1,team:1},achievements:[]};
let state=Object.assign({},base,JSON.parse(localStorage.getItem(KEY)||'{}')); state.skills=Object.assign({},base.skills,state.skills||{});
let view='home', shift=null, interval=null, sheet=null;
const $=s=>document.querySelector(s), save=()=>localStorage.setItem(KEY,JSON.stringify(state));
function toast(t){let x=document.createElement('div');x.className='toast';x.textContent=t;document.body.appendChild(x);setTimeout(()=>x.remove(),1800)}
function metric(k,v){return '<div class="metric"><span>'+k+'</span><b>'+v+'</b></div>'}
function header(){return '<header class="top"><div class="brand"><img class="logo" src="assets/logo.png" onerror="this.outerHTML=\'<div class=&quot;logo logo-fallback&quot;>ПЛМ</div>\'"><div><b>Папа любит мясо</b><small>Карьера</small></div></div><span class="tag">День '+state.day+'</span></header>'}
function nav(){if(shift)return '';let a=[['home','⌂','Главная'],['career','↗','Карьера'],['skills','★','Навыки'],['profile','●','Профиль']];return '<nav class="nav">'+a.map(x=>'<button data-nav="'+x[0]+'" class="'+(view===x[0]?'active':'')+'"><b>'+x[1]+'</b>'+x[2]+'</button>').join('')+'</nav>'}
function shell(content){$('#app').innerHTML=header()+'<main class="page">'+content+'</main>'+nav();bind()}
function home(){
 let r=ROLES[state.role],next=ROLES[state.role+1],pct=next?Math.min(100,state.xp/next.need*100):100;
 shell('<section class="game-home">'+
 '<div class="home-profile"><div class="avatar">А</div><div><b>АНДРЕЙ</b><small>'+r.name+' · День '+state.day+'</small></div><div class="home-xp"><span>'+state.xp+' XP</span><div class="progress"><i style="width:'+pct+'%"></i></div></div></div>'+
 '<div class="home-hero"><div class="hero-logo"><img src="assets/logo.png" onerror="this.style.display=\'none\'"><h1>ПАПА ЛЮБИТ МЯСО</h1><b>КАРЬЕРА</b></div><div class="manager-art"><div class="manager-placeholder">УПРАВЛЯЮЩИЙ</div></div><div class="hero-copy"><b>ВЫБЕРИ СВОЮ РОЛЬ</b><span>и развивайся вместе с нами</span></div></div>'+
 '<div class="home-stats">'+metric('💵 Деньги',state.money+' ₽')+metric('⭐ Репутация',state.reputation)+metric('🔥 Сервис',state.service)+'</div>'+
 '<div class="role-strip">'+ROLES.map((x,i)=>'<button class="role-tile '+(i===state.role?'active':'')+'" data-home-role="'+i+'"><span>'+x.icon+'</span><b>'+x.name+'</b><small>'+(i===state.role?'Текущая роль':x.need+' XP')+'</small></button>').join('')+'</div>'+
 '<button class="primary home-play" id="start">▶ ИГРАТЬ — '+r.name.toUpperCase()+'</button>'+
 '<div class="career-mini"><b>Карьерный прогресс</b><span>'+(next?'Следующая должность: '+next.name+' · '+Math.max(0,next.need-state.xp)+' XP':'Максимальная должность')+'</span></div>'+
 '</section>');
 document.querySelectorAll('[data-home-role]').forEach(b=>b.onclick=()=>{let i=+b.dataset.homeRole;if(DEV_MODE||state.xp>=ROLES[i].need){state.role=i;save();home()}else toast('Нужно '+ROLES[i].need+' XP')});
}
function career(){shell('<div class="section-title"><h2>Карьера</h2><span class="tag">'+state.xp+' XP</span></div>'+ROLES.map((r,i)=>'<div class="card career-card '+(i===state.role?'current ':'')+(state.xp<r.need&&!DEV_MODE?'locked':'')+'"><div class="num">'+r.icon+'</div><div><b>'+r.name+'</b><div class="muted">'+r.need+' XP</div></div>'+(DEV_MODE?'<button class="tiny" data-role="'+i+'">Тест</button>':'<span class="tag">'+(state.xp>=r.need?'Доступно':'Закрыто')+'</span>')+'</div>').join(''))}
function skills(){let names={service:'Сервис',leadership:'Лидерство',management:'Управление',finance:'Финансы',marketing:'Маркетинг',team:'Команда'};shell('<div class="section-title"><h2>Навыки</h2></div>'+Object.entries(state.skills).map(([k,v])=>'<div class="card"><b>'+names[k]+'</b><span class="tag" style="float:right">ур. '+v+'</span><div class="progress"><i style="width:'+Math.min(100,v*12)+'%"></i></div></div>').join(''))}
function profile(){shell('<div class="section-title"><h2>Профиль</h2></div><div class="card"><h3>'+ROLES[state.role].icon+' '+ROLES[state.role].name+'</h3><p class="muted">Личные деньги: '+state.money+' ₽<br>Бизнес: '+state.business+' ₽<br>Достижений: '+state.achievements.length+'</p></div><button class="danger" id="reset">Новая игра</button>')}
function bind(){document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{view=b.dataset.nav;render()});document.querySelectorAll('[data-role]').forEach(b=>b.onclick=()=>{state.role=+b.dataset.role;save();toast('Режим: '+ROLES[state.role].name);view='home';render()});if($('#start'))$('#start').onclick=startShift;if($('#reset'))$('#reset').onclick=()=>{if(confirm('Удалить весь прогресс и начать заново?')){localStorage.removeItem(KEY);state=JSON.parse(JSON.stringify(base));render()}}}
function render(){if(view==='home')home();else if(view==='career')career();else if(view==='skills')skills();else profile()}
const MENU=[
{cat:'Меню',name:'Звезда Инстаграма',icon:'🍔',price:590},
{cat:'Меню',name:'Тайский ледибой',icon:'🍔',price:620},
{cat:'Меню',name:'Шаурма',icon:'🌯',price:390},
{cat:'Меню',name:'Крылья',icon:'🍗',price:490},
{cat:'Меню',name:'Рёбра BBQ',icon:'🥩',price:690},
{cat:'Меню',name:'Картошка фри',icon:'🍟',price:220},
{cat:'Меню',name:'Морс смородина',icon:'🥤',price:170},
{cat:'Меню',name:'Лимонад',icon:'🧋',price:290},
{cat:'Меню',name:'Соус BBQ',icon:'🥣',price:90}
];
function makeOrder(round){
 let count=round<3?2:round<6?3:4,pool=[...MENU],items=[];
 while(items.length<count){let i=Math.floor(Math.random()*pool.length);items.push(pool.splice(i,1)[0].name)}
 return items;
}
function waiter(){shift={type:'waiter',patience:100,round:1,maxOrders:10,table:1,order:[],selected:[],correct:0,mistakes:0,revenue:0,tips:0,xp:0,menu:[...MENU].sort(()=>Math.random()-.5)};nextWaiterOrder();interval=setInterval(tickWaiter,250)}
function nextWaiterOrder(){if(shift.round>shift.maxOrders)return finishWaiter();shift.order=makeOrder(shift.round);shift.selected=[];shift.patience=Math.max(45,100-Math.floor((shift.round-1)/3)*8);shift.table=1+Math.floor(Math.random()*12);shift.menu=[...MENU].sort(()=>Math.random()-.5);drawWaiter()}
function sameOrder(a,b){let aa=[...a].sort(),bb=[...b].sort();return aa.length===bb.length&&aa.every((x,i)=>x===bb[i])}
function drawWaiter(){
 let s=shift;
 shell('<div class="shift-head"><div><small class="muted">СМЕНА ОФИЦИАНТА</small><h2>Стол №'+s.table+'</h2></div><span class="tag">Заказ '+s.round+'</span></div>'+
 '<div class="metrics">'+metric('Верно',s.correct)+metric('Ошибки',s.mistakes)+metric('Чаевые',s.tips+' ₽')+'</div>'+
 '<div class="card order-ticket"><div class="patience-title"><b>Терпение гостя</b><b>'+Math.ceil(s.patience)+'%</b></div><div class="patience guest-patience"><i style="width:'+s.patience+'%"></i></div><div class="order-icons">'+s.order.map(n=>{let x=MENU.find(m=>m.name===n);return '<div class="order-icon '+(s.selected.includes(n)?'done':'')+'"><span>'+x.icon+'</span><small>'+x.name+'</small></div>'}).join('')+'</div></div>'+
 '<div class="menu-grid waiter-nine">'+s.menu.map(x=>'<button class="menu-item '+(s.selected.includes(x.name)?'picked':'')+'" data-menu="'+x.name+'"><span>'+x.icon+'</span><b>'+x.name+'</b></button>').join('')+'</div>');
 document.querySelectorAll('[data-menu]').forEach(b=>b.onclick=()=>pickWaiterItem(b.dataset.menu));
}
function tickWaiter(){if(!shift||shift.type!=='waiter')return;shift.patience=Math.max(0,shift.patience-.7);if(shift.patience<=0){shift.mistakes++;toast('Гость не дождался');shift.round++;nextWaiterOrder()}else drawWaiter()}
function pickWaiterItem(name){
 let s=shift;
 if(s.selected.includes(name))return;
 if(!s.order.includes(name)){
   s.mistakes++;s.patience=Math.max(0,s.patience-18);toast('Этого нет в заказе!');drawWaiter();return;
 }
 s.selected.push(name);
 if(sameOrder(s.order,s.selected)){
   let sum=s.order.reduce((a,n)=>a+(MENU.find(x=>x.name===n)?.price||0),0),tip=Math.round(sum*.08*(.5+s.patience/200));
   s.correct++;s.revenue+=sum;s.tips+=tip;s.xp+=8+s.order.length*2+Math.round(s.patience/20);
   toast('Заказ собран! +'+tip+' ₽ чаевых');s.round++;nextWaiterOrder();
 }else drawWaiter();
}
function finishWaiter(){
 clearInterval(interval);let s=shift;state.money+=s.tips;state.business+=s.revenue;state.xp+=s.xp+10;state.service=Math.max(0,Math.min(100,state.service+s.correct-s.mistakes));state.day++;state.skills.service++;
 if(!state.achievements.includes('Первая смена'))state.achievements.push('Первая смена');save();shift=null;
 shell('<div class="hero"><small>СМЕНА ЗАВЕРШЕНА</small><h1>'+s.correct+' заказов</h1></div><div class="metrics">'+metric('Верно',s.correct)+metric('Ошибки',s.mistakes)+metric('Выручка',s.revenue+' ₽')+metric('Чаевые',s.tips+' ₽')+metric('XP','+'+(s.xp+10))+'</div><button class="primary" id="backHome">На главную</button>');
 $('#backHome').onclick=()=>{view='home';render()}
}
function senior(){shift={type:'senior',time:75,score:0,staff:[['Аня',82],['Саша',25],['Юля',55],['Катя',68]],events:[]};drawSenior();interval=setInterval(()=>{shift.time--;if(Math.random()<.35)shift.events.push({text:['Стол №7 ждёт 8 минут','Новый большой стол','Гость просит старшего','Официант перегружен'][Math.floor(Math.random()*4)],urgent:Math.random()<.5});if(shift.events.length>4)shift.events.shift();if(shift.time<=0)finishGeneric('Старший официант');else drawSenior()},1000)}
function drawSenior(){let s=shift;shell('<div class="shift-head"><h2>Управление залом</h2><div class="timer">'+s.time+'с</div></div>'+s.staff.map((e,i)=>'<div class="card employee"><b>'+e[0]+'</b><span>'+e[1]+'% загрузки</span><div class="progress"><i style="width:'+e[1]+'%"></i></div><button class="tiny" data-help="'+i+'">Перераспределить</button></div>').join('')+'<div class="section-title"><h2>События</h2></div>'+s.events.map((e,i)=>'<div class="card event '+(e.urgent?'urgent':'')+'"><b>⚠ '+e.text+'</b><div class="choice"><button data-event="'+i+'">Решить сейчас</button></div></div>').join(''));document.querySelectorAll('[data-help]').forEach(b=>b.onclick=()=>{let e=s.staff[+b.dataset.help];e[1]=Math.max(10,e[1]-25);s.score+=4;drawSenior()});document.querySelectorAll('[data-event]').forEach(b=>b.onclick=()=>{s.events.splice(+b.dataset.event,1);s.score+=6;drawSenior()})}
const ADMIN_EVENTS=[['😠 Холодный бургер',['Заменить блюдо','Скидка 20%','Отказать']],['🛵 Курьер ждёт 15 минут',['Ускорить кухню','Компенсировать ожидание','Оставить как есть']],['👨‍🍳 Конфликт кухни и зала',['Развести и поговорить','Поддержать кухню','Поддержать зал']],['❌ Сотрудник не вышел',['Вызвать замену','Перераспределить зал','Работать меньшим составом']],['🥩 Закончилась позиция',['Стоп-лист и замена','Срочная закупка','Продолжать продавать']]];
function admin(){shift={type:'admin',time:80,score:0,events:[],guests:75,team:70,kitchen:70,delivery:70,revenue:0};drawAdmin();interval=setInterval(()=>{shift.time--;shift.revenue+=Math.floor(200+Math.random()*400);if(Math.random()<.28&&shift.events.length<4){let e=ADMIN_EVENTS[Math.floor(Math.random()*ADMIN_EVENTS.length)];shift.events.push({title:e[0],choices:e[1],age:0})}shift.events.forEach(e=>e.age++);if(shift.events.some(e=>e.age>14)){shift.guests-=3;shift.team-=2}if(shift.time<=0)finishGeneric('Администратор');else drawAdmin()},1000)}
function drawAdmin(){let s=shift;shell('<div class="shift-head"><h2>Смена администратора</h2><div class="timer">'+s.time+'с</div></div><div class="metrics">'+metric('Гости',s.guests)+metric('Команда',s.team)+metric('Кухня',s.kitchen)+metric('Доставка',s.delivery)+metric('Выручка',s.revenue+' ₽')+'</div><div class="section-title"><h2>Активные проблемы</h2></div>'+(s.events.length?s.events.map((e,i)=>'<div class="card event '+(e.age>8?'urgent':'')+'"><b>'+e.title+'</b><p class="muted">Срочность: '+e.age+'/15</p><div class="choice">'+e.choices.map((c,j)=>'<button data-choice="'+i+','+j+'">'+c+'</button>').join('')+'</div></div>').join(''):'<div class="card muted">Пока спокойно. Следи за сменой.</div>'));document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{let [i,j]=b.dataset.choice.split(',').map(Number);s.events.splice(i,1);s.score+=5-j;s.guests+=j===0?3:j===1?1:-4;s.team+=j===0?1:j===2?-2:0;drawAdmin()})}
function finishGeneric(name){clearInterval(interval);let s=shift;state.xp+=20+s.score;state.money+=300+s.score*10;state.business+=s.revenue||0;state.day++;state.authority+=2;state.skills.leadership++;save();shift=null;shell('<div class="hero"><small>СМЕНА ЗАВЕРШЕНА</small><h1>'+name+'</h1><p>Решения: '+s.score+' очков эффективности</p></div><div class="metrics">'+metric('XP','+'+(20+s.score))+metric('Бонус',(300+s.score*10)+' ₽')+'</div><button class="primary" id="backHome">На главную</button>');$('#backHome').onclick=()=>{view='home';render()}}
function managerMode(title){shift={type:'manager'};shell('<div class="hero"><small>УПРАВЛЕНЧЕСКИЙ РЕЖИМ</small><h1>'+title+'</h1><p>Базовый режим подготовлен. Следующий этап — экономика, персонал, маркетинг и симуляция дня.</p></div><div class="card"><b>Режим находится в разработке</b><p class="muted">Кнопка не является мёртвой: полноценную механику добавим после теста первых трёх должностей.</p></div><button class="primary" id="backHome">Вернуться</button>');$('#backHome').onclick=()=>{shift=null;view='home';render()}}
function startShift(){if(state.role===0)waiter();else if(state.role===1)senior();else if(state.role===2)admin();else managerMode(ROLES[state.role].name)}
render();