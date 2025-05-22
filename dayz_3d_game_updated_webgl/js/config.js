// Configurações globais do jogo
const CONFIG = {
    // Configurações gerais
    GAME_NAME: "Survival City 3D",
    DEBUG_MODE: false,
    
    // Configurações de renderização
    RENDERER: {
        SHADOW_MAP_ENABLED: true,
        SHADOW_MAP_TYPE: "PCFSoftShadowMap",
        PIXEL_RATIO: window.devicePixelRatio,
        CLEAR_COLOR: 0x000000,
        TONE_MAPPING: "ACESFilmicToneMapping",
        TONE_MAPPING_EXPOSURE: 1.0
    },
    
    // Configurações de qualidade gráfica
    QUALITY: {
        LOW: {
            SHADOW_MAP_SIZE: 1024,
            DRAW_DISTANCE: 500,
            MAX_LIGHTS: 10,
            TEXTURE_QUALITY: 0.5,
            AMBIENT_OCCLUSION: false,
            ANTIALIASING: false
        },
        MEDIUM: {
            SHADOW_MAP_SIZE: 2048,
            DRAW_DISTANCE: 1000,
            MAX_LIGHTS: 20,
            TEXTURE_QUALITY: 1.0,
            AMBIENT_OCCLUSION: true,
            ANTIALIASING: true
        },
        HIGH: {
            SHADOW_MAP_SIZE: 4096,
            DRAW_DISTANCE: 2000,
            MAX_LIGHTS: 30,
            TEXTURE_QUALITY: 1.0,
            AMBIENT_OCCLUSION: true,
            ANTIALIASING: true
        }
    },
    
    // Configurações do mundo
    WORLD: {
        GRAVITY: 9.8,
        SIZE: 2000, // Tamanho do mundo em unidades
        GROUND_SIZE: 4000,
        CITY_SIZE: 1500,
        BUILDING_COUNT: 50,
        VEHICLE_COUNT: 30,
        ZOMBIE_COUNT: 100,
        ITEM_COUNT: 200,
        TIME_SCALE: 1.0, // Velocidade do ciclo dia/noite
        AMBIENT_LIGHT_DAY: 0.8,
        AMBIENT_LIGHT_NIGHT: 0.1
    },
    
    // Configurações do jogador
    PLAYER: {
        MOVE_SPEED: 5.0,
        SPRINT_SPEED: 8.0,
        JUMP_FORCE: 10.0,
        CAMERA_HEIGHT: 1.8,
        CAMERA_DISTANCE: 5.0,
        CAMERA_FOV: 75,
        CAMERA_NEAR: 0.1,
        CAMERA_FAR: 2000,
        HEALTH_MAX: 100,
        STAMINA_MAX: 100,
        STAMINA_REGEN: 0.5,
        COLLISION_RADIUS: 0.5,
        MOUSE_SENSITIVITY: 0.2
    },
    
    // Configurações de veículos
    VEHICLES: {
        TYPES: [
            {
                name: "Sedan",
                model: "sedan",
                maxSpeed: 120,
                acceleration: 10,
                handling: 0.8,
                seats: 4,
                health: 100,
                fuelCapacity: 60
            },
            {
                name: "SUV",
                model: "suv",
                maxSpeed: 100,
                acceleration: 8,
                handling: 0.7,
                seats: 6,
                health: 150,
                fuelCapacity: 80
            },
            {
                name: "Pickup",
                model: "pickup",
                maxSpeed: 110,
                acceleration: 9,
                handling: 0.6,
                seats: 4,
                health: 120,
                fuelCapacity: 70
            },
            {
                name: "Moto",
                model: "motorcycle",
                maxSpeed: 150,
                acceleration: 15,
                handling: 0.9,
                seats: 2,
                health: 70,
                fuelCapacity: 30
            },
            {
                name: "Caminhão",
                model: "truck",
                maxSpeed: 90,
                acceleration: 5,
                handling: 0.5,
                seats: 3,
                health: 200,
                fuelCapacity: 120
            }
        ]
    },
    
    // Configurações de armas
    WEAPONS: {
        TYPES: [
            {
                name: "Pistola",
                model: "pistol",
                damage: 15,
                fireRate: 0.5,
                reloadTime: 1.5,
                magazineSize: 12,
                range: 50,
                recoil: 0.1,
                type: "pistol"
            },
            {
                name: "Shotgun",
                model: "shotgun",
                damage: 50,
                fireRate: 0.8,
                reloadTime: 2.5,
                magazineSize: 8,
                range: 20,
                recoil: 0.4,
                type: "shotgun"
            },
            {
                name: "Rifle",
                model: "rifle",
                damage: 25,
                fireRate: 0.2,
                reloadTime: 2.0,
                magazineSize: 30,
                range: 100,
                recoil: 0.2,
                type: "rifle"
            },
            {
                name: "Metralhadora",
                model: "smg",
                damage: 10,
                fireRate: 0.1,
                reloadTime: 2.2,
                magazineSize: 50,
                range: 40,
                recoil: 0.15,
                type: "smg"
            }
        ],
        
        // Modificações de armas
        MODIFICATIONS: {
            SCOPES: [
                { name: "Mira Padrão", zoomFactor: 1.0, accuracy: 1.0 },
                { name: "Red Dot", zoomFactor: 1.2, accuracy: 1.2 },
                { name: "Scope 4x", zoomFactor: 4.0, accuracy: 1.5 }
            ],
            BARRELS: [
                { name: "Padrão", recoilReduction: 1.0, noiseFactor: 1.0 },
                { name: "Silenciador", recoilReduction: 1.1, noiseFactor: 0.3 },
                { name: "Compensador", recoilReduction: 1.5, noiseFactor: 1.2 }
            ],
            GRIPS: [
                { name: "Padrão", stabilityFactor: 1.0 },
                { name: "Vertical", stabilityFactor: 1.3 },
                { name: "Angled", stabilityFactor: 1.2 }
            ],
            MAGAZINES: [
                { name: "Padrão", capacityMultiplier: 1.0, reloadTimeMultiplier: 1.0 },
                { name: "Estendido", capacityMultiplier: 1.5, reloadTimeMultiplier: 1.1 },
                { name: "Rápido", capacityMultiplier: 1.0, reloadTimeMultiplier: 0.8 }
            ]
        }
    },
    
    // Configurações de zumbis
    ZOMBIES: {
        TYPES: [
            {
                name: "Comum",
                health: 50,
                damage: 10,
                speed: 2.0,
                detectionRange: 30,
                attackRange: 1.5,
                attackRate: 1.0
            },
            {
                name: "Corredor",
                health: 40,
                damage: 8,
                speed: 4.0,
                detectionRange: 40,
                attackRange: 1.5,
                attackRate: 0.8
            },
            {
                name: "Tanque",
                health: 200,
                damage: 25,
                speed: 1.5,
                detectionRange: 25,
                attackRange: 2.0,
                attackRate: 1.5
            },
            {
                name: "Spitter",
                health: 60,
                damage: 15,
                speed: 2.5,
                detectionRange: 50,
                attackRange: 10.0,
                attackRate: 2.0
            }
        ]
    },
    
    // Configurações de áudio
    AUDIO: {
        MASTER_VOLUME: 1.0,
        MUSIC_VOLUME: 0.5,
        SFX_VOLUME: 0.8,
        AMBIENT_VOLUME: 0.6
    },
    
    // Configurações de UI
    UI: {
        CROSSHAIR_SIZE: 20,
        HUD_OPACITY: 0.8,
        MINIMAP_SIZE: 200,
        MINIMAP_ZOOM: 0.1
    }
};
