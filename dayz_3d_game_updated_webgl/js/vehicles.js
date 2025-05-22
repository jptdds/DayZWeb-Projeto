// Classe para gerenciar veículos no jogo
class Vehicle {
    constructor(game, config, position) {
        this.game = game;
        this.scene = game.scene;
        
        // Configuração do veículo
        this.config = config;
        this.type = config.name;
        this.maxSpeed = config.maxSpeed;
        this.acceleration = config.acceleration;
        this.handling = config.handling;
        this.seats = config.seats;
        this.maxHealth = config.health;
        this.maxFuel = config.fuelCapacity;
        
        // Estado do veículo
        this.position = position || new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.health = this.maxHealth;
        this.fuel = this.maxFuel * 0.5; // Começa com metade do tanque
        this.needsRepair = Math.random() > 0.3; // 70% de chance de precisar de reparo
        this.isRunning = false;
        this.isOccupied = false;
        this.driver = null;
        this.passengers = [];
        
        // Propriedades físicas
        this.size = this.getVehicleSize();
        this.mass = this.getMassFromType();
        this.friction = 0.95;
        this.brakingForce = 0.8;
        this.steeringAngle = 0;
        this.maxSteeringAngle = Math.PI / 4;
        
        // Propriedades de controle
        this.throttle = 0;
        this.brake = 0;
        this.steering = 0;
        
        // Criar modelo do veículo
        this.createVehicleModel();
    }
    
    getVehicleSize() {
        // Dimensões baseadas no tipo
        switch (this.type) {
            case 'Sedan':
                return new THREE.Vector3(2, 1.5, 4.5);
            case 'SUV':
                return new THREE.Vector3(2.2, 1.8, 4.8);
            case 'Pickup':
                return new THREE.Vector3(2.2, 1.8, 5.2);
            case 'Moto':
                return new THREE.Vector3(1, 1.2, 2.2);
            case 'Caminhão':
                return new THREE.Vector3(2.5, 2.5, 7);
            default:
                return new THREE.Vector3(2, 1.5, 4.5);
        }
    }
    
    getMassFromType() {
        // Massa baseada no tipo
        switch (this.type) {
            case 'Sedan':
                return 1200;
            case 'SUV':
                return 1800;
            case 'Pickup':
                return 2000;
            case 'Moto':
                return 300;
            case 'Caminhão':
                return 5000;
            default:
                return 1500;
        }
    }
    
    createVehicleModel() {
        // Criar modelo temporário (será substituído por modelo carregado)
        const geometry = new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z);
        
        // Criar material
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffffff, 0x000000];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.5,
            metalness: 0.7
        });
        
        // Criar mesh
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.position.y += this.size.y / 2; // Ajustar altura
        this.mesh.rotation.copy(this.rotation);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.name = "vehicle_" + this.type;
        
        // Adicionar à cena
        this.scene.add(this.mesh);
        
        // Adicionar rodas se não for moto
        if (this.type !== 'Moto') {
            this.createWheels();
        }
        
        // Adicionar luzes
        this.createLights();
    }
    
    createWheels() {
        // Dimensões das rodas
        const wheelRadius = this.size.y * 0.3;
        const wheelWidth = this.size.x * 0.2;
        
        // Posições das rodas
        const wheelPositions = [
            new THREE.Vector3(this.size.x / 2 - wheelWidth / 2, -this.size.y / 2 + wheelRadius, this.size.z / 3), // Frente direita
            new THREE.Vector3(-this.size.x / 2 + wheelWidth / 2, -this.size.y / 2 + wheelRadius, this.size.z / 3), // Frente esquerda
            new THREE.Vector3(this.size.x / 2 - wheelWidth / 2, -this.size.y / 2 + wheelRadius, -this.size.z / 3), // Traseira direita
            new THREE.Vector3(-this.size.x / 2 + wheelWidth / 2, -this.size.y / 2 + wheelRadius, -this.size.z / 3) // Traseira esquerda
        ];
        
        // Criar geometria e material
        const wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 16);
        wheelGeometry.rotateZ(Math.PI / 2); // Rotacionar para ficar na orientação correta
        
        const wheelMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.9,
            metalness: 0.1
        });
        
        // Criar rodas
        this.wheels = [];
        
        for (let i = 0; i < wheelPositions.length; i++) {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.position.copy(wheelPositions[i]);
            wheel.castShadow = true;
            wheel.receiveShadow = true;
            
            this.mesh.add(wheel);
            this.wheels.push(wheel);
        }
    }
    
    createLights() {
        // Criar luzes dianteiras
        const headlightGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.1);
        const headlightMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.5
        });
        
        // Posições das luzes
        const headlightPositions = [
            new THREE.Vector3(this.size.x / 3, 0, this.size.z / 2), // Direita
            new THREE.Vector3(-this.size.x / 3, 0, this.size.z / 2) // Esquerda
        ];
        
        // Criar luzes
        this.headlights = [];
        
        for (let i = 0; i < headlightPositions.length; i++) {
            const headlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
            headlight.position.copy(headlightPositions[i]);
            
            this.mesh.add(headlight);
            this.headlights.push(headlight);
            
            // Adicionar luz pontual (desativada inicialmente)
            const light = new THREE.PointLight(0xffffff, 1, 100);
            light.position.copy(headlightPositions[i]);
            light.position.z += 0.1;
            light.visible = false;
            
            this.mesh.add(light);
            this.headlights.push(light);
        }
        
        // Criar luzes traseiras
        const taillightGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.1);
        const taillightMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });
        
        // Posições das luzes traseiras
        const taillightPositions = [
            new THREE.Vector3(this.size.x / 3, 0, -this.size.z / 2), // Direita
            new THREE.Vector3(-this.size.x / 3, 0, -this.size.z / 2) // Esquerda
        ];
        
        // Criar luzes traseiras
        this.taillights = [];
        
        for (let i = 0; i < taillightPositions.length; i++) {
            const taillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
            taillight.position.copy(taillightPositions[i]);
            
            this.mesh.add(taillight);
            this.taillights.push(taillight);
        }
    }
    
    update(delta) {
        if (this.isOccupied && this.isRunning) {
            // Atualizar controles do veículo
            this.updateControls(delta);
            
            // Atualizar física
            this.updatePhysics(delta);
            
            // Consumir combustível
            this.consumeFuel(delta);
        }
        
        // Atualizar posição e rotação do modelo
        this.updateModel();
    }
    
    updateControls(delta) {
        // Obter entrada do teclado do motorista
        if (this.driver === this.game.player) {
            // Aceleração
            if (this.game.inputManager.keys['KeyW']) {
                this.throttle = Math.min(1, this.throttle + delta * 2);
                this.brake = 0;
            } else if (this.game.inputManager.keys['KeyS']) {
                this.brake = Math.min(1, this.brake + delta * 2);
                this.throttle = 0;
            } else {
                this.throttle *= 0.95;
                this.brake *= 0.95;
            }
            
            // Direção
            if (this.game.inputManager.keys['KeyA']) {
                this.steering = Math.max(-1, this.steering - delta * 2);
            } else if (this.game.inputManager.keys['KeyD']) {
                this.steering = Math.min(1, this.steering + delta * 2);
            } else {
                this.steering *= 0.9;
            }
        }
    }
    
    updatePhysics(delta) {
        // Calcular força de aceleração
        const forwardForce = this.throttle * this.acceleration;
        const brakeForce = this.brake * this.brakingForce;
        
        // Calcular direção do veículo
        const direction = new THREE.Vector3(0, 0, 1).applyEuler(this.rotation);
        
        // Aplicar aceleração
        if (this.throttle > 0) {
            this.velocity.add(direction.clone().multiplyScalar(forwardForce * delta));
        }
        
        // Aplicar freio
        if (this.brake > 0) {
            const brakeDirection = direction.clone().multiplyScalar(-Math.sign(this.velocity.dot(direction)));
            this.velocity.add(brakeDirection.multiplyScalar(brakeForce * delta));
        }
        
        // Aplicar atrito
        this.velocity.multiplyScalar(this.friction);
        
        // Limitar velocidade máxima
        const speed = this.velocity.length();
        if (speed > this.maxSpeed) {
            this.velocity.normalize().multiplyScalar(this.maxSpeed);
        }
        
        // Aplicar direção
        if (speed > 0.1) {
            const steeringAmount = this.steering * this.maxSteeringAngle * this.handling;
            this.rotation.y += steeringAmount * delta * (speed / this.maxSpeed);
        }
        
        // Atualizar posição
        this.position.add(this.velocity.clone().multiplyScalar(delta));
        
        // Verificar colisões
        this.checkCollisions();
    }
    
    checkCollisions() {
        // Implementação simplificada de colisão
        // Será substituída por física mais robusta com Ammo.js
        
        // Verificar limites do mundo
        const worldSize = CONFIG.WORLD.SIZE / 2;
        if (this.position.x < -worldSize) this.position.x = -worldSize;
        if (this.position.x > worldSize) this.position.x = worldSize;
        if (this.position.z < -worldSize) this.position.z = -worldSize;
        if (this.position.z > worldSize) this.position.z = worldSize;
        
        // Verificar colisão com objetos do mundo
        // Será implementado quando tivermos objetos no mundo
    }
    
    updateModel() {
        if (this.mesh) {
            this.mesh.position.copy(this.position);
            this.mesh.position.y += this.size.y / 2; // Ajustar altura
            this.mesh.rotation.copy(this.rotation);
            
            // Atualizar rodas
            if (this.wheels && this.wheels.length > 0) {
                // Rotação das rodas baseada na velocidade
                const speed = this.velocity.length();
                const wheelRotationSpeed = speed * 0.5;
                
                for (let i = 0; i < this.wheels.length; i++) {
                    // Rotacionar rodas
                    this.wheels[i].rotation.x += wheelRotationSpeed;
                    
                    // Aplicar direção nas rodas dianteiras
                    if (i < 2) {
                        this.wheels[i].rotation.y = this.steering * this.maxSteeringAngle;
                    }
                }
            }
            
            // Atualizar luzes
            if (this.isRunning) {
                // Ativar faróis se estiver escuro
                const isDark = this.game.world && this.game.world.timeOfDay < 0.25 || this.game.world.timeOfDay > 0.75;
                
                if (this.headlights) {
                    for (let i = 0; i < this.headlights.length; i++) {
                        if (this.headlights[i] instanceof THREE.Light) {
                            this.headlights[i].visible = isDark;
                        }
                    }
                }
                
                // Ativar luzes de freio
                if (this.taillights) {
                    for (let i = 0; i < this.taillights.length; i++) {
                        if (this.brake > 0.1) {
                            this.taillights[i].material.emissiveIntensity = 1.0;
                        } else {
                            this.taillights[i].material.emissiveIntensity = isDark ? 0.5 : 0.1;
                        }
                    }
                }
            } else {
                // Desativar todas as luzes
                if (this.headlights) {
                    for (let i = 0; i < this.headlights.length; i++) {
                        if (this.headlights[i] instanceof THREE.Light) {
                            this.headlights[i].visible = false;
                        }
                    }
                }
                
                if (this.taillights) {
                    for (let i = 0; i < this.taillights.length; i++) {
                        this.taillights[i].material.emissiveIntensity = 0.1;
                    }
                }
            }
        }
    }
    
    consumeFuel(delta) {
        // Consumir combustível baseado na aceleração
        const fuelConsumption = this.throttle * 0.01 * delta;
        this.fuel -= fuelConsumption;
        
        // Verificar se acabou o combustível
        if (this.fuel <= 0) {
            this.fuel = 0;
            this.isRunning = false;
        }
    }
    
    enterVehicle(player) {
        if (!this.isOccupied) {
            console.log(`${player.name || 'Player'} entrou no veículo ${this.type}`);
            
            this.isOccupied = true;
            this.driver = player;
            
            // Tentar ligar o veículo
            this.startEngine();
            
            return true;
        } else if (this.passengers.length < this.seats - 1) {
            // Adicionar como passageiro
            this.passengers.push(player);
            return true;
        }
        
        return false;
    }
    
    exitVehicle(player) {
        if (this.driver === player) {
            console.log(`${player.name || 'Player'} saiu do veículo ${this.type}`);
            
            this.isOccupied = this.passengers.length > 0;
            this.driver = this.passengers.shift() || null;
            
            return true;
        } else {
            // Remover dos passageiros
            const index = this.passengers.indexOf(player);
            if (index !== -1) {
                this.passengers.splice(index, 1);
                return true;
            }
        }
        
        return false;
    }
    
    startEngine() {
        if (this.needsRepair) {
            console.log("Este veículo precisa de reparos para funcionar.");
            return false;
        }
        
        if (this.fuel <= 0) {
            console.log("Este veículo está sem combustível.");
            return false;
        }
        
        console.log(`Motor do ${this.type} ligado.`);
        this.isRunning = true;
        return true;
    }
    
    stopEngine() {
        console.log(`Motor do ${this.type} desligado.`);
        this.isRunning = false;
    }
    
    repair() {
        console.log(`${this.type} reparado.`);
        this.needsRepair = false;
        this.health = this.maxHealth;
    }
    
    refuel(amount) {
        const previousFuel = this.fuel;
        this.fuel = Math.min(this.maxFuel, this.fuel + amount);
        const addedFuel = this.fuel - previousFuel;
        
        console.log(`${this.type} reabastecido com ${addedFuel.toFixed(1)} litros.`);
        return addedFuel;
    }
    
    takeDamage(amount) {
        this.health -= amount;
        
        // Verificar destruição
        if (this.health <= 0) {
            this.destroy();
        }
    }
    
    destroy() {
        console.log(`${this.type} destruído.`);
        
        // Ejetar ocupantes
        if (this.driver) {
            this.exitVehicle(this.driver);
        }
        
        while (this.passengers.length > 0) {
            this.exitVehicle(this.passengers[0]);
        }
        
        // Desativar veículo
        this.isRunning = false;
        this.health = 0;
        
        // Efeito visual de destruição
        if (this.mesh) {
            this.mesh.material.color.set(0x333333);
        }
    }
}

// Exportar para uso em outros arquivos
window.Vehicle = Vehicle;
