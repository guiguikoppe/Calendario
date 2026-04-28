let currentViewDate = new Date();
let feriadosDoAno = [];
let dataSelecionada = null;

async function init() {
    updateHeaderStats();
    await carregarFeriados(currentViewDate.getFullYear());

    const hojeInput = new Date().toISOString().split('T')[0];
    document.getElementById('start-date').value = hojeInput;
}

function updateHeaderStats() {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today - start;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    document.getElementById('stats-topo').innerText =
        `Dia ${dayOfYear} de ${today.getFullYear()}`;
}

async function carregarFeriados(ano) {
    try {
        const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
        feriadosDoAno = await response.json();
    } catch {
        feriadosDoAno = [];
    }
    renderCalendar();
}

function renderCalendar() {
    const body = document.getElementById('calendar-body');
    const monthTitle = document.getElementById('mes-atual');

    body.innerHTML = "";

    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();

    monthTitle.innerText = new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric'
    }).format(currentViewDate);

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    // dias vazios
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = "empty-day";
        body.appendChild(empty);
    }

    // dias do mês
    for (let d = 1; d <= lastDate; d++) {
        const dataFormatada = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const feriado = feriadosDoAno.find(f => f.date === dataFormatada);

        const isToday =
            d === new Date().getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();

        const dayEl = document.createElement('div');
        dayEl.className = `day ${isToday ? 'today' : ''} ${feriado ? 'holiday' : ''}`;
        dayEl.innerText = d;

        dayEl.onclick = () => selectDay(d, month, year, feriado || null);

        body.appendChild(dayEl);
    }
}

// 🔥 STORAGE
function salvarEvento(data, texto) {
    localStorage.setItem(data, texto);
}

function carregarEvento(data) {
    return localStorage.getItem(data) || "";
}

async function selectDay(d, m, y, feriadoObj) {
    document.querySelectorAll('.day').forEach(el => el.classList.remove('selected'));

    const el = Array.from(document.querySelectorAll('.day')).find(e => e.innerText == d);
    if (el) el.classList.add('selected');

    const dataKey = `${y}-${m}-${d}`;
    dataSelecionada = dataKey;

    document.getElementById('selected-date-title').innerText =
        `${d} de ${new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(y, m, d))}`;

    // 📝 CARREGAR ANOTAÇÃO NO TEXTAREA
    const eventoAtual = carregarEvento(dataKey);
    document.getElementById("note-input").value = eventoAtual;

    // 📌 FERIADO
    const cardFeriado = document.getElementById('card-feriado');
    if (feriadoObj) {
        cardFeriado.style.display = "block";
        document.getElementById('nome-feriado').innerText = feriadoObj.name;
    } else {
        cardFeriado.style.display = "none";
    }

    // 📌 FAMOSO
    document.getElementById('famoso-nome').innerText =
        (typeof buscarFamoso === 'function')
            ? buscarFamoso(m, d)
            : "Nenhum famoso";

    // 📌 HISTÓRIA
    const fatoEl = document.getElementById('fato-texto');
    fatoEl.innerText = "Carregando...";

    try {
        const res = await fetch(`https://pt.wikipedia.org/api/rest_v1/feed/onthisday/events/${m + 1}/${d}`);
        const data = await res.json();

        const historia = data.events
            .slice(0, 3)
            .map(e => `${e.year}: ${e.text}`)
            .join("\n\n");

        fatoEl.innerText = historia;

    } catch {
        fatoEl.innerText = "História não disponível.";
    }
}

// 💾 SALVAR NOTA (SEM PROMPT)
function salvarNota() {
    if (!dataSelecionada) {
        alert("Selecione um dia primeiro!");
        return;
    }

    const texto = document.getElementById("note-input").value;
    salvarEvento(dataSelecionada, texto);
}

// 📅 MUDAR MÊS
function mudarMes(dir) {
    const anoAnt = currentViewDate.getFullYear();
    currentViewDate.setMonth(currentViewDate.getMonth() + dir);

    if (currentViewDate.getFullYear() !== anoAnt) {
        carregarFeriados(currentViewDate.getFullYear());
    } else {
        renderCalendar();
    }
}

// 📊 CALCULADORA
function calcularIntervalo() {
    const inicio = new Date(document.getElementById('start-date').value);
    const fim = new Date(document.getElementById('end-date').value);
    const res = document.getElementById('countdown-result');

    if (isNaN(inicio) || isNaN(fim)) {
        res.innerText = "Selecione as datas!";
        return;
    }

    const diff = Math.floor((fim - inicio) / (1000 * 60 * 60 * 24));

    res.innerText =
        diff >= 0
            ? `${diff} dias de diferença`
            : `Data final é anterior (${Math.abs(diff)} dias)`;
}

function resetarContador() {
    document.getElementById('end-date').value = "";
    document.getElementById('countdown-result').innerText = "---";
}

window.onload = init;