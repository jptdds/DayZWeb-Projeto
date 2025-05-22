// Classe para gerenciar armas no jogo
class Weapon {
    constructor(game, config, position) {
        this.game = game;
        this.scene = game.scene;
        
        // Configuração da arma
        this.config = config;
        this.name = config.name;
        this.type = config.type;
        this.damage = config.damage;
        this.fireRate = config.fireRate;
        this.reloadTime = config.reloadTime;
        this.magazineSize = config.magazineSize;
        this.range = config.range;
        this.recoil = config.recoil;
        
        // Estado da arma
        this.position = position || new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0);
        this.isPickedUp = false;
        this.owner = null;
        this.currentAmmo = this.magazineSize;
        this.totalAmmo = 0;
        this.isReloading = false;
        this.lastFireTime = 0;
        
        // Modificações
        this.modifications = {
            scope: null,
            barrel: null,
            grip: null,
            magazine: null
        };
        
        // Criar modelo da arma
        this.createWeaponModel();
    }
    
    createWeaponModel() {
        // Criar modelo temporário (será substituído por modelo carregado)
        let geometry;
        
        // Geometria baseada no tipo
        switch (this.type) {
            case 'pistol':
                geometry = new THREE.BoxGeometry(0.1, 0.15, 0.3);
                break;
            case 'shotgun':
                geometry = new THREE.BoxGeometry(0.1, 0.15, 0.8);
                break;
            case 'rifle':
                geometry = new THREE.BoxGeometry(0.1, 0.15, 1.0);
                break;
            case 'smg':
                geometry = new THREE.BoxGeometry(0.1, 0.15, 0.6);
                break;
            default:
                geometry = new THREE.BoxGeometry(0.1, 0.15, 0.5);
        }
        
        // Criar material
        const material = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.5,
            metalness: 0.7
        });
        
        // Criar mesh
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.rotation.copy(this.rotation);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.name = "weapon_" + this.name;
        
        // Adicionar à cena se não estiver no inventário
        if (!this.isPickedUp) {
            this.scene.add(this.mesh);
            
            // Adicionar efeito de flutuação
            this.floatHeight = 0.2;
            this.floatSpeed = 1 + Math.random() * 0.5;
            this.floatOffset = Math.random() * Math.PI * 2;
        }
    }
    
    update(delta) {
        if (!this.isPickedUp && this.mesh) {
            // Efeito de flutuação
            const floatY = Math.sin((this.game.gameTime + this.floatOffset) * this.floatSpeed) * 0.05;
            this.mesh.position.y = this.position.y + this.floatHeight + floatY;
            
            // Rotação lenta
            this.mesh.rotation.y += delta * 0.5;
            
            // Verificar proximidade do jogador para interação
            if (this.game.player) {
                const distance = this.position.distanceTo(this.game.player.position);
                if (distance < this.game.player.interactionRange) {
                    // Adicionar à lista de interagíveis do jogador
                    this.game.player.nearbyInteractables.push({
                        type: 'weapon',
                        object: this,
                        distance: distance
                    });
                }
            }
        }
    }
    
    pickup(player) {
        if (!this.isPickedUp) {
            console.log(`${player.name || 'Player'} pegou ${this.name}`);
            
            // Adicionar ao inventário do jogador
            const added = player.addToInventory(this);
            
            if (added) {
                this.isPickedUp = true;
                this.owner = player;
                
                // Remover da cena
                if (this.mesh) {
                    this.scene.remove(this.mesh);
                }
                
                // Remover da lista de itens do jogo
                const index = this.game.items.indexOf(this);
                if (index !== -1) {
                    this.game.items.splice(index, 1);
                }
                
                return true;
            }
        }
        
        return false;
    }
    
    drop(position) {
        if (this.isPickedUp) {
            console.log(`${this.owner.name || 'Player'} largou ${this.name}`);
            
            this.isPickedUp = false;
            this.owner = null;
            this.position.copy(position);
            
            // Recriar modelo
            this.createWeaponModel();
            
            // Adicionar de volta à lista de itens do jogo
            this.game.items.push(this);
            
            return true;
        }
        
        return false;
    }
    
    equip(player) {
        console.log(`${player.name || 'Player'} equipou ${this.name}`);
        
        // Verificar se já está equipada
        if (player.currentWeapon === this) {
            return false;
        }
        
        // Guardar arma atual
        if (player.currentWeapon) {
            player.currentWeapon.unequip();
        }
        
        // Equipar esta arma
        player.currentWeapon = this;
        
        // Atualizar HUD
        this.updateHUD();
        
        return true;
    }
    
    unequip() {
        if (this.owner && this.owner.currentWeapon === this) {
            this.owner.currentWeapon = null;
        }
    }
    
    fire() {
        // Verificar se pode atirar
        if (this.isReloading) {
            console.log("Arma recarregando...");
            return false;
        }
        
        if (this.currentAmmo <= 0) {
            console.log("Sem munição!");
            this.reload();
            return false;
        }
        
        // Verificar cooldown de tiro
        const currentTime = this.game.gameTime;
        if (currentTime - this.lastFireTime < this.fireRate) {
            return false;
        }
        
        console.log(`${this.name} disparou!`);
        
        // Atualizar último tempo de tiro
        this.lastFireTime = currentTime;
        
        // Consumir munição
        this.currentAmmo--;
        
        // Aplicar recuo
        this.applyRecoil();
        
        // Criar projétil ou raycasting
        this.createProjectile();
        
        // Atualizar HUD
        this.updateHUD();
        
        return true;
    }
    
    reload() {
        if (this.isReloading || this.currentAmmo === this.magazineSize) {
            return false;
        }
        
        // Verificar se tem munição total
        if (this.totalAmmo <= 0) {
            console.log("Sem munição para recarregar!");
            return false;
        }
        
        console.log(`Recarregando ${this.name}...`);
        
        // Iniciar recarga
        this.isReloading = true;
        
        // Timer de recarga
        setTimeout(() => {
            // Calcular quantidade a recarregar
            const ammoNeeded = this.magazineSize - this.currentAmmo;
            const ammoToReload = Math.min(ammoNeeded, this.totalAmmo);
            
            // Recarregar
            this.currentAmmo += ammoToReload;
            this.totalAmmo -= ammoToReload;
            
            // Finalizar recarga
            this.isReloading = false;
            
            console.log(`${this.name} recarregada!`);
            
            // Atualizar HUD
            this.updateHUD();
        }, this.reloadTime * 1000);
        
        return true;
    }
    
    addAmmo(amount) {
        this.totalAmmo += amount;
        console.log(`Adicionado ${amount} munições para ${this.name}. Total: ${this.totalAmmo}`);
        
        // Atualizar HUD
        this.updateHUD();
        
        return true;
    }
    
    applyRecoil() {
        // Aplicar recuo na câmera do jogador
        if (this.owner) {
            // Recuo vertical
            this.owner.rotation.x -= this.recoil * (0.5 + Math.random() * 0.5);
            
            // Recuo horizontal aleatório
            this.owner.rotation.y += (Math.random() - 0.5) * this.recoil * 0.5;
            
            // Limitar rotação vertical
            this.owner.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.owner.rotation.x));
        }
    }
    
    createProjectile() {
        // Para armas que usam projéteis físicos
        if (['shotgun', 'rpg'].includes(this.type)) {
            // Implementar projétil físico
        } else {
            // Usar raycasting para tiros instantâneos
            this.performRaycast();
        }
    }
    
    performRaycast() {
        // Obter direção do tiro
        const direction = new THREE.Vector3(0, 0, -1);
        
        // Aplicar rotação da câmera
        if (this.owner) {
            direction.applyEuler(this.owner.rotation);
        }
        
        // Origem do raio (posição da arma)
        const origin = this.getFirePosition();
        
        // Criar raycaster
        const raycaster = new THREE.Raycaster(origin, direction, 0, this.range);
        
        // Obter objetos para testar colisão
        const objects = [];
        
        // Adicionar objetos do mundo
        if (this.game.world) {
            // Adicionar edifícios
            this.game.world.buildings.forEach(building => {
                if (building.mesh) objects.push(building.mesh);
            });
            
            // Adicionar árvores
            this.game.world.trees.forEach(tree => {
                if (tree.mesh) objects.push(tree.mesh);
            });
        }
        
        // Adicionar veículos
        this.game.vehicles.forEach(vehicle => {
            if (vehicle.mesh) objects.push(vehicle.mesh);
        });
        
        // Adicionar zumbis
        this.game.zombies.forEach(zombie => {
            if (zombie.mesh) objects.push(zombie.mesh);
        });
        
        // Realizar raycasting
        const intersects = raycaster.intersectObjects(objects);
        
        // Verificar colisões
        if (intersects.length > 0) {
            const hit = intersects[0];
            
            // Efeito visual de impacto
            this.createImpactEffect(hit.point);
            
            // Verificar tipo de objeto atingido
            const hitObject = hit.object;
            
            // Verificar se é um zumbi
            const zombie = this.game.zombies.find(z => z.mesh === hitObject);
            if (zombie) {
                zombie.takeDamage(this.damage);
                console.log(`Zumbi atingido! Dano: ${this.damage}`);
                return;
            }
            
            // Verificar se é um veículo
            const vehicle = this.game.vehicles.find(v => v.mesh === hitObject);
            if (vehicle) {
                vehicle.takeDamage(this.damage * 0.5);
                console.log(`Veículo atingido! Dano: ${this.damage * 0.5}`);
                return;
            }
            
            // Objeto estático (edifício, árvore, etc.)
            console.log("Objeto atingido!");
        } else {
            console.log("Tiro não atingiu nada.");
        }
    }
    
    getFirePosition() {
        // Posição de onde o tiro sai
        if (this.owner) {
            // Posição da câmera + offset
            const cameraPosition = this.owner.camera.position.clone();
            const direction = new THREE.Vector3(0, 0, -1).applyEuler(this.owner.rotation);
            
            return cameraPosition.add(direction.multiplyScalar(0.5));
        }
        
        return this.position.clone();
    }
    
    createImpactEffect(position) {
        // Criar efeito visual de impacto
        const geometry = new THREE.SphereGeometry(0.05, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const impact = new THREE.Mesh(geometry, material);
        
        impact.position.copy(position);
        this.scene.add(impact);
        
        // Remover após um tempo
        setTimeout(() => {
            this.scene.remove(impact);
        }, 200);
    }
    
    updateHUD() {
        // Atualizar HUD com informações da arma
        if (this.owner && this.owner === this.game.player) {
            this.game.uiManager.updateHUD({
                ammo: {
                    current: this.currentAmmo,
                    max: this.magazineSize,
                    total: this.totalAmmo
                }
            });
        }
    }
    
    // Métodos para modificações
    addModification(slot, mod) {
        if (!this.modifications[slot]) {
            this.modifications[slot] = mod;
            
            // Aplicar efeitos da modificação
            this.applyModificationEffects();
            
            console.log(`${mod.name} adicionado a ${this.name}`);
            return true;
        }
        
        return false;
    }
    
    removeModification(slot) {
        if (this.modifications[slot]) {
            const mod = this.modifications[slot];
            this.modifications[slot] = null;
            
            // Remover efeitos da modificação
            this.applyModificationEffects();
            
            console.log(`${mod.name} removido de ${this.name}`);
            return mod;
        }
        
        return null;
    }
    
    applyModificationEffects() {
        // Resetar para valores base
        this.damage = this.config.damage;
        this.fireRate = this.config.fireRate;
        this.reloadTime = this.config.reloadTime;
        this.magazineSize = this.config.magazineSize;
        this.range = this.config.range;
        this.recoil = this.config.recoil;
        
        // Aplicar efeitos de cada modificação
        for (const slot in this.modifications) {
            const mod = this.modifications[slot];
            if (!mod) continue;
            
            switch (slot) {
                case 'scope':
                    this.range *= mod.zoomFactor;
                    break;
                case 'barrel':
                    this.recoil /= mod.recoilReduction;
                    break;
                case 'grip':
                    this.recoil /= mod.stabilityFactor;
                    break;
                case 'magazine':
                    this.magazineSize *= mod.capacityMultiplier;
                    this.reloadTime *= mod.reloadTimeMultiplier;
                    break;
            }
        }
    }
}

// Classe para gerenciar modificações de armas
class WeaponModification {
    constructor(config) {
        this.name = config.name;
        this.type = config.type; // scope, barrel, grip, magazine
        this.description = config.description || "";
        
        // Propriedades específicas por tipo
        switch (this.type) {
            case 'scope':
                this.zoomFactor = config.zoomFactor || 1.0;
                this.accuracy = config.accuracy || 1.0;
                break;
            case 'barrel':
                this.recoilReduction = config.recoilReduction || 1.0;
                this.noiseFactor = config.noiseFactor || 1.0;
                break;
            case 'grip':
                this.stabilityFactor = config.stabilityFactor || 1.0;
                break;
            case 'magazine':
                this.capacityMultiplier = config.capacityMultiplier || 1.0;
                this.reloadTimeMultiplier = config.reloadTimeMultiplier || 1.0;
                break;
        }
    }
}

// Exportar para uso em outros arquivos
window.Weapon = Weapon;
window.WeaponModification = WeaponModification;
