// =======================================================
// 1. Variáveis Globais e Estrutura de Rotas (SPA Básico)
// =======================================================

// AGORA APONTA APENAS PARA O NOME DO ARQUIVO (JÁ QUE A URL ATUAL JÁ ESTÁ NA PASTA HTML)
const routes = {
    '': 'index.html', // Chave vazia para rota raiz (/)
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
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");
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
    event.preventDefault(); // Impede a submissão padrão do formulário (que recarregaria a página)

    const form = event.target;
    const formGroups = form.querySelectorAll('.form-group');
    let isValid = true;
    let nomeCompleto = ''; // Variável para o template

    // Limpa estados de erro anteriores
    formGroups.forEach(group => {
        group.classList.remove('error');
    });

    // 1. Itera sobre os campos obrigatórios
    formGroups.forEach(group => {
        const input = group.querySelector('.form-input, .form-select');

        if (input && input.required && !input.value.trim()) {
            // Campo vazio
            group.classList.add('error');
            isValid = false;
        }

        if (input && input.id === 'campo_nome') {
            nomeCompleto = input.value.trim();
        }

        // Validação específica do CPF
        if (input && input.id === 'campo_cpf' && !validateCPF(input.value)) {
            group.classList.add('error');
            isValid = false;
        }
    });

    // 2. Se for válido, simula o envio e usa o sistema de template
    if (isValid) {
        // Simulação de envio para o servidor
        console.log('Formulário enviado com sucesso!', new FormData(form));

        // Encontra o container do formulário para exibir o feedback
        const formContainer = document.querySelector('.form-cadastro-layout');
        if (formContainer) {
            // Usa o template JavaScript para exibir a mensagem de sucesso
            formContainer.innerHTML = templateFeedbackSucesso(nomeCompleto);
        }

       
        saveRegistrationToLocalStorage(new FormData(form));
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

    if (registrations) {
        registrations = JSON.parse(registrations);
    } else {
        registrations = [];
    }

    registrations.push(data);
    localStorage.setItem('patasAmigasRegistrations', JSON.stringify(registrations));
    console.log('Dados salvos no Local Storage!');
}

// =======================================================
// 6. Manipulação do DOM e Lógica de SPA
// =======================================================

/**
 * Função de navegação para o SPA Básico.
 * Carrega o conteúdo da página sem recarregar o navegador.
 */
async function loadContent(path) {
    const contentArea = document.querySelector('main .wrapper');

    // 1. Limpa o path: remove a barra inicial (/) se existir.
    const cleanPath = path.replace(/^\//, '');

    // 2. Determina a Rota
    const route = routes[cleanPath] || routes[''] || 'index.html';

    // Garante que o container existe
    if (!contentArea) {
        console.error('Container de conteúdo (main .wrapper) não encontrado.');
        return; 
    }

    try {
        // O fetch busca o arquivo HTML da rota
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
            
            // Re-bind (re-ativa) todos os EventListeners, especialmente o formulário e as máscaras!
            bindEvents(); 
            
            // Atualiza a URL no navegador
            window.history.pushState({ path: cleanPath }, '', cleanPath);

        } else {
            throw new Error("Não foi possível encontrar o conteúdo principal (main .wrapper) na nova página.");
        }

    } catch (error) {
        console.error('Falha no carregamento do SPA:', error);
        contentArea.innerHTML = `<p class="alert-error">Erro ao carregar conteúdo. (${route})</p>`;
    }
}

/**
 * Função para configurar todos os EventListeners
 */
function bindEvents() {
    // --- Lógica de SPA e Navegação ---
    document.querySelectorAll('nav a').forEach(link => {
        if (!link.classList.contains('no-spa')) { 
             link.addEventListener('click', (e) => {
                // Previne o comportamento padrão (navegação)
                e.preventDefault(); 
                // Obtém o caminho do arquivo (ex: index.html)
                const path = e.target.getAttribute('href'); 
                // Navega para a nova rota e mantém apenas o caminho
               loadContent(path); 
                // Fecha o menu hamburger se estiver aberto
                document.querySelector('nav').classList.remove('open');
            });
        }
    });

    // --- Lógica de Formulário (Cadastro) ---
    const form = document.querySelector('.form-container form');
    if (form) {
        // Ouvinte de submissão
        form.addEventListener('submit', handleFormSubmission);
        
        // Ouvintes de Máscaras
        document.getElementById('campo_cpf')?.addEventListener('input', (e) => {
            e.target.value = maskCPF(e.target.value);
        });
        document.getElementById('campo_telefone')?.addEventListener('input', (e) => {
            e.target.value = maskTelefone(e.target.value);
        });
        document.getElementById('campo_cep')?.addEventListener('input', (e) => {
            e.target.value = maskCEP(e.target.value);
        });
    }
}

// =======================================================
// 7. Inicialização da Aplicação
// =======================================================

// A função toggleMenu (hambúrguer) é mantida no HTML para compatibilidade direta,
// mas seria movida para cá em um projeto 100% JS.

document.addEventListener('DOMContentLoaded', () => {
    // Configura os eventos iniciais
    bindEvents();
    
    // Configura o botão de 'Voltar' do navegador para o SPA
    window.onpopstate = () => {
        loadContent(window.location.pathname);
    };
});