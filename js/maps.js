// js/maps.js (Phiên bản sửa lỗi viền và lối đi hẹp)

export const CELL_SIZE = 60; // Kích thước ô (pixel)

// Biến lưu kích thước map (sẽ được cập nhật)
let MAP_WIDTH_CELLS = 16; 
let MAP_HEIGHT_CELLS = 10; 

// === Tỉ lệ "rắc" thêm các khối ===
const DESTRUCTIBLE_WALL_CHANCE = 0.2; // 20% tường còn lại -> Tường Vỡ
const SLOW_ZONE_CHANCE = 0.1;         // 10% Sàn Mê Cung -> Vùng Chậm

// === THAY ĐỔI: Tăng tỉ lệ "đục tường" để lối đi rộng hơn ===
const MAZE_SPARSENESS_CHANCE = 0.45;  // 45% tường sẽ bị đục bỏ

/**
 * === HÀM TẠO MÊ CUNG (Recursive Backtracker) ===
 */
function generateMazeLayout(width, height) {
    
    // 1. Bắt đầu với một bản đồ SÀN (0)
    let layout = Array(height).fill(0).map(() => Array(width).fill(0));
    
    // 2. Tự tay xây viền 1-ô TẠM THỜI (Tường Cứng 1)
    // (Viền này sẽ bị phá vỡ ở Bước 6)
    for (let c = 0; c < width; c++) {
        layout[0][c] = 1; // Viền trên
        layout[height - 1][c] = 1; // Viền dưới
    }
    for (let r = 0; r < height; r++) {
        layout[r][0] = 1; // Viền trái
        layout[r][width - 1] = 1; // Viền phải
    }
    
    // 3. Đổ đầy Tường Cứng (1) vào BÊN TRONG viền
    for (let r = 1; r < height - 1; r++) {
        for (let c = 1; c < width - 1; c++) {
            layout[r][c] = 1;
        }
    }

    let stack = [];
    
    // 4. Chọn 1 ô bắt đầu (phải là số lẻ) và "đào" nó
    let startR = 1, startC = 1; 
    if (startR % 2 === 0) startR++;
    if (startC % 2 === 0) startC++;
    if (startR >= height - 1) startR = 1;
    if (startC >= width - 1) startC = 1;

    layout[startR][startC] = 0; 
    stack.push([startR, startC]); 

    // 5. Vòng lặp "đào" (chỉ chạy BÊN TRONG viền)
    while (stack.length > 0) {
        let [r, c] = stack[stack.length - 1];
        let neighbors = [];
        
        if (r > 2 && layout[r-2][c] === 1) neighbors.push([r-2, c, 'up']);
        if (r < height - 3 && layout[r+2][c] === 1) neighbors.push([r+2, c, 'down']);
        if (c > 2 && layout[r][c-2] === 1) neighbors.push([r, c-2, 'left']);
        if (c < width - 3 && layout[r][c+2] === 1) neighbors.push([r, c+2, 'right']);

        if (neighbors.length > 0) {
            let [nr, nc, dir] = neighbors[Math.floor(Math.random() * neighbors.length)];
            
            if (dir === 'up') layout[r-1][c] = 0;
            if (dir === 'down') layout[r+1][c] = 0;
            if (dir === 'left') layout[r][c-1] = 0;
            if (dir === 'right') layout[r][c+1] = 0;
            
            layout[nr][nc] = 0;
            stack.push([nr, nc]);

        } else {
            stack.pop();
        }
    }
    
    // === BƯỚC 6: "Rắc" và "Đục" (POST-PROCESSING) ===
    
    // === THAY ĐỔI: Lặp qua TOÀN BỘ MAP (r=0, c=0) ===
    // (Để phá vỡ cả viền 1-ô)
    for (let r = 0; r < height; r++) { 
        for (let c = 0; c < width; c++) {
            
            // Nếu là Tường cứng (1)
            if (layout[r][c] === 1) {
                // Ưu tiên 1: Đục tường (tạo lối rộng) - 45% cơ hội
                if (Math.random() < MAZE_SPARSENESS_CHANCE) {
                    layout[r][c] = 0; 
                } 
                // Ưu tiên 2: Biến thành tường vỡ - 20% cơ hội
                else if (Math.random() < DESTRUCTIBLE_WALL_CHANCE) {
                    layout[r][c] = 5; 
                }
            } 
            // Nếu là Sàn (0)
            else if (layout[r][c] === 0) {
                // Biến thành vùng chậm - 10% cơ hội
                if (Math.random() < SLOW_ZONE_CHANCE) {
                    layout[r][c] = 3; 
                }
            }
        }
    }

    return layout;
}

/**
 * === HÀM getRandomMap ĐÃ SỬA ===
 */
export function getRandomMap(canvasWidth, canvasHeight) {
    
    // 1. Tính kích thước map CUỐI CÙNG (Full)
    MAP_WIDTH_CELLS = Math.floor(canvasWidth / CELL_SIZE);
    MAP_HEIGHT_CELLS = Math.floor(canvasHeight / CELL_SIZE);

    // 2. Đảm bảo kích thước tối thiểu
    if (MAP_WIDTH_CELLS < 11) MAP_WIDTH_CELLS = 11;
    if (MAP_HEIGHT_CELLS < 11) MAP_HEIGHT_CELLS = 11;

    // 3. Tạo ra map mê cung
    const mazeLayout = generateMazeLayout(MAP_WIDTH_CELLS, MAP_HEIGHT_CELLS);

    // 4. Trả về map
    const newMap = {
        name: "Procedural Maze (Wide Paths, Fullscreen)", 
        layout: mazeLayout
    };
    
    return newMap;
}

// === CÁC HÀM BÊN DƯỚI GIỮ NGUYÊN ===

// Vẽ map (PHIÊN BẢN NEON)
export function drawMap(ctx, map) {
    if (!map || !map.layout) return;

    ctx.shadowColor = "#00ffff"; 
    ctx.shadowBlur = 5; 

    for (let r = 0; r < map.layout.length; r++) {
        for (let c = 0; c < map.layout[r].length; c++) {
            const cellValue = map.layout[r][c];
            
            let color = null;
            let glow = false;

            if (cellValue === 1) {
                color = "#003333"; 
                ctx.strokeStyle = "#00ffff"; 
                glow = true;
            } else if (cellValue === 5) { 
                color = "#4d004d"; 
                ctx.strokeStyle = "#ff00ff"; 
                glow = true;
            } else if (cellValue === 4) { 
                color = "#660000"; 
                ctx.strokeStyle = "#ff005c"; 
                glow = true;
            } else if (cellValue === 3) {
                color = "#1a1a1a"; 
                ctx.shadowBlur = 0;
                ctx.fillStyle = color;
                ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                continue; 
            }

            if (color) {
                ctx.fillStyle = color; 
                if (glow) {
                    ctx.shadowBlur = 5; 
                    ctx.shadowColor = ctx.strokeStyle; 
                } else {
                    ctx.shadowBlur = 0;
                }
                
                ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                
                ctx.lineWidth = 1;
                ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
    
    ctx.shadowBlur = 0; 
}

// Hàm lấy loại ô (quan trọng)
export function getMapCellType(x, y, map) {
    const c = Math.floor(x / CELL_SIZE);
    const r = Math.floor(y / CELL_SIZE);

    if (r >= 0 && r < map.layout.length && c >= 0 && c < map.layout[0].length) {
        return map.layout[r][c];
    }
    
    return 1; // Mặc định ngoài map là tường cứng
}

// Hàm kiểm tra va chạm (quan trọng)
export function isBlocked(x, y, map) {
    const type = getMapCellType(x, y, map);
    return type === 1 || type === 5 || type === 4; 
}
