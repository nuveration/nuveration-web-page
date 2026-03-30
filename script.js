const CLIENT_ID = "Ov23lihS21fywXyFbKFf";
const REPO = "nuveration/nuverat-phone";

async function startDeviceLogin() {
    const authBox = document.getElementById('auth-section');
    authBox.innerHTML = `<h2>A ligar ao GitHub...</h2><p>Por favor, aguarda.</p>`;

    try {
        // 1. Pedir código ao GitHub
        const response = await fetch('https://github.com/login/device/code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ client_id: CLIENT_ID, scope: 'repo,user' })
        });
        const data = await response.json();

        // 2. Mostrar código ao utilizador
        authBox.innerHTML = `
            <h2>Autenticação Nuveration</h2>
            <p>Introduz este código no teu GitHub:</p>
            <div class="user-code">${data.user_code}</div>
            <a href="${data.verification_uri}" target="_blank" class="btn-main">Confirmar no GitHub</a>
            <p style="margin-top:20px; font-size:0.8rem; color:#666">O dashboard abrirá automaticamente após confirmares.</p>
        `;

        // 3. Ficar a ouvir a confirmação
        pollForToken(data.device_code);
    } catch (err) {
        authBox.innerHTML = `<h2>Erro na ligação</h2><p>Verifica se o Client ID está correto.</p>`;
    }
}

async function pollForToken(deviceCode) {
    const interval = setInterval(async () => {
        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                client_id: CLIENT_ID,
                device_code: deviceCode,
                grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
            })
        });
        const data = await response.json();

        if (data.access_token) {
            clearInterval(interval);
            loadDashboard(data.access_token);
        }
    }, 5000);
}

async function loadDashboard(token) {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');

    // Carregar Issues reais
    const issuesRes = await fetch(`https://api.github.com/repos/${REPO}/issues`);
    const issues = await issuesRes.json();
    const list = document.getElementById('issues-list');
    list.innerHTML = issues.slice(0,4).map(i => `
        <div style="background:#000; padding:10px; margin-bottom:5px; border-radius:4px; font-size:0.8rem">
            <b style="color:#ff0055">#${i.number}</b> ${i.title}
        </div>
    `).join('') || "Sem issues abertas.";

    // Simular Consola Git
    const log = document.getElementById('git-log');
    log.innerHTML = `<p style="color:#fff">> git remote add origin nuveration...</p>`;
    log.innerHTML += `<p>> Autenticação confirmada.</p>`;
    log.innerHTML += `<p>> A carregar projeto nuverat-phone...</p>`;
    log.innerHTML += `<p style="color:var(--cyan)">> Pronto para contribuir.</p>`;
}
