const audioMap = {};
let backgroundMusic = null;
let isMusicStarted = false;

// === BIẾN ĐIỀU KHIỂN ÂM LƯỢNG ===
let isMusicMuted = false;
let isSfxMuted = false;

// Danh sách các âm thanh cần tải
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
    
    // Music
    music: 'assets/audio/nhac-nen.mp3'
};


/**
 * === SỬA LẠI: Tải trước TẤT CẢ âm thanh, bao gồm cả nhạc nền ===
 */
export async function preloadAudio() {
    console.log("Đang tải các file âm thanh...");
    const audioPromises = []; // Tạo một mảng để chứa các Promise

    for (const key in SOUND_LIST) {
        // XÓA DÒNG "if (key === 'music') continue;"

        const promise = new Promise((resolve, reject) => {
            const audio = new Audio(SOUND_LIST[key]);
            
            audio.addEventListener('canplaythrough', () => {
                // === SỬA LẠI: Phân loại nhạc và SFX ===
                if (key === 'music') {
                    // Đây là nhạc nền
                    backgroundMusic = audio; // Gán vào biến toàn cục
                    backgroundMusic.loop = true;
                    backgroundMusic.volume = 0.3;
                    console.log("Tải nhạc nền thành công.");
                } else {
                    // Đây là SFX
                    audioMap[key] = audio; // Gán vào audioMap
                }
                resolve(); // Báo cho Promise là đã xong
            });

            audio.addEventListener('error', (e) => {
                console.error(`Lỗi tải audio: ${key}`, e);
                reject(new Error(`Lỗi tải ${key}`));
            });

            // Yêu cầu trình duyệt bắt đầu tải
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
 * === SỬA LẠI: Hàm này giờ chỉ phát nhạc đã được tải trước ===
 */
export function startMusic() {
    if (isMusicStarted) return;
    if (isMusicMuted) {
        console.log("Nhạc nền đang bị tắt, sẽ không tự động phát.");
        return; 
    }
    
    // Kiểm tra xem nhạc đã được tải chưa
    if (!backgroundMusic) {
        console.error("Lỗi: startMusic() được gọi trước khi preloadAudio() hoàn tất.");
        return;
    }
    
    console.log("Khởi động nhạc nền (từ file đã tải)...");
    
    backgroundMusic.play().then(() => {
        isMusicStarted = true;
        console.log("Đã phát nhạc nền.");
    }).catch(e => {
        // Lỗi này vẫn có thể xảy ra nếu người dùng chưa click
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
            // Nếu nhạc chưa bao giờ bắt đầu, hãy thử bắt đầu ngay
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
