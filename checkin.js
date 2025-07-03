// --- CONFIGURATION (ข้อมูลของคุณถูกใส่ไว้แล้ว) ---
const LIFF_ID = "2007679100-KAeXEz6B";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzXnJIeHpqYt2225TzHPqUTwkfeoB6y8zLseDkbNJbgnYCeg4MbTUnyM0rm1HBz7C3y/exec";
// ------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
    // --- Element References ---
    const datetimeEl = document.getElementById('datetime');
    const mapEl = document.getElementById('map');
    const previewEl = document.getElementById('preview');
    const takeSelfieBtn = document.getElementById('takeSelfieBtn');
    const selfieInput = document.getElementById('selfieInput');
    const selfieSection = document.getElementById('selfie-section');
    const actionButtons = document.getElementById('action-buttons');
    const checkinBtn = document.getElementById('checkinBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const takeAnotherBtn = document.getElementById('takeAnotherBtn');
    const statusEl = document.getElementById('status');
    const historyContainer = document.getElementById('history-container');
    const retryLocationSection = document.getElementById('retry-location-section');
    const retryLocationBtn = document.getElementById('retryLocationBtn');

    let selfieFile = null;
    let currentLocation = null;
    let map = null;
    const username = sessionStorage.getItem('loggedInUser');

    if (!username) {
        window.location.href = 'index.html';
        return;
    }

    // --- Initialize LIFF ---
    try {
        await liff.init({ liffId: LIFF_ID });
        if (!liff.isLoggedIn()) liff.login();
    } catch (err) {
        console.error('LIFF Init failed', err);
        statusEl.textContent = "LIFF Error";
    }

    // --- Functions ---
    const updateTime = () => {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        datetimeEl.textContent = now.toLocaleDateString('th-TH', options).replace(' พ.ศ. ', '/').replace(' น.', ' AM');
    };

    const initializeMap = (lat, lng) => {
        if (map) map.remove();
        map = L.map(mapEl).setView([lat, lng], 17);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        L.marker([lat, lng], { title: "You Are Here" }).addTo(map)
         .bindPopup('ตำแหน่งของคุณ').openPopup();
    };

    const fetchLocation = async () => {
        statusEl.textContent = 'กำลังตรวจสอบสิทธิ์...';
        statusEl.className = 'text-center text-sm h-4 mb-4 text-gray-500';
        retryLocationSection.classList.add('hidden');

        // Check if API is available first
        if (!liff.isApiAvailable('getLocation')) {
            statusEl.textContent = 'ฟังก์ชันตำแหน่งไม่พร้อมใช้งานบนอุปกรณ์นี้';
            statusEl.className = 'text-center text-sm h-4 mb-4 text-red-500';
            initializeMap(13.7563, 100.5018); // Default map
            return;
        }

        try {
            const permissionStatus = await liff.permission.query('geolocation');
            if (permissionStatus.state === 'granted') {
                statusEl.textContent = 'กำลังระบุตำแหน่ง...';
                currentLocation = await liff.getLocation();
                initializeMap(currentLocation.latitude, currentLocation.longitude);
                statusEl.textContent = ''; // Clear status on success
            } else if (permissionStatus.state === 'prompt') {
                statusEl.textContent = 'กรุณาอนุญาตให้เข้าถึงตำแหน่ง';
                await liff.permission.requestAll();
                // After requesting, guide user to click the retry button
                statusEl.textContent = 'ขอบคุณครับ! กรุณากด "ลองระบุตำแหน่งอีกครั้ง"';
                retryLocationSection.classList.remove('hidden');
            } else { // 'denied'
                throw new Error("คุณปฏิเสธการเข้าถึงตำแหน่ง! กรุณาเปิดสิทธิ์ใน การตั้งค่า > LINE > สิทธิ์ของแอป > ตำแหน่ง");
            }
        } catch (error) {
            console.error("Location Fetch Error:", error);
            statusEl.textContent = error.message || "เกิดข้อผิดพลาดในการระบุตำแหน่ง";
            statusEl.className = 'text-center text-sm h-4 mb-4 text-red-500';
            retryLocationSection.classList.remove('hidden');
            initializeMap(13.7563, 100.5018); // Default map
        }
    };
    
    const fetchHistory = async () => {
        historyContainer.innerHTML = '<p class="text-gray-500">กำลังโหลดประวัติ...</p>';
        try {
            const response = await fetch(`${APPS_SCRIPT_URL}?action=getHistory&username=${username}`);
            const result = await response.json();
            if (result.status === 'success' && result.data.length > 0) {
                historyContainer.innerHTML = result.data.map(item => `
                    <div class="flex items-center space-x-4 p-2 border-b">
                        <img src="${item.imageUrl}" class="w-12 h-12 rounded-full object-cover">
                        <div class="flex-grow">
                            <p class="font-bold ${item.status === 'Check In' ? 'text-green-600' : 'text-red-600'}">${item.status}</p>
                            <p class="text-sm text-gray-600">${item.date} ${item.time}</p>
                        </div>
                    </div>
                `).join('');
            } else {
                historyContainer.innerHTML = '<p class="text-gray-500">ยังไม่มีประวัติการลงเวลา</p>';
            }
        } catch (error) {
            console.error('Fetch history error:', error);
            historyContainer.innerHTML = '<p class="text-red-500">ไม่สามารถโหลดประวัติได้</p>';
        }
    };

    const handleCheckinProcess = async (action) => {
        if (!selfieFile) {
            alert("กรุณาถ่ายรูปก่อน");
            return;
        }
        if (!currentLocation) {
            alert("กรุณารอให้ระบบระบุตำแหน่งให้เสร็จสิ้น หรือกดปุ่ม 'ลองอีกครั้ง'");
            return;
        }
        statusEl.textContent = `กำลัง ${action === 'checkin' ? 'Check In' : 'Check Out'}...`;
        actionButtons.classList.add('hidden');

        try {
            const formData = new FormData();
            formData.append('action', action);
            formData.append('username', username);
            formData.append('latitude', currentLocation.latitude);
            formData.append('longitude', currentLocation.longitude);
            formData.append('selfieImage', selfieFile);

            const response = await fetch(APPS_SCRIPT_URL, { method: 'POST', body: formData });
            const result = await response.json();

            if (result.status === 'success') {
                statusEl.textContent = `${action === 'checkin' ? 'Check In' : 'Check Out'} สำเร็จ!`;
                statusEl.className = 'text-center text-sm h-4 mb-4 text-green-600';
                await fetchHistory();
                // Reset for next action
                 setTimeout(() => {
                    takeAnotherBtn.click();
                    statusEl.textContent = '';
                }, 2000);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error(`Process failed:`, error);
            statusEl.textContent = `เกิดข้อผิดพลาด: ${error.message}`;
            statusEl.className = 'text-center text-sm h-4 mb-4 text-red-500';
            actionButtons.classList.remove('hidden');
        }
    };

    // --- Event Listeners ---
    takeSelfieBtn.addEventListener('click', () => selfieInput.click());
    takeAnotherBtn.addEventListener('click', () => {
        selfieFile = null;
        selfieInput.value = ''; // Clear the file input
        previewEl.classList.add('hidden');
        selfieSection.classList.remove('hidden');
        actionButtons.classList.add('hidden');
    });
    retryLocationBtn.addEventListener('click', fetchLocation);

    selfieInput.addEventListener('change', (event) => {
        if (event.target.files && event.target.files.length > 0) {
            selfieFile = event.target.files[0];
            previewEl.src = URL.createObjectURL(selfieFile);
            previewEl.classList.remove('hidden');
            selfieSection.classList.add('hidden');
            actionButtons.classList.remove('hidden');
        }
    });
    
    checkinBtn.addEventListener('click', () => handleCheckinProcess('checkin'));
    checkoutBtn.addEventListener('click', () => handleCheckinProcess('checkout'));

    // --- Initial Load ---
    updateTime();
    setInterval(updateTime, 1000);
    await fetchLocation();
    await fetchHistory();
});
