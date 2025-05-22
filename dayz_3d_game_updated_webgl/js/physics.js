// Sistema de física para o jogo
class Physics {
    constructor(game) {
        this.game = game;
        this.scene = game.scene;
        
        // Configurações de física
        this.gravity = CONFIG.WORLD.GRAVITY || 9.8;
        this.timeStep = 1/60; // 60 fps
        this.maxSubSteps = 3;
        
        // Objetos físicos
        this.bodies = [];
        this.colliders = [];
        
        // Inicializar
        this.init();
    }
    
    init() {
        console.log("Inicializando sistema de física...");
        
        // Configurar detecção de colisão
        this.setupCollisionDetection();
    }
    
    setupCollisionDetection() {
        // Implementação simplificada de detecção de colisão
        // Em uma implementação real, usaríamos uma biblioteca como Ammo.js
        
        // Adicionar objetos do mundo como colisores
        if (this.game.world) {
            // Adicionar edifícios
            this.game.world.buildings.forEach(building => {
                if (building.collidable) {
                    this.addBoxCollider(
                        building.position,
                        building.size,
                        { type: 'building', object: building }
                    );
                }
            });
            
            // Adicionar árvores
            this.game.world.trees.forEach(tree => {
                if (tree.collidable) {
                    this.addSphereCollider(
                        tree.position,
                        tree.radius,
                        { type: 'tree', object: tree }
                    );
                }
            });
        }
    }
    
    addBoxCollider(position, size, userData) {
        const collider = {
            type: 'box',
            position: position.clone(),
            size: size.clone(),
            userData: userData || {}
        };
        
        this.colliders.push(collider);
        return collider;
    }
    
    addSphereCollider(position, radius, userData) {
        const collider = {
            type: 'sphere',
            position: position.clone(),
            radius: radius,
            userData: userData || {}
        };
        
        this.colliders.push(collider);
        return collider;
    }
    
    createRigidBody(object, mass, shape) {
        // Implementação simplificada de corpo rígido
        const body = {
            object: object,
            mass: mass,
            shape: shape,
            position: object.position.clone(),
            velocity: new THREE.Vector3(),
            angularVelocity: new THREE.Vector3(),
            force: new THREE.Vector3(),
            torque: new THREE.Vector3()
        };
        
        this.bodies.push(body);
        return body;
    }
    
    applyForce(body, force, point) {
        body.force.add(force);
        
        if (point) {
            // Calcular torque
            const relativePoint = point.clone().sub(body.position);
            const torque = relativePoint.cross(force);
            body.torque.add(torque);
        }
    }
    
    applyGravity(body) {
        if (body.mass > 0) {
            const gravityForce = new THREE.Vector3(0, -this.gravity * body.mass, 0);
            this.applyForce(body, gravityForce);
        }
    }
    
    update(delta) {
        // Atualizar corpos físicos
        this.updateBodies(delta);
        
        // Verificar colisões
        this.checkCollisions();
    }
    
    updateBodies(delta) {
        for (const body of this.bodies) {
            if (body.mass <= 0) continue; // Objetos estáticos
            
            // Aplicar gravidade
            this.applyGravity(body);
            
            // Atualizar velocidade
            const acceleration = body.force.clone().divideScalar(body.mass);
            body.velocity.add(acceleration.multiplyScalar(delta));
            
            // Atualizar posição
            const deltaPosition = body.velocity.clone().multiplyScalar(delta);
            body.position.add(deltaPosition);
            
            // Atualizar rotação
            const angularAcceleration = body.torque.clone(); // Simplificado
            body.angularVelocity.add(angularAcceleration.multiplyScalar(delta));
            
            // Atualizar objeto 3D
            if (body.object) {
                body.object.position.copy(body.position);
                
                // Atualizar rotação (simplificado)
                body.object.rotation.x += body.angularVelocity.x * delta;
                body.object.rotation.y += body.angularVelocity.y * delta;
                body.object.rotation.z += body.angularVelocity.z * delta;
            }
            
            // Resetar forças
            body.force.set(0, 0, 0);
            body.torque.set(0, 0, 0);
        }
    }
    
    checkCollisions() {
        // Verificar colisões entre corpos e colisores
        for (const body of this.bodies) {
            for (const collider of this.colliders) {
                if (this.testCollision(body, collider)) {
                    this.resolveCollision(body, collider);
                }
            }
        }
        
        // Verificar colisões entre corpos
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                if (this.testBodyCollision(this.bodies[i], this.bodies[j])) {
                    this.resolveBodyCollision(this.bodies[i], this.bodies[j]);
                }
            }
        }
    }
    
    testCollision(body, collider) {
        // Implementação simplificada de teste de colisão
        if (!body.shape) return false;
        
        if (body.shape === 'sphere' && collider.type === 'box') {
            return this.testSphereBoxCollision(
                body.position, body.radius,
                collider.position, collider.size
            );
        } else if (body.shape === 'sphere' && collider.type === 'sphere') {
            return this.testSphereSphereCollision(
                body.position, body.radius,
                collider.position, collider.radius
            );
        } else if (body.shape === 'box' && collider.type === 'box') {
            return this.testBoxBoxCollision(
                body.position, body.size,
                collider.position, collider.size
            );
        } else if (body.shape === 'box' && collider.type === 'sphere') {
            return this.testSphereBoxCollision(
                collider.position, collider.radius,
                body.position, body.size
            );
        }
        
        return false;
    }
    
    testSphereBoxCollision(spherePos, sphereRadius, boxPos, boxSize) {
        // Encontrar o ponto mais próximo da esfera dentro da caixa
        const closest = new THREE.Vector3();
        
        // Para cada eixo, encontrar o ponto mais próximo
        for (let i = 0; i < 3; i++) {
            const axisMin = boxPos.getComponent(i) - boxSize.getComponent(i) / 2;
            const axisMax = boxPos.getComponent(i) + boxSize.getComponent(i) / 2;
            const sphereComponent = spherePos.getComponent(i);
            
            // Limitar ao intervalo da caixa
            closest.setComponent(i, Math.max(axisMin, Math.min(axisMax, sphereComponent)));
        }
        
        // Verificar se o ponto mais próximo está dentro da esfera
        const distance = closest.distanceTo(spherePos);
        return distance < sphereRadius;
    }
    
    testSphereSphereCollision(pos1, radius1, pos2, radius2) {
        const distance = pos1.distanceTo(pos2);
        return distance < (radius1 + radius2);
    }
    
    testBoxBoxCollision(pos1, size1, pos2, size2) {
        // Verificar sobreposição em cada eixo
        for (let i = 0; i < 3; i++) {
            const min1 = pos1.getComponent(i) - size1.getComponent(i) / 2;
            const max1 = pos1.getComponent(i) + size1.getComponent(i) / 2;
            const min2 = pos2.getComponent(i) - size2.getComponent(i) / 2;
            const max2 = pos2.getComponent(i) + size2.getComponent(i) / 2;
            
            // Se não há sobreposição em algum eixo, não há colisão
            if (max1 < min2 || min1 > max2) {
                return false;
            }
        }
        
        // Sobreposição em todos os eixos
        return true;
    }
    
    testBodyCollision(body1, body2) {
        // Implementação simplificada de teste de colisão entre corpos
        if (!body1.shape || !body2.shape) return false;
        
        if (body1.shape === 'sphere' && body2.shape === 'sphere') {
            return this.testSphereSphereCollision(
                body1.position, body1.radius,
                body2.position, body2.radius
            );
        } else if (body1.shape === 'box' && body2.shape === 'box') {
            return this.testBoxBoxCollision(
                body1.position, body1.size,
                body2.position, body2.size
            );
        } else if (body1.shape === 'sphere' && body2.shape === 'box') {
            return this.testSphereBoxCollision(
                body1.position, body1.radius,
                body2.position, body2.size
            );
        } else if (body1.shape === 'box' && body2.shape === 'sphere') {
            return this.testSphereBoxCollision(
                body2.position, body2.radius,
                body1.position, body1.size
            );
        }
        
        return false;
    }
    
    resolveCollision(body, collider) {
        // Implementação simplificada de resolução de colisão
        if (body.mass <= 0) return; // Objetos estáticos não são afetados
        
        // Calcular vetor de penetração
        let penetrationVector = new THREE.Vector3();
        
        if (body.shape === 'sphere' && collider.type === 'box') {
            penetrationVector = this.calculateSphereBoxPenetration(
                body.position, body.radius,
                collider.position, collider.size
            );
        } else if (body.shape === 'sphere' && collider.type === 'sphere') {
            penetrationVector = this.calculateSphereSpherePenetration(
                body.position, body.radius,
                collider.position, collider.radius
            );
        }
        
        // Mover o corpo para fora da colisão
        body.position.add(penetrationVector);
        
        // Refletir a velocidade
        if (penetrationVector.length() > 0) {
            const normal = penetrationVector.clone().normalize();
            const reflection = body.velocity.clone().reflect(normal);
            
            // Adicionar um fator de amortecimento
            const dampingFactor = 0.5;
            body.velocity.copy(reflection.multiplyScalar(dampingFactor));
        }
        
        // Disparar evento de colisão
        this.onCollision(body, collider);
    }
    
    calculateSphereBoxPenetration(spherePos, sphereRadius, boxPos, boxSize) {
        // Encontrar o ponto mais próximo da esfera dentro da caixa
        const closest = new THREE.Vector3();
        
        // Para cada eixo, encontrar o ponto mais próximo
        for (let i = 0; i < 3; i++) {
            const axisMin = boxPos.getComponent(i) - boxSize.getComponent(i) / 2;
            const axisMax = boxPos.getComponent(i) + boxSize.getComponent(i) / 2;
            const sphereComponent = spherePos.getComponent(i);
            
            // Limitar ao intervalo da caixa
            closest.setComponent(i, Math.max(axisMin, Math.min(axisMax, sphereComponent)));
        }
        
        // Calcular vetor de penetração
        const direction = spherePos.clone().sub(closest).normalize();
        const distance = closest.distanceTo(spherePos);
        const penetration = sphereRadius - distance;
        
        if (penetration > 0) {
            return direction.multiplyScalar(penetration);
        } else {
            return new THREE.Vector3();
        }
    }
    
    calculateSphereSpherePenetration(pos1, radius1, pos2, radius2) {
        const direction = pos1.clone().sub(pos2).normalize();
        const distance = pos1.distanceTo(pos2);
        const penetration = radius1 + radius2 - distance;
        
        if (penetration > 0) {
            return direction.multiplyScalar(penetration);
        } else {
            return new THREE.Vector3();
        }
    }
    
    resolveBodyCollision(body1, body2) {
        // Implementação simplificada de resolução de colisão entre corpos
        if (body1.mass <= 0 && body2.mass <= 0) return; // Ambos estáticos
        
        // Calcular vetor de penetração
        let penetrationVector = new THREE.Vector3();
        
        if (body1.shape === 'sphere' && body2.shape === 'sphere') {
            penetrationVector = this.calculateSphereSpherePenetration(
                body1.position, body1.radius,
                body2.position, body2.radius
            );
        }
        
        // Calcular massas relativas
        const totalMass = body1.mass + body2.mass;
        const mass1Ratio = body1.mass / totalMass;
        const mass2Ratio = body2.mass / totalMass;
        
        // Mover os corpos para fora da colisão
        if (body1.mass > 0) {
            body1.position.add(penetrationVector.clone().multiplyScalar(mass2Ratio));
        }
        
        if (body2.mass > 0) {
            body2.position.sub(penetrationVector.clone().multiplyScalar(mass1Ratio));
        }
        
        // Calcular velocidades após colisão (conservação de momento)
        if (penetrationVector.length() > 0) {
            const normal = penetrationVector.clone().normalize();
            
            // Velocidade relativa ao longo da normal
            const v1 = body1.velocity.clone().dot(normal);
            const v2 = body2.velocity.clone().dot(normal);
            
            // Coeficiente de restituição (elasticidade)
            const e = 0.3;
            
            // Velocidades após colisão
            let v1Final, v2Final;
            
            if (body1.mass <= 0) {
                // Corpo 1 é estático
                v2Final = -v2 * e;
                v1Final = 0;
            } else if (body2.mass <= 0) {
                // Corpo 2 é estático
                v1Final = -v1 * e;
                v2Final = 0;
            } else {
                // Ambos são dinâmicos
                v1Final = (v1 * (body1.mass - body2.mass) + 2 * body2.mass * v2) / totalMass;
                v2Final = (v2 * (body2.mass - body1.mass) + 2 * body1.mass * v1) / totalMass;
                
                // Aplicar elasticidade
                v1Final *= e;
                v2Final *= e;
            }
            
            // Aplicar velocidades
            if (body1.mass > 0) {
                const v1Change = v1Final - v1;
                body1.velocity.add(normal.clone().multiplyScalar(v1Change));
            }
            
            if (body2.mass > 0) {
                const v2Change = v2Final - v2;
                body2.velocity.add(normal.clone().multiplyScalar(v2Change));
            }
        }
        
        // Disparar evento de colisão
        this.onBodyCollision(body1, body2);
    }
    
    onCollision(body, collider) {
        // Evento de colisão entre corpo e colisor
        if (body.onCollision) {
            body.onCollision(collider);
        }
        
        // Notificar objetos específicos
        if (body.object === this.game.player) {
            // Colisão do jogador
            this.game.player.handleCollision(collider);
        } else if (collider.userData && collider.userData.type === 'building') {
            // Colisão com edifício
            // Implementação específica
        }
    }
    
    onBodyCollision(body1, body2) {
        // Evento de colisão entre corpos
        if (body1.onCollision) {
            body1.onCollision(body2);
        }
        
        if (body2.onCollision) {
            body2.onCollision(body1);
        }
        
        // Notificar objetos específicos
        if (body1.object === this.game.player || body2.object === this.game.player) {
            // Colisão envolvendo o jogador
            const otherBody = body1.object === this.game.player ? body2 : body1;
            this.game.player.handleBodyCollision(otherBody);
        }
    }
    
    raycast(origin, direction, maxDistance = Infinity) {
        // Implementação de raycasting para detecção de colisão
        const ray = new THREE.Ray(origin, direction);
        let closestHit = null;
        let closestDistance = maxDistance;
        
        // Verificar colisão com colisores
        for (const collider of this.colliders) {
            let intersection = null;
            
            if (collider.type === 'box') {
                // Criar caixa para teste
                const halfSize = collider.size.clone().multiplyScalar(0.5);
                const box = new THREE.Box3(
                    collider.position.clone().sub(halfSize),
                    collider.position.clone().add(halfSize)
                );
                
                // Testar interseção
                intersection = ray.intersectBox(box, new THREE.Vector3());
            } else if (collider.type === 'sphere') {
                // Testar interseção com esfera
                intersection = ray.intersectSphere(
                    new THREE.Sphere(collider.position, collider.radius),
                    new THREE.Vector3()
                );
            }
            
            // Verificar se é o hit mais próximo
            if (intersection) {
                const distance = intersection.distanceTo(origin);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestHit = {
                        point: intersection,
                        distance: distance,
                        collider: collider
                    };
                }
            }
        }
        
        return closestHit;
    }
    
    debugDraw() {
        // Desenhar representações visuais dos colisores para debug
        if (!this.game.debugMode) return;
        
        // Remover helpers antigos
        if (this.debugHelpers) {
            this.debugHelpers.forEach(helper => {
                this.scene.remove(helper);
            });
        }
        
        this.debugHelpers = [];
        
        // Desenhar colisores
        for (const collider of this.colliders) {
            let helper;
            
            if (collider.type === 'box') {
                const geometry = new THREE.BoxGeometry(
                    collider.size.x,
                    collider.size.y,
                    collider.size.z
                );
                const material = new THREE.MeshBasicMaterial({
                    color: 0xff0000,
                    wireframe: true,
                    opacity: 0.5,
                    transparent: true
                });
                helper = new THREE.Mesh(geometry, material);
                helper.position.copy(collider.position);
            } else if (collider.type === 'sphere') {
                const geometry = new THREE.SphereGeometry(collider.radius, 16, 16);
                const material = new THREE.MeshBasicMaterial({
                    color: 0x00ff00,
                    wireframe: true,
                    opacity: 0.5,
                    transparent: true
                });
                helper = new THREE.Mesh(geometry, material);
                helper.position.copy(collider.position);
            }
            
            if (helper) {
                this.scene.add(helper);
                this.debugHelpers.push(helper);
            }
        }
        
        // Desenhar corpos
        for (const body of this.bodies) {
            let helper;
            
            if (body.shape === 'sphere') {
                const geometry = new THREE.SphereGeometry(body.radius, 16, 16);
                const material = new THREE.MeshBasicMaterial({
                    color: 0x0000ff,
                    wireframe: true,
                    opacity: 0.5,
                    transparent: true
                });
                helper = new THREE.Mesh(geometry, material);
                helper.position.copy(body.position);
            } else if (body.shape === 'box') {
                const geometry = new THREE.BoxGeometry(
                    body.size.x,
                    body.size.y,
                    body.size.z
                );
                const material = new THREE.MeshBasicMaterial({
                    color: 0xff00ff,
                    wireframe: true,
                    opacity: 0.5,
                    transparent: true
                });
                helper = new THREE.Mesh(geometry, material);
                helper.position.copy(body.position);
            }
            
            if (helper) {
                this.scene.add(helper);
                this.debugHelpers.push(helper);
            }
        }
    }
}

// Exportar para uso em outros arquivos
window.Physics = Physics;
