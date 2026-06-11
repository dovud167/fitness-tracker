let dataBase = [];

function switchPage(pageName) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active-page'));
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`page-${pageName}`).classList.add('active-page');
    document.getElementById(`nav-${pageName}`).classList.add('active');
}

function checkExerciseType() {
    const exercise = document.getElementById('modal-exercise').value;
    
    const countGroup = document.getElementById('group-count');
    const durationGroup = document.getElementById('group-duration');
    const runningGroup = document.getElementById('group-running');

    countGroup.style.display = 'none';
    durationGroup.style.display = 'none';
    runningGroup.style.display = 'none';

    if (exercise.includes("Бег")) {
        runningGroup.style.display = 'block';
    } else if (exercise.includes("Планка") || exercise.includes("Вис на турнике")) {
        durationGroup.style.display = 'block';
    } else {
        countGroup.style.display = 'block';
    }
}

function openModal() { 
    const now = new Date();
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    document.getElementById('modal-date').value = `${year}-${month}-${day}`;

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('modal-time').value = `${hours}:${minutes}`;

    document.getElementById('modal-count').value = "10";
    document.getElementById('modal-min').value = "1";
    document.getElementById('modal-sec').value = "0";
    document.getElementById('run-distance').value = "1";
    document.getElementById('run-hour').value = "0";
    document.getElementById('run-min').value = "10";
    document.getElementById('run-sec').value = "0";

    checkExerciseType();
    document.getElementById('exerciseModal').style.display = 'flex'; 
}

function closeModal() { document.getElementById('exerciseModal').style.display = 'none'; }

function saveExerciseData() {
    const exercise = document.getElementById('modal-exercise').value;
    const customDate = document.getElementById('modal-date').value;
    const customTime = document.getElementById('modal-time').value;
    
    let resultResultString = ""; 

    if (exercise.includes("Бег")) {
        const distance = document.getElementById('run-distance').value;
        const unit = document.getElementById('run-unit').value;
        const h = parseInt(document.getElementById('run-hour').value) || 0;
        const m = parseInt(document.getElementById('run-min').value) || 0;
        const s = parseInt(document.getElementById('run-sec').value) || 0;

        if (!distance || distance <= 0) {
            alert("Укажите правильную дистанцию!");
            return;
        }
        if (h === 0 && m === 0 && s === 0) {
            alert("Укажите время бега!");
            return;
        }

        let timeParts = [];
        if (h > 0) timeParts.push(`${h} ч.`);
        if (m > 0) timeParts.push(`${m} мин.`);
        if (s > 0) timeParts.push(`${s} сек.`);
        
        resultResultString = `Дистанция: ${distance} ${unit} | Время: ${timeParts.join(' ')}`;

    } else if (exercise.includes("Планка") || exercise.includes("Вис на турнике")) {
        const min = parseInt(document.getElementById('modal-min').value) || 0;
        const sec = parseInt(document.getElementById('modal-sec').value) || 0;
        
        if (min === 0 && sec === 0) {
            alert("Укажите время удержания!");
            return;
        }
        let minStr = min > 0 ? `${min} мин. ` : "";
        let secStr = sec > 0 ? `${sec} сек.` : "";
        resultResultString = minStr + secStr;

    } else {
        const count = document.getElementById('modal-count').value;
        if(!count || count < 1 || count > 1000) {
            alert("Укажите количество от 1 до 1000!");
            return;
        }
        resultResultString = `${count} раз(а)`;
    }

    const finalDateObj = new Date(`${customDate}T${customTime}`);

    const newData = {
        id: Date.now(),
        exercise: exercise,
        result: resultResultString, 
        time: customTime,
        dateString: finalDateObj.toLocaleDateString('ru-RU'),
        dateObj: finalDateObj
    };

    dataBase.push(newData);
    renderData();
    closeModal();
}

function renderData() {
    const todayList = document.getElementById('today-list');
    document.getElementById('profile-count').textContent = dataBase.length;

    if(dataBase.length === 0) {
        todayList.innerHTML = `<p style="color: var(--text-muted);">За сегодня тренировок пока нет.</p>`;
        return;
    }

    todayList.innerHTML = '';
    dataBase.slice().reverse().forEach(item => {
        todayList.innerHTML += `
            <div class="exercise-item">
                <span><strong>${item.exercise}</strong> <br><small style="color:var(--text-muted)">${item.result}</small></span>
                <span style="color: var(--accent-color); text-align: right; min-width: 110px; font-size: 0.9rem;">📅 ${item.dateString}<br>⏰ в ${item.time}</span>
            </div>
        `;
    });

    filterData('all', document.querySelector('.btn-filter.active'));
}

function filterData(range, btnElement) {
    document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');

    const historyList = document.getElementById('history-list');
    if(dataBase.length === 0) {
        historyList.innerHTML = `<p style="color: var(--text-muted); text-align:center;">История пуста.</p>`;
        return;
    }

    const now = new Date();
    let filtered = dataBase.filter(item => {
        const diffTime = Math.abs(now - item.dateObj);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if(range === 'day') {
            return item.dateObj.toDateString() === now.toDateString();
        }
        if(range === 'week') return diffDays <= 7;
        if(range === 'month') return diffDays <= 30;
        if(range === 'year') return diffDays <= 365;
        return true;
    });

    historyList.innerHTML = '';
    if(filtered.length === 0) {
        historyList.innerHTML = `<p style="color: var(--text-muted); text-align:center;">За данный период записей нет.</p>`;
    } else {
        filtered.slice().reverse().forEach(item => {
            historyList.innerHTML += `
                <div class="exercise-item" style="border-left-color: var(--accent-color)">
                    <span><strong>${item.exercise}</strong> <br><small style="color:var(--text-muted)">${item.result}</small></span>
                    <span style="color: var(--text-muted); text-align: right; font-size: 0.85rem;">📅 ${item.dateString}<br>⏰ ${item.time}</span>
                </div>
            `;
        });
    }
}

function toggleFaq(element) {
    const answer = element.querySelector('.faq-answer');
    const arrow = element.querySelector('span');
    if(answer.style.display === 'block') {
        answer.style.display = 'none'; arrow.textContent = '▼';
    } else {
        answer.style.display = 'block'; arrow.textContent = '▲';
    }
}

function sendToAdmin() {
    const text = document.getElementById('support-msg').value;
    if(!text.trim()) { alert('Напишите сообщение!'); return; }
    alert(`Отправлено администратору:\n"${text}"`);
    document.getElementById('support-msg').value = '';
}

function simulateLogin(method) {
    document.getElementById('profile-logged-out').style.display = 'none';
    document.getElementById('profile-logged-in').style.display = 'block';
}

function logout() {
    document.getElementById('profile-logged-in').style.display = 'none';
    document.getElementById('profile-logged-out').style.display = 'block';
    document.getElementById('auth-methods-block').style.display = 'none';
}