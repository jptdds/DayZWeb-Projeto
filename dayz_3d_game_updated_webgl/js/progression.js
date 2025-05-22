// Classe para gerenciar o sistema de progresso e upgrades do jogador
class ProgressionSystem {
    constructor(game) {
        this.game = game;
        
        // Níveis e experiência
        this.level = 1;
        this.experience = 0;
        this.experienceToNextLevel = this.calculateExperienceForLevel(2);
        
        // Pontos de habilidade
        this.skillPoints = 0;
        
        // Habilidades
        this.skills = {
            // Sobrevivência
            health: { level: 1, maxLevel: 10, name: "Saúde", description: "Aumenta a saúde máxima", value: 100, increment: 20 },
            stamina: { level: 1, maxLevel: 10, name: "Resistência", description: "Aumenta a stamina máxima", value: 100, increment: 20 },
            hunger: { level: 1, maxLevel: 5, name: "Metabolismo", description: "Reduz a taxa de fome", value: 1.0, increment: -0.1 },
            thirst: { level: 1, maxLevel: 5, name: "Hidratação", description: "Reduz a taxa de sede", value: 1.0, increment: -0.1 },
            
            // Combate
            damage: { level: 1, maxLevel: 10, name: "Força", description: "Aumenta o dano corpo-a-corpo", value: 1.0, increment: 0.1 },
            accuracy: { level: 1, maxLevel: 10, name: "Precisão", description: "Aumenta a precisão com armas", value: 1.0, increment: 0.1 },
            reloadSpeed: { level: 1, maxLevel: 5, name: "Recarga Rápida", description: "Reduz o tempo de recarga", value: 1.0, increment: -0.1 },
            criticalHit: { level: 1, maxLevel: 5, name: "Golpe Crítico", description: "Aumenta a chance de acerto crítico", value: 0.05, increment: 0.05 },
            
            // Movimento
            speed: { level: 1, maxLevel: 5, name: "Velocidade", description: "Aumenta a velocidade de movimento", value: 1.0, increment: 0.1 },
            sprintDuration: { level: 1, maxLevel: 5, name: "Sprint", description: "Aumenta a duração do sprint", value: 1.0, increment: 0.2 },
            jumpHeight: { level: 1, maxLevel: 3, name: "Salto", description: "Aumenta a altura do pulo", value: 1.0, increment: 0.15 },
            fallDamage: { level: 1, maxLevel: 3, name: "Aterrissagem", description: "Reduz o dano de queda", value: 1.0, increment: -0.25 },
            
            // Veículos
            drivingSkill: { level: 1, maxLevel: 5, name: "Direção", description: "Melhora o controle de veículos", value: 1.0, increment: 0.15 },
            vehicleEfficiency: { level: 1, maxLevel: 5, name: "Eficiência", description: "Reduz o consumo de combustível", value: 1.0, increment: -0.1 },
            repairSkill: { level: 1, maxLevel: 5, name: "Mecânica", description: "Aumenta a eficiência de reparos", value: 1.0, increment: 0.2 },
            
            // Sobrevivência
            scavenging: { level: 1, maxLevel: 5, name: "Coleta", description: "Aumenta a quantidade de itens encontrados", value: 1.0, increment: 0.2 },
            stealth: { level: 1, maxLevel: 5, name: "Furtividade", description: "Reduz a detecção por zumbis", value: 1.0, increment: 0.2 },
            crafting: { level: 1, maxLevel: 5, name: "Fabricação", description: "Melhora a qualidade dos itens fabricados", value: 1.0, increment: 0.2 }
        };
        
        // Conquistas
        this.achievements = {
            zombieKiller: { name: "Caçador de Zumbis", description: "Elimine 100 zumbis", progress: 0, target: 100, completed: false, reward: 500 },
            survivor: { name: "Sobrevivente", description: "Sobreviva por 1 hora", progress: 0, target: 3600, completed: false, reward: 1000 },
            explorer: { name: "Explorador", description: "Visite todas as áreas do mapa", progress: 0, target: 10, completed: false, reward: 750 },
            mechanic: { name: "Mecânico", description: "Repare 10 veículos", progress: 0, target: 10, completed: false, reward: 500 },
            gunsmith: { name: "Armeiro", description: "Customize 5 armas", progress: 0, target: 5, completed: false, reward: 500 },
            hoarder: { name: "Acumulador", description: "Colete 200 itens", progress: 0, target: 200, completed: false, reward: 500 },
            driver: { name: "Piloto", description: "Dirija por 10km", progress: 0, target: 10000, completed: false, reward: 500 }
        };
        
        // Estatísticas
        this.stats = {
            zombiesKilled: 0,
            timeSurvived: 0,
            distanceTraveled: 0,
            vehiclesRepaired: 0,
            weaponsCustomized: 0,
            itemsCollected: 0,
            distanceDriven: 0,
            deaths: 0,
            headshots: 0,
            criticalHits: 0
        };
        
        // Inicializar
        this.init();
    }
    
    init() {
        console.log("Inicializando sistema de progressão...");
        
        // Aplicar habilidades iniciais ao jogador
        this.applySkillsToPlayer();
    }
    
    calculateExperienceForLevel(level) {
        // Fórmula para calcular XP necessário para o próximo nível
        // Cada nível requer mais XP que o anterior
        return Math.floor(100 * Math.pow(level, 1.5));
    }
    
    addExperience(amount) {
        this.experience += amount;
        
        console.log(`+${amount} XP! Total: ${this.experience}/${this.experienceToNextLevel}`);
        
        // Verificar se subiu de nível
        while (this.experience >= this.experienceToNextLevel) {
            this.levelUp();
        }
        
        // Atualizar HUD
        this.updateHUD();
    }
    
    levelUp() {
        this.level++;
        this.experience -= this.experienceToNextLevel;
        this.experienceToNextLevel = this.calculateExperienceForLevel(this.level + 1);
        
        // Ganhar pontos de habilidade
        this.skillPoints += 2;
        
        console.log(`Nível ${this.level} alcançado! +2 Pontos de Habilidade`);
        
        // Efeito visual de level up
        this.showLevelUpEffect();
        
        // Atualizar HUD
        this.updateHUD();
    }
    
    showLevelUpEffect() {
        // Implementação futura para efeito visual de level up
        // Pode ser um flash na tela, som, partículas, etc.
    }
    
    upgradeSkill(skillName) {
        const skill = this.skills[skillName];
        
        // Verificar se a habilidade existe
        if (!skill) {
            console.log(`Habilidade ${skillName} não encontrada.`);
            return false;
        }
        
        // Verificar se já está no nível máximo
        if (skill.level >= skill.maxLevel) {
            console.log(`${skill.name} já está no nível máximo.`);
            return false;
        }
        
        // Verificar se tem pontos de habilidade suficientes
        if (this.skillPoints <= 0) {
            console.log("Sem pontos de habilidade disponíveis.");
            return false;
        }
        
        // Aplicar upgrade
        skill.level++;
        skill.value += skill.increment;
        this.skillPoints--;
        
        console.log(`${skill.name} melhorada para nível ${skill.level}! Valor: ${skill.value.toFixed(2)}`);
        
        // Aplicar efeitos da habilidade
        this.applySkillsToPlayer();
        
        // Atualizar HUD
        this.updateHUD();
        
        return true;
    }
    
    applySkillsToPlayer() {
        // Aplicar efeitos das habilidades ao jogador
        if (this.game.player) {
            // Saúde e stamina
            this.game.player.maxHealth = this.skills.health.value;
            this.game.player.maxStamina = this.skills.stamina.value;
            
            // Velocidade de movimento
            this.game.player.moveSpeed = CONFIG.PLAYER.MOVE_SPEED * this.skills.speed.value;
            this.game.player.sprintSpeed = CONFIG.PLAYER.SPRINT_SPEED * this.skills.speed.value;
            
            // Regeneração de stamina
            this.game.player.staminaRegen = CONFIG.PLAYER.STAMINA_REGEN * (1 + (this.skills.sprintDuration.value - 1));
            
            // Altura do pulo
            this.game.player.jumpForce = CONFIG.PLAYER.JUMP_FORCE * this.skills.jumpHeight.value;
            
            // Outras habilidades serão aplicadas quando necessário
        }
    }
    
    updateStats(statName, value) {
        if (this.stats[statName] !== undefined) {
            this.stats[statName] += value;
            
            // Verificar conquistas relacionadas
            this.checkAchievements();
        }
    }
    
    checkAchievements() {
        // Verificar cada conquista
        for (const key in this.achievements) {
            const achievement = this.achievements[key];
            
            // Pular conquistas já completadas
            if (achievement.completed) continue;
            
            // Atualizar progresso baseado nas estatísticas
            switch (key) {
                case 'zombieKiller':
                    achievement.progress = this.stats.zombiesKilled;
                    break;
                case 'survivor':
                    achievement.progress = this.stats.timeSurvived;
                    break;
                case 'explorer':
                    // Será atualizado quando o jogador visitar áreas
                    break;
                case 'mechanic':
                    achievement.progress = this.stats.vehiclesRepaired;
                    break;
                case 'gunsmith':
                    achievement.progress = this.stats.weaponsCustomized;
                    break;
                case 'hoarder':
                    achievement.progress = this.stats.itemsCollected;
                    break;
                case 'driver':
                    achievement.progress = this.stats.distanceDriven;
                    break;
            }
            
            // Verificar se a conquista foi completada
            if (achievement.progress >= achievement.target && !achievement.completed) {
                this.completeAchievement(key);
            }
        }
    }
    
    completeAchievement(achievementKey) {
        const achievement = this.achievements[achievementKey];
        
        if (!achievement || achievement.completed) return;
        
        achievement.completed = true;
        
        console.log(`Conquista desbloqueada: ${achievement.name}!`);
        console.log(`${achievement.description}`);
        
        // Recompensa
        this.addExperience(achievement.reward);
        
        // Efeito visual
        this.showAchievementUnlockedEffect(achievement);
        
        // Atualizar HUD
        this.updateHUD();
    }
    
    showAchievementUnlockedEffect(achievement) {
        // Implementação futura para efeito visual de conquista desbloqueada
    }
    
    getSkillValue(skillName) {
        return this.skills[skillName] ? this.skills[skillName].value : 1.0;
    }
    
    getSkillLevel(skillName) {
        return this.skills[skillName] ? this.skills[skillName].level : 1;
    }
    
    getSkillDescription(skillName) {
        const skill = this.skills[skillName];
        if (!skill) return "";
        
        return `${skill.name} (Nível ${skill.level}/${skill.maxLevel}): ${skill.description}`;
    }
    
    getProgressPercentage() {
        return (this.experience / this.experienceToNextLevel) * 100;
    }
    
    update(delta) {
        // Atualizar tempo sobrevivido
        this.stats.timeSurvived += delta;
        
        // Verificar conquistas a cada segundo
        if (Math.floor(this.stats.timeSurvived) % 10 === 0) {
            this.checkAchievements();
        }
    }
    
    updateHUD() {
        // Atualizar elementos do HUD relacionados à progressão
        if (this.game.uiManager) {
            this.game.uiManager.updateHUD({
                level: this.level,
                experience: this.experience,
                experienceToNextLevel: this.experienceToNextLevel,
                skillPoints: this.skillPoints
            });
        }
    }
    
    reset() {
        // Resetar progresso (usado quando o jogador morre)
        // Não resetamos o nível e habilidades, apenas estatísticas temporárias
        
        this.stats.deaths++;
        
        // Atualizar HUD
        this.updateHUD();
    }
    
    saveProgress() {
        // Implementação futura para salvar progresso
        const saveData = {
            level: this.level,
            experience: this.experience,
            skillPoints: this.skillPoints,
            skills: this.skills,
            achievements: this.achievements,
            stats: this.stats
        };
        
        return saveData;
    }
    
    loadProgress(saveData) {
        // Implementação futura para carregar progresso
        if (!saveData) return false;
        
        this.level = saveData.level || 1;
        this.experience = saveData.experience || 0;
        this.skillPoints = saveData.skillPoints || 0;
        
        // Carregar habilidades
        if (saveData.skills) {
            for (const key in saveData.skills) {
                if (this.skills[key]) {
                    this.skills[key].level = saveData.skills[key].level;
                    this.skills[key].value = saveData.skills[key].value;
                }
            }
        }
        
        // Carregar conquistas
        if (saveData.achievements) {
            for (const key in saveData.achievements) {
                if (this.achievements[key]) {
                    this.achievements[key].progress = saveData.achievements[key].progress;
                    this.achievements[key].completed = saveData.achievements[key].completed;
                }
            }
        }
        
        // Carregar estatísticas
        if (saveData.stats) {
            for (const key in saveData.stats) {
                if (this.stats[key] !== undefined) {
                    this.stats[key] = saveData.stats[key];
                }
            }
        }
        
        // Recalcular XP para próximo nível
        this.experienceToNextLevel = this.calculateExperienceForLevel(this.level + 1);
        
        // Aplicar habilidades
        this.applySkillsToPlayer();
        
        // Atualizar HUD
        this.updateHUD();
        
        return true;
    }
}

// Exportar para uso em outros arquivos
window.ProgressionSystem = ProgressionSystem;
