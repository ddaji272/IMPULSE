// js/audio.js

// --- PHẦN BẠN BỊ THIẾU ---
const audioMap = {};
let backgroundMusic = null;
let isMusicStarted = false;
// ------------------------

// Danh sách các âm thanh cần tải
// (Đã sửa đường dẫn theo đúng cấu trúc thư mục của bạn)
const SOUND_LIST = {
    // Sound Effects
    button_click: 'assets/sound-effects/button_click.wav',
    shoot: 'assets/sound-effects/shoot.wav',
    hitted: 'assets/sound-effects/hitted.wav',
    bounced: 'assets/sound-effects/bounced.wav',
    wall_crack: 'assets/sound-effects/wall_crack.wav',
    buy: 'assets/sound-effects/buy.wav',
    defeated: 'assets/sound-effects/defeated.wav',
    victory: 'assets/sound-effects/victory.wav',
    
    // Music (Tải riêng)
    music: 'assets/audio/nhac-nen.mp3' // Đảm bảo bạn đã đổi tên file này (bỏ dấu)
};

/**
 * Tải trước tất cả các hiệu ứng âm thanh (SFX)
 */
export function preloadAudio() {
    console.log("Đang tải các file âm thanh...");
    for (const key in SOUND_LIST) {
        if (key === 'music') continue; // Bỏ qua nhạc nền
        
        const audio = new Audio(SOUND_LIST[key]);
        audio.preload = 'auto';
        audioMap[key] = audio; // Dòng này sẽ hết lỗi vì audioMap đã được định nghĩa
    }
}

/**
 * Phát một hiệu ứng âm thanh (SFX)
 * @param {string} key Tên của âm thanh (ví dụ: 'shoot')
 */
export function playSound(key) {
    const audio = audioMap[key];
    if (audio) {
        // Tạm dừng và tua về 0 nếu âm thanh đang phát
        audio.currentTime = 0;
        audio.play().catch(e => console.warn(`Lỗi phát âm thanh: ${key}`, e));
    } else {
        console.warn(`Không tìm thấy âm thanh: ${key}`);
    }
}

/**
 * Khởi tạo và bắt đầu phát nhạc nền (chỉ chạy 1 lần)
 */
export function startMusic() {
    if (isMusicStarted) return; // Không chạy lại nếu đã chạy rồi
    
    console.log("Khởi động nhạc nền...");
    backgroundMusic = new Audio(SOUND_LIST.music);
    backgroundMusic.loop = true; // Lặp lại vô tận
    backgroundMusic.volume = 0.3; // Giảm âm lượng nhạc nền
    
    backgroundMusic.play().then(() => {
        isMusicStarted = true;
        console.log("Đã phát nhạc nền.");
    }).catch(e => {
        console.error("Lỗi tự động phát nhạc (chờ người dùng click):", e);
    });
}