// Classe para gerenciar itens no jogo
class Item {
    constructor(game, config, position) {
        this.game = game;
        this.scene = game.scene;
        
        // Configuração do item
        this.config = config;
        this.type = config.type;
        this.name = config.name;
        this.description = config.description;
        this.value = config.value;
        this.stackable = config.stackable || false;
        this.maxStack = config.maxStack || 1;
        this.quantity = config.quantity || 1;
        this.weight = config.weight || 1;
        this.useTime = config.useTime || 1;
        this.color = config.color || 0xffffff;
        
        // Estado do item
        this.position = position || new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0);
        this.isPickedUp = false;
        this.owner = null;
        
        // Criar modelo do item
        this.createItemModel();
    }
    
    createItemModel() {
        // Criar modelo temporário (será substituído por modelo carregado)
        let geometry;
        
        // Geometria baseada no tipo
        switch (this.type) {
            case 'weapon':
                geometry = new THREE.BoxGeometry(0.3, 0.2, 0.8);
                break;
            case 'ammo':
                geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
                break;
            case 'medkit':
                geometry = new THREE.BoxGeometry(0.4, 0.2, 0.4);
                break;
            case 'food':
                geometry = new THREE.SphereGeometry(0.2, 8, 8);
                break;
            case 'drink':
                geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 8);
                break;
            case 'fuel':
                geometry = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 8);
                break;
            case 'repair':
                geometry = new THREE.BoxGeometry(0.3, 0.1, 0.3);
                break;
            default:
                geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        }
        
        // Criar material
        const material = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.7,
            metalness: 0.3
        });
        
        // Criar mesh
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.position.y += 0.2; // Elevar ligeiramente do chão
        this.mesh.rotation.copy(this.rotation);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.name = "item_" + this.name;
        
        // Adicionar à cena
        this.scene.add(this.mesh);
        
        // Adicionar efeito de flutuação
        this.floatHeight = 0.2;
        this.floatSpeed = 1 + Math.random() * 0.5;
        this.floatOffset = Math.random() * Math.PI * 2;
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
                        type: 'item',
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
            this.createItemModel();
            
            // Adicionar de volta à lista de itens do jogo
            this.game.items.push(this);
            
            return true;
        }
        
        return false;
    }
    
    use(player) {
        console.log(`${player.name || 'Player'} usou ${this.name}`);
        
        // Efeito baseado no tipo
        switch (this.type) {
            case 'medkit':
                player.heal(this.value);
                break;
            case 'food':
                player.eat(this.value);
                break;
            case 'drink':
                player.drink(this.value);
                break;
            case 'fuel':
                // Verificar se está perto de um veículo
                if (player.currentVehicle) {
                    player.currentVehicle.refuel(this.value);
                } else {
                    // Verificar veículos próximos
                    const nearbyVehicle = player.getNearbyVehicle();
                    if (nearbyVehicle) {
                        nearbyVehicle.refuel(this.value);
                    } else {
                        console.log("Nenhum veículo próximo para reabastecer.");
                        return false;
                    }
                }
                break;
            case 'repair':
                // Verificar se está perto de um veículo
                if (player.currentVehicle) {
                    player.currentVehicle.repair();
                } else {
                    // Verificar veículos próximos
                    const nearbyVehicle = player.getNearbyVehicle();
                    if (nearbyVehicle) {
                        nearbyVehicle.repair();
                    } else {
                        console.log("Nenhum veículo próximo para reparar.");
                        return false;
                    }
                }
                break;
            case 'ammo':
                // Recarregar arma atual
                if (player.currentWeapon) {
                    player.currentWeapon.reload(this.value);
                } else {
                    console.log("Nenhuma arma equipada para recarregar.");
                    return false;
                }
                break;
            default:
                console.log("Este item não pode ser usado diretamente.");
                return false;
        }
        
        // Consumir item se for consumível
        if (['medkit', 'food', 'drink', 'fuel', 'repair', 'ammo'].includes(this.type)) {
            this.quantity--;
            
            if (this.quantity <= 0) {
                // Remover do inventário
                player.removeFromInventory(this);
            }
        }
        
        return true;
    }
}

// Classe para gerenciar o inventário do jogador
class Inventory {
    constructor(owner, maxSlots = 20, maxWeight = 50) {
        this.owner = owner;
        this.maxSlots = maxSlots;
        this.maxWeight = maxWeight;
        this.slots = new Array(maxSlots).fill(null);
        this.currentWeight = 0;
    }
    
    addItem(item) {
        // Verificar se o item é stackável e já existe no inventário
        if (item.stackable) {
            for (let i = 0; i < this.slots.length; i++) {
                const slot = this.slots[i];
                if (slot && slot.name === item.name && slot.type === item.type && slot.quantity < slot.maxStack) {
                    // Adicionar ao stack existente
                    const spaceInStack = slot.maxStack - slot.quantity;
                    const amountToAdd = Math.min(item.quantity, spaceInStack);
                    
                    slot.quantity += amountToAdd;
                    item.quantity -= amountToAdd;
                    
                    // Se ainda sobrou quantidade, continuar procurando slots
                    if (item.quantity <= 0) {
                        return true;
                    }
                }
            }
        }
        
        // Se chegou aqui, precisa de um novo slot
        // Verificar peso
        if (this.currentWeight + item.weight * item.quantity > this.maxWeight) {
            console.log("Inventário muito pesado!");
            return false;
        }
        
        // Procurar slot vazio
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i] === null) {
                this.slots[i] = item;
                this.currentWeight += item.weight * item.quantity;
                return true;
            }
        }
        
        console.log("Inventário cheio!");
        return false;
    }
    
    removeItem(item) {
        const index = this.slots.indexOf(item);
        if (index !== -1) {
            this.currentWeight -= item.weight * item.quantity;
            this.slots[index] = null;
            return true;
        }
        return false;
    }
    
    useItem(index) {
        if (index >= 0 && index < this.slots.length && this.slots[index]) {
            const item = this.slots[index];
            const used = item.use(this.owner);
            
            if (used && item.quantity <= 0) {
                this.slots[index] = null;
            }
            
            return used;
        }
        return false;
    }
    
    dropItem(index) {
        if (index >= 0 && index < this.slots.length && this.slots[index]) {
            const item = this.slots[index];
            
            // Calcular posição para soltar (na frente do jogador)
            const direction = new THREE.Vector3(0, 0, -1).applyEuler(this.owner.rotation);
            const dropPosition = this.owner.position.clone().add(direction.multiplyScalar(1.5));
            
            const dropped = item.drop(dropPosition);
            
            if (dropped) {
                this.currentWeight -= item.weight * item.quantity;
                this.slots[index] = null;
            }
            
            return dropped;
        }
        return false;
    }
    
    getItemCount(itemName, itemType) {
        let count = 0;
        for (let i = 0; i < this.slots.length; i++) {
            const item = this.slots[i];
            if (item && item.name === itemName && item.type === itemType) {
                count += item.quantity;
            }
        }
        return count;
    }
    
    hasItem(itemName, itemType, quantity = 1) {
        return this.getItemCount(itemName, itemType) >= quantity;
    }
    
    getFirstItemByType(type) {
        for (let i = 0; i < this.slots.length; i++) {
            const item = this.slots[i];
            if (item && item.type === type) {
                return { item, index: i };
            }
        }
        return null;
    }
}

// Exportar para uso em outros arquivos
window.Item = Item;
window.Inventory = Inventory;
