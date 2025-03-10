import { Tool } from "./draw";

export interface ResizeHandle {
    x: number;
    y: number;
    cursor: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export class SelectionManager {
    private canvas: HTMLCanvasElement;
    private selectedShape: Tool | null = null;
    private isDragging: boolean = false;
    private isResizing: boolean = false;
    private dragOffset: { x: number; y: number } = { x: 0, y: 0 };
    private dragEndOffset: { x: number; y: number } = { x: 0, y: 0 };
    private activeResizeHandle: ResizeHandle | null = null;
    private originalShapeBounds: { x: number; y: number; width: number; height: number } | null = null;
    private ctx: CanvasRenderingContext2D;
    private setCursor(cursor: string) {
        this.canvas.style.cursor = cursor;
    }
    
    private resetCursor() {
        this.canvas.style.cursor = 'auto';
    }
    constructor(ctx: CanvasRenderingContext2D,canvas:HTMLCanvasElement) {
        this.ctx = ctx;
        this.canvas = canvas;
    }

    getSelectedShape(): Tool | null {
        return this.selectedShape;
    }

    setSelectedShape(shape: Tool | null) {
        this.selectedShape = shape;
    }

    isShapeSelected(): boolean {
        return this.selectedShape !== null;
    }

    isDraggingShape(): boolean {
        return this.isDragging;
    }

    isResizingShape(): boolean {
        return this.isResizing;
    }

    getShapeBounds(shape: Tool): { x: number; y: number; width: number; height: number } {
        let bounds = {
            x: shape.x,
            y: shape.y,
            width: 0,
            height: 0
        };

        switch (shape.type) {
            case "rect":
                bounds.width = shape.width || 0;
                bounds.height = shape.height || 0;
                if (bounds.width < 0) {
                    bounds.x += bounds.width;
                    bounds.width = Math.abs(bounds.width);
                }
                if (bounds.height < 0) {
                    bounds.y += bounds.height;
                    bounds.height = Math.abs(bounds.height);
                }
                bounds.x-=10;
                bounds.y-=10;
                bounds.width+=20;
                bounds.height+=20;
                break;
            case "circle":
                bounds.width = (shape.width || 0) * 2;
                bounds.height = (shape.height || 0) * 2;
                break;
            case "diamond":
                const size = shape.size || 0;
                bounds.width = size * 2;
                bounds.height = size * 2;
                bounds.x -= size;
                bounds.y -= size;
                break;
            case "line":
            case "arrow":
                bounds.width = Math.abs(shape.endX - shape.x)+20;
                bounds.height = Math.abs(shape.endY - shape.y)+20;
                bounds.x = Math.min(shape.x, shape.endX)-10;
                bounds.y = Math.min(shape.y, shape.endY)-10;
                break;
            case "text":
                this.ctx.font = '24px Comic Sans MS, cursive';
                const metrics = this.ctx.measureText(shape.text || "");
                bounds.x = shape.x-10
                bounds.y = shape.y-10
                bounds.width = metrics.width+20;
                bounds.height = 48;
                break;
        }

        return bounds;
    }

    private getResizeHandles(bounds: { x: number; y: number; width: number; height: number }): ResizeHandle[] {
        return [
            { x: bounds.x, y: bounds.y, cursor: 'nw-resize', position: 'top-left' },
            { x: bounds.x + bounds.width, y: bounds.y, cursor: 'ne-resize', position: 'top-right' },
            { x: bounds.x, y: bounds.y + bounds.height, cursor: 'sw-resize', position: 'bottom-left' },
            { x: bounds.x + bounds.width, y: bounds.y + bounds.height, cursor: 'se-resize', position: 'bottom-right' }
        ];
    }

    drawSelectionBox(bounds: { x: number; y: number; width: number; height: number }) {
        this.ctx.save();
        this.ctx.strokeStyle = '#6082B6';
        // this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        
        // Draw resize handles
        this.ctx.fillStyle = '#6082B6';
        const handles = this.getResizeHandles(bounds);
        handles.forEach(handle => {
            this.ctx.beginPath();
            this.ctx.arc(handle.x, handle.y, 7, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.restore();
    }

    isPointInShape(x: number, y: number, shape: Tool): boolean {
        const bounds = this.getShapeBounds(shape);
        return x >= bounds.x && x <= bounds.x + bounds.width &&
               y >= bounds.y && y <= bounds.y + bounds.height;
    }

    getResizeHandleAtPoint(x: number, y: number, bounds: { x: number; y: number; width: number; height: number }): ResizeHandle | null {
        const handles = this.getResizeHandles(bounds);
        const handleRadius = 5;
        
        return handles.find(handle => {
            const dx = x - handle.x;
            const dy = y - handle.y;
            return (dx * dx + dy * dy) <= handleRadius * handleRadius;
        }) || null;
    }

    startDragging(x: number, y: number) {
        if (this.selectedShape) {
            this.isDragging = true;
            this.dragOffset = {
                x: x - this.selectedShape.x,
                y: y - this.selectedShape.y
            };
            
            if (this.selectedShape.type === "line" || this.selectedShape.type === "arrow") {
                this.dragEndOffset = {
                    x: x - this.selectedShape.endX,
                    y: y - this.selectedShape.endY
                };
            }
            this.setCursor('move');
        }
    }

    startResizing(x: number, y: number) {
        if (this.selectedShape) {
            const bounds = this.getShapeBounds(this.selectedShape);
            const handle = this.getResizeHandleAtPoint(x, y, bounds);
            
            if (handle) {
                this.isResizing = true;
                this.activeResizeHandle = handle;
                this.originalShapeBounds = { ...bounds };
                this.setCursor(handle.cursor);
            }
        }
    }

    updateDragging(x: number, y: number) {
        if (this.isDragging && this.selectedShape) {
            if (this.selectedShape.type === "line" || this.selectedShape.type === "arrow") {
                // Calculate the movement delta
                const dx = x - this.dragOffset.x;
                const dy = y - this.dragOffset.y;
                
                // Move both start and end points by the same amount
                const moveX = dx - this.selectedShape.x;
                const moveY = dy - this.selectedShape.y;
                
                this.selectedShape.x = dx;
                this.selectedShape.y = dy;
                this.selectedShape.endX += moveX;
                this.selectedShape.endY += moveY;
            } else if (this.selectedShape.type === "circle") {
                // Calculate the movement delta
                const dx = x - this.dragOffset.x;
                const dy = y - this.dragOffset.y;
    
                if(!this.selectedShape.width || !this.selectedShape.height) return;
                // Move the circle's start and end points by the same amount
                this.selectedShape.x = dx;
                this.selectedShape.y = dy;
                this.selectedShape.endX = dx + (this.selectedShape.width * 2); // Diameter = radius * 2
                this.selectedShape.endY = dy + (this.selectedShape.height * 2); // Diameter = radius * 2
            }
            else {
                // For other shapes, just update the position
                this.selectedShape.x = x - this.dragOffset.x;
                this.selectedShape.y = y - this.dragOffset.y;
            }

        }
        
    }

    updateResizing(x: number, y: number) {
        if (this.isResizing && this.selectedShape && this.activeResizeHandle && this.originalShapeBounds) {
            const newBounds = { ...this.originalShapeBounds };
            this.setCursor(this.activeResizeHandle.cursor);
            switch (this.activeResizeHandle.position) {
                
                case 'top-left':
                    newBounds.width += newBounds.x - x;
                    newBounds.height += newBounds.y - y;
                    newBounds.x = x;
                    newBounds.y = y;
                    break;
                case 'top-right':
                    newBounds.width = x - newBounds.x;
                    newBounds.height += newBounds.y - y;
                    newBounds.y = y;
                    break;
                case 'bottom-left':
                    newBounds.width += newBounds.x - x;
                    newBounds.height = y - newBounds.y;
                    newBounds.x = x;
                    break;
                case 'bottom-right':
                    newBounds.width = x - newBounds.x;
                    newBounds.height = y - newBounds.y;
                    break;
            }
            
            if (this.selectedShape.type === "rect") {
                this.selectedShape.x = newBounds.x;
                this.selectedShape.y = newBounds.y;
                this.selectedShape.width = newBounds.width;
                this.selectedShape.height = newBounds.height;
            }
            else if (this.selectedShape.type === "circle") {
                // Update the circle's start/end points and radii
                this.selectedShape.x = newBounds.x; // Left edge of bounding box
                this.selectedShape.endX = newBounds.x + newBounds.width; // Right edge of bounding box
                this.selectedShape.y = newBounds.y; // Top edge of bounding box
                this.selectedShape.endY = newBounds.y + newBounds.height; // Bottom edge of bounding box
    
                // Update the radii (width/height are radiusX and radiusY)
                this.selectedShape.width = Math.max((newBounds.width / 2),0); // radiusX = diameter / 2
                this.selectedShape.height = Math.max((newBounds.height / 2),0); // radiusY = diameter / 2
            }
            else if (this.selectedShape.type === "diamond") {
                this.selectedShape.size = Math.max(Math.abs(newBounds.width), Math.abs(newBounds.height)) / 2;
            }
            else if (this.selectedShape.type === "line" || this.selectedShape.type === "arrow") {
                // Update line/arrow endpoints based on the resize handle
                switch (this.activeResizeHandle.position) {
                    case 'top-left':
                        this.selectedShape.x = x;
                        this.selectedShape.y = y;
                        break;
                    case 'top-right':
                        this.selectedShape.endX = x;
                        this.selectedShape.y = y;
                        break;
                    case 'bottom-left':
                        this.selectedShape.x = x;
                        this.selectedShape.endY = y;
                        break;
                    case 'bottom-right':
                        this.selectedShape.endX = x;
                        this.selectedShape.endY = y;
                        break;
                }
            }
        }
    }

    stopDragging() {
        this.isDragging = false;
        this.resetCursor(); 
    }

    stopResizing() {
        this.isResizing = false;
        this.activeResizeHandle = null;
        this.originalShapeBounds = null;
        this.resetCursor(); 
    }
}