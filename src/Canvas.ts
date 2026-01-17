import { SCREEN_WIDTH, SCREEN_HEIGHT } from './constants';

// Canvas class to manage HTML5 Canvas element and context
export class Canvas {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor(canvasId: string) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas) {
            throw new Error(`Canvas with id '${canvasId}' not found`);
        }

        this.canvas = canvas;
        
        // Set canvas dimensions from constants
        this.canvas.width = SCREEN_WIDTH;
        this.canvas.height = SCREEN_HEIGHT;
        
        const context = this.canvas.getContext('2d');
        if (!context) {
            throw new Error('Unable to get 2D rendering context');
        }
        
        this.ctx = context;
    }

    public getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    public getCtx(): CanvasRenderingContext2D {
        return this.ctx;
    }

    public clearScreen(color: string = '#000000'): void {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public drawLine(x1: number, y1: number, x2: number, y2: number, color: string = '#ffffff', lineWidth: number = 2): void {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }
}