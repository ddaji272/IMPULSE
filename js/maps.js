// js/maps.js

export const CELL_SIZE = 60; // Kích thước ô (pixel)

// Biến lưu kích thước map (sẽ được cập nhật)
let MAP_WIDTH_CELLS = 16; 
let MAP_HEIGHT_CELLS = 9; 

// Các loại map
const MAPS = [
    {
        name: "Empty Border",
        layout: [] // Sẽ được tạo động
    },
    {
        name: "Simple Columns",
        layout: [] // Sẽ được tạo động
    },
    {
        name: "Random Blocks",
        layout: [] // Sẽ được tạo động
    }
];

// Hàm tạo layout map động (SỬA LẠI HOÀN TOÀN)
function generateDynamicLayout(mapName) {
    let layout = Array(MAP_HEIGHT_CELLS).fill(0).map(() => Array(MAP_WIDTH_CELLS).fill(0));

    // 1. Luôn tạo viền xung quanh
    for (let c = 0; c < MAP_WIDTH_CELLS; c++) {
        layout[0][c] = 1; // Viền trên
        layout[MAP_HEIGHT_CELLS - 1][c] = 1; // Viền dưới
    }
    for (let r = 0; r < MAP_HEIGHT_CELLS; r++) {
        layout[r][0] = 1; // Viền trái
        layout[r][MAP_WIDTH_CELLS - 1] = 1; // Viền phải
    }

    // 2. Thêm chướng ngại vật dựa trên loại map
    if (mapName === "Simple Columns") {
        const col1 = Math.floor(MAP_WIDTH_CELLS / 3);
        const col2 = Math.floor(MAP_WIDTH_CELLS * 2 / 3);
        
        for (let r = 2; r < MAP_HEIGHT_CELLS - 2; r++) {
            layout[r][col1] = 1; // Vẽ cột 1
            layout[r][col2] = 1; // Vẽ cột 2
        }
        
        // ========== SỬA LỖI ==========
        // Đục 2 lỗ (cửa) trên tường để đảm bảo có thể đi qua
        const doorPosition = Math.floor(MAP_HEIGHT_CELLS / 2);
        layout[doorPosition][col1] = 0;
        layout[doorPosition][col2] = 0;
        // Thêm 1 ô nữa cho cửa rộng hơn
        if (doorPosition + 1 < MAP_HEIGHT_CELLS - 1) {
             layout[doorPosition + 1][col1] = 0;
             layout[doorPosition + 1][col2] = 0;
        }
        // ===============================

    } else if (mapName === "Random Blocks") {
        // Tạo các khối ngẫu nhiên, nhưng không quá nhiều
        for (let i = 0; i < (MAP_WIDTH_CELLS * MAP_HEIGHT_CELLS) / 10; i++) { // 10% số ô là tường
            let r = Math.floor(Math.random() * (MAP_HEIGHT_CELLS - 2)) + 1; // Không đè lên viền
            let c = Math.floor(Math.random() * (MAP_WIDTH_CELLS - 2)) + 1; // Không đè lên viền
            
            layout[r][c] = 1;
        }
    }
    // "Empty Border" không cần làm gì thêm
    
    return layout;
}

// Lấy map ngẫu nhiên (SỬA LẠI)
export function getRandomMap(canvasWidth, canvasHeight) {
    // Tính toán kích thước map (số ô) dựa trên kích thước canvas
    MAP_WIDTH_CELLS = Math.floor(canvasWidth / CELL_SIZE);
    MAP_HEIGHT_CELLS = Math.floor(canvasHeight / CELL_SIZE);

    // Đảm bảo map không quá nhỏ
    if (MAP_WIDTH_CELLS < 10) MAP_WIDTH_CELLS = 10;
    if (MAP_HEIGHT_CELLS < 10) MAP_HEIGHT_CELLS = 10;

    const randomIndex = Math.floor(Math.random() * MAPS.length);
    const selectedMap = MAPS[randomIndex];
    
    // Tạo layout động cho map được chọn
    selectedMap.layout = generateDynamicLayout(selectedMap.name);

    return selectedMap;
}


// Hàm vẽ map (Giữ nguyên)
export function drawMap(ctx, map) {
    if (!map || !map.layout) return;

    ctx.fillStyle = "#555"; // Màu tường
    for (let r = 0; r < map.layout.length; r++) {
        for (let c = 0; c < map.layout[r].length; c++) {
            if (map.layout[r][c] === 1) {
                ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}

// Hàm kiểm tra va chạm (Giữ nguyên)
export function isBlocked(x, y, map) {
    const c = Math.floor(x / CELL_SIZE);
    const r = Math.floor(y / CELL_SIZE);

    if (r >= 0 && r < map.layout.length && c >= 0 && c < map.layout[0].length) {
        return map.layout[r][c] === 1;
    }
    
    // Nếu ra ngoài map (vùng đen) thì coi như là tường (bị chặn)
    // Sửa lại: Lẽ ra game.js phải xử lý va chạm biên, nhưng để an toàn, coi như bên ngoài là tường
    return true; 
}