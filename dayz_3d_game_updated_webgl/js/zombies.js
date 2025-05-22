// Classe para gerenciar zumbis no jogo
class Zombie {
    constructor(game, config, position) {
        this.game = game;
        this.scene = game.scene;
        
        // Configuração do zumbi
        this.config = config;
        this.type = config.name;
        this.health = config.health;
        this.maxHealth = config.health;
        this.damage = config.damage;
        this.speed = config.speed;
        this.detectionRange = config.detectionRange;
        this.attackRange = config.attackRange;
        this.attackRate = config.attackRate;
        
        // Estado do zumbi
        this.position = position || new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0);
        this.velocity = new THREE.Vector3();
        this.target = null;
        this.isAttacking = false;
        this.lastAttackTime = 0;
        this.isDead = false;
        this.isStunned = false;
        this.stunTime = 0;
        
        // Propriedades físicas
        this.height = 1.8;
        this.radius = 0.4;
        
        // Propriedades de IA
        this.state = 'idle'; // idle, wander, chase, attack, stunned, dead
        this.wanderTarget = null;
        this.wanderTime = 0;
        this.wanderDuration = 5;
        this.detectedTargets = [];
        this.path = [];
        this.currentPathIndex = 0;
        
        // Criar modelo do zumbi
        this.createZombieModel();
    }
    
    createZombieModel() {
        // Criar modelo temporário (será substituído por modelo carregado)
        const geometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height, 8);
        
        // Ajustar origem do cilindro para a base
        geometry.translate(0, this.height / 2, 0);
        
        // Cor baseada no tipo
        let color;
        switch (this.type) {
            case 'Comum':
                color = 0x8B4513; // Marrom
                break;
            case 'Corredor':
                color = 0x228B22; // Verde escuro
                break;
            case 'Tanque':
                color = 0x8B0000; // Vermelho escuro
                break;
            case 'Spitter':
                color = 0x4B0082; // Índigo
                break;
            default:
                color = 0x8B4513; // Marrom padrão
        }
        
        const material = new THREE.MeshStandardMaterial({ color: color });
        
        // Criar mesh
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.name = "zombie_" + this.type;
        
        // Adicionar à cena
        this.scene.add(this.mesh);
        
        // Adicionar cabeça
        this.createHead();
        
        // Adicionar braços
        this.createLimbs();
    }
    
    createHead() {
        const headGeometry = new THREE.SphereGeometry(this.radius * 0.8, 8, 8);
        const headMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xA0522D // Marrom mais claro
        });
        
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.y = this.height - this.radius * 0.8;
        this.head.castShadow = true;
        
        this.mesh.add(this.head);
        
        // Adicionar olhos
        const eyeGeometry = new THREE.SphereGeometry(this.radius * 0.15, 8, 8);
        const eyeMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFF0000,
            emissive: 0xFF0000,
            emissiveIntensity: 0.5
        });
        
        // Olho esquerdo
        this.leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        this.leftEye.position.set(-this.radius * 0.3, 0, -this.radius * 0.6);
        this.head.add(this.leftEye);
        
        // Olho direito
        this.rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        this.rightEye.position.set(this.radius * 0.3, 0, -this.radius * 0.6);
        this.head.add(this.rightEye);
    }
    
    createLimbs() {
        const armGeometry = new THREE.BoxGeometry(this.radius * 0.4, this.height * 0.6, this.radius * 0.4);
        const legGeometry = new THREE.BoxGeometry(this.radius * 0.4, this.height * 0.6, this.radius * 0.4);
        
        const limbMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513 // Marrom
        });
        
        // Braço esquerdo
        this.leftArm = new THREE.Mesh(armGeometry, limbMaterial);
        this.leftArm.position.set(-this.radius * 1.2, -this.height * 0.15, 0);
        this.leftArm.castShadow = true;
        this.mesh.add(this.leftArm);
        
        // Braço direito
        this.rightArm = new THREE.Mesh(armGeometry, limbMaterial);
        this.rightArm.position.set(this.radius * 1.2, -this.height * 0.15, 0);
        this.rightArm.castShadow = true;
        this.mesh.add(this.rightArm);
        
        // Perna esquerda
        this.leftLeg = new THREE.Mesh(legGeometry, limbMaterial);
        this.leftLeg.position.set(-this.radius * 0.6, -this.height * 0.7, 0);
        this.leftLeg.castShadow = true;
        this.mesh.add(this.leftLeg);
        
        // Perna direita
        this.rightLeg = new THREE.Mesh(legGeometry, limbMaterial);
        this.rightLeg.position.set(this.radius * 0.6, -this.height * 0.7, 0);
        this.rightLeg.castShadow = true;
        this.mesh.add(this.rightLeg);
    }
    
    update(delta) {
        if (this.isDead) {
            return;
        }
        
        // Atualizar estado
        this.updateState(delta);
        
        // Atualizar comportamento baseado no estado
        switch (this.state) {
            case 'idle':
                this.updateIdle(delta);
                break;
            case 'wander':
                this.updateWander(delta);
                break;
            case 'chase':
                this.updateChase(delta);
                break;
            case 'attack':
                this.updateAttack(delta);
                break;
            case 'stunned':
                this.updateStunned(delta);
                break;
        }
        
        // Atualizar animações
        this.updateAnimations(delta);
        
        // Atualizar posição do modelo
        this.updateModel();
    }
    
    updateState(delta) {
        // Verificar se está atordoado
        if (this.isStunned) {
            this.stunTime -= delta;
            if (this.stunTime <= 0) {
                this.isStunned = false;
                this.state = 'idle';
            } else {
                this.state = 'stunned';
                return;
            }
        }
        
        // Detectar alvos
        this.detectTargets();
        
        // Decidir estado baseado nos alvos
        if (this.detectedTargets.length > 0) {
            // Ordenar alvos por distância
            this.detectedTargets.sort((a, b) => a.distance - b.distance);
            
            // Selecionar alvo mais próximo
            this.target = this.detectedTargets[0].object;
            
            // Verificar distância para ataque
            if (this.detectedTargets[0].distance <= this.attackRange) {
                this.state = 'attack';
            } else {
                this.state = 'chase';
            }
        } else {
            // Sem alvos, alternar entre idle e wander
            if (this.state === 'idle') {
                if (Math.random() < 0.01) { // 1% de chance por frame de começar a vagar
                    this.state = 'wander';
                    this.setWanderTarget();
                }
            } else if (this.state === 'wander') {
                this.wanderTime += delta;
                if (this.wanderTime >= this.wanderDuration) {
                    this.state = 'idle';
                    this.wanderTime = 0;
                }
            } else if (this.state !== 'stunned') {
                this.state = 'idle';
            }
        }
    }
    
    detectTargets() {
        this.detectedTargets = [];
        
        // Verificar jogador
        if (this.game.player) {
            const distance = this.position.distanceTo(this.game.player.position);
            
            // Verificar se está no alcance de detecção
            if (distance <= this.detectionRange) {
                // Verificar linha de visão
                if (this.hasLineOfSight(this.game.player.position)) {
                    this.detectedTargets.push({
                        object: this.game.player,
                        distance: distance,
                        type: 'player'
                    });
                }
            }
        }
        
        // Verificar outros alvos (implementação futura)
    }
    
    hasLineOfSight(targetPosition) {
        // Origem do raio (posição do zumbi + altura dos olhos)
        const origin = this.position.clone();
        origin.y += this.height * 0.8;
        
        // Direção para o alvo
        const direction = targetPosition.clone().sub(origin).normalize();
        
        // Criar raycaster
        const raycaster = new THREE.Raycaster(origin, direction);
        
        // Obter objetos para testar colisão
        const objects = [];
        
        // Adicionar objetos do mundo
        if (this.game.world) {
            // Adicionar edifícios
            this.game.world.buildings.forEach(building => {
                if (building.mesh) objects.push(building.mesh);
            });
        }
        
        // Realizar raycasting
        const intersects = raycaster.intersectObjects(objects);
        
        // Verificar se há obstáculos entre o zumbi e o alvo
        if (intersects.length > 0) {
            const hitDistance = intersects[0].distance;
            const targetDistance = origin.distanceTo(targetPosition);
            
            // Se a distância do hit for menor que a distância até o alvo,
            // significa que há um obstáculo no caminho
            return hitDistance > targetDistance;
        }
        
        // Sem obstáculos
        return true;
    }
    
    updateIdle(delta) {
        // Em estado idle, o zumbi fica parado
        this.velocity.set(0, 0, 0);
    }
    
    setWanderTarget() {
        // Definir um ponto aleatório próximo para vagar
        const angle = Math.random() * Math.PI * 2;
        const distance = 5 + Math.random() * 10;
        
        const x = this.position.x + Math.cos(angle) * distance;
        const z = this.position.z + Math.sin(angle) * distance;
        
        this.wanderTarget = new THREE.Vector3(x, 0, z);
    }
    
    updateWander(delta) {
        if (!this.wanderTarget) {
            this.setWanderTarget();
        }
        
        // Mover em direção ao ponto de vagar
        const direction = this.wanderTarget.clone().sub(this.position);
        direction.y = 0; // Manter movimento no plano horizontal
        
        // Normalizar direção
        if (direction.length() > 0.1) {
            direction.normalize();
            
            // Aplicar velocidade
            const wanderSpeed = this.speed * 0.5; // Mais lento que perseguição
            this.velocity.x = direction.x * wanderSpeed;
            this.velocity.z = direction.z * wanderSpeed;
            
            // Rotacionar para a direção do movimento
            this.rotation.y = Math.atan2(direction.x, direction.z);
        } else {
            // Chegou ao destino, resetar
            this.wanderTarget = null;
            this.velocity.set(0, 0, 0);
        }
    }
    
    updateChase(delta) {
        if (!this.target) {
            this.state = 'idle';
            return;
        }
        
        // Mover em direção ao alvo
        const direction = this.target.position.clone().sub(this.position);
        direction.y = 0; // Manter movimento no plano horizontal
        
        // Normalizar direção
        if (direction.length() > 0) {
            direction.normalize();
            
            // Aplicar velocidade
            this.velocity.x = direction.x * this.speed;
            this.velocity.z = direction.z * this.speed;
            
            // Rotacionar para a direção do movimento
            this.rotation.y = Math.atan2(direction.x, direction.z);
        }
    }
    
    updateAttack(delta) {
        if (!this.target) {
            this.state = 'idle';
            return;
        }
        
        // Parar movimento durante ataque
        this.velocity.set(0, 0, 0);
        
        // Rotacionar para olhar para o alvo
        const direction = this.target.position.clone().sub(this.position);
        direction.y = 0;
        
        if (direction.length() > 0) {
            this.rotation.y = Math.atan2(direction.x, direction.z);
        }
        
        // Verificar cooldown de ataque
        const currentTime = this.game.gameTime;
        if (currentTime - this.lastAttackTime >= this.attackRate) {
            this.attack();
            this.lastAttackTime = currentTime;
        }
    }
    
    updateStunned(delta) {
        // Zumbi atordoado não se move
        this.velocity.set(0, 0, 0);
    }
    
    attack() {
        if (!this.target) return;
        
        console.log(`${this.type} atacou!`);
        
        // Verificar distância
        const distance = this.position.distanceTo(this.target.position);
        if (distance <= this.attackRange) {
            // Causar dano ao alvo
            if (this.target.takeDamage) {
                this.target.takeDamage(this.damage);
            }
            
            // Animação de ataque
            this.playAttackAnimation();
        }
    }
    
    playAttackAnimation() {
        // Animação simples de ataque (braços para frente)
        if (this.leftArm && this.rightArm) {
            // Salvar posição original
            const leftPos = this.leftArm.position.clone();
            const rightPos = this.rightArm.position.clone();
            
            // Mover braços para frente
            this.leftArm.position.z += 0.5;
            this.rightArm.position.z += 0.5;
            
            // Voltar à posição original após um tempo
            setTimeout(() => {
                if (this.leftArm && this.rightArm) {
                    this.leftArm.position.copy(leftPos);
                    this.rightArm.position.copy(rightPos);
                }
            }, 200);
        }
    }
    
    updateAnimations(delta) {
        // Animações simples baseadas no estado
        if (this.state === 'idle') {
            // Animação de respiração
            if (this.mesh) {
                this.mesh.position.y = this.position.y + Math.sin(this.game.gameTime * 2) * 0.02;
            }
        } else if (this.state === 'wander' || this.state === 'chase') {
            // Animação de caminhada
            if (this.leftLeg && this.rightLeg) {
                const walkSpeed = this.state === 'chase' ? 8 : 4;
                const legSwing = Math.sin(this.game.gameTime * walkSpeed) * 0.2;
                
                this.leftLeg.rotation.x = legSwing;
                this.rightLeg.rotation.x = -legSwing;
            }
            
            if (this.leftArm && this.rightArm) {
                const armSwing = Math.sin(this.game.gameTime * (this.state === 'chase' ? 8 : 4)) * 0.4;
                
                this.leftArm.rotation.x = -armSwing;
                this.rightArm.rotation.x = armSwing;
            }
        }
    }
    
    updateModel() {
        if (this.mesh) {
            // Aplicar física
            this.updatePhysics();
            
            // Atualizar posição do modelo
            this.mesh.position.copy(this.position);
            this.mesh.rotation.y = this.rotation.y;
        }
    }
    
    updatePhysics() {
        // Aplicar velocidade
        this.position.x += this.velocity.x;
        this.position.z += this.velocity.z;
        
        // Verificar colisões
        this.checkCollisions();
    }
    
    checkCollisions() {
        // Verificar limites do mundo
        const worldSize = CONFIG.WORLD.SIZE / 2;
        if (this.position.x < -worldSize) this.position.x = -worldSize;
        if (this.position.x > worldSize) this.position.x = worldSize;
        if (this.position.z < -worldSize) this.position.z = -worldSize;
        if (this.position.z > worldSize) this.position.z = worldSize;
        
        // Verificar colisão com objetos do mundo
        if (this.game.world) {
            // Verificar edifícios
            for (const building of this.game.world.buildings) {
                if (!building.collidable) continue;
                
                // Colisão simples com caixa
                const halfSize = new THREE.Vector3(
                    building.size.x / 2,
                    building.size.y / 2,
                    building.size.z / 2
                );
                
                const minX = building.position.x - halfSize.x;
                const maxX = building.position.x + halfSize.x;
                const minZ = building.position.z - halfSize.z;
                const maxZ = building.position.z + halfSize.z;
                
                // Verificar se o zumbi está dentro da caixa
                if (this.position.x + this.radius > minX && 
                    this.position.x - this.radius < maxX && 
                    this.position.z + this.radius > minZ && 
                    this.position.z - this.radius < maxZ) {
                    
                    // Determinar a direção de menor penetração
                    const overlapX1 = this.position.x + this.radius - minX;
                    const overlapX2 = maxX - (this.position.x - this.radius);
                    const overlapZ1 = this.position.z + this.radius - minZ;
                    const overlapZ2 = maxZ - (this.position.z - this.radius);
                    
                    // Encontrar a menor sobreposição
                    const minOverlap = Math.min(overlapX1, overlapX2, overlapZ1, overlapZ2);
                    
                    // Resolver colisão
                    if (minOverlap === overlapX1) {
                        this.position.x = minX - this.radius;
                    } else if (minOverlap === overlapX2) {
                        this.position.x = maxX + this.radius;
                    } else if (minOverlap === overlapZ1) {
                        this.position.z = minZ - this.radius;
                    } else if (minOverlap === overlapZ2) {
                        this.position.z = maxZ + this.radius;
                    }
                }
            }
            
            // Verificar árvores
            for (const tree of this.game.world.trees) {
                if (!tree.collidable) continue;
                
                // Colisão com círculo
                const dx = this.position.x - tree.position.x;
                const dz = this.position.z - tree.position.z;
                const distance = Math.sqrt(dx * dx + dz * dz);
                
                if (distance < this.radius + tree.radius) {
                    // Normalizar vetor de direção
                    const nx = dx / distance;
                    const nz = dz / distance;
                    
                    // Mover para fora da colisão
                    const penetration = this.radius + tree.radius - distance;
                    this.position.x += nx * penetration;
                    this.position.z += nz * penetration;
                }
            }
        }
        
        // Verificar colisão com outros zumbis
        for (const zombie of this.game.zombies) {
            if (zombie === this) continue;
            
            const dx = this.position.x - zombie.position.x;
            const dz = this.position.z - zombie.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance < this.radius + zombie.radius) {
                // Normalizar vetor de direção
                const nx = dx / distance;
                const nz = dz / distance;
                
                // Mover para fora da colisão
                const penetration = (this.radius + zombie.radius - distance) * 0.5;
                this.position.x += nx * penetration;
                this.position.z += nz * penetration;
                
                // Mover o outro zumbi também
                zombie.position.x -= nx * penetration;
                zombie.position.z -= nz * penetration;
            }
        }
        
        // Verificar colisão com veículos
        for (const vehicle of this.game.vehicles) {
            // Simplificação: tratar veículo como círculo
            const vehicleRadius = Math.max(vehicle.size.x, vehicle.size.z) / 2;
            
            const dx = this.position.x - vehicle.position.x;
            const dz = this.position.z - vehicle.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance < this.radius + vehicleRadius) {
                // Normalizar vetor de direção
                const nx = dx / distance;
                const nz = dz / distance;
                
                // Mover para fora da colisão
                const penetration = this.radius + vehicleRadius - distance;
                this.position.x += nx * penetration;
                this.position.z += nz * penetration;
            }
        }
    }
    
    takeDamage(amount) {
        this.health -= amount;
        
        console.log(`${this.type} tomou ${amount} de dano! Saúde: ${this.health}/${this.maxHealth}`);
        
        // Efeito visual de dano
        if (this.mesh) {
            this.mesh.material.color.set(0xff0000);
            setTimeout(() => {
                if (this.mesh) {
                    // Restaurar cor original
                    switch (this.type) {
                        case 'Comum':
                            this.mesh.material.color.set(0x8B4513);
                            break;
                        case 'Corredor':
                            this.mesh.material.color.set(0x228B22);
                            break;
                        case 'Tanque':
                            this.mesh.material.color.set(0x8B0000);
                            break;
                        case 'Spitter':
                            this.mesh.material.color.set(0x4B0082);
                            break;
                        default:
                            this.mesh.material.color.set(0x8B4513);
                    }
                }
            }, 200);
        }
        
        // Verificar morte
        if (this.health <= 0) {
            this.die();
        } else {
            // Atordoar brevemente
            this.stun(0.5);
        }
    }
    
    stun(duration) {
        this.isStunned = true;
        this.stunTime = duration;
        this.state = 'stunned';
    }
    
    die() {
        console.log(`${this.type} morreu!`);
        
        this.isDead = true;
        this.velocity.set(0, 0, 0);
        
        // Efeito visual de morte
        if (this.mesh) {
            // Rotacionar para cair
            this.mesh.rotation.x = Math.PI / 2;
            this.mesh.position.y = this.radius;
            
            // Mudar cor
            this.mesh.material.color.set(0x333333);
            
            // Desativar olhos
            if (this.leftEye) this.leftEye.material.emissiveIntensity = 0;
            if (this.rightEye) this.rightEye.material.emissiveIntensity = 0;
        }
        
        // Chance de dropar item
        if (Math.random() < 0.3) { // 30% de chance
            this.dropItem();
        }
        
        // Remover da lista de zumbis após um tempo
        setTimeout(() => {
            const index = this.game.zombies.indexOf(this);
            if (index !== -1) {
                // Remover da cena
                if (this.mesh) {
                    this.scene.remove(this.mesh);
                }
                
                // Remover da lista
                this.game.zombies.splice(index, 1);
            }
        }, 10000); // Remover após 10 segundos
    }
    
    dropItem() {
        // Tipos de itens que podem ser dropados
        const itemTypes = [
            { type: 'ammo', name: 'Munição', value: 10, color: 0xCCCCCC, weight: 0.5, stackable: true, maxStack: 100, quantity: 10 },
            { type: 'medkit', name: 'Bandagem', value: 20, color: 0xFFFFFF, weight: 0.5, stackable: true, maxStack: 5, quantity: 1 },
            { type: 'food', name: 'Comida Enlatada', value: 15, color: 0xC0C0C0, weight: 1, stackable: true, maxStack: 5, quantity: 1 },
            { type: 'drink', name: 'Água', value: 10, color: 0x0000FF, weight: 1, stackable: true, maxStack: 5, quantity: 1 }
        ];
        
        // Escolher item aleatório
        const itemConfig = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        
        // Criar item
        const item = new Item(this.game, itemConfig, this.position.clone());
        
        // Adicionar à lista de itens do jogo
        this.game.items.push(item);
    }
}

// Classe para gerenciar o sistema de zumbis
class ZombieManager {
    constructor(game) {
        this.game = game;
        this.zombies = [];
        this.maxZombies = CONFIG.ZOMBIES.MAX_COUNT || 50;
        this.spawnInterval = null;
        this.spawnRate = CONFIG.ZOMBIES.SPAWN_RATE || 10000; // ms entre spawns
        this.zombieTypes = CONFIG.ZOMBIES.TYPES;
    }
    
    init() {
        console.log("Inicializando gerenciador de zumbis...");
        
        // Spawn inicial
        this.spawnInitialZombies();
        
        // Iniciar spawn contínuo
        this.startSpawning();
    }
    
    spawnInitialZombies() {
        const initialCount = Math.min(10, this.maxZombies);
        
        for (let i = 0; i < initialCount; i++) {
            this.spawnRandomZombie();
        }
    }
    
    startSpawning() {
        this.spawnInterval = setInterval(() => {
            if (this.zombies.length < this.maxZombies) {
                this.spawnRandomZombie();
            }
        }, this.spawnRate);
    }
    
    stopSpawning() {
        clearInterval(this.spawnInterval);
    }
    
    spawnRandomZombie() {
        // Encontrar posição válida para spawn
        const position = this.getRandomSpawnPosition();
        
        // Escolher tipo aleatório
        const typeIndex = Math.floor(Math.random() * this.zombieTypes.length);
        const zombieConfig = this.zombieTypes[typeIndex];
        
        // Criar zumbi
        const zombie = new Zombie(this.game, zombieConfig, position);
        
        // Adicionar à lista
        this.zombies.push(zombie);
        
        return zombie;
    }
    
    getRandomSpawnPosition() {
        const worldSize = CONFIG.WORLD.SIZE / 2;
        const citySize = CONFIG.WORLD.CITY_SIZE / 2;
        
        // Tentar encontrar posição válida
        let position;
        let isValid = false;
        let attempts = 0;
        
        while (!isValid && attempts < 50) {
            attempts++;
            
            // Gerar posição aleatória
            const x = (Math.random() * 2 - 1) * worldSize;
            const z = (Math.random() * 2 - 1) * worldSize;
            
            position = new THREE.Vector3(x, 0, z);
            
            // Verificar distância do jogador (não spawnar muito perto)
            if (this.game.player) {
                const distanceToPlayer = position.distanceTo(this.game.player.position);
                if (distanceToPlayer < 50) {
                    continue;
                }
            }
            
            // Verificar colisões com edifícios
            let collisionDetected = false;
            
            if (this.game.world) {
                for (const building of this.game.world.buildings) {
                    if (!building.collidable) continue;
                    
                    const halfSize = new THREE.Vector3(
                        building.size.x / 2,
                        building.size.y / 2,
                        building.size.z / 2
                    );
                    
                    const minX = building.position.x - halfSize.x;
                    const maxX = building.position.x + halfSize.x;
                    const minZ = building.position.z - halfSize.z;
                    const maxZ = building.position.z + halfSize.z;
                    
                    if (position.x > minX && position.x < maxX && 
                        position.z > minZ && position.z < maxZ) {
                        collisionDetected = true;
                        break;
                    }
                }
                
                // Verificar colisão com árvores
                for (const tree of this.game.world.trees) {
                    if (!tree.collidable) continue;
                    
                    const dx = position.x - tree.position.x;
                    const dz = position.z - tree.position.z;
                    const distance = Math.sqrt(dx * dx + dz * dz);
                    
                    if (distance < tree.radius) {
                        collisionDetected = true;
                        break;
                    }
                }
            }
            
            if (!collisionDetected) {
                isValid = true;
            }
        }
        
        // Se não encontrou posição válida após várias tentativas, usar posição padrão
        if (!isValid) {
            position = new THREE.Vector3(
                (Math.random() * 2 - 1) * worldSize,
                0,
                (Math.random() * 2 - 1) * worldSize
            );
        }
        
        return position;
    }
    
    update(delta) {
        // Atualizar todos os zumbis
        for (const zombie of this.zombies) {
            zombie.update(delta);
        }
    }
    
    clear() {
        // Remover todos os zumbis
        for (const zombie of this.zombies) {
            if (zombie.mesh) {
                this.game.scene.remove(zombie.mesh);
            }
        }
        
        this.zombies = [];
    }
}

// Exportar para uso em outros arquivos
window.Zombie = Zombie;
window.ZombieManager = ZombieManager;
