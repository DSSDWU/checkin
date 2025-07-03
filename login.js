// --- CONFIGURATION (ข้อมูลของคุณถูกใส่ไว้แล้ว) ---
const LIFF_ID = "2007679100-KAeXEz6B";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzXnJIeHpqYt2225TzHPqUTwkfeoB6y8zLseDkbNJbgnYCeg4MbTUnyM0rm1HBz7C3y/exec";
// ------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    liff.init({ liffId: LIFF_ID })
        .catch(err => console.error('LIFF Initialization failed', err));
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusEl = document.getElementById('status');
    const submitButton = e.target.querySelector('button[type="submit"]');
    statusEl.textContent = "กำลังตรวจสอบ...";
    submitButton.disabled = true;

    try {
        const profile = await liff.getProfile();
        const currentLineUserId = profile.userId;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'login',
                username: username,
                password: password,
                currentLineUserId: currentLineUserId
            })
        });
        
        const result = await response.json();
        if (result.status === 'success') {
            sessionStorage.setItem('loggedInUser', username);
            window.location.href = 'checkin.html';
        } else {
            throw new Error(result.message || 'ข้อมูลไม่ถูกต้อง');
        }

    } catch (err) {
        console.error('Login failed:', err);
        statusEl.textContent = "ล็อกอินไม่สำเร็จ: " + err.message;
        submitButton.disabled = false;
    }
});
