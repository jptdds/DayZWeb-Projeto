// Classe para gerenciar a interface do usuário
class UIManager {
    constructor(game) {
        this.game = game;
        
        // Elementos do HUD
        this.hudElements = {};
        
        // Estado dos menus
        this.activeMenu = null;
        this.menuStack = [];
        
        // Notificações
        this.notifications = [];
        this.notificationDuration = 3; // segundos
        
        // Inicializar
        this.init();
    }
    
    init() {
        console.log("Inicializando gerenciador de UI...");
        
        // Criar elementos do HUD
        this.createHUDElements();
        
        // Criar menus
        this.createMenus();
        
        // Configurar eventos
        this.setupEventListeners();
    }
    
    createHUDElements() {
        // Container principal do HUD
        const hudContainer = document.createElement('div');
        hudContainer.id = 'hud-container';
        document.body.appendChild(hudContainer);
        
        // Saúde e Stamina
        const statusContainer = document.createElement('div');
        statusContainer.id = 'status-container';
        hudContainer.appendChild(statusContainer);
        
        // Barra de saúde
        const healthBar = document.createElement('div');
        healthBar.id = 'health-bar';
        healthBar.className = 'status-bar';
        statusContainer.appendChild(healthBar);
        
        const healthFill = document.createElement('div');
        healthFill.id = 'health-fill';
        healthFill.className = 'status-fill';
        healthBar.appendChild(healthFill);
        
        const healthText = document.createElement('div');
        healthText.id = 'health-text';
        healthText.className = 'status-text';
        healthText.textContent = '100/100';
        healthBar.appendChild(healthText);
        
        // Barra de stamina
        const staminaBar = document.createElement('div');
        staminaBar.id = 'stamina-bar';
        staminaBar.className = 'status-bar';
        statusContainer.appendChild(staminaBar);
        
        const staminaFill = document.createElement('div');
        staminaFill.id = 'stamina-fill';
        staminaFill.className = 'status-fill';
        staminaBar.appendChild(staminaFill);
        
        const staminaText = document.createElement('div');
        staminaText.id = 'stamina-text';
        staminaText.className = 'status-text';
        staminaText.textContent = '100/100';
        staminaBar.appendChild(staminaText);
        
        // Arma e munição
        const weaponContainer = document.createElement('div');
        weaponContainer.id = 'weapon-container';
        hudContainer.appendChild(weaponContainer);
        
        const weaponName = document.createElement('div');
        weaponName.id = 'weapon-name';
        weaponContainer.appendChild(weaponName);
        
        const ammoDisplay = document.createElement('div');
        ammoDisplay.id = 'ammo-display';
        weaponContainer.appendChild(ammoDisplay);
        
        // Minimapa
        const minimapContainer = document.createElement('div');
        minimapContainer.id = 'minimap-container';
        hudContainer.appendChild(minimapContainer);
        
        const minimap = document.createElement('div');
        minimap.id = 'minimap';
        minimapContainer.appendChild(minimap);
        
        // Bússola
        const compassContainer = document.createElement('div');
        compassContainer.id = 'compass-container';
        hudContainer.appendChild(compassContainer);
        
        const compass = document.createElement('div');
        compass.id = 'compass';
        compassContainer.appendChild(compass);
        
        const compassDirections = document.createElement('div');
        compassDirections.id = 'compass-directions';
        compassDirections.innerHTML = '<span>N</span><span>NE</span><span>E</span><span>SE</span><span>S</span><span>SW</span><span>W</span><span>NW</span>';
        compass.appendChild(compassDirections);
        
        const compassNeedle = document.createElement('div');
        compassNeedle.id = 'compass-needle';
        compass.appendChild(compassNeedle);
        
        // Nível e experiência
        const levelContainer = document.createElement('div');
        levelContainer.id = 'level-container';
        hudContainer.appendChild(levelContainer);
        
        const levelDisplay = document.createElement('div');
        levelDisplay.id = 'level-display';
        levelContainer.appendChild(levelDisplay);
        
        const xpBar = document.createElement('div');
        xpBar.id = 'xp-bar';
        levelContainer.appendChild(xpBar);
        
        const xpFill = document.createElement('div');
        xpFill.id = 'xp-fill';
        xpBar.appendChild(xpFill);
        
        // Prompt de interação
        const interactionPrompt = document.createElement('div');
        interactionPrompt.id = 'interaction-prompt';
        interactionPrompt.className = 'hidden';
        hudContainer.appendChild(interactionPrompt);
        
        // Container de notificações
        const notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        hudContainer.appendChild(notificationContainer);
        
        // Armazenar referências
        this.hudElements = {
            container: hudContainer,
            healthFill: healthFill,
            healthText: healthText,
            staminaFill: staminaFill,
            staminaText: staminaText,
            weaponName: weaponName,
            ammoDisplay: ammoDisplay,
            minimap: minimap,
            compass: compass,
            compassNeedle: compassNeedle,
            levelDisplay: levelDisplay,
            xpFill: xpFill,
            interactionPrompt: interactionPrompt,
            notificationContainer: notificationContainer
        };
    }
    
    createMenus() {
        // Container principal de menus
        const menuContainer = document.createElement('div');
        menuContainer.id = 'menu-container';
        menuContainer.className = 'hidden';
        document.body.appendChild(menuContainer);
        
        // Menu de pausa
        const pauseMenu = document.createElement('div');
        pauseMenu.id = 'pause-menu';
        pauseMenu.className = 'menu hidden';
        menuContainer.appendChild(pauseMenu);
        
        const pauseTitle = document.createElement('h2');
        pauseTitle.textContent = 'Jogo Pausado';
        pauseMenu.appendChild(pauseTitle);
        
        const pauseButtons = document.createElement('div');
        pauseButtons.className = 'menu-buttons';
        pauseMenu.appendChild(pauseButtons);
        
        const resumeButton = document.createElement('button');
        resumeButton.textContent = 'Continuar';
        resumeButton.addEventListener('click', () => this.closeMenu());
        pauseButtons.appendChild(resumeButton);
        
        const optionsButton = document.createElement('button');
        optionsButton.textContent = 'Opções';
        optionsButton.addEventListener('click', () => this.openMenu('options'));
        pauseButtons.appendChild(optionsButton);
        
        const exitButton = document.createElement('button');
        exitButton.textContent = 'Sair do Jogo';
        exitButton.addEventListener('click', () => this.game.exitGame());
        pauseButtons.appendChild(exitButton);
        
        // Menu de inventário
        const inventoryMenu = document.createElement('div');
        inventoryMenu.id = 'inventory-menu';
        inventoryMenu.className = 'menu hidden';
        menuContainer.appendChild(inventoryMenu);
        
        const inventoryTitle = document.createElement('h2');
        inventoryTitle.textContent = 'Inventário';
        inventoryMenu.appendChild(inventoryTitle);
        
        const inventoryContent = document.createElement('div');
        inventoryContent.id = 'inventory-content';
        inventoryMenu.appendChild(inventoryContent);
        
        const inventorySlots = document.createElement('div');
        inventorySlots.id = 'inventory-slots';
        inventoryContent.appendChild(inventorySlots);
        
        // Criar slots de inventário
        for (let i = 0; i < 20; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.dataset.index = i;
            slot.addEventListener('click', (e) => this.handleInventorySlotClick(e));
            inventorySlots.appendChild(slot);
        }
        
        const inventoryDetails = document.createElement('div');
        inventoryDetails.id = 'inventory-details';
        inventoryContent.appendChild(inventoryDetails);
        
        const inventoryClose = document.createElement('button');
        inventoryClose.textContent = 'Fechar';
        inventoryClose.addEventListener('click', () => this.closeMenu());
        inventoryMenu.appendChild(inventoryClose);
        
        // Menu de habilidades
        const skillsMenu = document.createElement('div');
        skillsMenu.id = 'skills-menu';
        skillsMenu.className = 'menu hidden';
        menuContainer.appendChild(skillsMenu);
        
        const skillsTitle = document.createElement('h2');
        skillsTitle.textContent = 'Habilidades';
        skillsMenu.appendChild(skillsTitle);
        
        const skillsContent = document.createElement('div');
        skillsContent.id = 'skills-content';
        skillsMenu.appendChild(skillsContent);
        
        // Categorias de habilidades
        const skillCategories = [
            { id: 'survival', name: 'Sobrevivência', skills: ['health', 'stamina', 'hunger', 'thirst'] },
            { id: 'combat', name: 'Combate', skills: ['damage', 'accuracy', 'reloadSpeed', 'criticalHit'] },
            { id: 'movement', name: 'Movimento', skills: ['speed', 'sprintDuration', 'jumpHeight', 'fallDamage'] },
            { id: 'vehicles', name: 'Veículos', skills: ['drivingSkill', 'vehicleEfficiency', 'repairSkill'] },
            { id: 'scavenging', name: 'Coleta', skills: ['scavenging', 'stealth', 'crafting'] }
        ];
        
        // Criar tabs para categorias
        const skillTabs = document.createElement('div');
        skillTabs.id = 'skill-tabs';
        skillsContent.appendChild(skillTabs);
        
        skillCategories.forEach(category => {
            const tab = document.createElement('div');
            tab.className = 'skill-tab';
            tab.dataset.category = category.id;
            tab.textContent = category.name;
            tab.addEventListener('click', () => this.showSkillCategory(category.id));
            skillTabs.appendChild(tab);
        });
        
        // Conteúdo das habilidades
        const skillsList = document.createElement('div');
        skillsList.id = 'skills-list';
        skillsContent.appendChild(skillsList);
        
        // Pontos de habilidade disponíveis
        const skillPoints = document.createElement('div');
        skillPoints.id = 'skill-points';
        skillPoints.textContent = 'Pontos de Habilidade: 0';
        skillsContent.appendChild(skillPoints);
        
        const skillsClose = document.createElement('button');
        skillsClose.textContent = 'Fechar';
        skillsClose.addEventListener('click', () => this.closeMenu());
        skillsMenu.appendChild(skillsClose);
        
        // Menu de opções
        const optionsMenu = document.createElement('div');
        optionsMenu.id = 'options-menu';
        optionsMenu.className = 'menu hidden';
        menuContainer.appendChild(optionsMenu);
        
        const optionsTitle = document.createElement('h2');
        optionsTitle.textContent = 'Opções';
        optionsMenu.appendChild(optionsTitle);
        
        const optionsContent = document.createElement('div');
        optionsContent.id = 'options-content';
        optionsMenu.appendChild(optionsContent);
        
        // Opções de gráficos
        const graphicsOptions = document.createElement('div');
        graphicsOptions.className = 'options-section';
        optionsContent.appendChild(graphicsOptions);
        
        const graphicsTitle = document.createElement('h3');
        graphicsTitle.textContent = 'Gráficos';
        graphicsOptions.appendChild(graphicsTitle);
        
        // Qualidade gráfica
        const qualityOption = document.createElement('div');
        qualityOption.className = 'option';
        graphicsOptions.appendChild(qualityOption);
        
        const qualityLabel = document.createElement('label');
        qualityLabel.textContent = 'Qualidade:';
        qualityOption.appendChild(qualityLabel);
        
        const qualitySelect = document.createElement('select');
        qualitySelect.id = 'quality-select';
        qualityOption.appendChild(qualitySelect);
        
        const qualities = ['Baixa', 'Média', 'Alta'];
        qualities.forEach(quality => {
            const option = document.createElement('option');
            option.value = quality.toLowerCase();
            option.textContent = quality;
            qualitySelect.appendChild(option);
        });
        
        // Distância de renderização
        const renderDistanceOption = document.createElement('div');
        renderDistanceOption.className = 'option';
        graphicsOptions.appendChild(renderDistanceOption);
        
        const renderDistanceLabel = document.createElement('label');
        renderDistanceLabel.textContent = 'Distância de Renderização:';
        renderDistanceOption.appendChild(renderDistanceLabel);
        
        const renderDistanceSlider = document.createElement('input');
        renderDistanceSlider.type = 'range';
        renderDistanceSlider.min = '100';
        renderDistanceSlider.max = '1000';
        renderDistanceSlider.value = '500';
        renderDistanceSlider.id = 'render-distance-slider';
        renderDistanceOption.appendChild(renderDistanceSlider);
        
        const renderDistanceValue = document.createElement('span');
        renderDistanceValue.id = 'render-distance-value';
        renderDistanceValue.textContent = '500m';
        renderDistanceOption.appendChild(renderDistanceValue);
        
        // Opções de áudio
        const audioOptions = document.createElement('div');
        audioOptions.className = 'options-section';
        optionsContent.appendChild(audioOptions);
        
        const audioTitle = document.createElement('h3');
        audioTitle.textContent = 'Áudio';
        audioOptions.appendChild(audioTitle);
        
        // Volume principal
        const masterVolumeOption = document.createElement('div');
        masterVolumeOption.className = 'option';
        audioOptions.appendChild(masterVolumeOption);
        
        const masterVolumeLabel = document.createElement('label');
        masterVolumeLabel.textContent = 'Volume Principal:';
        masterVolumeOption.appendChild(masterVolumeLabel);
        
        const masterVolumeSlider = document.createElement('input');
        masterVolumeSlider.type = 'range';
        masterVolumeSlider.min = '0';
        masterVolumeSlider.max = '100';
        masterVolumeSlider.value = '100';
        masterVolumeSlider.id = 'master-volume-slider';
        masterVolumeOption.appendChild(masterVolumeSlider);
        
        const masterVolumeValue = document.createElement('span');
        masterVolumeValue.id = 'master-volume-value';
        masterVolumeValue.textContent = '100%';
        masterVolumeOption.appendChild(masterVolumeValue);
        
        // Botões de opções
        const optionsButtons = document.createElement('div');
        optionsButtons.className = 'menu-buttons';
        optionsMenu.appendChild(optionsButtons);
        
        const applyButton = document.createElement('button');
        applyButton.textContent = 'Aplicar';
        applyButton.addEventListener('click', () => this.applyOptions());
        optionsButtons.appendChild(applyButton);
        
        const backButton = document.createElement('button');
        backButton.textContent = 'Voltar';
        backButton.addEventListener('click', () => this.closeMenu('options'));
        optionsButtons.appendChild(backButton);
        
        // Menu de morte
        const deathMenu = document.createElement('div');
        deathMenu.id = 'death-menu';
        deathMenu.className = 'menu hidden';
        menuContainer.appendChild(deathMenu);
        
        const deathTitle = document.createElement('h2');
        deathTitle.textContent = 'Você Morreu';
        deathMenu.appendChild(deathTitle);
        
        const deathMessage = document.createElement('p');
        deathMessage.id = 'death-message';
        deathMessage.textContent = 'A cidade reclamou mais uma vítima...';
        deathMenu.appendChild(deathMessage);
        
        const deathButtons = document.createElement('div');
        deathButtons.className = 'menu-buttons';
        deathMenu.appendChild(deathButtons);
        
        const respawnButton = document.createElement('button');
        respawnButton.textContent = 'Renascer';
        respawnButton.addEventListener('click', () => this.game.respawnPlayer());
        deathButtons.appendChild(respawnButton);
        
        const mainMenuButton = document.createElement('button');
        mainMenuButton.textContent = 'Menu Principal';
        mainMenuButton.addEventListener('click', () => this.game.returnToMainMenu());
        deathButtons.appendChild(mainMenuButton);
        
        // Armazenar referências
        this.menuElements = {
            container: menuContainer,
            pauseMenu: pauseMenu,
            inventoryMenu: inventoryMenu,
            inventorySlots: inventorySlots,
            inventoryDetails: inventoryDetails,
            skillsMenu: skillsMenu,
            skillsList: skillsList,
            skillPoints: skillPoints,
            optionsMenu: optionsMenu,
            deathMenu: deathMenu
        };
    }
    
    setupEventListeners() {
        // Tecla ESC para abrir/fechar menu de pausa
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                if (this.activeMenu === 'pause') {
                    this.closeMenu();
                } else if (!this.activeMenu) {
                    this.openMenu('pause');
                } else {
                    this.closeMenu();
                }
            }
            
            // Tecla I para abrir/fechar inventário
            if (e.code === 'KeyI' && !this.activeMenu) {
                this.openMenu('inventory');
            }
            
            // Tecla K para abrir/fechar habilidades
            if (e.code === 'KeyK' && !this.activeMenu) {
                this.openMenu('skills');
            }
        });
        
        // Eventos para sliders de opções
        const renderDistanceSlider = document.getElementById('render-distance-slider');
        if (renderDistanceSlider) {
            renderDistanceSlider.addEventListener('input', () => {
                const value = renderDistanceSlider.value;
                document.getElementById('render-distance-value').textContent = value + 'm';
            });
        }
        
        const masterVolumeSlider = document.getElementById('master-volume-slider');
        if (masterVolumeSlider) {
            masterVolumeSlider.addEventListener('input', () => {
                const value = masterVolumeSlider.value;
                document.getElementById('master-volume-value').textContent = value + '%';
            });
        }
    }
    
    openMenu(menuName) {
        // Pausar o jogo
        this.game.pause();
        
        // Esconder todos os menus
        for (const key in this.menuElements) {
            if (key.endsWith('Menu')) {
                this.menuElements[key].classList.add('hidden');
            }
        }
        
        // Mostrar container de menus
        this.menuElements.container.classList.remove('hidden');
        
        // Mostrar menu específico
        switch (menuName) {
            case 'pause':
                this.menuElements.pauseMenu.classList.remove('hidden');
                break;
            case 'inventory':
                this.updateInventoryUI();
                this.menuElements.inventoryMenu.classList.remove('hidden');
                break;
            case 'skills':
                this.updateSkillsUI();
                this.menuElements.skillsMenu.classList.remove('hidden');
                this.showSkillCategory('survival'); // Mostrar primeira categoria por padrão
                break;
            case 'options':
                this.menuElements.optionsMenu.classList.remove('hidden');
                break;
            case 'death':
                this.menuElements.deathMenu.classList.remove('hidden');
                break;
        }
        
        // Atualizar estado
        this.activeMenu = menuName;
        this.menuStack.push(menuName);
    }
    
    closeMenu(specificMenu = null) {
        if (specificMenu) {
            // Fechar menu específico e voltar ao anterior
            if (this.activeMenu === specificMenu) {
                this.menuStack.pop();
                const previousMenu = this.menuStack.pop();
                
                if (previousMenu) {
                    this.openMenu(previousMenu);
                } else {
                    this.closeAllMenus();
                }
            }
        } else {
            // Fechar todos os menus
            this.closeAllMenus();
        }
    }
    
    closeAllMenus() {
        // Esconder todos os menus
        for (const key in this.menuElements) {
            if (key.endsWith('Menu')) {
                this.menuElements[key].classList.add('hidden');
            }
        }
        
        // Esconder container
        this.menuElements.container.classList.add('hidden');
        
        // Retomar o jogo
        this.game.resume();
        
        // Resetar estado
        this.activeMenu = null;
        this.menuStack = [];
    }
    
    updateHUD(data) {
        if (!data) return;
        
        // Atualizar saúde
        if (data.health !== undefined) {
            const healthPercent = (data.health / this.game.player.maxHealth) * 100;
            this.hudElements.healthFill.style.width = `${healthPercent}%`;
            this.hudElements.healthText.textContent = `${Math.ceil(data.health)}/${this.game.player.maxHealth}`;
            
            // Mudar cor baseado na saúde
            if (healthPercent < 25) {
                this.hudElements.healthFill.style.backgroundColor = '#ff0000';
            } else if (healthPercent < 50) {
                this.hudElements.healthFill.style.backgroundColor = '#ff7700';
            } else {
                this.hudElements.healthFill.style.backgroundColor = '#00cc00';
            }
        }
        
        // Atualizar stamina
        if (data.stamina !== undefined) {
            const staminaPercent = (data.stamina / this.game.player.maxStamina) * 100;
            this.hudElements.staminaFill.style.width = `${staminaPercent}%`;
            this.hudElements.staminaText.textContent = `${Math.ceil(data.stamina)}/${this.game.player.maxStamina}`;
        }
        
        // Atualizar arma e munição
        if (data.ammo !== undefined) {
            if (this.game.player.currentWeapon) {
                this.hudElements.weaponName.textContent = this.game.player.currentWeapon.name;
                this.hudElements.ammoDisplay.textContent = `${data.ammo.current}/${data.ammo.max} | ${data.ammo.total}`;
            } else {
                this.hudElements.weaponName.textContent = 'Desarmado';
                this.hudElements.ammoDisplay.textContent = '-/-';
            }
        }
        
        // Atualizar nível e experiência
        if (data.level !== undefined) {
            this.hudElements.levelDisplay.textContent = `Nível ${data.level}`;
            
            if (data.experience !== undefined && data.experienceToNextLevel !== undefined) {
                const xpPercent = (data.experience / data.experienceToNextLevel) * 100;
                this.hudElements.xpFill.style.width = `${xpPercent}%`;
            }
        }
        
        // Atualizar bússola
        if (this.game.player) {
            const rotation = this.game.player.rotation.y;
            const degrees = (rotation * 180 / Math.PI) % 360;
            this.hudElements.compassDirections.style.transform = `translateX(${-degrees}px)`;
        }
        
        // Atualizar prompt de interação
        if (this.game.player && this.game.player.nearbyInteractables.length > 0) {
            const interactable = this.game.player.nearbyInteractables[0];
            let promptText = '';
            
            switch (interactable.type) {
                case 'vehicle':
                    promptText = `Pressione E para ${this.game.player.isInVehicle ? 'sair do' : 'entrar no'} veículo`;
                    break;
                case 'item':
                    promptText = `Pressione E para pegar ${interactable.object.name}`;
                    break;
                case 'weapon':
                    promptText = `Pressione E para pegar ${interactable.object.name}`;
                    break;
                default:
                    promptText = 'Pressione E para interagir';
            }
            
            this.hudElements.interactionPrompt.textContent = promptText;
            this.hudElements.interactionPrompt.classList.remove('hidden');
        } else {
            this.hudElements.interactionPrompt.classList.add('hidden');
        }
    }
    
    updateInventoryUI() {
        if (!this.game.player || !this.game.player.inventory) return;
        
        // Limpar slots
        const slots = this.menuElements.inventorySlots.children;
        for (let i = 0; i < slots.length; i++) {
            slots[i].innerHTML = '';
            slots[i].className = 'inventory-slot';
        }
        
        // Preencher slots com itens
        const inventory = this.game.player.inventory;
        for (let i = 0; i < inventory.slots.length; i++) {
            const item = inventory.slots[i];
            if (item) {
                const slot = slots[i];
                
                // Criar elemento do item
                const itemElement = document.createElement('div');
                itemElement.className = 'inventory-item';
                itemElement.style.backgroundColor = this.getColorForItem(item);
                
                // Nome do item
                const itemName = document.createElement('div');
                itemName.className = 'item-name';
                itemName.textContent = item.name;
                itemElement.appendChild(itemName);
                
                // Quantidade (se stackável)
                if (item.stackable && item.quantity > 1) {
                    const itemQuantity = document.createElement('div');
                    itemQuantity.className = 'item-quantity';
                    itemQuantity.textContent = item.quantity;
                    itemElement.appendChild(itemQuantity);
                }
                
                // Adicionar ao slot
                slot.appendChild(itemElement);
                
                // Marcar slot como equipado se for a arma atual
                if (item === this.game.player.currentWeapon) {
                    slot.classList.add('equipped');
                }
            }
        }
        
        // Limpar detalhes
        this.menuElements.inventoryDetails.innerHTML = '';
    }
    
    getColorForItem(item) {
        // Retornar cor baseada no tipo de item
        if (item.color) {
            return `#${item.color.toString(16).padStart(6, '0')}`;
        }
        
        switch (item.type) {
            case 'weapon':
                return '#666666';
            case 'ammo':
                return '#cccccc';
            case 'medkit':
                return '#ffffff';
            case 'food':
                return '#c0c0c0';
            case 'drink':
                return '#0000ff';
            case 'fuel':
                return '#ffff00';
            case 'repair':
                return '#ff0000';
            default:
                return '#aaaaaa';
        }
    }
    
    handleInventorySlotClick(e) {
        const slotIndex = parseInt(e.currentTarget.dataset.index);
        const inventory = this.game.player.inventory;
        
        if (slotIndex >= 0 && slotIndex < inventory.slots.length) {
            const item = inventory.slots[slotIndex];
            
            if (item) {
                // Mostrar detalhes do item
                this.showItemDetails(item, slotIndex);
            }
        }
    }
    
    showItemDetails(item, slotIndex) {
        const details = this.menuElements.inventoryDetails;
        details.innerHTML = '';
        
        // Título
        const title = document.createElement('h3');
        title.textContent = item.name;
        details.appendChild(title);
        
        // Tipo
        const type = document.createElement('p');
        type.textContent = `Tipo: ${this.getItemTypeName(item.type)}`;
        details.appendChild(type);
        
        // Descrição
        if (item.description) {
            const description = document.createElement('p');
            description.textContent = item.description;
            details.appendChild(description);
        }
        
        // Propriedades específicas
        if (item.type === 'weapon') {
            const damage = document.createElement('p');
            damage.textContent = `Dano: ${item.damage}`;
            details.appendChild(damage);
            
            const fireRate = document.createElement('p');
            fireRate.textContent = `Cadência: ${60 / item.fireRate} tiros/min`;
            details.appendChild(fireRate);
            
            const ammo = document.createElement('p');
            ammo.textContent = `Munição: ${item.currentAmmo}/${item.magazineSize} | ${item.totalAmmo}`;
            details.appendChild(ammo);
        } else if (item.value) {
            const value = document.createElement('p');
            value.textContent = `Valor: ${item.value}`;
            details.appendChild(value);
        }
        
        // Peso
        if (item.weight) {
            const weight = document.createElement('p');
            weight.textContent = `Peso: ${item.weight} kg`;
            details.appendChild(weight);
        }
        
        // Quantidade
        if (item.stackable) {
            const quantity = document.createElement('p');
            quantity.textContent = `Quantidade: ${item.quantity}/${item.maxStack}`;
            details.appendChild(quantity);
        }
        
        // Botões de ação
        const actions = document.createElement('div');
        actions.className = 'item-actions';
        details.appendChild(actions);
        
        // Botão de uso
        if (['medkit', 'food', 'drink', 'ammo', 'fuel', 'repair'].includes(item.type)) {
            const useButton = document.createElement('button');
            useButton.textContent = 'Usar';
            useButton.addEventListener('click', () => {
                this.game.player.inventory.useItem(slotIndex);
                this.updateInventoryUI();
            });
            actions.appendChild(useButton);
        }
        
        // Botão de equipar (para armas)
        if (item.type === 'weapon') {
            const equipButton = document.createElement('button');
            equipButton.textContent = item === this.game.player.currentWeapon ? 'Desequipar' : 'Equipar';
            equipButton.addEventListener('click', () => {
                if (item === this.game.player.currentWeapon) {
                    item.unequip();
                } else {
                    item.equip(this.game.player);
                }
                this.updateInventoryUI();
            });
            actions.appendChild(equipButton);
        }
        
        // Botão de descartar
        const dropButton = document.createElement('button');
        dropButton.textContent = 'Descartar';
        dropButton.addEventListener('click', () => {
            this.game.player.inventory.dropItem(slotIndex);
            this.updateInventoryUI();
        });
        actions.appendChild(dropButton);
    }
    
    getItemTypeName(type) {
        switch (type) {
            case 'weapon': return 'Arma';
            case 'ammo': return 'Munição';
            case 'medkit': return 'Medicamento';
            case 'food': return 'Comida';
            case 'drink': return 'Bebida';
            case 'fuel': return 'Combustível';
            case 'repair': return 'Ferramenta';
            default: return 'Item';
        }
    }
    
    updateSkillsUI() {
        if (!this.game.progressionSystem) return;
        
        // Atualizar pontos de habilidade
        this.menuElements.skillPoints.textContent = `Pontos de Habilidade: ${this.game.progressionSystem.skillPoints}`;
    }
    
    showSkillCategory(categoryId) {
        if (!this.game.progressionSystem) return;
        
        // Destacar tab selecionada
        const tabs = document.querySelectorAll('.skill-tab');
        tabs.forEach(tab => {
            if (tab.dataset.category === categoryId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Limpar lista de habilidades
        const skillsList = this.menuElements.skillsList;
        skillsList.innerHTML = '';
        
        // Obter habilidades da categoria
        let skills = [];
        switch (categoryId) {
            case 'survival':
                skills = ['health', 'stamina', 'hunger', 'thirst'];
                break;
            case 'combat':
                skills = ['damage', 'accuracy', 'reloadSpeed', 'criticalHit'];
                break;
            case 'movement':
                skills = ['speed', 'sprintDuration', 'jumpHeight', 'fallDamage'];
                break;
            case 'vehicles':
                skills = ['drivingSkill', 'vehicleEfficiency', 'repairSkill'];
                break;
            case 'scavenging':
                skills = ['scavenging', 'stealth', 'crafting'];
                break;
        }
        
        // Criar elementos para cada habilidade
        skills.forEach(skillName => {
            const skill = this.game.progressionSystem.skills[skillName];
            if (!skill) return;
            
            const skillElement = document.createElement('div');
            skillElement.className = 'skill-item';
            
            // Nome e nível
            const nameElement = document.createElement('div');
            nameElement.className = 'skill-name';
            nameElement.textContent = `${skill.name} (${skill.level}/${skill.maxLevel})`;
            skillElement.appendChild(nameElement);
            
            // Descrição
            const descElement = document.createElement('div');
            descElement.className = 'skill-description';
            descElement.textContent = skill.description;
            skillElement.appendChild(descElement);
            
            // Valor atual
            const valueElement = document.createElement('div');
            valueElement.className = 'skill-value';
            valueElement.textContent = `Valor atual: ${skill.value.toFixed(2)}`;
            skillElement.appendChild(valueElement);
            
            // Barra de progresso
            const progressContainer = document.createElement('div');
            progressContainer.className = 'skill-progress';
            skillElement.appendChild(progressContainer);
            
            const progressBar = document.createElement('div');
            progressBar.className = 'skill-progress-bar';
            progressBar.style.width = `${(skill.level / skill.maxLevel) * 100}%`;
            progressContainer.appendChild(progressBar);
            
            // Botão de upgrade
            const upgradeButton = document.createElement('button');
            upgradeButton.className = 'skill-upgrade';
            upgradeButton.textContent = 'Melhorar';
            upgradeButton.disabled = this.game.progressionSystem.skillPoints <= 0 || skill.level >= skill.maxLevel;
            upgradeButton.addEventListener('click', () => {
                if (this.game.progressionSystem.upgradeSkill(skillName)) {
                    this.updateSkillsUI();
                    this.showSkillCategory(categoryId);
                }
            });
            skillElement.appendChild(upgradeButton);
            
            // Adicionar à lista
            skillsList.appendChild(skillElement);
        });
    }
    
    applyOptions() {
        // Aplicar opções de gráficos
        const qualitySelect = document.getElementById('quality-select');
        const renderDistanceSlider = document.getElementById('render-distance-slider');
        
        if (qualitySelect && renderDistanceSlider) {
            const quality = qualitySelect.value;
            const renderDistance = parseInt(renderDistanceSlider.value);
            
            // Aplicar ao jogo
            this.game.setGraphicsQuality(quality);
            this.game.setRenderDistance(renderDistance);
        }
        
        // Aplicar opções de áudio
        const masterVolumeSlider = document.getElementById('master-volume-slider');
        
        if (masterVolumeSlider) {
            const volume = parseInt(masterVolumeSlider.value) / 100;
            
            // Aplicar ao jogo
            this.game.setMasterVolume(volume);
        }
        
        // Mostrar notificação
        this.showNotification('Opções aplicadas');
    }
    
    showNotification(message, duration = null) {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        // Adicionar ao container
        this.hudElements.notificationContainer.appendChild(notification);
        
        // Adicionar à lista
        const notificationObj = {
            element: notification,
            time: this.notificationDuration
        };
        
        this.notifications.push(notificationObj);
        
        // Animar entrada
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
    }
    
    updateNotifications(delta) {
        // Atualizar tempo de cada notificação
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            const notification = this.notifications[i];
            notification.time -= delta;
            
            // Remover se o tempo acabou
            if (notification.time <= 0) {
                notification.element.classList.remove('show');
                
                // Remover do DOM após animação
                setTimeout(() => {
                    if (notification.element.parentNode) {
                        notification.element.parentNode.removeChild(notification.element);
                    }
                }, 300);
                
                // Remover da lista
                this.notifications.splice(i, 1);
            }
        }
    }
    
    showDeathScreen(message) {
        // Atualizar mensagem de morte
        const deathMessage = document.getElementById('death-message');
        if (deathMessage) {
            deathMessage.textContent = message || 'A cidade reclamou mais uma vítima...';
        }
        
        // Abrir menu de morte
        this.openMenu('death');
    }
    
    update(delta) {
        // Atualizar notificações
        this.updateNotifications(delta);
        
        // Atualizar HUD se o jogo estiver rodando
        if (!this.activeMenu) {
            this.updateHUD({});
        }
    }
}

// Exportar para uso em outros arquivos
window.UIManager = UIManager;
