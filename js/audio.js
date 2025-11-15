const audioMap = {};
let backgroundMusic = null;
let isMusicStarted = false;

// === BIẾN ĐIỀU KHIỂN ÂM LƯỢNG ===
let isMusicMuted = false;
let isSfxMuted = false;

// === SỬA LỖI VERCEL: Thêm dấu "/" vào đầu các đường dẫn ===
const SOUND_LIST = {
    // Sound Effects
    button_click: '/assets/sound-effects/button_click.wav',
    shoot: '/assets/sound-effects/shoot.wav',
    hitted: '/assets/sound-effects/hitted.wav',
    bounced: '/assets/sound-effects/bounced.wav',
    wall_crack: '/assets/sound-effects/wall_crack.wav',
    buy: '/assets/sound-effects/buy.wav',
    defeated: '/assets/sound-effects/defeated.wav',
    victory: '/assets/sound-effects/victory.wav',
    
    // Music
    music: '/assets/audio/music.mp3'
};
// =======================================================


/**
 * === Tải trước TẤT CẢ âm thanh (Logic này đã đúng) ===
 */
export async function preloadAudio() {
    console.log("Đang tải các file âm thanh...");
    const audioPromises = []; // Tạo một mảng để chứa các Promise

    for (const key in SOUND_LIST) {
        const promise = new Promise((resolve, reject) => {
            const audio = new Audio(SOUND_LIST[key]);
            
            audio.addEventListener('canplaythrough', () => {
                if (key === 'music') {
                    backgroundMusic = audio; 
                    backgroundMusic.loop = true;
                    backgroundMusic.volume = 0.3;
                    console.log("Tải nhạc nền thành công.");
                } else {
                    audioMap[key] = audio; 
                }
                resolve(); 
            });

            audio.addEventListener('error', (e) => {
                console.error(`Lỗi tải audio: ${key}`, e);
                reject(new Error(`Lỗi tải ${key}`));
            });

            audio.load(); 
        });

        audioPromises.push(promise);
    }

    // Chờ cho TẤT CẢ các promise âm thanh hoàn tất
    try {
        await Promise.all(audioPromises);
        console.log("Tải âm thanh hoàn tất!");
    } catch (error) {
        console.error("Đã xảy ra lỗi trong quá trình tải âm thanh.", error);
    }
}

/**
 * Phát một hiệu ứng âm thanh (SFX)
 */
export function playSound(key) {
    if (isSfxMuted) return; 

    const audio = audioMap[key];
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.warn(`Lỗi phát âm thanh: ${key}`, e));
    } else {
        console.warn(`Không tìm thấy âm thanh: ${key}`);
    }
}

/**
 * Phát nhạc đã được tải trước
 */
export function startMusic() {
    if (isMusicStarted) return;
    if (isMusicMuted) {
        console.log("Nhạc nền đang bị tắt, sẽ không tự động phát.");
        return; 
    }
    
    if (!backgroundMusic) {
        console.error("Lỗi: startMusic() được gọi trước khi preloadAudio() hoàn tất.");
        return;
    }
    
    console.log("Khởi động nhạc nền (từ file đã tải)...");
    
    backgroundMusic.play().then(() => {
        isMusicStarted = true;
        console.log("Đã phát nhạc nền.");
    }).catch(e => {
        console.error("Lỗi tự động phát nhạc (chờ người dùng click):", e);
    });
}

// === HÀM Bật/Tắt Nhạc Nền (Giữ nguyên) ===
export function toggleMusic() {
    isMusicMuted = !isMusicMuted;
    
    if (isMusicMuted) {
        if (backgroundMusic && isMusicStarted) {
            backgroundMusic.pause();
        }
        console.log("Đã TẮT nhạc nền.");
    } else {
        if (backgroundMusic && isMusicStarted) {
            backgroundMusic.play();
        } else if (!isMusicStarted) {
            startMusic();
        }
        console.log("Đã BẬT nhạc nền.");
    }
    return isMusicMuted; // Trả về trạng thái mới
}

// === HÀM Bật/Tắt Hiệu Ứng (Giữ nguyên) ===
export function toggleSfx() {
    isSfxMuted = !isSfxMuted;
    console.log(isSfxMuted ? "Đã TẮT hiệu ứng." : "Đã BẬT hiệu ứng.");
    return isSfxMuted; // Trả về trạng thái mới
}

