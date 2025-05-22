// Sistema de carregamento de recursos para o jogo
class ResourceLoader {
    constructor(game) {
        this.game = game;
        
        // Gerenciadores de carregamento
        this.textureLoader = new THREE.TextureLoader();
        this.audioLoader = new THREE.AudioLoader();
        this.modelLoader = new THREE.GLTFLoader();
        
        // Cache de recursos
        this.textures = {};
        this.models = {};
        this.sounds = {};
        
        // Estado de carregamento
        this.loadingQueue = [];
        this.loadedItems = 0;
        this.totalItems = 0;
        this.isLoading = false;
        
        // Callbacks
        this.onProgress = null;
        this.onComplete = null;
        
        // Inicializar
        this.init();
    }
    
    init() {
        console.log("Inicializando sistema de carregamento de recursos...");
    }
    
    // Carregar textura
    loadTexture(name, url) {
        return new Promise((resolve, reject) => {
            if (this.textures[name]) {
                resolve(this.textures[name]);
                return;
            }
            
            this.textureLoader.load(
                url,
                (texture) => {
                    this.textures[name] = texture;
                    resolve(texture);
                },
                undefined,
                (error) => {
                    console.error(`Erro ao carregar textura ${name}:`, error);
                    reject(error);
                }
            );
        });
    }
    
    // Carregar modelo 3D
    loadModel(name, url) {
        return new Promise((resolve, reject) => {
            if (this.models[name]) {
                resolve(this.models[name]);
                return;
            }
            
            this.modelLoader.load(
                url,
                (gltf) => {
                    this.models[name] = gltf;
                    resolve(gltf);
                },
                undefined,
                (error) => {
                    console.error(`Erro ao carregar modelo ${name}:`, error);
                    reject(error);
                }
            );
        });
    }
    
    // Carregar som
    loadSound(name, url) {
        return new Promise((resolve, reject) => {
            if (this.sounds[name]) {
                resolve(this.sounds[name]);
                return;
            }
            
            this.audioLoader.load(
                url,
                (buffer) => {
                    this.sounds[name] = buffer;
                    resolve(buffer);
                },
                undefined,
                (error) => {
                    console.error(`Erro ao carregar som ${name}:`, error);
                    reject(error);
                }
            );
        });
    }
    
    // Adicionar item à fila de carregamento
    addToQueue(type, name, url) {
        this.loadingQueue.push({ type, name, url });
        this.totalItems++;
    }
    
    // Carregar todos os recursos na fila
    loadAll(onProgress, onComplete) {
        if (this.isLoading) {
            console.warn("Já existe um carregamento em andamento.");
            return;
        }
        
        this.onProgress = onProgress;
        this.onComplete = onComplete;
        this.isLoading = true;
        this.loadedItems = 0;
        
        if (this.loadingQueue.length === 0) {
            console.log("Nenhum recurso para carregar.");
            this.isLoading = false;
            if (this.onComplete) this.onComplete();
            return;
        }
        
        console.log(`Iniciando carregamento de ${this.totalItems} recursos...`);
        
        // Processar fila de carregamento
        this.processQueue();
    }
    
    // Processar fila de carregamento
    processQueue() {
        if (this.loadingQueue.length === 0) {
            console.log("Carregamento concluído.");
            this.isLoading = false;
            if (this.onComplete) this.onComplete();
            return;
        }
        
        const item = this.loadingQueue.shift();
        let loadPromise;
        
        switch (item.type) {
            case 'texture':
                loadPromise = this.loadTexture(item.name, item.url);
                break;
            case 'model':
                loadPromise = this.loadModel(item.name, item.url);
                break;
            case 'sound':
                loadPromise = this.loadSound(item.name, item.url);
                break;
            default:
                console.warn(`Tipo de recurso desconhecido: ${item.type}`);
                this.updateProgress();
                this.processQueue();
                return;
        }
        
        loadPromise
            .then(() => {
                this.updateProgress();
                this.processQueue();
            })
            .catch(() => {
                console.warn(`Falha ao carregar ${item.type} ${item.name}. Continuando...`);
                this.updateProgress();
                this.processQueue();
            });
    }
    
    // Atualizar progresso de carregamento
    updateProgress() {
        this.loadedItems++;
        const progress = this.loadedItems / this.totalItems;
        
        if (this.onProgress) {
            this.onProgress(progress);
        }
        
        console.log(`Progresso de carregamento: ${Math.round(progress * 100)}%`);
    }
    
    // Carregar recursos padrão do jogo
    loadDefaultResources(onProgress, onComplete) {
        // Texturas
        this.addToQueue('texture', 'grass', 'textures/ground/grass.jpg');
        this.addToQueue('texture', 'dirt', 'textures/ground/dirt.jpg');
        this.addToQueue('texture', 'asphalt', 'textures/ground/asphalt.jpg');
        this.addToQueue('texture', 'concrete', 'textures/buildings/concrete.jpg');
        this.addToQueue('texture', 'brick', 'textures/buildings/brick.jpg');
        this.addToQueue('texture', 'wood', 'textures/buildings/wood.jpg');
        this.addToQueue('texture', 'metal', 'textures/vehicles/metal.jpg');
        this.addToQueue('texture', 'glass', 'textures/vehicles/glass.jpg');
        this.addToQueue('texture', 'sky', 'textures/environment/sky.jpg');
        this.addToQueue('texture', 'clouds', 'textures/environment/clouds.jpg');
        this.addToQueue('texture', 'blood', 'textures/effects/blood.png');
        this.addToQueue('texture', 'muzzleFlash', 'textures/effects/muzzle_flash.png');
        this.addToQueue('texture', 'smoke', 'textures/effects/smoke.png');
        this.addToQueue('texture', 'fire', 'textures/effects/fire.png');
        
        // Modelos
        this.addToQueue('model', 'player', 'models/characters/player.glb');
        this.addToQueue('model', 'zombie', 'models/characters/zombie.glb');
        this.addToQueue('model', 'zombieRunner', 'models/characters/zombie_runner.glb');
        this.addToQueue('model', 'zombieTank', 'models/characters/zombie_tank.glb');
        this.addToQueue('model', 'car', 'models/vehicles/car.glb');
        this.addToQueue('model', 'truck', 'models/vehicles/truck.glb');
        this.addToQueue('model', 'motorcycle', 'models/vehicles/motorcycle.glb');
        this.addToQueue('model', 'building1', 'models/buildings/building1.glb');
        this.addToQueue('model', 'building2', 'models/buildings/building2.glb');
        this.addToQueue('model', 'building3', 'models/buildings/building3.glb');
        this.addToQueue('model', 'tree', 'models/environment/tree.glb');
        this.addToQueue('model', 'rock', 'models/environment/rock.glb');
        this.addToQueue('model', 'pistol', 'models/weapons/pistol.glb');
        this.addToQueue('model', 'rifle', 'models/weapons/rifle.glb');
        this.addToQueue('model', 'shotgun', 'models/weapons/shotgun.glb');
        this.addToQueue('model', 'medkit', 'models/items/medkit.glb');
        this.addToQueue('model', 'ammo', 'models/items/ammo.glb');
        this.addToQueue('model', 'food', 'models/items/food.glb');
        this.addToQueue('model', 'water', 'models/items/water.glb');
        
        // Sons
        this.addToQueue('sound', 'footstep', 'audio/footstep.mp3');
        this.addToQueue('sound', 'gunshot', 'audio/gunshot.mp3');
        this.addToQueue('sound', 'reload', 'audio/reload.mp3');
        this.addToQueue('sound', 'zombieGroan', 'audio/zombie_groan.mp3');
        this.addToQueue('sound', 'zombieAttack', 'audio/zombie_attack.mp3');
        this.addToQueue('sound', 'carEngine', 'audio/car_engine.mp3');
        this.addToQueue('sound', 'itemPickup', 'audio/item_pickup.mp3');
        this.addToQueue('sound', 'playerDamage', 'audio/player_damage.mp3');
        this.addToQueue('sound', 'playerDeath', 'audio/player_death.mp3');
        this.addToQueue('sound', 'ambient', 'audio/ambient.mp3');
        
        // Iniciar carregamento
        this.loadAll(onProgress, onComplete);
    }
    
    // Obter textura
    getTexture(name) {
        if (!this.textures[name]) {
            console.warn(`Textura não encontrada: ${name}`);
            return null;
        }
        return this.textures[name];
    }
    
    // Obter modelo
    getModel(name) {
        if (!this.models[name]) {
            console.warn(`Modelo não encontrado: ${name}`);
            return null;
        }
        return this.models[name].scene.clone();
    }
    
    // Obter som
    getSound(name) {
        if (!this.sounds[name]) {
            console.warn(`Som não encontrado: ${name}`);
            return null;
        }
        return this.sounds[name];
    }
    
    // Criar material com textura
    createMaterial(textureName, options = {}) {
        const texture = this.getTexture(textureName);
        
        if (!texture) {
            // Retornar material padrão se a textura não for encontrada
            return new THREE.MeshStandardMaterial({
                color: 0xcccccc,
                ...options
            });
        }
        
        // Configurar repetição da textura
        if (options.repeat) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(options.repeat.x || 1, options.repeat.y || 1);
        }
        
        // Criar material com a textura
        return new THREE.MeshStandardMaterial({
            map: texture,
            ...options
        });
    }
    
    // Criar áudio posicional
    createPositionalAudio(listener, soundName) {
        const sound = this.getSound(soundName);
        
        if (!sound) {
            console.warn(`Som não encontrado para áudio posicional: ${soundName}`);
            return null;
        }
        
        const audio = new THREE.PositionalAudio(listener);
        audio.setBuffer(sound);
        
        return audio;
    }
    
    // Criar sprite com textura
    createSprite(textureName, options = {}) {
        const texture = this.getTexture(textureName);
        
        if (!texture) {
            console.warn(`Textura não encontrada para sprite: ${textureName}`);
            return null;
        }
        
        const material = new THREE.SpriteMaterial({
            map: texture,
            ...options
        });
        
        return new THREE.Sprite(material);
    }
    
    // Criar sistema de partículas com textura
    createParticleSystem(textureName, count, options = {}) {
        const texture = this.getTexture(textureName);
        
        if (!texture) {
            console.warn(`Textura não encontrada para sistema de partículas: ${textureName}`);
            return null;
        }
        
        // Geometria para partículas
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        for (let i = 0; i < count; i++) {
            // Posições aleatórias dentro de um cubo
            positions[i * 3] = (Math.random() - 0.5) * (options.spread || 10);
            positions[i * 3 + 1] = (Math.random() - 0.5) * (options.spread || 10);
            positions[i * 3 + 2] = (Math.random() - 0.5) * (options.spread || 10);
            
            // Tamanhos aleatórios
            sizes[i] = Math.random() * (options.maxSize || 1) + (options.minSize || 0.1);
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Material para partículas
        const material = new THREE.PointsMaterial({
            map: texture,
            size: 1,
            sizeAttenuation: true,
            transparent: true,
            alphaTest: 0.5,
            ...options
        });
        
        // Sistema de partículas
        return new THREE.Points(geometry, material);
    }
    
    // Criar skybox
    createSkybox(textureName) {
        const texture = this.getTexture(textureName);
        
        if (!texture) {
            console.warn(`Textura não encontrada para skybox: ${textureName}`);
            return null;
        }
        
        const geometry = new THREE.SphereGeometry(1000, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide
        });
        
        return new THREE.Mesh(geometry, material);
    }
    
    // Limpar recursos não utilizados
    clearUnused() {
        // Implementação para liberar recursos não utilizados
        console.log("Limpando recursos não utilizados...");
    }
}

// Exportar para uso em outros arquivos
window.ResourceLoader = ResourceLoader;
