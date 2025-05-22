// Classe do jogador para controle em terceira pessoa
class Player {
    constructor(game) {
        this.game = game;
        this.scene = game.scene;
        this.camera = game.camera;
        
        // Propriedades físicas
        this.height = 1.8;
        this.radius = CONFIG.PLAYER.COLLISION_RADIUS;
        this.moveSpeed = CONFIG.PLAYER.MOVE_SPEED;
        this.sprintSpeed = CONFIG.PLAYER.SPRINT_SPEED;
        this.jumpForce = CONFIG.PLAYER.JUMP_FORCE;
        this.gravity = CONFIG.WORLD.GRAVITY;
        
        // Propriedades de movimento
        this.position = new THREE.Vector3(0, this.height, 0);
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
        this.isSprinting = false;
        this.isJumping = false;
        this.isGrounded = false;
        
        // Propriedades da câmera
        this.cameraOffset = new THREE.Vector3(0, CONFIG.PLAYER.CAMERA_HEIGHT, CONFIG.PLAYER.CAMERA_DISTANCE);
        this.cameraTarget = new THREE.Vector3();
        this.mouseSensitivity = CONFIG.PLAYER.MOUSE_SENSITIVITY;
        
        // Propriedades de status
        this.health = CONFIG.PLAYER.HEALTH_MAX;
        this.stamina = CONFIG.PLAYER.STAMINA_MAX;
        
        // Propriedades de combate
        this.currentWeapon = null;
        this.weapons = [];
        this.isReloading = false;
        this.isAiming = false;
        
        // Propriedades de veículo
        this.currentVehicle = null;
        this.isInVehicle = false;
        
        // Propriedades de interação
        this.interactionRange = 3.0;
        this.nearbyInteractables = [];
        
        // Criar modelo do jogador
        this.createPlayerModel();
        
        // Criar corpo físico
        this.createPhysicsBody();
    }
    
    createPlayerModel() {
        // Criar modelo temporário (será substituído por modelo carregado)
        const geometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height, 8);
        const material = new THREE.MeshLambertMaterial({ color: 0x3498db });
        
        // Ajustar origem do cilindro para a base
        geometry.translate(0, this.height / 2, 0);
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.name = "player";
        
        // Adicionar à cena
        this.scene.add(this.mesh);
        
        // Criar grupo para armas
        this.weaponGroup = new THREE.Group();
        this.mesh.add(this.weaponGroup);
        
        // Posicionar armas
        this.weaponGroup.position.set(0.3, this.height * 0.8, -0.3);
    }
    
    createPhysicsBody() {
        // Implementação da física será feita quando integrarmos Ammo.js completamente
        // Por enquanto, usaremos detecção de colisão simplificada
    }
    
    spawn(position) {
        // Definir posição inicial do jogador
        if (position) {
            this.position.copy(position);
        } else {
            // Posição padrão
            this.position.set(0, this.height, 0);
        }
        
        // Resetar velocidade e rotação
        this.velocity.set(0, 0, 0);
        this.rotation.set(0, 0, 0);
        
        // Atualizar mesh
        this.updateMeshPosition();
        
        // Resetar status
        this.health = CONFIG.PLAYER.HEALTH_MAX;
        this.stamina = CONFIG.PLAYER.STAMINA_MAX;
        
        // Atualizar HUD
        this.updateHUD();
    }
    
    update(delta) {
        if (this.isInVehicle) {
            this.updateVehicleControls(delta);
        } else {
            this.updateMovement(delta);
            this.updateCamera(delta);
            this.checkInteractions();
        }
        
        // Atualizar status
        this.updateStatus(delta);
        
        // Atualizar HUD
        this.updateHUD();
    }
    
    updateMovement(delta) {
        // Obter entrada do teclado
        const inputDir = this.getInputDirection();
        
        // Aplicar direção baseada na rotação da câmera
        this.direction.set(0, 0, 0);
        
        if (inputDir.z !== 0) {
            this.direction.z = inputDir.z;
        }
        
        if (inputDir.x !== 0) {
            this.direction.x = inputDir.x;
        }
        
        // Normalizar direção se estiver se movendo diagonalmente
        if (this.direction.length() > 1) {
            this.direction.normalize();
        }
        
        // Rotacionar direção baseado na rotação da câmera
        const cameraYaw = this.rotation.y;
        const directionVector = new THREE.Vector3(this.direction.x, 0, this.direction.z);
        directionVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);
        
        // Verificar sprint
        this.isSprinting = this.game.inputManager.keys['ShiftLeft'] && this.stamina > 0;
        const currentSpeed = this.isSprinting ? this.sprintSpeed : this.moveSpeed;
        
        // Consumir stamina ao correr
        if (this.isSprinting && directionVector.length() > 0) {
            this.stamina -= CONFIG.PLAYER.STAMINA_MAX * 0.1 * delta;
            if (this.stamina < 0) {
                this.stamina = 0;
                this.isSprinting = false;
            }
        } else if (!this.isSprinting) {
            // Regenerar stamina quando não estiver correndo
            this.stamina += CONFIG.PLAYER.STAMINA_REGEN * delta;
            if (this.stamina > CONFIG.PLAYER.STAMINA_MAX) {
                this.stamina = CONFIG.PLAYER.STAMINA_MAX;
            }
        }
        
        // Aplicar movimento horizontal
        this.velocity.x = directionVector.x * currentSpeed;
        this.velocity.z = directionVector.z * currentSpeed;
        
        // Verificar pulo
        if (this.game.inputManager.keys['Space'] && this.isGrounded) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
            this.isJumping = true;
        }
        
        // Aplicar gravidade
        if (!this.isGrounded) {
            this.velocity.y -= this.gravity * delta;
        }
        
        // Detectar colisão com o chão
        const groundLevel = 0;
        if (this.position.y + this.velocity.y * delta <= this.height) {
            this.position.y = this.height;
            this.velocity.y = 0;
            this.isGrounded = true;
            this.isJumping = false;
        } else {
            this.position.y += this.velocity.y * delta;
        }
        
        // Detectar colisões com objetos (simplificado por enquanto)
        const newPositionX = this.position.x + this.velocity.x * delta;
        const newPositionZ = this.position.z + this.velocity.z * delta;
        
        // Verificar colisões no eixo X
        if (!this.checkCollision(newPositionX, this.position.z)) {
            this.position.x = newPositionX;
        }
        
        // Verificar colisões no eixo Z
        if (!this.checkCollision(this.position.x, newPositionZ)) {
            this.position.z = newPositionZ;
        }
        
        // Atualizar posição do mesh
        this.updateMeshPosition();
    }
    
    getInputDirection() {
        const direction = new THREE.Vector3();
        
        // WASD para movimento
        if (this.game.inputManager.keys['KeyW']) {
            direction.z = -1;
        } else if (this.game.inputManager.keys['KeyS']) {
            direction.z = 1;
        }
        
        if (this.game.inputManager.keys['KeyA']) {
            direction.x = -1;
        } else if (this.game.inputManager.keys['KeyD']) {
            direction.x = 1;
        }
        
        return direction;
    }
    
    checkCollision(x, z) {
        // Implementação simplificada de colisão
        // Será substituída por física mais robusta com Ammo.js
        
        // Verificar limites do mundo
        const worldSize = CONFIG.WORLD.SIZE / 2;
        if (x < -worldSize || x > worldSize || z < -worldSize || z > worldSize) {
            return true;
        }
        
        // Verificar colisão com objetos do mundo
        // Será implementado quando tivermos objetos no mundo
        
        return false;
    }
    
    updateMeshPosition() {
        if (this.mesh) {
            this.mesh.position.copy(this.position);
            this.mesh.rotation.y = this.rotation.y;
        }
    }
    
    updateCamera(delta) {
        // Calcular posição da câmera em terceira pessoa
        const cameraOffset = this.cameraOffset.clone();
        
        // Rotacionar offset baseado na rotação do jogador
        cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation.y);
        
        // Posicionar câmera
        this.camera.position.copy(this.position).add(cameraOffset);
        
        // Definir alvo da câmera (ligeiramente acima do jogador)
        this.cameraTarget.copy(this.position).add(new THREE.Vector3(0, this.height * 0.8, 0));
        
        // Olhar para o jogador
        this.camera.lookAt(this.cameraTarget);
    }
    
    handleMouseMove(mouse) {
        // Rotação horizontal (eixo Y)
        this.rotation.y -= mouse.x * this.mouseSensitivity * 0.002;
        
        // Rotação vertical (eixo X) com limites
        this.rotation.x -= mouse.y * this.mouseSensitivity * 0.002;
        this.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.rotation.x));
        
        // Atualizar rotação da câmera
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.x = this.rotation.x;
        this.camera.rotation.y = this.rotation.y;
    }
    
    handleMouseDown() {
        // Atirar se tiver arma equipada
        if (this.currentWeapon && !this.isReloading) {
            this.shoot();
        }
    }
    
    handleMouseUp() {
        // Implementação futura para armas que precisam de release
    }
    
    shoot() {
        // Será implementado quando tivermos o sistema de armas
    }
    
    updateVehicleControls(delta) {
        // Será implementado quando tivermos o sistema de veículos
    }
    
    checkInteractions() {
        // Verificar objetos interativos próximos
        this.nearbyInteractables = [];
        
        // Verificar veículos
        this.game.vehicles.forEach(vehicle => {
            const distance = this.position.distanceTo(vehicle.position);
            if (distance < this.interactionRange) {
                this.nearbyInteractables.push({
                    type: 'vehicle',
                    object: vehicle,
                    distance: distance
                });
            }
        });
        
        // Verificar itens
        this.game.items.forEach(item => {
            const distance = this.position.distanceTo(item.position);
            if (distance < this.interactionRange) {
                this.nearbyInteractables.push({
                    type: 'item',
                    object: item,
                    distance: distance
                });
            }
        });
        
        // Ordenar por distância
        this.nearbyInteractables.sort((a, b) => a.distance - b.distance);
        
        // Mostrar prompt de interação se houver algo próximo
        const interactionPrompt = document.getElementById('interaction-prompt');
        if (this.nearbyInteractables.length > 0) {
            interactionPrompt.classList.remove('hidden');
            
            // Verificar tecla E para interagir
            if (this.game.inputManager.keys['KeyE']) {
                this.interact(this.nearbyInteractables[0]);
                // Resetar tecla para evitar interações múltiplas
                this.game.inputManager.keys['KeyE'] = false;
            }
        } else {
            interactionPrompt.classList.add('hidden');
        }
    }
    
    interact(interactable) {
        if (!interactable) return;
        
        switch (interactable.type) {
            case 'vehicle':
                this.enterVehicle(interactable.object);
                break;
            case 'item':
                this.pickupItem(interactable.object);
                break;
            // Outros tipos de interação serão adicionados conforme necessário
        }
    }
    
    enterVehicle(vehicle) {
        // Será implementado quando tivermos o sistema de veículos
    }
    
    exitVehicle() {
        // Será implementado quando tivermos o sistema de veículos
    }
    
    pickupItem(item) {
        // Será implementado quando tivermos o sistema de itens
    }
    
    updateStatus(delta) {
        // Implementação futura para fome, sede, etc.
    }
    
    updateHUD() {
        // Atualizar elementos do HUD
        this.game.uiManager.updateHUD({
            health: this.health,
            stamina: this.stamina,
            ammo: this.currentWeapon ? {
                current: this.currentWeapon.currentAmmo,
                max: this.currentWeapon.magazineSize
            } : { current: 0, max: 0 }
        });
    }
    
    takeDamage(amount) {
        this.health -= amount;
        
        // Efeito visual de dano
        // Será implementado com shaders ou efeitos de post-processing
        
        // Verificar morte
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        console.log("Jogador morreu");
        this.game.gameOver();
    }
    
    reset() {
        // Resetar propriedades do jogador
        this.health = CONFIG.PLAYER.HEALTH_MAX;
        this.stamina = CONFIG.PLAYER.STAMINA_MAX;
        this.position.set(0, this.height, 0);
        this.velocity.set(0, 0, 0);
        this.rotation.set(0, 0, 0);
        this.isInVehicle = false;
        this.currentVehicle = null;
        
        // Atualizar mesh
        this.updateMeshPosition();
        
        // Atualizar HUD
        this.updateHUD();
    }
}

// Exportar para uso em outros arquivos
window.Player = Player;
