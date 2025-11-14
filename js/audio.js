// js/audio.js

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


export async function preloadAudio() {
    console.log("Đang tải các file âm thanh...");
    const audioPromises = []; // Tạo một mảng để chứa các Promise

    for (const key in SOUND_LIST) {
        if (key === 'music') continue; // Vẫn bỏ qua nhạc nền

        const promise = new Promise((resolve, reject) => {
            const audio = new Audio(SOUND_LIST[key]);
            
            // 'canplaythrough' là sự kiện đảm bảo audio đã được tải đủ
            audio.addEventListener('canplaythrough', () => {
                audioMap[key] = audio;
                // console.log(`Tải audio thành công: ${key}`); // Bỏ comment nếu muốn test
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
    // === SỬA: Chỉ phát nếu SFX không bị tắt ===
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
 * Khởi tạo và bắt đầu phát nhạc nền (chỉ chạy 1 lần)
 */
export function startMusic() {
    if (isMusicStarted) return;
    
    // === SỬA: Không khởi động nhạc nếu đang bị tắt ===
    if (isMusicMuted) {
        console.log("Nhạc nền đang bị tắt, sẽ không tự động phát.");
        return; 
    }
    
    console.log("Khởi động nhạc nền...");
    backgroundMusic = new Audio(SOUND_LIST.music);
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;
    
    backgroundMusic.play().then(() => {
        isMusicStarted = true;
        console.log("Đã phát nhạc nền.");
    }).catch(e => {
        console.error("Lỗi tự động phát nhạc (chờ người dùng click):", e);
    });
}

// === HÀM MỚI: Bật/Tắt Nhạc Nền ===
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

// === HÀM MỚI: Bật/Tắt Hiệu Ứng ===
export function toggleSfx() {
    isSfxMuted = !isSfxMuted;
    console.log(isSfxMuted ? "Đã TẮT hiệu ứng." : "Đã BẬT hiệu ứng.");
    return isSfxMuted; // Trả về trạng thái mới
}
