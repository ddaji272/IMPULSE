// js/maps.js

export const CELL_SIZE = 60; // Kích thước ô (pixel)

// Biến lưu kích thước map (sẽ được cập nhật)
let MAP_WIDTH_CELLS = 16; 
let MAP_HEIGHT_CELLS = 9; 

// Các loại map
const MAPS = [
    {
        name: "Empty Border", // Chỉ có viền
        layout: []
    },
    {
        name: "Simple Columns", // Viền + Cột có cửa
        layout: []
    },
    {
        name: "Random Blocks", // Map ngẫu nhiên
        layout: []
    }
];

// Hàm tạo layout map động
function generateDynamicLayout(mapName) {
    let layout = Array(MAP_HEIGHT_CELLS).fill(0).map(() => Array(MAP_WIDTH_CELLS).fill(0));

    // 1. Luôn tạo viền xung quanh (Tường cứng: 1)
    for (let c = 0; c < MAP_WIDTH_CELLS; c++) {
        layout[0][c] = 1; // Viền trên
        layout[MAP_HEIGHT_CELLS - 1][c] = 1; // Viền dưới
    }
    for (let r = 0; r < MAP_HEIGHT_CELLS; r++) {
        layout[r][0] = 1; // Viền trái
        layout[r][MAP_WIDTH_CELLS - 1] = 1; // Viền phải
    }

    // 2. Thêm chướng ngại vật
    if (mapName === "Simple Columns") {
        const col1 = Math.floor(MAP_WIDTH_CELLS / 3);
        const col2 = Math.floor(MAP_WIDTH_CELLS * 2 / 3);
        
        for (let r = 2; r < MAP_HEIGHT_CELLS - 2; r++) {
            layout[r][col1] = 1; // Tường cứng
            layout[r][col2] = 1; // Tường cứng
        }
        
        // Đục 2 lỗ (cửa)
        const doorPosition = Math.floor(MAP_HEIGHT_CELLS / 2);
        layout[doorPosition][col1] = 0;
        layout[doorPosition][col2] = 0;
        if (doorPosition + 1 < MAP_HEIGHT_CELLS - 1) {
             layout[doorPosition + 1][col1] = 0;
             layout[doorPosition + 1][col2] = 0;
        }

    } else if (mapName === "Random Blocks") {
        // Tạo các khối ngẫu nhiên
        for (let i = 0; i < (MAP_WIDTH_CELLS * MAP_HEIGHT_CELLS) / 10; i++) { 
            let r = Math.floor(Math.random() * (MAP_HEIGHT_CELLS - 2)) + 1;
            let c = Math.floor(Math.random() * (MAP_WIDTH_CELLS - 2)) + 1;
            
            const rand = Math.random();
            if (rand < 0.33) {
                layout[r][c] = 1; // Tường cứng (1)
            } else if (rand < 0.66) {
                layout[r][c] = 5; // Tường phá hủy (Khởi tạo HP=2, giá trị 5) **ĐÃ SỬA**
            } else {
                layout[r][c] = 3; // Vùng giảm tốc (3)
            }
        }
    }
    
    return layout;
}

// Lấy map ngẫu nhiên
export function getRandomMap(canvasWidth, canvasHeight) {
    MAP_WIDTH_CELLS = Math.floor(canvasWidth / CELL_SIZE);
    MAP_HEIGHT_CELLS = Math.floor(canvasHeight / CELL_SIZE);

    if (MAP_WIDTH_CELLS < 10) MAP_WIDTH_CELLS = 10;
    if (MAP_HEIGHT_CELLS < 10) MAP_HEIGHT_CELLS = 10;

    const randomIndex = Math.floor(Math.random() * MAPS.length);
    const selectedMap = MAPS[randomIndex];
    
    selectedMap.layout = generateDynamicLayout(selectedMap.name);
    return selectedMap;
}


// Vẽ map (PHIÊN BẢN NEON)
export function drawMap(ctx, map) {
    if (!map || !map.layout) return;

    // Đặt màu và hiệu ứng phát sáng mặc định cho tường
    ctx.shadowColor = "#00ffff"; 
    ctx.shadowBlur = 5; 

    for (let r = 0; r < map.layout.length; r++) {
        for (let c = 0; c < map.layout[r].length; c++) {
            const cellValue = map.layout[r][c];
            
            let color = null;
            let glow = false;

            if (cellValue === 1) {
                // Tường cứng (xanh đậm/cyborg)
                color = "#003333"; 
                ctx.strokeStyle = "#00ffff"; // Viền neon xanh
                glow = true;
            } else if (cellValue === 5) { 
                // Tường Phá Hủy (Độ bền 2/2)
                color = "#4d004d"; // Tím đậm
                ctx.strokeStyle = "#ff00ff"; // Viền neon tím
                glow = true;
            } else if (cellValue === 4) { 
                // Tường Phá Hủy (Độ bền 1/2) - Gần hỏng
                color = "#660000"; // Đỏ đậm
                ctx.strokeStyle = "#ff005c"; // Viền neon đỏ
                glow = true;
            } else if (cellValue === 3) {
                // Vùng giảm tốc (Chỉ làm mờ, không phát sáng mạnh)
                color = "#1a1a1a"; // Xám rất đậm
                ctx.shadowBlur = 0;
                ctx.fillStyle = color;
                ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                continue; // Bỏ qua viền và glow cho vùng giảm tốc
            }

            if (color) {
                ctx.fillStyle = color; 
                if (glow) {
                    ctx.shadowBlur = 5; 
                    ctx.shadowColor = ctx.strokeStyle; // Bóng theo màu viền
                } else {
                    ctx.shadowBlur = 0;
                }
                
                ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                
                // Vẽ viền (border) để tạo hiệu ứng lưới điện tử
                ctx.lineWidth = 1;
                ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
    
    ctx.shadowBlur = 0; // Tắt glow sau khi vẽ map
}

// Hàm lấy loại ô (quan trọng)
export function getMapCellType(x, y, map) {
    const c = Math.floor(x / CELL_SIZE);
    const r = Math.floor(y / CELL_SIZE);

    if (r >= 0 && r < map.layout.length && c >= 0 && c < map.layout[0].length) {
        return map.layout[r][c]; // Trả về 0 (trống), 1 (cứng), 3 (giảm tốc), 4 hoặc 5 (phá hủy)
    }
    
    return 1; // Mặc định ngoài map là tường cứng
}

// Hàm kiểm tra va chạm (quan trọng)
export function isBlocked(x, y, map) {
    // Player/Bot bị chặn bởi Tường cứng (1) và Tường phá hủy (4 hoặc 5).
    const type = getMapCellType(x, y, map);
    return type === 1 || type === 5 || type === 4; // **ĐÃ SỬA**
}
