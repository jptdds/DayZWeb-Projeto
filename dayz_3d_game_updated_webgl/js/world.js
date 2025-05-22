// Classe para gerenciar o mundo do jogo
class World {
    constructor(game) {
        this.game = game;
        this.scene = game.scene;
        
        // Propriedades do mundo
        this.size = CONFIG.WORLD.SIZE;
        this.groundSize = CONFIG.WORLD.GROUND_SIZE;
        
        // Elementos do mundo
        this.ground = null;
        this.buildings = [];
        this.roads = [];
        this.props = [];
        this.trees = [];
        this.lights = [];
        
        // Estado do mundo
        this.timeOfDay = 0.5; // 0 = meia-noite, 0.5 = meio-dia, 1 = meia-noite
        this.weather = 'clear'; // clear, rain, fog
        
        // Inicializar mundo
        this.init();
    }
    
    init() {
        console.log("Inicializando mundo...");
        
        // Criar terreno
        this.createGround();
        
        // Configurar iluminação
        this.setupLighting();
        
        // Criar skybox
        this.createSkybox();
        
        // Criar cidade temporária (será substituída por modelos carregados)
        this.createTemporaryCity();
    }
    
    createGround() {
        // Criar geometria do terreno
        const geometry = new THREE.PlaneGeometry(this.groundSize, this.groundSize, 32, 32);
        
        // Criar material com textura temporária
        const material = new THREE.MeshStandardMaterial({
            color: 0x555555,
            roughness: 0.8,
            metalness: 0.2
        });
        
        // Criar mesh
        this.ground = new THREE.Mesh(geometry, material);
        this.ground.rotation.x = -Math.PI / 2; // Rotacionar para ficar horizontal
        this.ground.position.y = 0;
        this.ground.receiveShadow = true;
        this.ground.name = "ground";
        
        // Adicionar à cena
        this.scene.add(this.ground);
    }
    
    setupLighting() {
        // Luz ambiente
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);
        
        // Luz direcional (sol)
        const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
        sunLight.position.set(500, 1000, -500);
        sunLight.castShadow = true;
        
        // Configurar sombras
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 2000;
        
        // Área de sombra
        const shadowSize = 1000;
        sunLight.shadow.camera.left = -shadowSize;
        sunLight.shadow.camera.right = shadowSize;
        sunLight.shadow.camera.top = shadowSize;
        sunLight.shadow.camera.bottom = -shadowSize;
        
        this.scene.add(sunLight);
        this.lights.push(sunLight);
        this.sunLight = sunLight;
        
        // Adicionar helper para debug se em modo debug
        if (CONFIG.DEBUG_MODE) {
            const helper = new THREE.DirectionalLightHelper(sunLight, 10);
            this.scene.add(helper);
            
            const shadowHelper = new THREE.CameraHelper(sunLight.shadow.camera);
            this.scene.add(shadowHelper);
        }
    }
    
    createSkybox() {
        // Criar skybox temporário (cor sólida)
        this.scene.background = new THREE.Color(0x87CEEB);
        
        // Será substituído por um skybox mais elaborado posteriormente
    }
    
    createTemporaryCity() {
        // Criar edifícios temporários
        this.createTemporaryBuildings();
        
        // Criar estradas temporárias
        this.createTemporaryRoads();
        
        // Adicionar árvores
        this.createTemporaryTrees();
        
        // Adicionar veículos abandonados
        this.createTemporaryVehicles();
    }
    
    createTemporaryBuildings() {
        const buildingCount = CONFIG.WORLD.BUILDING_COUNT;
        const citySize = CONFIG.WORLD.CITY_SIZE;
        const halfCitySize = citySize / 2;
        
        // Criar edifícios em grade
        const gridSize = Math.ceil(Math.sqrt(buildingCount));
        const spacing = citySize / gridSize;
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                // Pular alguns espaços para criar ruas
                if ((i % 2 === 0 && j % 2 === 0) || Math.random() < 0.3) {
                    continue;
                }
                
                // Posição do edifício
                const x = -halfCitySize + i * spacing + (Math.random() * spacing * 0.5);
                const z = -halfCitySize + j * spacing + (Math.random() * spacing * 0.5);
                
                // Tamanho do edifício
                const width = Utils.randomRange(10, 30);
                const height = Utils.randomRange(10, 50);
                const depth = Utils.randomRange(10, 30);
                
                // Criar edifício
                this.createTemporaryBuilding(x, z, width, height, depth);
            }
        }
    }
    
    createTemporaryBuilding(x, z, width, height, depth) {
        // Criar geometria
        const geometry = new THREE.BoxGeometry(width, height, depth);
        
        // Criar material
        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(
                Utils.randomRange(0.3, 0.7),
                Utils.randomRange(0.3, 0.7),
                Utils.randomRange(0.3, 0.7)
            ),
            roughness: 0.7,
            metalness: 0.2
        });
        
        // Criar mesh
        const building = new THREE.Mesh(geometry, material);
        building.position.set(x, height / 2, z);
        building.castShadow = true;
        building.receiveShadow = true;
        building.name = "building";
        
        // Adicionar à cena
        this.scene.add(building);
        
        // Adicionar à lista de edifícios
        this.buildings.push({
            mesh: building,
            position: new THREE.Vector3(x, 0, z),
            size: new THREE.Vector3(width, height, depth),
            collidable: true
        });
    }
    
    createTemporaryRoads() {
        const citySize = CONFIG.WORLD.CITY_SIZE;
        const halfCitySize = citySize / 2;
        const roadWidth = 15;
        
        // Criar estradas em grade
        const gridSize = 5;
        const spacing = citySize / gridSize;
        
        // Estradas horizontais
        for (let i = 0; i <= gridSize; i++) {
            const z = -halfCitySize + i * spacing;
            this.createTemporaryRoad(-halfCitySize, z - roadWidth/2, citySize, roadWidth);
        }
        
        // Estradas verticais
        for (let i = 0; i <= gridSize; i++) {
            const x = -halfCitySize + i * spacing;
            this.createTemporaryRoad(x - roadWidth/2, -halfCitySize, roadWidth, citySize);
        }
    }
    
    createTemporaryRoad(x, z, width, depth) {
        // Criar geometria
        const geometry = new THREE.PlaneGeometry(width, depth);
        
        // Criar material
        const material = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.9,
            metalness: 0.1
        });
        
        // Criar mesh
        const road = new THREE.Mesh(geometry, material);
        road.rotation.x = -Math.PI / 2; // Rotacionar para ficar horizontal
        road.position.set(x + width/2, 0.1, z + depth/2); // Ligeiramente acima do chão
        road.receiveShadow = true;
        road.name = "road";
        
        // Adicionar à cena
        this.scene.add(road);
        
        // Adicionar à lista de estradas
        this.roads.push({
            mesh: road,
            position: new THREE.Vector3(x + width/2, 0, z + depth/2),
            size: new THREE.Vector3(width, 0, depth),
            collidable: false
        });
    }
    
    createTemporaryTrees() {
        const treeCount = 100;
        const worldSize = this.size / 2;
        const citySize = CONFIG.WORLD.CITY_SIZE / 2;
        
        // Criar árvores fora da cidade
        for (let i = 0; i < treeCount; i++) {
            // Gerar posição aleatória fora da cidade
            let x, z;
            do {
                x = Utils.randomRange(-worldSize, worldSize);
                z = Utils.randomRange(-worldSize, worldSize);
            } while (Math.abs(x) < citySize && Math.abs(z) < citySize);
            
            // Criar árvore
            this.createTemporaryTree(x, z);
        }
    }
    
    createTemporaryTree(x, z) {
        // Criar tronco
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 5, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, 2.5, z);
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        
        // Criar copa
        const topGeometry = new THREE.ConeGeometry(3, 6, 8);
        const topMaterial = new THREE.MeshStandardMaterial({
            color: 0x2E8B57,
            roughness: 0.8,
            metalness: 0.1
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.set(0, 5, 0);
        top.castShadow = true;
        
        // Agrupar
        const tree = new THREE.Group();
        tree.add(trunk);
        tree.add(top);
        tree.position.set(0, 0, 0);
        tree.name = "tree";
        
        // Adicionar à cena
        this.scene.add(tree);
        
        // Adicionar à lista de árvores
        this.trees.push({
            mesh: tree,
            position: new THREE.Vector3(x, 0, z),
            radius: 1.5,
            collidable: true
        });
    }
    
    createTemporaryVehicles() {
        const vehicleCount = CONFIG.WORLD.VEHICLE_COUNT;
        const citySize = CONFIG.WORLD.CITY_SIZE;
        const halfCitySize = citySize / 2;
        
        // Criar veículos nas estradas
        for (let i = 0; i < vehicleCount; i++) {
            // Escolher uma estrada aleatória
            const road = this.roads[Math.floor(Math.random() * this.roads.length)];
            
            // Posição aleatória na estrada
            const roadWidth = road.size.x;
            const roadLength = road.size.z;
            
            let x, z;
            
            if (roadWidth > roadLength) {
                // Estrada horizontal
                x = Utils.randomRange(road.position.x - roadWidth/2 + 5, road.position.x + roadWidth/2 - 5);
                z = road.position.z;
            } else {
                // Estrada vertical
                x = road.position.x;
                z = Utils.randomRange(road.position.z - roadLength/2 + 5, road.position.z + roadLength/2 - 5);
            }
            
            // Criar veículo
            this.createTemporaryVehicle(x, z);
        }
    }
    
    createTemporaryVehicle(x, z) {
        // Escolher tipo de veículo aleatório
        const vehicleTypes = CONFIG.VEHICLES.TYPES;
        const vehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
        
        // Dimensões baseadas no tipo
        let width, height, length;
        
        switch (vehicleType.name) {
            case 'Sedan':
                width = 2;
                height = 1.5;
                length = 4.5;
                break;
            case 'SUV':
                width = 2.2;
                height = 1.8;
                length = 4.8;
                break;
            case 'Pickup':
                width = 2.2;
                height = 1.8;
                length = 5.2;
                break;
            case 'Moto':
                width = 1;
                height = 1.2;
                length = 2.2;
                break;
            case 'Caminhão':
                width = 2.5;
                height = 2.5;
                length = 7;
                break;
            default:
                width = 2;
                height = 1.5;
                length = 4.5;
        }
        
        // Criar geometria
        const geometry = new THREE.BoxGeometry(width, height, length);
        
        // Criar material
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffffff, 0x000000];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.5,
            metalness: 0.7
        });
        
        // Criar mesh
        const vehicle = new THREE.Mesh(geometry, material);
        vehicle.position.set(x, height/2, z);
        
        // Rotação aleatória
        vehicle.rotation.y = Math.random() * Math.PI * 2;
        
        vehicle.castShadow = true;
        vehicle.receiveShadow = true;
        vehicle.name = "vehicle";
        
        // Adicionar à cena
        this.scene.add(vehicle);
        
        // Adicionar à lista de veículos do jogo
        this.game.vehicles.push({
            mesh: vehicle,
            position: new THREE.Vector3(x, 0, z),
            rotation: vehicle.rotation.y,
            size: new THREE.Vector3(width, height, length),
            type: vehicleType,
            collidable: true,
            interactable: true,
            health: vehicleType.health,
            fuel: vehicleType.fuelCapacity * Math.random(),
            needsRepair: Math.random() > 0.3 // 70% de chance de precisar de reparo
        });
    }
    
    update(delta) {
        // Atualizar ciclo dia/noite
        this.updateDayNightCycle(delta);
        
        // Atualizar clima
        this.updateWeather(delta);
    }
    
    updateDayNightCycle(delta) {
        // Avançar tempo
        this.timeOfDay += delta * CONFIG.WORLD.TIME_SCALE * 0.01;
        if (this.timeOfDay >= 1) {
            this.timeOfDay = 0;
        }
        
        // Calcular posição do sol
        const angle = this.timeOfDay * Math.PI * 2;
        const radius = 1000;
        const height = Math.sin(angle) * radius;
        const horizontal = Math.cos(angle) * radius;
        
        this.sunLight.position.set(horizontal, height + 200, -horizontal);
        
        // Ajustar intensidade da luz baseado na hora do dia
        const dayIntensity = CONFIG.WORLD.AMBIENT_LIGHT_DAY;
        const nightIntensity = CONFIG.WORLD.AMBIENT_LIGHT_NIGHT;
        
        // Calcular intensidade baseada na altura do sol
        let intensity;
        if (height > 0) {
            // Dia
            intensity = Utils.lerp(dayIntensity * 0.5, dayIntensity, height / radius);
        } else {
            // Noite
            intensity = Utils.lerp(nightIntensity, dayIntensity * 0.5, (height + radius) / radius);
        }
        
        // Aplicar intensidade
        this.lights[0].intensity = intensity;
    }
    
    updateWeather(delta) {
        // Implementação futura para sistema de clima
    }
    
    reset() {
        // Resetar estado do mundo
        this.timeOfDay = 0.5; // Meio-dia
        this.weather = 'clear';
        
        // Atualizar iluminação
        this.updateDayNightCycle(0);
    }
}

// Exportar para uso em outros arquivos
window.World = World;
