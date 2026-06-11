// --- БЛОК 1. ПОДКЛЮЧЕНИЕ К БАЗЕ ДАННЫХ SUPABASE ---
const SUPABASE_URL = "https://rkurxleswixoxoigeese.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_QU4QHXcLWqAKuUy9BQpW4Q_u5yN0MoW";

// Инициализируем клиент базы данных
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Твоя база данных тренировок в памяти
let dataBase = [];

// --- БЛОК 2. ЛОГИКА АВТОРИЗАЦИИ (БЕЗОПАСНАЯ) ---
document.addEventListener("DOMContentLoaded", () => {
    if (!supabase) {
        console.error("Ошибка: Библиотека Supabase не загрузилась.");
        return;
    }

    // Элементы интерфейса для входа
    const emailInput = document.getElementById("email-input");
    const codeInput = document.getElementById("code-input");
    const btnSendCode = document.getElementById("btn-send-code");
    const btnVerifyCode = document.getElementById("btn-verify-code");
    const btnGoogleAuth = document.getElementById("btn-google-auth");

    // Отправка кода на Email
    if (btnSendCode && emailInput) {
        btnSendCode.addEventListener("click", async () => {
            const email = emailInput.value.trim();
            if (!email) {
                alert("Пожалуйста, введи свой Email!");
                return;
            }
            btnSendCode.innerText = "Отправка...";
            btnSendCode.disabled = true;

            const { error } = await supabase.auth.signInWithOtp({ email: email });

            if (error) {
                alert("Ошибка отправки кода: " + error.message);
                btnSendCode.innerText = "📩 Получить код на Email";
                btnSendCode.disabled = false;
            } else {
                alert("Код успешно отправлен на твою почту!");
                btnSendCode.innerText = "Код отправлен";
            }
        });
    }

    // Проверка введенного кода из письма
    if (btnVerifyCode && codeInput && emailInput) {
        btnVerifyCode.addEventListener("click", async () => {
            const email = emailInput.value.trim();
            const token = codeInput.value.trim();

            if (!email || !token) {
                alert("Введи Email и Код из письма!");
                return;
            }
            btnVerifyCode.innerText = "Проверка...";

            const { error } = await supabase.auth.verifyOtp({
                email: email,
                token: token,
                type: 'magiclink'
            });

            if (error) {
                alert("Неверный код: " + error.message);
                btnVerifyCode.innerText = "✅ Подтвердить код";
            } else {
                alert("Авторизация успешна!");
                checkUser();
            }
        });
    }

    // Вход через Google
    if (btnGoogleAuth) {
        btnGoogleAuth.addEventListener("click", async () => {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin }
            });
            if (error) alert("Ошибка входа через Google: " + error.message);
        });
    }

    // Автоматическая проверка: вошел ли пользователь?
    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser();
        const profileEmailText = document.getElementById("profile-email-text");
        const loggedOutBlock = document.getElementById('profile-logged-out');
        const loggedInBlock = document.getElementById('profile-logged-in');

        if (user) {
            if (loggedOutBlock) loggedOutBlock.style.display = 'none';
            if (loggedInBlock) loggedInBlock.style.display = 'block';
            if (profileEmailText) profileEmailText.innerText = user.email;
        } else {
            if (loggedInBlock) loggedInBlock.style.display = 'none';
            if (loggedOutBlock) loggedOutBlock.style.display = 'block';
        }
    }
    checkUser();
});

// --- БЛОК 3. ТВОЙ СТАРЫЙ ОРИГИНАЛЬНЫЙ КОД (БЕЗ ИЗМЕНЕНИЙ) ---

function switchPage(pageName) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active-page'));
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    
    // Проверяем, существуют ли элементы, чтобы код не падал
    const targetPage = document.getElementById(`page-${pageName}`);
    const targetBtn = document.getElementById(`nav-${pageName}`);
    
    if (targetPage) targetPage.classList.add('active-page');
    if (targetBtn) targetBtn.classList.add('active');
}

function checkExerciseType() {
    const exercise = document.getElementById('modal-exercise').value;
    
    const countGroup = document.getElementById('group-count');
    const durationGroup = document.getElementById('group-duration');
    const runningGroup = document.getElementById('group-running');

    if (countGroup) countGroup.style.display = 'none';
    if (durationGroup) durationGroup.style.display = 'none';
    if (runningGroup) runningGroup.style.display = 'none';

    if (exercise.includes("Бег")) {
        if (runningGroup) runningGroup.style.display = 'block';
    } else if (exercise.includes("Планка") || exercise.includes("Вис на турнике")) {
        if (durationGroup) durationGroup.style.display = 'block';
    } else {
        if (countGroup) countGroup.style.display = 'block';
    }
}

function openModal() { 
    const now = new Date();
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    const modalDate = document.getElementById('modal-date');
    const modalTime = document.getElementById('modal-time');
    
    if (modalDate) modalDate.value = `${year}-${month}-${day}`;
    if (modalTime) modalTime.value = `${now.getHours()}:${now.getMinutes()}`;

    checkExerciseType();
    const modal = document.getElementById('exerciseModal');
    if (modal) modal.style.display = 'flex'; 
}

function closeModal() { 
    const modal = document.getElementById('exerciseModal');
    if (modal) modal.style.display = 'none'; 
}

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
    const profileCount = document.getElementById('profile-count');
    if (profileCount) profileCount.textContent = dataBase.length;

    if (!todayList) return;

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

    const activeFilter = document.querySelector('.btn-filter.active');
    filterData('all', activeFilter);
}

function filterData(range, btnElement) {
    if (btnElement) {
        document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
        btnElement.classList.add('active');
    }

    const historyList = document.getElementById('history-list');
    if (!historyList) return;

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
    if(!answer) return;
    if(answer.style.display === 'block') {
        answer.style.display = 'none'; 
        if (arrow) arrow.textContent = '▼';
    } else {
        answer.style.display = 'block'; 
        if (arrow) arrow.textContent = '▲';
    }
}

function sendToAdmin() {
    const text = document.getElementById('support-msg').value;
    if(!text.trim()) { alert('Напишите сообщение!'); return; }
    alert(`Отправлено администратору:\n"${text}"`);
    document.getElementById('support-msg').value = '';
}

function simulateLogin(method) {}

async function logout() {
    if (supabase) {
        await supabase.auth.signOut();
        alert("Вы вышли из системы");
        window.location.reload();
    }
}