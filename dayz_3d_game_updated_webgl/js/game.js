// Classe principal do jogo
class Game {
    constructor() {
        // Propriedades principais
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = null;
        this.stats = null;
        this.physicsWorld = null;
        
        // Gerenciadores
        this.loaderManager = null;
        this.inputManager = null;
        this.audioManager = null;
        this.uiManager = null;
        
        // Elementos do jogo
        this.player = null;
        this.world = null;
        this.vehicles = [];
        this.zombies = [];
        this.items = [];
        
        // Estado do jogo
        this.isRunning = false;
        this.isPaused = false;
        this.gameTime = 0;
        this.qualitySettings = "medium";
        
        // Inicialização
        this.init();
    }
    
    init() {
        console.log("Inicializando jogo...");
        
        // Inicializar Three.js
        this.initThree();
        
        // Inicializar gerenciadores
        this.initManagers();
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Mostrar tela de carregamento
        this.uiManager.showLoadingScreen();
        
        // Carregar recursos
        this.loadResources();
    }
    
    initThree() {
        // Criar cena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Céu azul
        this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.002);
        
        // Criar câmera
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.PLAYER.CAMERA_FOV,
            window.innerWidth / window.innerHeight,
            CONFIG.PLAYER.CAMERA_NEAR,
            CONFIG.PLAYER.CAMERA_FAR
        );
        
        // Criar renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(CONFIG.RENDERER.PIXEL_RATIO);
        this.renderer.shadowMap.enabled = CONFIG.RENDERER.SHADOW_MAP_ENABLED;
        this.renderer.shadowMap.type = THREE[CONFIG.RENDERER.SHADOW_MAP_TYPE];
        this.renderer.toneMapping = THREE[CONFIG.RENDERER.TONE_MAPPING];
        this.renderer.toneMappingExposure = CONFIG.RENDERER.TONE_MAPPING_EXPOSURE;
        
        // Adicionar canvas ao container
        document.getElementById('game-container').appendChild(this.renderer.domElement);
        
        // Criar relógio para animações
        this.clock = new THREE.Clock();
        
        // Configurar stats para debug
        if (CONFIG.DEBUG_MODE) {
            this.stats = new Stats();
            document.body.appendChild(this.stats.dom);
        }
        
        // Configurar redimensionamento da janela
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    initManagers() {
        // Gerenciador de carregamento
        this.loaderManager = {
            loadingManager: new THREE.LoadingManager(),
            textureLoader: new THREE.TextureLoader(),
            gltfLoader: new THREE.GLTFLoader(),
            fbxLoader: new THREE.FBXLoader(),
            audioLoader: new THREE.AudioLoader()
        };
        
        // Configurar eventos do gerenciador de carregamento
        this.loaderManager.loadingManager.onProgress = (url, loaded, total) => {
            const progress = (loaded / total) * 100;
            document.getElementById('loading-progress').style.width = `${progress}%`;
            document.getElementById('loading-text').textContent = `Carregando recursos... ${Math.floor(progress)}%`;
        };
        
        this.loaderManager.loadingManager.onLoad = () => {
            console.log("Todos os recursos carregados!");
            this.onResourcesLoaded();
        };
        
        // Gerenciador de entrada
        this.inputManager = {
            keys: {},
            mouse: { x: 0, y: 0, isDown: false },
            pointerLocked: false
        };
        
        // Gerenciador de UI
        this.uiManager = {
            showLoadingScreen: () => {
                document.getElementById('loading-screen').classList.remove('hidden');
                document.getElementById('game-menu').classList.add('hidden');
                document.getElementById('hud').classList.add('hidden');
            },
            showMainMenu: () => {
                document.getElementById('loading-screen').classList.add('hidden');
                document.getElementById('game-menu').classList.remove('hidden');
                document.getElementById('hud').classList.add('hidden');
            },
            showHUD: () => {
                document.getElementById('loading-screen').classList.add('hidden');
                document.getElementById('game-menu').classList.add('hidden');
                document.getElementById('hud').classList.remove('hidden');
            },
            updateHUD: (data) => {
                // Atualizar elementos do HUD com dados do jogo
                if (data.health !== undefined) {
                    document.getElementById('health-fill').style.width = `${data.health}%`;
                }
                if (data.ammo !== undefined) {
                    document.getElementById('current-ammo').textContent = data.ammo.current;
                    document.getElementById('max-ammo').textContent = data.ammo.max;
                }
                // Outros elementos do HUD...
            },
            showGameOver: (survivalTime) => {
                document.getElementById('game-over').classList.remove('hidden');
                document.getElementById('survival-time').textContent = survivalTime;
            }
        };
    }
    
    setupEventListeners() {
        // Eventos de teclado
        document.addEventListener('keydown', (e) => {
            this.inputManager.keys[e.code] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.inputManager.keys[e.code] = false;
        });
        
        // Eventos de mouse
        document.addEventListener('mousemove', (e) => {
            if (this.inputManager.pointerLocked) {
                this.inputManager.mouse.x = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
                this.inputManager.mouse.y = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
                
                if (this.player) {
                    this.player.handleMouseMove(this.inputManager.mouse);
                }
            }
        });
        
        document.addEventListener('mousedown', (e) => {
            this.inputManager.mouse.isDown = true;
            
            if (this.player && this.isRunning) {
                this.player.handleMouseDown();
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            this.inputManager.mouse.isDown = false;
            
            if (this.player && this.isRunning) {
                this.player.handleMouseUp();
            }
        });
        
        // Eventos de pointer lock para controle da câmera
        document.addEventListener('pointerlockchange', () => {
            this.inputManager.pointerLocked = document.pointerLockElement === this.renderer.domElement;
        });
        
        // Eventos de botões da UI
        document.getElementById('start-game').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('restart-game').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('return-menu').addEventListener('click', () => {
            this.returnToMenu();
        });
        
        document.getElementById('options').addEventListener('click', () => {
            document.getElementById('game-menu').classList.add('hidden');
            document.getElementById('options-menu').classList.remove('hidden');
        });
        
        document.getElementById('save-options').addEventListener('click', () => {
            this.saveOptions();
            document.getElementById('options-menu').classList.add('hidden');
            document.getElementById('game-menu').classList.remove('hidden');
        });
        
        document.getElementById('cancel-options').addEventListener('click', () => {
            document.getElementById('options-menu').classList.add('hidden');
            document.getElementById('game-menu').classList.remove('hidden');
        });
    }
    
    loadResources() {
        console.log("Carregando recursos...");
        // Implementação do carregamento de recursos será feita em loaders.js
    }
    
    onResourcesLoaded() {
        console.log("Recursos carregados, preparando jogo...");
        
        // Inicializar física
        this.initPhysics();
        
        // Criar mundo
        this.world = new World(this);
        
        // Criar jogador
        this.player = new Player(this);
        
        // Mostrar menu principal
        this.uiManager.showMainMenu();
    }
    
    initPhysics() {
        // Inicialização da física com Ammo.js
        // Implementação detalhada será feita em physics.js
    }
    
    startGame() {
        console.log("Iniciando jogo...");
        
        // Esconder menu e mostrar HUD
        this.uiManager.showHUD();
        
        // Ativar controle da câmera
        this.renderer.domElement.requestPointerLock();
        
        // Iniciar estado do jogo
        this.isRunning = true;
        this.isPaused = false;
        this.gameTime = 0;
        
        // Posicionar jogador
        this.player.spawn();
        
        // Gerar zumbis
        this.spawnZombies();
        
        // Iniciar loop do jogo
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        // Calcular delta time
        const delta = this.clock.getDelta();
        
        // Atualizar tempo de jogo
        this.gameTime += delta;
        
        // Atualizar física
        this.updatePhysics(delta);
        
        // Atualizar jogador
        if (this.player) {
            this.player.update(delta);
        }
        
        // Atualizar mundo
        if (this.world) {
            this.world.update(delta);
        }
        
        // Atualizar veículos
        this.vehicles.forEach(vehicle => vehicle.update(delta));
        
        // Atualizar zumbis
        this.zombies.forEach(zombie => zombie.update(delta));
        
        // Atualizar itens
        this.items.forEach(item => item.update(delta));
        
        // Renderizar cena
        this.renderer.render(this.scene, this.camera);
        
        // Atualizar stats se em modo debug
        if (this.stats) {
            this.stats.update();
        }
        
        // Continuar loop
        requestAnimationFrame(() => this.gameLoop());
    }
    
    updatePhysics(delta) {
        // Atualização da física
        // Implementação detalhada será feita em physics.js
    }
    
    spawnZombies() {
        // Gerar zumbis pelo mapa
        // Implementação detalhada será feita em zombies.js
    }
    
    onWindowResize() {
        // Atualizar câmera e renderer quando a janela for redimensionada
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    gameOver() {
        console.log("Game Over!");
        
        // Parar o jogo
        this.isRunning = false;
        
        // Liberar pointer lock
        document.exitPointerLock();
        
        // Mostrar tela de game over
        this.uiManager.showGameOver(Math.floor(this.gameTime));
    }
    
    restartGame() {
        console.log("Reiniciando jogo...");
        
        // Esconder tela de game over
        document.getElementById('game-over').classList.add('hidden');
        
        // Resetar estado do jogo
        this.resetGameState();
        
        // Iniciar jogo novamente
        this.startGame();
    }
    
    returnToMenu() {
        console.log("Voltando ao menu principal...");
        
        // Esconder tela de game over
        document.getElementById('game-over').classList.add('hidden');
        
        // Resetar estado do jogo
        this.resetGameState();
        
        // Mostrar menu principal
        this.uiManager.showMainMenu();
    }
    
    resetGameState() {
        // Limpar entidades
        this.vehicles.forEach(vehicle => this.scene.remove(vehicle.mesh));
        this.zombies.forEach(zombie => this.scene.remove(zombie.mesh));
        this.items.forEach(item => this.scene.remove(item.mesh));
        
        // Limpar arrays
        this.vehicles = [];
        this.zombies = [];
        this.items = [];
        
        // Resetar jogador
        if (this.player) {
            this.player.reset();
        }
        
        // Resetar mundo
        if (this.world) {
            this.world.reset();
        }
        
        // Resetar tempo
        this.gameTime = 0;
    }
    
    saveOptions() {
        // Salvar configurações
        this.qualitySettings = document.getElementById('graphics-quality').value;
        CONFIG.PLAYER.MOUSE_SENSITIVITY = document.getElementById('mouse-sensitivity').value / 10;
        CONFIG.AUDIO.MASTER_VOLUME = document.getElementById('sound-volume').value / 100;
        
        // Aplicar configurações
        this.applyQualitySettings();
    }
    
    applyQualitySettings() {
        // Aplicar configurações de qualidade
        const quality = CONFIG.QUALITY[this.qualitySettings.toUpperCase()];
        
        this.renderer.shadowMap.enabled = quality.SHADOW_MAP_SIZE > 0;
        if (this.renderer.shadowMap.enabled) {
            this.renderer.shadowMap.size = quality.SHADOW_MAP_SIZE;
        }
        
        // Atualizar distância de renderização
        if (this.camera) {
            this.camera.far = quality.DRAW_DISTANCE;
            this.camera.updateProjectionMatrix();
        }
        
        // Atualizar fog
        if (this.scene && this.scene.fog) {
            this.scene.fog.density = 1 / (quality.DRAW_DISTANCE * 0.5);
        }
    }
}

// Exportar para uso em outros arquivos
window.Game = Game;
