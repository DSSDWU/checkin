// --- แก้ไขค่าเหล่านี้ ---
const LIFF_ID = "2007679100-KAeXEz6B";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzXnJIeHpqYt2225TzHPqUTwkfeoB6y8zLseDkbNJbgnYCeg4MbTUnyM0rm1HBz7C3y/exec";
// --------------------

document.addEventListener('DOMContentLoaded', () => {
    liff.init({ liffId: LIFF_ID })
        .catch(err => console.error(err));

    const takeSelfieBtn = document.getElementById('takeSelfieBtn');
    const selfieInput = document.getElementById('selfieInput');
    const preview = document.getElementById('preview');
    const checkinBtn = document.getElementById('checkinBtn');
    const status = document.getElementById('status');
    
    let selfieFile = null;

    takeSelfieBtn.addEventListener('click', () => selfieInput.click());

    selfieInput.addEventListener('change', (event) => {
        selfieFile = event.target.files[0];
        if (selfieFile) {
            preview.src = URL.createObjectURL(selfieFile);
            preview.style.display = 'block';
            checkinBtn.disabled = false;
        }
    });

    checkinBtn.addEventListener('click', async () => {
        if (!selfieFile) {
            alert("กรุณาถ่ายรูปก่อน");
            return;
        }
        status.innerText = "กำลังระบุตำแหน่งและบันทึกข้อมูล...";

        try {
            const currentLocation = await liff.getLocation();
            
            const map = L.map('map').setView([currentLocation.latitude, currentLocation.longitude], 16);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            L.marker([currentLocation.latitude, currentLocation.longitude]).addTo(map);

            const formData = new FormData();
            formData.append('action', 'checkin');
            // ดึง username จาก sessionStorage ที่บันทึกไว้ตอนล็อกอิน
            formData.append('username', sessionStorage.getItem('loggedInUser') || 'unknown');
            formData.append('latitude', currentLocation.latitude);
            formData.append('longitude', currentLocation.longitude);
            formData.append('selfieImage', selfieFile);

            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (result.status === 'success') {
                status.innerText = "เช็คอินสำเร็จ!";
                checkinBtn.disabled = true;
            } else {
                 throw new Error(result.message);
            }

        } catch (err) {
            status.innerText = `เกิดข้อผิดพลาด: ${err.message}`;
        }
    });
});