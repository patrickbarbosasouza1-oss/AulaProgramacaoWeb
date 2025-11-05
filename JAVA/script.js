// =======================================================
// 1. Variáveis Globais e Estrutura de Rotas (SPA Básico)
// =======================================================

const routes = {
    // Chave vazia para rota raiz (/) - Usado ao carregar a página inicialmente
    '': 'index.html', 
    'index.html': 'index.html',
    'projeto.html': 'projeto.html',
    'cadastro.html': 'cadastro.html',
};

// =======================================================
// 2. Templates JavaScript (Simples para Exemplo)
// =======================================================

// Template de Exemplo: Mensagem de Sucesso após Cadastro
const templateFeedbackSucesso = (nome) => `
    <div class="alert alert-success">
        <h3 style="color: var(--cor-sucesso);">🎉 Cadastro Concluído com Sucesso!</h3>
        <p>Obrigado, ${nome}! Seu interesse em ser voluntário na ONG Patas Amigas foi registrado.</p>
        <p>Entraremos em contato em breve através do seu e-mail para os próximos passos.</p>
    </div>
`;

// =======================================================
// 3. Funções de Utilitários (Máscaras e Validação)
// =======================================================

/**
 * Aplica a máscara de CPF (000.000.000-00).
 */
function maskCPF(value) {
    value = value.replace(/\D/g, ""); // Remove tudo que não for dígito
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return value;
}

/**
 * Aplica a máscara de Telefone ((XX) XXXXX-XXXX).
 */
function maskTelefone(value) {
    value = value.replace(/\D/g, ""); // Remove tudo que não for dígito
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    // Verifica se é 9 ou 8 dígitos após o prefixo (para celular ou fixo)
    value = value.replace(/(\d{5})(\d{4})$/, "$1-$2"); 
    return value;
}

/**
 * Aplica a máscara de CEP (00000-000).
 */
function maskCEP(value) {
    value = value.replace(/\D/g, ""); // Remove tudo que não for dígito
    value = value.replace(/(\d{5})(\d)/, "$1-$2");
    return value;
}

/**
 * Função simples para verificar se um CPF está em um formato válido.
 */
function validateCPF(cpf) {
    // Verifica se tem 14 caracteres (formato com pontos e hífen)
    // Uma validação mais robusta seria necessária para produção
    return cpf.length === 14; 
}

// =======================================================
// 4. Lógica de Validação e Submissão do Formulário
// =======================================================

/**
 * Valida o formulário antes da submissão e aplica feedback visual.
 * @param {Event} event - O evento de submissão do formulário.
 */
function handleFormSubmission(event) {
    event.preventDefault(); 

    const form = event.target;
    const formContainer = document.querySelector('.form-cadastro-layout');
    let isValid = true;
    let nomeCompleto = ''; 

    // Limpa estados de erro anteriores
    form.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error');
    });

    // 1. Itera sobre os campos obrigatórios
    form.querySelectorAll('.form-group').forEach(group => {
        const input = group.querySelector('.form-input, .form-select');

        if (input) {
             // 1. Validação de Campo Vazio
            if (input.required && !input.value.trim()) {
                group.classList.add('error');
                isValid = false;
            }
            
            // 2. Coleta o nome para o template
            if (input.id === 'campo_nome') {
                nomeCompleto = input.value.trim();
            }

            // 3. Validação específica do CPF (se o campo for relevante)
            if (input.id === 'campo_cpf' && input.value.trim() && !validateCPF(input.value)) {
                group.classList.add('error');
                isValid = false;
            }
        }
    });

    // 2. Se for válido, simula o envio
    if (isValid) {
        console.log('Formulário enviado com sucesso!');

        // Salva e exibe o feedback
        saveRegistrationToLocalStorage(new FormData(form));
        if (formContainer) {
            formContainer.innerHTML = templateFeedbackSucesso(nomeCompleto);
        }

    } else {
        alert('Por favor, preencha todos os campos obrigatórios e corrija os erros de formato.');
    }
}

// =======================================================
// 5. Integração com Armazenamento Local (localStorage)
// =======================================================

/**
 * Salva os dados de um cadastro no localStorage.
 * @param {FormData} formData - Dados do formulário.
 */
function saveRegistrationToLocalStorage(formData) {
    const data = Object.fromEntries(formData.entries());
    let registrations = localStorage.getItem('patasAmigasRegistrations');

    registrations = registrations ? JSON.parse(registrations) : [];

    registrations.push(data);
    localStorage.setItem('patasAmigasRegistrations', JSON.stringify(registrations));
    console.log('Dados salvos no Local Storage!');
}

// =======================================================
// 6. Lógica de Acessibilidade: Modo Escuro e Menu Hamburguer
// =======================================================

// NOVO: Acessibilidade de 3 estados
const THEMES = ['light', 'dark-mode', 'high-contrast-mode'];

/**
 * 🌙 Alterna entre modo claro, escuro e alto contraste.
 */
function toggleDarkMode() {
    const body = document.body;
    let currentTheme = 'light';

    // 1. Determina o tema atual
    if (body.classList.contains('dark-mode')) {
        currentTheme = 'dark-mode';
    } else if (body.classList.contains('high-contrast-mode')) {
        currentTheme = 'high-contrast-mode';
    }

    // 2. Determina o próximo tema na sequência: light -> dark-mode -> high-contrast-mode -> light
    const currentIndex = THEMES.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    const nextTheme = THEMES[nextIndex];

    // 3. Aplica o novo tema
    body.classList.remove(...THEMES.filter(t => t !== 'light')); 

    if (nextTheme !== 'light') {
        body.classList.add(nextTheme);
    }

    // 4. Salva e atualiza o ícone
    localStorage.setItem('themePreference', nextTheme);
    updateThemeToggleIcon(nextTheme);
}

/**
 * ☀️ Carrega a preferência de tema do usuário ao iniciar a página.
 */
function loadThemePreference() {
    const preference = localStorage.getItem('themePreference') || 'light';

    if (preference !== 'light') {
        document.body.classList.add(preference);
    }
    // Garante que o ícone inicial esteja correto
    updateThemeToggleIcon(preference);
}

/**
 * Atualiza o ícone do botão de alternância de tema.
 * @param {string} theme - O tema ativo ('light', 'dark-mode', 'high-contrast-mode').
 */
function updateThemeToggleIcon(theme) {
    const button = document.querySelector('.theme-toggle-btn');
    if (button) {
        let icon = '🌙'; // Padrão: Sugere ir para o Escuro
        let label = 'Ativar modo escuro';

        if (theme === 'dark-mode') {
            icon = '⚙️'; // Sugere ir para o Alto Contraste
            label = 'Ativar modo de alto contraste';
        } else if (theme === 'high-contrast-mode') {
            icon = '☀️'; // Sugere voltar para o Claro (ou Sol)
            label = 'Voltar para modo claro';
        } 
        
        button.innerHTML = icon;
        button.setAttribute('aria-label', label);
    }
}

// =======================================================
// 7. Manipulação do DOM e Lógica de SPA (Navegação)
// =======================================================

/**
 * Função de navegação para o SPA Básico.
 */
async function loadContent(path) {
    const contentArea = document.querySelector('main .wrapper');

    const cleanPath = path.replace(/^\//, '').replace(/^.*\//, ''); // Limpa e pega apenas o nome do arquivo
    const route = routes[cleanPath] || routes[''] || 'index.html';

    if (!contentArea) {
        console.error('Container de conteúdo (main .wrapper) não encontrado.');
        return; 
    }

    try {
        const response = await fetch(route);
        
        if (!response.ok) {
            throw new Error(`Erro ao carregar a página: ${route}. Status: ${response.status}`);
        }

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Pega apenas o conteúdo que está dentro do 'main .wrapper' da nova página
        const newMainContent = doc.querySelector('main .wrapper');
        
        if (newMainContent) {
            contentArea.innerHTML = newMainContent.innerHTML;
            
            // Re-bind (re-ativa) todos os EventListeners, essencial para o formulário e temas!
            bindEvents(); 
            
            // Atualiza a URL no navegador
            window.history.pushState({ path: cleanPath }, '', cleanPath);

            // 🚨 NOVO: Move o foco para o primeiro H1 ou H2 no novo conteúdo (Acessibilidade)
            const newTitle = contentArea.querySelector('h1, h2');
            if (newTitle) {
                // Torna o título focável e move o foco
                newTitle.setAttribute('tabindex', '-1'); 
                newTitle.focus();
            }

        } else {
            throw new Error("Não foi possível encontrar o conteúdo principal (main .wrapper) na nova página.");
        }

    } catch (error) {
        console.error('Falha no carregamento do SPA:', error);
        contentArea.innerHTML = `<p class="alert-error">Erro ao carregar conteúdo. (${route})</p>`;
    }
}


/**
 * Função para configurar todos os EventListeners (chamada em cada troca de página do SPA)
 */
function bindEvents() {
    // --- Lógica de SPA e Navegação ---
    document.querySelectorAll('nav a').forEach(link => {
        // Remove listeners anteriores para evitar duplicação no SPA
        link.removeEventListener('click', handleNavigation); 
        link.addEventListener('click', handleNavigation);
    });

    // --- Lógica de Formulário (Cadastro) ---
    const form = document.querySelector('.form-container form');
    if (form) {
        // Ouvinte de submissão
        form.removeEventListener('submit', handleFormSubmission);
        form.addEventListener('submit', handleFormSubmission);
        
        // Ouvintes de Máscaras (Garantindo que só haja um listener)
        const cpfInput = document.getElementById('campo_cpf');
        const telInput = document.getElementById('campo_telefone');
        const cepInput = document.getElementById('campo_cep');

        if (cpfInput) {
            cpfInput.removeEventListener('input', applyMaskCPF);
            cpfInput.addEventListener('input', applyMaskCPF);
        }
        if (telInput) {
            telInput.removeEventListener('input', applyMaskTelefone);
            telInput.addEventListener('input', applyMaskTelefone);
        }
        if (cepInput) {
            cepInput.removeEventListener('input', applyMaskCEP);
            cepInput.addEventListener('input', applyMaskCEP);
        }
    }
    
    // --- Lógica de Menu Hamburguer ---
    // Você precisará definir a função 'toggleMenu' em algum lugar do seu código
    document.querySelector('.hamburger-menu')?.removeEventListener('click', toggleMenu);
    document.querySelector('.hamburger-menu')?.addEventListener('click', toggleMenu);
    
    // --- Lógica de Modo Escuro/Alto Contraste: ATUALIZAÇÃO DO ÍCONE ---
    // 🚨 CORREÇÃO APLICADA: Esta lógica garante que o ícone do tema seja redefinido
    // corretamente após a troca de página no SPA, verificando os 3 estados.
    let currentTheme = 'light';
    if (document.body.classList.contains('dark-mode')) {
        currentTheme = 'dark-mode';
    } else if (document.body.classList.contains('high-contrast-mode')) {
        currentTheme = 'high-contrast-mode';
    }
    updateThemeToggleIcon(currentTheme);
}

// Funções auxiliares para os EventListeners de input (para remover/adicionar corretamente)
function handleNavigation(e) {
    e.preventDefault(); 
    const path = e.target.getAttribute('href'); 
    loadContent(path); 
    document.querySelector('nav')?.classList.remove('open');
}

function applyMaskCPF(e) { e.target.value = maskCPF(e.target.value); }
function applyMaskTelefone(e) { e.target.value = maskTelefone(e.target.value); }
function applyMaskCEP(e) { e.target.value = maskCEP(e.target.value); }

// Nota: A função 'toggleMenu' para o menu hamburger não está definida aqui. 
// Certifique-se de que ela existe (se for usada). Exemplo:
function toggleMenu() {
    document.querySelector('nav').classList.toggle('open');
}


// =======================================================
// 8. Inicialização da Aplicação
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Carrega a preferência de tema *antes* de configurar outros eventos
    loadThemePreference(); 
    
    // 2. Configura os eventos iniciais
    bindEvents();
    
    // 3. Configura o botão de 'Voltar' do navegador para o SPA
    window.onpopstate = () => {
        // Pega a URL atual e carrega o conteúdo correspondente
        loadContent(window.location.pathname);
    };
});