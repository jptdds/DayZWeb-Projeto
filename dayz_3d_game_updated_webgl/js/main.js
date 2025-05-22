// Arquivo principal para inicialização do jogo
document.addEventListener('DOMContentLoaded', () => {
    console.log("Survival City 3D - Inicializando...");
    
    // Verificar suporte a WebGL e outros requisitos
    const requirements = checkRequirements();
    
    if (!requirements.success) {
        showErrorMessage(requirements.errorTitle, requirements.errorMessage);
        return;
    }
    
    // Inicializar recursos necessários
    initializeResources()
        .then(() => {
            // Criar instância do jogo
            window.gameInstance = new Game();
            console.log("Jogo inicializado com sucesso!");
        })
        .catch(error => {
            console.error("Erro ao inicializar recursos:", error);
            showErrorMessage(
                "Erro ao carregar recursos", 
                "Ocorreu um erro ao carregar recursos necessários. Por favor, tente novamente ou use um navegador diferente."
            );
        });
});

// Verificar todos os requisitos necessários
function checkRequirements() {
    // Verificar WebGL
    const webglSupport = checkWebGLSupport();
    if (!webglSupport.supported) {
        return {
            success: false,
            errorTitle: "WebGL não suportado",
            errorMessage: `Seu navegador ou dispositivo não suporta WebGL, necessário para executar este jogo.
                <br><br>
                Detalhes: ${webglSupport.reason}
                <br><br>
                Recomendações:
                <ul>
                    <li>Atualize seu navegador para a versão mais recente</li>
                    <li>Tente usar Chrome, Firefox ou Edge</li>
                    <li>Verifique se a aceleração de hardware está ativada nas configurações do navegador</li>
                    <li>Atualize os drivers da sua placa de vídeo</li>
                </ul>`
        };
    }
    
    // Verificar suporte a áudio
    if (!window.AudioContext && !window.webkitAudioContext) {
        return {
            success: false,
            errorTitle: "Áudio não suportado",
            errorMessage: "Seu navegador não suporta Web Audio API, necessária para os efeitos sonoros do jogo. Por favor, use um navegador mais recente."
        };
    }
    
    // Verificar suporte a módulos ES6
    try {
        new Function('import("")');
    } catch (err) {
        return {
            success: false,
            errorTitle: "JavaScript moderno não suportado",
            errorMessage: "Seu navegador não suporta recursos modernos de JavaScript necessários para o jogo. Por favor, use um navegador atualizado."
        };
    }
    
    // Verificar memória disponível (estimativa)
    if (navigator.deviceMemory && navigator.deviceMemory < 4) {
        console.warn("Memória do dispositivo pode ser insuficiente:", navigator.deviceMemory, "GB");
        // Apenas aviso, não bloqueia o jogo
    }
    
    // Verificar performance (opcional)
    try {
        const canvas = document.createElement('canvas');
        const gl = forceWebGL2Context(canvas);
        const extension = gl.getExtension('WEBGL_debug_renderer_info');
        if (extension) {
            const renderer = gl.getParameter(extension.UNMASKED_RENDERER_WEBGL);
            console.log("Renderizador WebGL:", renderer);
            
            // Verificar se é um renderizador de software
            if (renderer.indexOf('SwiftShader') >= 0 || 
                renderer.indexOf('software') >= 0 || 
                renderer.indexOf('llvmpipe') >= 0) {
                console.warn("Renderizador de software detectado. O desempenho pode ser afetado.");
                // Apenas aviso, não bloqueia o jogo
            }
        }
    } catch (e) {
        console.warn("Não foi possível verificar o renderizador WebGL:", e);
    }
    
    // Todos os requisitos essenciais foram atendidos
    return {
        success: true
    };
}

// Verificar suporte a WebGL com detalhes
function checkWebGLSupport() {
    try {
        const canvas = document.createElement('canvas');
        
        // Tentar obter contexto WebGL2 primeiro (preferido)
        let gl = canvas.getContext('webgl2');
        
        if (!gl) {
            // Tentar WebGL1 como fallback
            gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) {
                return {
                    supported: false,
                    reason: "WebGL não está disponível neste navegador/dispositivo."
                };
            } else {
                console.warn("WebGL 2 não disponível, usando WebGL 1 como fallback.");
                // Armazenar o contexto para uso posterior
                window.WEBGL_VERSION = 1;
                return { supported: true };
            }
        } else {
            // WebGL 2 está disponível
            console.log("Usando WebGL 2");
            window.WEBGL_VERSION = 2;
            return { supported: true };
        }
    } catch (e) {
        return {
            supported: false,
            reason: "Erro ao inicializar WebGL: " + e.message
        };
    }
}

// Forçar o uso de WebGL2 quando disponível
function forceWebGL2Context(canvas) {
    // Tentar obter contexto WebGL2 primeiro
    let gl = canvas.getContext('webgl2', { 
        alpha: false,
        antialias: true,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false
    });
    
    if (!gl) {
        // Fallback para WebGL1
        gl = canvas.getContext('webgl', { 
            alpha: false,
            antialias: true,
            powerPreference: 'high-performance',
            failIfMajorPerformanceCaveat: false
        }) || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            throw new Error("WebGL não está disponível");
        }
    }
    
    return gl;
}

// Mostrar mensagem de erro personalizada
function showErrorMessage(title, message) {
    // Criar container se não existir
    let container = document.getElementById('game-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'game-container';
        document.body.appendChild(container);
    }
    
    container.innerHTML = `
        <div class="error-message">
            <h2>${title}</h2>
            <div>${message}</div>
            <div class="error-actions">
                <button onclick="location.reload()">Tentar Novamente</button>
                <a href="https://get.webgl.org" target="_blank">Mais Informações sobre WebGL</a>
            </div>
        </div>
    `;
    
    // Adicionar estilo para a mensagem de erro
    const style = document.createElement('style');
    style.textContent = `
        .error-message {
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            max-width: 600px;
            margin: 100px auto;
            text-align: center;
            font-family: Arial, sans-serif;
        }
        .error-message h2 {
            color: #ff5555;
            margin-bottom: 20px;
        }
        .error-message ul {
            text-align: left;
            margin: 20px auto;
            max-width: 400px;
        }
        .error-actions {
            margin-top: 30px;
        }
        .error-actions button, .error-actions a {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 10px 20px;
            margin: 0 10px;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
        }
        .error-actions button:hover, .error-actions a:hover {
            background-color: #2980b9;
        }
    `;
    document.head.appendChild(style);
}

// Inicializar recursos necessários
function initializeResources() {
    return new Promise(async (resolve, reject) => {
        try {
            // Inicializar Ammo.js (física)
            if (typeof Ammo === 'function') {
                window.Ammo = await Ammo().catch(error => {
                    throw new Error("Falha ao inicializar Ammo.js: " + error.message);
                });
                console.log("Ammo.js inicializado com sucesso");
            } else {
                console.warn("Ammo.js não encontrado, carregando alternativa...");
                // Implementar carregamento alternativo ou usar física simplificada
                window.useSimplePhysics = true;
            }
            
            // Verificar e carregar Three.js se necessário
            if (typeof THREE === 'undefined') {
                console.warn("Three.js não encontrado no escopo global");
                throw new Error("Three.js não está disponível");
            }
            
            // Verificar extensões necessárias do Three.js
            if (!THREE.GLTFLoader) {
                console.warn("GLTFLoader não encontrado, carregando...");
                // Aqui poderia carregar dinamicamente se necessário
            }
            
            // Inicializar sistema de áudio
            try {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                window.audioContext = new AudioContext();
                console.log("Sistema de áudio inicializado");
            } catch (e) {
                console.warn("Não foi possível inicializar o sistema de áudio:", e);
                // Continuar sem áudio
                window.audioEnabled = false;
            }
            
            // Configurar detector de perda de contexto WebGL
            const canvas = document.createElement('canvas');
            const gl = forceWebGL2Context(canvas);
            
            gl.getExtension('WEBGL_lose_context');
            canvas.addEventListener('webglcontextlost', function(e) {
                e.preventDefault();
                console.error("Contexto WebGL perdido!");
                showErrorMessage(
                    "Erro de Renderização", 
                    "O contexto WebGL foi perdido. Isso pode ocorrer devido a problemas com o driver de vídeo ou uso excessivo de memória."
                );
            }, false);
            
            // Tudo inicializado com sucesso
            resolve();
            
        } catch (error) {
            console.error("Erro ao inicializar recursos:", error);
            reject(error);
        }
    });
}

// Adicionar manipulador para erros não capturados
window.addEventListener('error', function(event) {
    console.error("Erro não capturado:", event.error);
    
    // Verificar se é um erro relacionado a WebGL
    const errorMsg = event.message || '';
    if (errorMsg.includes('WebGL') || errorMsg.includes('GPU') || errorMsg.includes('graphics')) {
        showErrorMessage(
            "Erro de Renderização", 
            "Ocorreu um erro relacionado ao sistema gráfico. Tente atualizar seus drivers de vídeo ou usar um navegador diferente."
        );
    }
});

// Adicionar detecção de baixo desempenho
let frameCount = 0;
let lastTime = performance.now();
let lowFPSCount = 0;

function checkPerformance() {
    frameCount++;
    const now = performance.now();
    const elapsed = now - lastTime;
    
    if (elapsed >= 1000) { // Verificar a cada segundo
        const fps = Math.round((frameCount * 1000) / elapsed);
        console.log("FPS:", fps);
        
        if (fps < 30) {
            lowFPSCount++;
            if (lowFPSCount >= 3) { // Se tiver baixo FPS por 3 segundos consecutivos
                console.warn("Desempenho baixo detectado!");
                // Reduzir qualidade automaticamente
                if (window.gameInstance && window.gameInstance.setQualityLevel) {
                    window.gameInstance.setQualityLevel('low');
                    console.log("Qualidade reduzida para melhorar desempenho");
                }
                lowFPSCount = 0; // Resetar contador após ajustar
            }
        } else {
            lowFPSCount = 0; // Resetar se o FPS estiver bom
        }
        
        frameCount = 0;
        lastTime = now;
    }
    
    requestAnimationFrame(checkPerformance);
}

// Iniciar monitoramento de desempenho após o jogo carregar
window.addEventListener('load', () => {
    // Pequeno atraso para permitir que o jogo inicialize
    setTimeout(() => {
        requestAnimationFrame(checkPerformance);
    }, 5000);
});
