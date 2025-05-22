// Utilitários para o jogo
class Utils {
    // Converter graus para radianos
    static degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    // Converter radianos para graus
    static radToDeg(radians) {
        return radians * (180 / Math.PI);
    }
    
    // Gerar número aleatório entre min e max
    static randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    // Gerar número inteiro aleatório entre min e max (inclusive)
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // Gerar posição aleatória dentro de uma área
    static randomPosition(minX, maxX, minZ, maxZ) {
        return new THREE.Vector3(
            Utils.randomRange(minX, maxX),
            0, // Y é sempre 0 (nível do chão)
            Utils.randomRange(minZ, maxZ)
        );
    }
    
    // Verificar se um ponto está dentro de uma área
    static isPointInArea(point, minX, maxX, minZ, maxZ) {
        return (
            point.x >= minX && 
            point.x <= maxX && 
            point.z >= minZ && 
            point.z <= maxZ
        );
    }
    
    // Calcular distância entre dois pontos (apenas X e Z)
    static distanceXZ(point1, point2) {
        const dx = point2.x - point1.x;
        const dz = point2.z - point1.z;
        return Math.sqrt(dx * dx + dz * dz);
    }
    
    // Interpolar linearmente entre dois valores
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    // Interpolar suavemente entre dois valores (easing)
    static smoothStep(a, b, t) {
        t = t * t * (3 - 2 * t); // Função de suavização
        return Utils.lerp(a, b, t);
    }
    
    // Limitar um valor entre min e max
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    
    // Verificar colisão entre dois círculos
    static circleCollision(center1, radius1, center2, radius2) {
        const distance = Utils.distanceXZ(center1, center2);
        return distance < (radius1 + radius2);
    }
    
    // Verificar colisão entre um ponto e um círculo
    static pointInCircle(point, center, radius) {
        const distance = Utils.distanceXZ(point, center);
        return distance < radius;
    }
    
    // Verificar colisão entre um raio e um objeto
    static raycast(origin, direction, objects, maxDistance = Infinity) {
        const raycaster = new THREE.Raycaster(origin, direction, 0, maxDistance);
        return raycaster.intersectObjects(objects, true);
    }
    
    // Criar um helper visual para debug
    static createDebugSphere(scene, position, radius = 0.5, color = 0xff0000) {
        const geometry = new THREE.SphereGeometry(radius, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: color, wireframe: true });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.copy(position);
        scene.add(sphere);
        return sphere;
    }
    
    // Criar um helper de direção para debug
    static createDebugArrow(scene, origin, direction, length = 5, color = 0xff0000) {
        const arrowHelper = new THREE.ArrowHelper(
            direction.normalize(),
            origin,
            length,
            color
        );
        scene.add(arrowHelper);
        return arrowHelper;
    }
    
    // Formatar tempo em segundos para formato MM:SS
    static formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Gerar ID único
    static generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Exportar para uso em outros arquivos
window.Utils = Utils;
