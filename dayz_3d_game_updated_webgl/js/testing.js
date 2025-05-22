// Arquivo de configuração para testes e otimização
class TestAndOptimization {
    constructor(game) {
        this.game = game;
        this.scene = game.scene;
        this.renderer = game.renderer;
        this.camera = game.camera;
        
        // Estatísticas de desempenho
        this.stats = {
            fps: 0,
            frameTime: 0,
            memory: 0,
            drawCalls: 0,
            triangles: 0
        };
        
        // Configurações de qualidade
        this.qualitySettings = {
            low: {
                shadowMapSize: 1024,
                shadowDistance: 100,
                drawDistance: 300,
                antialiasing: false,
                textureQuality: 'low',
                particleCount: 100,
                reflections: false
            },
            medium: {
                shadowMapSize: 2048,
                shadowDistance: 300,
                drawDistance: 500,
                antialiasing: true,
                textureQuality: 'medium',
                particleCount: 300,
                reflections: false
            },
            high: {
                shadowMapSize: 4096,
                shadowDistance: 500,
                drawDistance: 1000,
                antialiasing: true,
                textureQuality: 'high',
                particleCount: 1000,
                reflections: true
            }
        };
        
        // Configuração atual
        this.currentQuality = 'medium';
        
        // Inicializar
        this.init();
    }
    
    init() {
        console.log("Inicializando sistema de testes e otimização...");
        
        // Aplicar configurações iniciais
        this.applyQualitySettings(this.currentQuality);
        
        // Iniciar monitoramento de desempenho
        this.startPerformanceMonitoring();
    }
    
    applyQualitySettings(quality) {
        if (!this.qualitySettings[quality]) {
            console.error(`Configuração de qualidade '${quality}' não encontrada.`);
            return;
        }
        
        console.log(`Aplicando configurações de qualidade: ${quality}`);
        
        const settings = this.qualitySettings[quality];
        this.currentQuality = quality;
        
        // Aplicar configurações ao renderer
        if (this.renderer) {
            // Antialiasing
            if (this.renderer.capabilities.isWebGL2) {
                this.renderer.antialias = settings.antialiasing;
            }
            
            // Sombras
            if (this.game.world && this.game.world.sunLight) {
                const sunLight = this.game.world.sunLight;
                sunLight.shadow.mapSize.width = settings.shadowMapSize;
                sunLight.shadow.mapSize.height = settings.shadowMapSize;
                sunLight.shadow.camera.far = settings.shadowDistance;
            }
            
            // Distância de renderização
            if (this.camera) {
                this.camera.far = settings.drawDistance;
                this.camera.updateProjectionMatrix();
            }
        }
        
        // Aplicar outras configurações específicas
        this.applyTextureQuality(settings.textureQuality);
        
        // Atualizar configurações de partículas
        this.updateParticleSettings(settings.particleCount);
        
        // Atualizar reflexões
        this.updateReflections(settings.reflections);
    }
    
    applyTextureQuality(quality) {
        // Implementação para ajustar qualidade de texturas
        // Isso normalmente envolveria carregar versões diferentes de texturas
        console.log(`Aplicando qualidade de textura: ${quality}`);
    }
    
    updateParticleSettings(count) {
        // Implementação para ajustar sistema de partículas
        console.log(`Configurando sistema de partículas para: ${count} partículas`);
    }
    
    updateReflections(enabled) {
        // Implementação para ativar/desativar reflexões
        console.log(`Reflexões: ${enabled ? 'ativadas' : 'desativadas'}`);
    }
    
    startPerformanceMonitoring() {
        // Iniciar monitoramento de desempenho
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.fpsUpdateInterval = 1000; // Atualizar FPS a cada 1 segundo
        this.lastFpsUpdate = this.lastFrameTime;
    }
    
    updatePerformanceStats() {
        const now = performance.now();
        const delta = now - this.lastFrameTime;
        this.lastFrameTime = now;
        
        // Calcular tempo de frame
        this.stats.frameTime = delta;
        
        // Atualizar contador de frames
        this.frameCount++;
        
        // Atualizar FPS a cada intervalo
        if (now - this.lastFpsUpdate >= this.fpsUpdateInterval) {
            this.stats.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = now;
            
            // Obter estatísticas do renderer
            if (this.renderer) {
                this.stats.drawCalls = this.renderer.info.render.calls;
                this.stats.triangles = this.renderer.info.render.triangles;
            }
            
            // Obter uso de memória (se disponível)
            if (window.performance && window.performance.memory) {
                this.stats.memory = Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024));
            }
            
            // Verificar desempenho e ajustar configurações se necessário
            this.checkPerformanceAndAdjust();
            
            // Atualizar HUD de debug se estiver ativo
            this.updateDebugHUD();
        }
    }
    
    checkPerformanceAndAdjust() {
        // Verificar FPS e ajustar qualidade automaticamente se necessário
        if (this.stats.fps < 30 && this.currentQuality !== 'low') {
            console.log("Desempenho baixo detectado, reduzindo qualidade...");
            this.applyQualitySettings('low');
            this.game.uiManager.showNotification("Qualidade reduzida para melhorar desempenho");
        } else if (this.stats.fps > 55 && this.currentQuality === 'low') {
            console.log("Bom desempenho detectado, aumentando qualidade...");
            this.applyQualitySettings('medium');
            this.game.uiManager.showNotification("Qualidade aumentada");
        }
    }
    
    updateDebugHUD() {
        // Atualizar HUD de debug se estiver ativo
        if (this.game.debugMode && this.game.debugHUD) {
            const debugInfo = document.getElementById('debug-info');
            if (debugInfo) {
                debugInfo.innerHTML = `
                    FPS: ${this.stats.fps}<br>
                    Frame Time: ${this.stats.frameTime.toFixed(2)} ms<br>
                    Draw Calls: ${this.stats.drawCalls}<br>
                    Triangles: ${this.stats.triangles}<br>
                    Memory: ${this.stats.memory} MB<br>
                    Quality: ${this.currentQuality}
                `;
            }
        }
    }
    
    toggleDebugHUD() {
        // Alternar visibilidade do HUD de debug
        if (!this.game.debugHUD) {
            // Criar HUD de debug
            const debugHUD = document.createElement('div');
            debugHUD.id = 'debug-hud';
            debugHUD.style.position = 'fixed';
            debugHUD.style.top = '10px';
            debugHUD.style.left = '10px';
            debugHUD.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            debugHUD.style.color = 'white';
            debugHUD.style.padding = '10px';
            debugHUD.style.borderRadius = '5px';
            debugHUD.style.fontFamily = 'monospace';
            debugHUD.style.fontSize = '12px';
            debugHUD.style.zIndex = '1000';
            
            const debugTitle = document.createElement('div');
            debugTitle.textContent = 'DEBUG INFO';
            debugTitle.style.marginBottom = '5px';
            debugTitle.style.fontWeight = 'bold';
            debugHUD.appendChild(debugTitle);
            
            const debugInfo = document.createElement('div');
            debugInfo.id = 'debug-info';
            debugHUD.appendChild(debugInfo);
            
            document.body.appendChild(debugHUD);
            this.game.debugHUD = debugHUD;
        } else {
            // Remover HUD de debug
            document.body.removeChild(this.game.debugHUD);
            this.game.debugHUD = null;
        }
    }
    
    runTests() {
        console.log("Executando testes de integração...");
        
        // Testar colisões
        this.testCollisions();
        
        // Testar interações
        this.testInteractions();
        
        // Testar IA
        this.testAI();
        
        // Testar física
        this.testPhysics();
        
        // Testar renderização
        this.testRendering();
        
        console.log("Testes concluídos.");
    }
    
    testCollisions() {
        console.log("Testando sistema de colisões...");
        
        // Implementação de testes de colisão
        // Verificar colisões entre jogador e objetos
        // Verificar colisões entre zumbis e objetos
        // Verificar colisões entre veículos e objetos
    }
    
    testInteractions() {
        console.log("Testando sistema de interações...");
        
        // Implementação de testes de interação
        // Verificar interação com veículos
        // Verificar interação com itens
        // Verificar interação com zumbis
    }
    
    testAI() {
        console.log("Testando sistema de IA...");
        
        // Implementação de testes de IA
        // Verificar comportamento de zumbis
        // Verificar detecção de jogador
        // Verificar pathfinding
    }
    
    testPhysics() {
        console.log("Testando sistema de física...");
        
        // Implementação de testes de física
        // Verificar gravidade
        // Verificar movimento de veículos
        // Verificar movimento de projéteis
    }
    
    testRendering() {
        console.log("Testando sistema de renderização...");
        
        // Implementação de testes de renderização
        // Verificar culling
        // Verificar sombras
        // Verificar efeitos visuais
    }
    
    optimizeForMobile() {
        console.log("Otimizando para dispositivos móveis...");
        
        // Detectar se é dispositivo móvel
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            // Aplicar configurações para mobile
            this.applyQualitySettings('low');
            
            // Ajustar controles para touch
            this.setupMobileControls();
        }
    }
    
    setupMobileControls() {
        console.log("Configurando controles para dispositivos móveis...");
        
        // Criar joystick virtual para movimento
        this.createVirtualJoystick();
        
        // Criar botões virtuais para ações
        this.createActionButtons();
    }
    
    createVirtualJoystick() {
        // Implementação de joystick virtual para movimento
        const joystickContainer = document.createElement('div');
        joystickContainer.id = 'joystick-container';
        joystickContainer.style.position = 'fixed';
        joystickContainer.style.bottom = '20px';
        joystickContainer.style.left = '20px';
        joystickContainer.style.width = '120px';
        joystickContainer.style.height = '120px';
        joystickContainer.style.borderRadius = '60px';
        joystickContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        joystickContainer.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        joystickContainer.style.zIndex = '1000';
        
        const joystick = document.createElement('div');
        joystick.id = 'joystick';
        joystick.style.position = 'absolute';
        joystick.style.top = '50%';
        joystick.style.left = '50%';
        joystick.style.transform = 'translate(-50%, -50%)';
        joystick.style.width = '50px';
        joystick.style.height = '50px';
        joystick.style.borderRadius = '25px';
        joystick.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        joystick.style.zIndex = '1001';
        
        joystickContainer.appendChild(joystick);
        document.body.appendChild(joystickContainer);
        
        // Implementar lógica de touch para joystick
        // ...
    }
    
    createActionButtons() {
        // Implementação de botões virtuais para ações
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'action-buttons';
        buttonContainer.style.position = 'fixed';
        buttonContainer.style.bottom = '20px';
        buttonContainer.style.right = '20px';
        buttonContainer.style.display = 'grid';
        buttonContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
        buttonContainer.style.gridGap = '10px';
        buttonContainer.style.zIndex = '1000';
        
        // Botão de tiro
        const shootButton = document.createElement('div');
        shootButton.id = 'shoot-button';
        shootButton.textContent = '🔫';
        shootButton.style.width = '60px';
        shootButton.style.height = '60px';
        shootButton.style.borderRadius = '30px';
        shootButton.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
        shootButton.style.display = 'flex';
        shootButton.style.alignItems = 'center';
        shootButton.style.justifyContent = 'center';
        shootButton.style.fontSize = '24px';
        
        // Botão de interação
        const interactButton = document.createElement('div');
        interactButton.id = 'interact-button';
        interactButton.textContent = '🔄';
        interactButton.style.width = '60px';
        interactButton.style.height = '60px';
        interactButton.style.borderRadius = '30px';
        interactButton.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
        interactButton.style.display = 'flex';
        interactButton.style.alignItems = 'center';
        interactButton.style.justifyContent = 'center';
        interactButton.style.fontSize = '24px';
        
        // Botão de pulo
        const jumpButton = document.createElement('div');
        jumpButton.id = 'jump-button';
        jumpButton.textContent = '⬆️';
        jumpButton.style.width = '60px';
        jumpButton.style.height = '60px';
        jumpButton.style.borderRadius = '30px';
        jumpButton.style.backgroundColor = 'rgba(0, 0, 255, 0.5)';
        jumpButton.style.display = 'flex';
        jumpButton.style.alignItems = 'center';
        jumpButton.style.justifyContent = 'center';
        jumpButton.style.fontSize = '24px';
        
        // Botão de recarga
        const reloadButton = document.createElement('div');
        reloadButton.id = 'reload-button';
        reloadButton.textContent = '🔄';
        reloadButton.style.width = '60px';
        reloadButton.style.height = '60px';
        reloadButton.style.borderRadius = '30px';
        reloadButton.style.backgroundColor = 'rgba(255, 255, 0, 0.5)';
        reloadButton.style.display = 'flex';
        reloadButton.style.alignItems = 'center';
        reloadButton.style.justifyContent = 'center';
        reloadButton.style.fontSize = '24px';
        
        buttonContainer.appendChild(shootButton);
        buttonContainer.appendChild(interactButton);
        buttonContainer.appendChild(jumpButton);
        buttonContainer.appendChild(reloadButton);
        
        document.body.appendChild(buttonContainer);
        
        // Implementar lógica de touch para botões
        // ...
    }
    
    update(delta) {
        // Atualizar estatísticas de desempenho
        this.updatePerformanceStats();
    }
}

// Exportar para uso em outros arquivos
window.TestAndOptimization = TestAndOptimization;
