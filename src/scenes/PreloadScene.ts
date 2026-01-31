import Phaser from 'phaser';

/**
 * PreloadScene - Handles asset loading and displays a loading bar
 * This scene creates placeholder graphics for the game since we don't have assets yet
 */
export default class PreloadScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics;
  private loadingBarBorder!: Phaser.GameObjects.Graphics;
  private progressText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    // Create loading bar graphics
    this.createLoadingBar();

    // Set up loading event listeners
    this.load.on('progress', this.updateLoadingBar, this);
    this.load.on('complete', this.onLoadComplete, this);

    // Generate placeholder textures using colored rectangles
    // These simulate game assets with Sanrio-inspired pastel colors
    this.generatePlaceholderAssets();
  }

  /**
   * Creates a visual loading bar using Phaser Graphics
   * Positioned in the center of the screen
   */
  private createLoadingBar(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background text
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ff69b4' // Hot pink for Hello Kitty theme
    });
    loadingText.setOrigin(0.5);

    // Progress percentage text
    this.progressText = this.add.text(width / 2, height / 2 + 50, '0%', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff'
    });
    this.progressText.setOrigin(0.5);

    // Loading bar border (white outline)
    this.loadingBarBorder = this.add.graphics();
    this.loadingBarBorder.lineStyle(3, 0xffffff, 1);
    this.loadingBarBorder.strokeRect(width / 2 - 160, height / 2 - 10, 320, 30);

    // Loading bar fill (pink gradient effect)
    this.loadingBar = this.add.graphics();
  }

  /**
   * Updates the loading bar based on load progress
   * @param value - Progress value between 0 and 1
   */
  private updateLoadingBar(value: number): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Clear previous bar
    this.loadingBar.clear();

    // Draw pink loading bar
    this.loadingBar.fillStyle(0xffb3d9, 1); // Light pink
    this.loadingBar.fillRect(width / 2 - 155, height / 2 - 5, 310 * value, 20);

    // Update percentage text
    this.progressText.setText(`${Math.floor(value * 100)}%`);
  }

  /**
   * Called when all assets are loaded
   * Transitions to the main kitchen scene
   */
  private onLoadComplete(): void {
    // Small delay for visual feedback
    this.time.delayedCall(500, () => {
      this.scene.start('KitchenScene');
    });
  }

  /**
   * Generates placeholder textures using Phaser's Graphics
   * These represent game assets with Sanrio aesthetic (pastel colors)
   */
  private generatePlaceholderAssets(): void {
    // Background - Kitchen (soft blue with floor)
    const bg = this.add.graphics();
    bg.fillStyle(0xb3d9ff, 1); // Soft blue walls
    bg.fillRect(0, 0, 1000, 700);
    bg.fillStyle(0xf5deb3, 1); // Wheat colored floor
    bg.fillRect(0, 500, 1000, 200);
    bg.generateTexture('background-kitchen', 1000, 700);
    bg.destroy();

    // Hello Kitty Character (playable - larger, more detailed)
    const kitty = this.add.graphics();
    kitty.fillStyle(0xffffff, 1); // White body
    kitty.fillCircle(40, 50, 35); // Head
    kitty.fillEllipse(40, 80, 30, 35); // Body
    // Bow
    kitty.fillStyle(0xff1493, 1); // Deep pink bow
    kitty.fillCircle(20, 30, 12);
    kitty.fillCircle(35, 25, 10);
    // Face details
    kitty.fillStyle(0x000000, 1); // Black
    kitty.fillCircle(32, 48, 3); // Left eye
    kitty.fillCircle(48, 48, 3); // Right eye
    // Whiskers
    kitty.lineStyle(2, 0x000000);
    kitty.lineBetween(20, 55, 5, 55);
    kitty.lineBetween(60, 55, 75, 55);
    kitty.generateTexture('hello-kitty-char', 80, 100);
    kitty.destroy();

    // Waiting Character (at table - different color scheme)
    const customer = this.add.graphics();
    customer.fillStyle(0xffb6c1, 1); // Light pink body
    customer.fillCircle(40, 50, 35);
    customer.fillEllipse(40, 80, 30, 35);
    // Bow (different color)
    customer.fillStyle(0x9370db, 1); // Purple bow
    customer.fillCircle(20, 30, 12);
    customer.fillCircle(35, 25, 10);
    // Face
    customer.fillStyle(0x000000, 1);
    customer.fillCircle(32, 48, 3);
    customer.fillCircle(48, 48, 3);
    customer.generateTexture('customer-char', 80, 100);
    customer.destroy();

    // Armário de Ingredientes (Losango - Diamond shape)
    const pantry = this.add.graphics();
    pantry.fillStyle(0x8b4513, 1); // Brown wood
    // Desenhar losango
    pantry.beginPath();
    pantry.moveTo(50, 0);    // Topo
    pantry.lineTo(100, 40);  // Direita
    pantry.lineTo(50, 80);   // Baixo
    pantry.lineTo(0, 40);    // Esquerda
    pantry.closePath();
    pantry.fillPath();
    // Detalhes
    pantry.fillStyle(0xa0522d, 1);
    pantry.fillCircle(50, 40, 15);
    pantry.generateTexture('station-pantry', 100, 80);
    pantry.destroy();

    // Bancada (Losango - Diamond shape)
    const counter = this.add.graphics();
    counter.fillStyle(0xd3d3d3, 1); // Gray countertop
    // Desenhar losango
    counter.beginPath();
    counter.moveTo(50, 0);    // Topo
    counter.lineTo(100, 40);  // Direita
    counter.lineTo(50, 80);   // Baixo
    counter.lineTo(0, 40);    // Esquerda
    counter.closePath();
    counter.fillPath();
    // Detalhes
    counter.fillStyle(0xffb3d9, 1);
    counter.fillCircle(50, 40, 12);
    counter.generateTexture('station-counter', 100, 80);
    counter.destroy();

    // Forno (Losango - Diamond shape)
    const oven = this.add.graphics();
    oven.fillStyle(0x2f4f4f, 1); // Dark slate gray
    // Desenhar losango
    oven.beginPath();
    oven.moveTo(50, 0);    // Topo
    oven.lineTo(100, 40);  // Direita
    oven.lineTo(50, 80);   // Baixo
    oven.lineTo(0, 40);    // Esquerda
    oven.closePath();
    oven.fillPath();
    // Porta do forno
    oven.fillStyle(0x000000, 1);
    oven.fillRect(30, 25, 40, 30);
    oven.generateTexture('station-oven', 100, 80);
    oven.destroy();

    // Mesa (Table - Quadrado)
    const table = this.add.graphics();
    table.fillStyle(0xdaa520, 1); // Goldenrod table
    table.fillRoundedRect(0, 0, 100, 100, 8); // Quadrado
    table.fillStyle(0xb8860b, 1); // Darker gold
    table.fillRect(10, 10, 80, 80);
    // Plate on table
    table.fillStyle(0xffffff, 1);
    table.fillCircle(50, 50, 20);
    table.generateTexture('station-table', 100, 100);
    table.destroy();

    // Add a small delay to simulate loading
    // In a real project, you'd load actual image files here:
    // this.load.image('background-kitchen', 'assets/bg_kitchen.png');
    // this.load.atlas('ingredients', 'assets/ingredients.png', 'assets/ingredients.json');
    
    // Simulate some loading time
    for (let i = 0; i < 10; i++) {
      this.load.image(`dummy-${i}`, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    }
  }
}
