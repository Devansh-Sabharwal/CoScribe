import { getExistingChats } from "./http";
import { eraseShape } from "./eraser";
import { SelectionManager } from "./SelectionManager";

export interface Tool {
    id: string;
    type:
      | "rect"
      | "circle"
      | "pencil"
      | "diamond"
      | "arrow"
      | "line"
      | "text"
      | "eraser" 
      | "select"
    x: number;
    y: number;
    endX: number;
    endY: number;
    width?: number;
    height?: number;
    rotation?: number;
    text?: string;
    size?: number;
    path?: { x: number; y: number }[]; // for draw drawing
    color: string // Make color required
    bgColor: string
    strokeWidth:number
    strokeStyle:string
}

export class Draw {
    private ctx: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;
    private socket: WebSocket;
    private roomId: string;
    private existingStrokes: Tool[] = [];
    private clicked: boolean = false;
    private startX: number = 0;
    private startY: number = 0;
    private currShape = "select";
    private selectedShape: Tool | null = null;
    private tempPath: { x: number; y: number }[] = [];
    private selectionManager: SelectionManager;
    private setShape;
    private currColor: string = "white";
    private currBgColor: string = "#ffffff00";
    private currStrokeWidth:number = 2;
    private currStrokeStyle:string = "solid"
    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, socket: WebSocket, roomId: string, setShape: any) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.socket = socket;
        this.roomId = roomId;
        this.setShape = setShape;
        this.selectionManager = new SelectionManager(ctx, canvas);
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    }

    setTool(shape: Tool["type"]) {
        this.currShape = shape;
        if (shape !== "select") {
            this.selectedShape = null;
            this.selectionManager.setSelectedShape(null);
            this.clearCanvas();
        }
    }

    setColor(color: string) {
        this.currColor = color;
    }

    setBgColor(color: string) {
        this.currBgColor = color;
    }
    setStrokeWidth(width:number){
        this.currStrokeWidth = width;
    }
    setStrokeStyle(style:string){
        this.currStrokeStyle = style;
    }
    async init() {
        this.existingStrokes = await getExistingChats(this.roomId);
        this.clearCanvas();
    }

    clean() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.existingStrokes = [];
        this.socket.send(JSON.stringify({
            type: "clean",
            roomId: this.roomId
        }));
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type == "chat") {
                const parsedShape = JSON.parse(message.message);
                this.existingStrokes.push(parsedShape);
                this.clearCanvas();
            }
            if (message.type == "eraser") {
                this.existingStrokes = this.existingStrokes.filter((shape) => shape.id !== message.id);
                this.clearCanvas();
            }
            if (message.type == "clean") {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.existingStrokes = [];
            }
            if (message.type == "update") {
                const parsedShape = JSON.parse(message.message);
                const shapeIndex = this.existingStrokes.findIndex((shape) => shape.id === parsedShape.id);
                if (shapeIndex !== -1) {
                    this.existingStrokes[shapeIndex] = parsedShape;
                    this.clearCanvas();
                }
            }
        }
    }

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler);
        this.canvas.addEventListener("mouseup", this.mouseUpHandler);
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";

        this.existingStrokes.forEach((shape) => {
            this.ctx.save();
            switch (shape.strokeStyle) {
                case "solid":
                    this.ctx.setLineDash([]); // Solid line
                    break;
                case "dotted":
                    this.ctx.setLineDash([shape.strokeWidth, shape.strokeWidth*2]); // Increased dot spacing
                    break;
                case "dashed":
                    this.ctx.setLineDash([shape.strokeWidth*4, shape.strokeWidth*2]); // Longer dashes with more space
                    break;
                default:
                    this.ctx.setLineDash([]); // Default to solid
            }
            // Set the colors for the current shape
            this.ctx.strokeStyle = shape.color;
            this.ctx.fillStyle = shape.bgColor;
            this.ctx.lineWidth = shape.strokeWidth;


            if (shape.type === "pencil") {
                const path = shape.path;
                if (!path || path.length === 0) return;
                this.ctx.beginPath();
                this.ctx.moveTo(path[0].x, path[0].y);

                for (let i = 1; i < path.length; i++) {
                    this.ctx.lineTo(path[i].x, path[i].y);
                }
                this.ctx.stroke();
                this.ctx.closePath();
            }
            if (shape.type === "circle") {
                this.ctx.beginPath();
                if (!shape.width || !shape.height) return;
                const centerX = (shape.x + shape.endX) / 2;
                const centerY = (shape.y + shape.endY) / 2;
                this.ctx.ellipse(centerX, centerY, shape.width, shape.height, 0, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.stroke();
            }
            if (shape.type == "rect") {
                if (!shape.width || !shape.height) return;
                this.ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            }
            if (shape.type == "diamond") {
                const size = shape.size;
                if (!size) return;
                this.drawDiamond(shape.x, shape.y, size, true);
            }
            if (shape.type == "arrow") {
                this.drawLine(shape.x, shape.y, shape.endX, shape.endY, true);
            }
            if (shape.type == "line") {
                this.drawLine(shape.x, shape.y, shape.endX, shape.endY, false);
            }
            if (shape.type == "text") {
                if (shape.text) {
                    this.ctx.font = '24px Comic Sans MS, cursive';
                    this.ctx.fillText(shape.text, shape.x, shape.y + 24);
                }
            }

            this.ctx.restore();
        });

        // Set current colors for new drawings
        this.ctx.strokeStyle = this.currColor;
        this.ctx.fillStyle = this.currBgColor;
        this.ctx.lineWidth = this.currStrokeWidth;
        switch (this.currStrokeStyle) {
            case "solid":
                this.ctx.setLineDash([]); // Solid line
                break;
            case "dotted":
                this.ctx.setLineDash([this.currStrokeWidth, this.currStrokeWidth*2]); // Increased dot spacing
                break;
            case "dashed":
                this.ctx.setLineDash([this.currStrokeWidth*4, this.currStrokeWidth*2]); // Longer dashes with more space
                break;
            default:
                this.ctx.setLineDash([]); // Default to solid
        }

        // Draw selection box if there's a selected shape
        if (this.selectionManager.isShapeSelected() && this.currShape === "select") {
            const selectedShape = this.selectionManager.getSelectedShape();
            if (selectedShape) {
                const bounds = this.selectionManager.getShapeBounds(selectedShape);
                this.selectionManager.drawSelectionBox(bounds);
            }
        }
    }

    mouseDownHandler = (e: MouseEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.currShape === "select") {
            const selectedShape = this.selectionManager.getSelectedShape();
            if (selectedShape) {
                const bounds = this.selectionManager.getShapeBounds(selectedShape);
                const handle = this.selectionManager.getResizeHandleAtPoint(x, y, bounds);
                
                if (handle) {
                    this.selectionManager.startResizing(x, y);
                    return;
                }
            }

            // Check if clicked on an existing shape
            for (let i = this.existingStrokes.length - 1; i >= 0; i--) {
                const shape = this.existingStrokes[i];
                if (this.selectionManager.isPointInShape(x, y, shape)) {
                    this.selectedShape = shape;
                    this.selectionManager.setSelectedShape(shape);
                    this.selectionManager.startDragging(x, y);
                    this.clearCanvas();
                    return;
                }
            }
            
            this.selectedShape = null;
            this.selectionManager.setSelectedShape(null);
            this.clearCanvas();
            return;
        }

        this.clicked = true;
        this.startX = x;
        this.startY = y;

        if (this.currShape === "pencil") {
            this.tempPath = [{ x: this.startX, y: this.startY }];
            this.ctx.beginPath();
            this.ctx.moveTo(this.startX, this.startY);
        }
        else if (this.currShape == "text") {
            this.clicked = false;
            this.addInput(e.clientX, e.clientY);
        }
        else {
            this.selectedShape = {
                type: this.currShape as Tool["type"],
                x: this.startX,
                y: this.startY,
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
                endX: this.startX,
                endY: this.startY,
                color: this.currColor,
                bgColor: this.currBgColor,
                strokeWidth: this.currStrokeWidth,
                strokeStyle: this.currStrokeStyle
            };
        }
    }

    mouseUpHandler = (e: MouseEvent) => {
        if(this.currShape !== "pencil" && this.currShape !== "eraser" && this.currShape !== "line") this.setShape("select");
        if (this.currShape === "select") {
            if (this.selectionManager.isDraggingShape() || this.selectionManager.isResizingShape()) {
                const selectedShape = this.selectionManager.getSelectedShape();
                if (selectedShape) {
                    const index = this.existingStrokes.findIndex(shape => shape.id === selectedShape.id);
                    if (index !== -1) {
                        this.existingStrokes[index] = selectedShape;
                        this.clearCanvas();
                        this.socket.send(JSON.stringify({
                            type: "update",
                            id: selectedShape.id,
                            roomId: this.roomId,
                            message: JSON.stringify(selectedShape)
                        }));
                    }
                }
            }
            this.selectionManager.stopDragging();
            this.selectionManager.stopResizing();
            return;
        }

        if (this.selectedShape) {
            if (this.selectedShape.type == "circle") {
                this.selectedShape.height = Math.abs(e.clientY - this.startY)/2;
                this.selectedShape.width = Math.abs(e.clientX - this.startX) / 2
            }
            if (this.selectedShape.type == "rect") {
                this.selectedShape.height = (e.clientY - this.startY);
                this.selectedShape.width = (e.clientX - this.startX);
            }
            const currSize = Math.max(Math.abs(e.clientX - this.startX), Math.abs(e.clientY - this.startY));

            this.selectedShape.size = currSize;
            this.selectedShape.endX = e.clientX;
            this.selectedShape.endY = e.clientY;
        }
        
        this.clicked = false;
        if (this.currShape === "pencil") {
            if (this.tempPath.length <= 1) return;
            this.selectedShape = {
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
                type: "pencil",
                x: 0,
                y: 0,
                endX: 0,
                endY: 0,
                path: [...this.tempPath],
                color: this.currColor,
                bgColor: this.currBgColor,
                strokeWidth: this.currStrokeWidth,
                strokeStyle: this.currStrokeStyle
        
            };
            this.existingStrokes.push(this.selectedShape);
            this.socket.send(JSON.stringify({
                type: "chat",
                id: this.selectedShape.id,
                roomId: this.roomId,
                message: JSON.stringify(this.selectedShape)
            }));
            this.tempPath = [];
        }
        else if (this.currShape != "eraser" && this.currShape != "select" && this.currShape != "text") {
            if (!this.selectedShape) return;
            this.existingStrokes.push(this.selectedShape);
            this.socket.send(JSON.stringify({
                type: "chat",
                id: this.selectedShape.id,
                roomId: this.roomId,
                message: JSON.stringify(this.selectedShape)
            }));
            this.selectedShape = null;
        }
    }

    mouseMoveHandler = (e: MouseEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (this.currShape === "select") {
            if (this.selectionManager.isDraggingShape()) {
                this.selectionManager.updateDragging(x, y);
                this.clearCanvas();
            }
            else if (this.selectionManager.isResizingShape()) {
                this.selectionManager.updateResizing(x, y);
                this.clearCanvas();
            }
            return;
        }

        if (this.clicked) {
            this.ctx.strokeStyle=this.currColor
            this.ctx.lineCap = "round";
            this.ctx.lineJoin = "round";
            this.ctx.lineWidth = this.currStrokeWidth;
            switch (this.currStrokeStyle) {
                case "solid":
                    this.ctx.setLineDash([]); // Solid line
                    break;
                case "dotted":
                    this.ctx.setLineDash([this.currStrokeWidth, this.currStrokeWidth*2]); // Increased dot spacing
                    break;
                case "dashed":
                    this.ctx.setLineDash([this.currStrokeWidth*4, this.currStrokeWidth*2]); // Longer dashes with more space
                    break;
                default:
                    this.ctx.setLineDash([]); // Default to solid
            }
            if (this.currShape == "rect") {
                this.drawRect(e);
            }
            else if (this.currShape == "circle") {
                requestAnimationFrame(() => {
                    this.drawCircle(e);
                });
            }
            else if (this.currShape === "pencil") {
                requestAnimationFrame(() => {
                    this.drawPencil(e);
                });
            }
            else if (this.currShape === "diamond") {
                const currSize = Math.max(Math.abs(x - this.startX), Math.abs(y - this.startY));
                requestAnimationFrame(() => {
                    this.clearCanvas();
                    this.drawDiamond(this.startX, this.startY, currSize, true);
                });
            }
            else if (this.currShape === "arrow") {
                this.clearCanvas();
                this.drawLine(this.startX, this.startY, x, y, true);
            }
            else if (this.currShape === "line") {
                this.clearCanvas();
                this.drawLine(this.startX, this.startY, x, y, false);
            }
            else if (this.currShape === "eraser") {
                this.eraseShape(x, y);
            }
        }
    }
    
    eraseShape(x: number, y: number) {
        const eraserSize = 10;
        this.existingStrokes = eraseShape(this.existingStrokes, x, y, eraserSize, this.socket, this.roomId);
        this.clearCanvas();
    }

    drawCircle(e: MouseEvent) {
        const endX = e.clientX;
        const endY = e.clientY;
        const centerX = (this.startX + endX) / 2;
        const centerY = (this.startY + endY) / 2;
    
        const radiusX = Math.abs(endX - this.startX) / 2;
        const radiusY = Math.abs(endY - this.startY) / 2;
    
        this.clearCanvas();
        this.ctx.beginPath();
        this.ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawRect(e: MouseEvent) {
        const width = e.clientX - this.startX;
        const height = e.clientY - this.startY;
        this.clearCanvas();
        this.ctx.fillRect(this.startX, this.startY, width, height);
        this.ctx.strokeRect(this.startX, this.startY, width, height);
    }

    drawPencil(e: MouseEvent) {
        const newPoint = { x: e.clientX, y: e.clientY };
        this.tempPath.push(newPoint); 
        this.ctx.lineTo(newPoint.x, newPoint.y);
        this.ctx.stroke();
    }

    drawDiamond(startX: number, startY: number, size: number, fill: boolean) {
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY - size);
        this.ctx.lineTo(startX + size, startY);
        this.ctx.lineTo(startX, startY + size);
        this.ctx.lineTo(startX - size, startY);
        this.ctx.closePath();
        if (fill) {
            this.ctx.fill();
        }
        this.ctx.stroke();
    }

    drawLine(startX: number, startY: number, endX: number, endY: number, arrow: boolean) {
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        
        if (arrow == false) return;
        
        const arrowLength = 10;
        const angle = Math.atan2(endY - startY, endX - startX);

        this.ctx.beginPath();
        
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(
            endX - arrowLength * Math.cos(angle - Math.PI / 6),
            endY - arrowLength * Math.sin(angle - Math.PI / 6)
        );

        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(
            endX - arrowLength * Math.cos(angle + Math.PI / 6),
            endY - arrowLength * Math.sin(angle + Math.PI / 6)
        );

        this.ctx.stroke();
    }

    addInput(x: number, y: number) {
        const input = document.createElement("input");
        input.type = "text";
        input.style.position = "absolute";
        input.style.left = `${x}px`;
        input.style.top = `${y}px`;
        input.style.background = "transparent";
        input.style.color = this.currColor;
        input.style.border = "none";
        input.style.outline = "none";
        input.style.fontSize = "24px";
        input.style.fontFamily = "Comic Sans MS, cursive";
        input.style.maxWidth="100px"
        document.body.appendChild(input);
        setTimeout(() => input.focus(), 0);
    
        const handleSubmit = () => {
            if (input.value.trim() !== "") {
                this.drawText(input.value, x, y);
                this.selectedShape = {
                    id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
                    type: "text",
                    x,
                    y,
                    endX: x,
                    endY: y,
                    text: input.value.trim(),
                    color: this.currColor,
                    bgColor: this.currColor,
                    strokeWidth: this.currStrokeWidth,
                    strokeStyle: "solid"
                };
                this.existingStrokes.push(this.selectedShape);
                this.socket.send(
                    JSON.stringify({
                        type: "chat",
                        id: this.selectedShape.id,
                        roomId: this.roomId,
                        message: JSON.stringify(this.selectedShape),
                    })
                );
            }
            document.body.removeChild(input);
        };
    
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                handleSubmit();
            }
        });
    
        const handleClickOutside = (e: MouseEvent) => {
            if (!input.contains(e.target as Node)) {
                handleSubmit();
            }
        };
    
        setTimeout(() => {
            document.addEventListener("mousedown", handleClickOutside);
        }, 10);
    
        input.addEventListener("blur", () => {
            document.removeEventListener("mousedown", handleClickOutside);
        });
    }

    drawText(text: string, x: number, y: number) {
        this.ctx.font = '24px Comic Sans MS, cursive';
        this.ctx.fillStyle=this.currColor;
        this.ctx.lineWidth = this.currStrokeWidth
        this.ctx.fillText(text, x, y + 24);
    }
}