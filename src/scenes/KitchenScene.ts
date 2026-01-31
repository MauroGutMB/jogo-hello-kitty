import Phaser from 'phaser';

/**
 * KitchenScene - Main gameplay scene
 * Point & Click movement system where Hello Kitty moves around the kitchen
 * and interacts with 4 different stations
 */

// Interface para definir as estações interativas
interface Station {
  sprite: Phaser.GameObjects.Sprite;
  name: string;
  position: { x: number; y: number };
  interactionZone: Phaser.Geom.Circle;
  label?: Phaser.GameObjects.Text;
  icon?: Phaser.GameObjects.Text;
}

export default class KitchenScene extends Phaser.Scene {
  private helloKitty!: Phaser.GameObjects.Sprite;
  private customerChar!: Phaser.GameObjects.Sprite;
  private background!: Phaser.GameObjects.Image;
  
  // 4 Estações interativas
  private stations: Station[] = [];
  private tableStation!: Station; // Referência especial para a mesa (onde o cliente está)

  // UI
  private instructionsText?: Phaser.GameObjects.Text;

  // Cache de tamanho para resize responsivo
  private lastWidth: number = 0;
  private lastHeight: number = 0;
  
  // Estado do movimento
  private isMoving: boolean = false;
  private targetPosition: { x: number; y: number } | null = null;
  private moveSpeed: number = 200; // pixels por segundo
  
  // Estado da interação
  private currentStation: Station | null = null;

  constructor() {
    super({ key: 'KitchenScene' });
  }

  create(): void {
    // Configurar o background da cozinha
    this.createBackground();

    // Criar as 4 estações interativas
    this.createStations();

    // Criar o personagem que espera na mesa
    this.createCustomerCharacter();

    // Criar a Hello Kitty (personagem jogável)
    this.createHelloKitty();

    // Configurar o sistema de cliques
    this.setupClickControls();

    // Adicionar instruções
    this.createInstructions();

    // Adicionar indicadores visuais (opcional)
    this.createStationIndicators();

    // Layout inicial e resize responsivo
    this.layout(this.scale.width, this.scale.height);
    this.lastWidth = this.scale.width;
    this.lastHeight = this.scale.height;
    this.scale.on('resize', this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.handleResize, this);
    });
  }

  update(_time: number, delta: number): void {
    // Atualizar movimento da Hello Kitty
    if (this.isMoving && this.targetPosition) {
      this.moveHelloKittyToTarget(delta);
    }
  }

  /**
   * Cria e posiciona o background da cozinha
   */
  private createBackground(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.background = this.add.image(width / 2, height / 2, 'background-kitchen');
    
    const scaleX = width / this.background.width;
    const scaleY = height / this.background.height;
    const scale = Math.max(scaleX, scaleY);
    this.background.setScale(scale);
  }

  /**
   * Recalcula layout para manter centralização e responsividade
   */
  private layout(width: number, height: number): void {
    // Background centralizado
    if (this.background) {
      this.background.setPosition(width / 2, height / 2);
      const scaleX = width / this.background.width;
      const scaleY = height / this.background.height;
      this.background.setScale(Math.max(scaleX, scaleY));
    }

    const topY = height * 0.18;
    const centerY = height * 0.5;
    const bottomY = height * 0.7;

    const labelOffset = Math.max(50, Math.min(90, height * 0.1));
    const iconOffset = labelOffset;

    const pantry = this.stations.find((s) => s.name === 'Armário');
    const counter = this.stations.find((s) => s.name === 'Bancada');
    const oven = this.stations.find((s) => s.name === 'Forno');
    const table = this.stations.find((s) => s.name === 'Mesa');

    this.updateStationPosition(pantry, width * 0.25, topY, labelOffset, iconOffset);
    this.updateStationPosition(counter, width * 0.5, topY, labelOffset, iconOffset);
    this.updateStationPosition(oven, width * 0.75, topY, labelOffset, iconOffset);
    this.updateStationPosition(table, width * 0.78, bottomY, labelOffset, iconOffset);

    // Reposicionar cliente com base na mesa
    if (this.customerChar && this.tableStation) {
      const customerOffsetX = Math.max(60, width * 0.08);
      this.customerChar.setPosition(this.tableStation.position.x - customerOffsetX, this.tableStation.position.y);
    }

    // Centralizar Hello Kitty (posição base) apenas se ainda não houver movimento
    if (this.helloKitty && !this.isMoving && !this.targetPosition) {
      this.helloKitty.setPosition(width / 2, centerY);
      const shadow = this.helloKitty.getData('shadow') as Phaser.GameObjects.Ellipse | undefined;
      if (shadow) {
        shadow.setPosition(this.helloKitty.x, this.helloKitty.y + 40);
      }
    }

    // Reposicionar instruções no topo
    if (this.instructionsText) {
      this.instructionsText.setPosition(width / 2, Math.max(24, height * 0.05));
    }
  }

  /**
   * Atualiza posição da estação e seus elementos associados
   */
  private updateStationPosition(
    station: Station | undefined,
    x: number,
    y: number,
    labelOffset: number,
    iconOffset: number
  ): void {
    if (!station) return;

    station.position = { x, y };
    station.sprite.setPosition(x, y);
    station.interactionZone.setPosition(x, y);

    if (station.label) {
      station.label.setPosition(x, y - labelOffset);
    }

    if (station.icon) {
      station.icon.setPosition(x, y + iconOffset);
    }
  }

  /**
   * Evento de resize para manter a cena responsiva
   */
  private handleResize(
    gameSize: Phaser.Structs.Size,
    _baseSize: Phaser.Structs.Size,
    _displaySize: Phaser.Structs.Size,
    _resolution: number
  ): void {
    const width = gameSize.width;
    const height = gameSize.height;
    const oldWidth = this.lastWidth || width;
    const oldHeight = this.lastHeight || height;

    // Preservar posição relativa da Hello Kitty
    if (this.helloKitty) {
      const relX = this.helloKitty.x / oldWidth;
      const relY = this.helloKitty.y / oldHeight;
      this.helloKitty.setPosition(relX * width, relY * height);

      const shadow = this.helloKitty.getData('shadow') as Phaser.GameObjects.Ellipse | undefined;
      if (shadow) {
        shadow.setPosition(this.helloKitty.x, this.helloKitty.y + 40);
      }
    }

    // Preservar destino atual, se houver
    if (this.targetPosition) {
      this.targetPosition = {
        x: (this.targetPosition.x / oldWidth) * width,
        y: (this.targetPosition.y / oldHeight) * height
      };
    }

    // Recalcular layout geral
    this.layout(width, height);

    this.lastWidth = width;
    this.lastHeight = height;
  }

  /**
   * Cria as 4 estações interativas na cozinha
   * Layout conforme imagem:
   * [◇ Armário]  [◇ Bancada]  [◇ Forno]
   * 
   *              ⭕ Hello Kitty
   * 
   *                            [□ Mesa]
   */
  private createStations(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 1. Armário de Ingredientes (topo - esquerda)
    this.createStation(
      'station-pantry',
      'Armário',
      width * 0.25,
      height * 0.2
    );

    // 2. Bancada (topo - centro)
    this.createStation(
      'station-counter',
      'Bancada',
      width * 0.5,
      height * 0.2
    );

    // 3. Forno (topo - direita)
    this.createStation(
      'station-oven',
      'Forno',
      width * 0.75,
      height * 0.2
    );

    // 4. Mesa (inferior direito) - salvar referência
    this.tableStation = this.createStation(
      'station-table',
      'Mesa',
      width * 0.78,
      height * 0.7
    );
  }

  /**
   * Helper para criar uma estação interativa
   */
  private createStation(
    texture: string,
    name: string,
    x: number,
    y: number
  ): Station {
    const sprite = this.add.sprite(x, y, texture);
    sprite.setScale(1.0); // Tamanho ajustado conforme imagem
    sprite.setInteractive({ useHandCursor: true });

    // Zona de interação ao redor da estação
    const interactionZone = new Phaser.Geom.Circle(x, y, 80);

    const station: Station = {
      sprite,
      name,
      position: { x, y },
      interactionZone
    };

    this.stations.push(station);

    // Adicionar efeito de hover
    sprite.on('pointerover', () => {
      sprite.setTint(0xffff99); // Highlight amarelo
      sprite.setScale(1.1);
    });

    sprite.on('pointerout', () => {
      sprite.clearTint();
      sprite.setScale(1.0);
    });

    return station;
  }

  /**
   * Cria o personagem que aguarda os bolos na mesa
   */
  private createCustomerCharacter(): void {
    const tablePos = this.tableStation.position;
    
    // Posicionar o personagem próximo à mesa (canto inferior direito)
    this.customerChar = this.add.sprite(
      tablePos.x - 80,
      tablePos.y,
      'customer-char'
    );
    this.customerChar.setScale(0.6);
    this.customerChar.setDepth(10);

    // Animação de espera (balançando gentilmente)
    this.tweens.add({
      targets: this.customerChar,
      y: this.customerChar.y + 5,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Cria a Hello Kitty (personagem jogável)
   * Tamanho: similar ao círculo na imagem de referência
   */
  private createHelloKitty(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Posição inicial no centro da tela (como na imagem)
    this.helloKitty = this.add.sprite(
      width / 2,
      height * 0.5,
      'hello-kitty-char'
    );
    this.helloKitty.setScale(0.8); // Tamanho do círculo de referência
    this.helloKitty.setDepth(100); // Sempre na frente

    // Adicionar sombra para dar profundidade
    const shadow = this.add.ellipse(
      this.helloKitty.x,
      this.helloKitty.y + 40,
      35,
      12,
      0x000000,
      0.3
    );
    shadow.setDepth(99);
    
    // Conectar a sombra ao personagem
    this.helloKitty.setData('shadow', shadow);
  }

  /**
   * Configura o sistema de cliques para movimento e interação
   */
  private setupClickControls(): void {
    // Clique nas estações
    this.stations.forEach(station => {
      station.sprite.on('pointerdown', () => {
        this.moveToStation(station);
      });
    });

    // Clique no background (movimento livre)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Verificar se o clique não foi em uma estação
      let clickedStation = false;
      
      this.stations.forEach(station => {
        const bounds = station.sprite.getBounds();
        if (bounds.contains(pointer.x, pointer.y)) {
          clickedStation = true;
        }
      });

      // Se não clicou em uma estação, mover livremente
      if (!clickedStation) {
        this.moveToPosition(pointer.x, pointer.y);
      }
    });
  }

  /**
   * Move a Hello Kitty para uma estação específica
   */
  private moveToStation(station: Station): void {
    console.log(`🎀 Movendo para: ${station.name}`);
    
    // Calcular posição na frente da estação
    const targetX = station.position.x;
    const targetY = station.position.y + 80; // Posicionar na frente
    
    this.moveToPosition(targetX, targetY);
    this.currentStation = station;
  }

  /**
   * Move a Hello Kitty para uma posição específica (x, y)
   */
  private moveToPosition(x: number, y: number): void {
    // Limitar posição dentro dos limites da tela
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    x = Phaser.Math.Clamp(x, 50, width - 50);
    y = Phaser.Math.Clamp(y, 100, height - 50);

    this.targetPosition = { x, y };
    this.isMoving = true;

    // Feedback visual: mostrar ponto de destino
    this.showDestinationMarker(x, y);
  }

  /**
   * Atualiza o movimento da Hello Kitty em direção ao alvo
   */
  private moveHelloKittyToTarget(delta: number): void {
    if (!this.targetPosition) return;

    const distance = Phaser.Math.Distance.Between(
      this.helloKitty.x,
      this.helloKitty.y,
      this.targetPosition.x,
      this.targetPosition.y
    );

    // Chegou ao destino
    if (distance < 5) {
      this.helloKitty.x = this.targetPosition.x;
      this.helloKitty.y = this.targetPosition.y;
      this.isMoving = false;
      
      // Atualizar posição da sombra
      const shadow = this.helloKitty.getData('shadow') as Phaser.GameObjects.Ellipse;
      if (shadow) {
        shadow.x = this.helloKitty.x;
        shadow.y = this.helloKitty.y + 40;
      }

      // Verificar se chegou em uma estação
      if (this.currentStation) {
        this.onReachedStation(this.currentStation);
      }

      return;
    }

    // Calcular direção do movimento
    const angle = Phaser.Math.Angle.Between(
      this.helloKitty.x,
      this.helloKitty.y,
      this.targetPosition.x,
      this.targetPosition.y
    );

    // Mover na direção do alvo
    const moveDistance = (this.moveSpeed * delta) / 1000;
    this.helloKitty.x += Math.cos(angle) * moveDistance;
    this.helloKitty.y += Math.sin(angle) * moveDistance;

    // Atualizar posição da sombra
    const shadow = this.helloKitty.getData('shadow') as Phaser.GameObjects.Ellipse;
    if (shadow) {
      shadow.x = this.helloKitty.x;
      shadow.y = this.helloKitty.y + 40;
    }

    // Flip sprite baseado na direção (olhar para onde está indo)
    if (this.targetPosition.x < this.helloKitty.x) {
      this.helloKitty.setFlipX(true);
    } else {
      this.helloKitty.setFlipX(false);
    }
  }

  /**
   * Chamado quando a Hello Kitty chega em uma estação
   * Aqui será implementado o minigame de cada estação no futuro
   */
  private onReachedStation(station: Station): void {
    console.log(`✨ Chegou na estação: ${station.name}`);
    
    // Animação de chegada
    this.tweens.add({
      targets: this.helloKitty,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 200,
      yoyo: true
    });

    // Mostrar mensagem de interação
    this.showInteractionPrompt(station);

    // Reset
    this.currentStation = null;
  }

  /**
   * Mostra um marcador visual no ponto de destino
   */
  private showDestinationMarker(x: number, y: number): void {
    const marker = this.add.circle(x, y, 20, 0xff69b4, 0.5);
    marker.setDepth(50);

    // Animação de pulso
    this.tweens.add({
      targets: marker,
      scale: 1.5,
      alpha: 0,
      duration: 500,
      onComplete: () => marker.destroy()
    });
  }

  /**
   * Mostra prompt de interação quando chega em uma estação
   */
  private showInteractionPrompt(station: Station): void {
    const promptText = this.add.text(
      station.position.x,
      station.position.y - 80,
      `[${station.name}]\nMinigame em breve! 🎮`,
      {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#ff69b4',
        backgroundColor: '#ffffff',
        padding: { x: 10, y: 5 },
        align: 'center'
      }
    );
    promptText.setOrigin(0.5);
    promptText.setDepth(200);

    // Fade out após 2 segundos
    this.tweens.add({
      targets: promptText,
      alpha: 0,
      duration: 1000,
      delay: 2000,
      onComplete: () => promptText.destroy()
    });
  }

  /**
   * Cria indicadores visuais sobre as estações
   */
  private createStationIndicators(): void {
    this.stations.forEach(station => {
      // Texto do nome da estação
      const label = this.add.text(
        station.position.x,
        station.position.y - 70,
        station.name,
        {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#ffffff',
          backgroundColor: '#ff69b4',
          padding: { x: 8, y: 4 }
        }
      );
      label.setOrigin(0.5);
      label.setDepth(150);

      // Ícone de interação (piscando)
      const icon = this.add.text(
        station.position.x,
        station.position.y + 70,
        '👆',
        {
          fontSize: '24px'
        }
      );
      icon.setOrigin(0.5);
      icon.setDepth(150);

      // Guardar referência para reposicionamento responsivo
      station.label = label;
      station.icon = icon;

      // Animação de piscar
      this.tweens.add({
        targets: icon,
        alpha: 0.3,
        duration: 1000,
        yoyo: true,
        repeat: -1
      });
    });
  }

  /**
   * Cria instruções para o jogador
   */
  private createInstructions(): void {
    const width = this.cameras.main.width;

    const instructions = this.add.text(
      width / 2,
      30,
      'Clique nas estações ou em qualquer lugar para mover a Hello Kitty! 🎀',
      {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#ff69b4',
        stroke: '#ffffff',
        strokeThickness: 4,
        align: 'center'
      }
    );
    instructions.setOrigin(0.5);
    instructions.setDepth(300);
    this.instructionsText = instructions;

    // Fade out após alguns segundos
    this.tweens.add({
      targets: instructions,
      alpha: 0,
      duration: 1000,
      delay: 5000,
      onComplete: () => instructions.destroy()
    });
  }
}
