// --- CONFIGURATION (ข้อมูลของคุณถูกใส่ไว้แล้ว) ---
const LIFF_ID = "2007679100-KAeXEz6B";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzXnJIeHpqYt2225TzHPqUTwkfeoB6y8zLseDkbNJbgnYCeg4MbTUnyM0rm1HBz7C3y/exec";
// ------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    liff.init({ liffId: LIFF_ID })
        .then(() => {
            if (!liff.isLoggedIn()) {
                liff.login();
            }
        })
        .catch(err => console.error('LIFF Initialization failed', err));
});

document.getElementById('regForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusEl = document.getElementById('status');
    const submitButton = e.target.querySelector('button[type="submit"]');
    statusEl.textContent = "กำลังลงทะเบียน...";
    submitButton.disabled = true;

    try {
        const profile = await liff.getProfile();
        const lineUserId = profile.userId;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'register',
                username: username,
                password: password,
                lineUserId: lineUserId
            })
        });
        
        const result = await response.json();
        if (result.status === 'success') {
             statusEl.textContent = "ลงทะเบียนสำเร็จ! กรุณากลับไปหน้าล็อกอิน";
             statusEl.className = "text-center text-green-500 text-sm h-4";
             e.target.reset(); // Clear form
        } else {
            throw new Error(result.message || 'เกิดข้อผิดพลาด');
        }

    } catch (err) {
        console.error('Registration failed:', err);
        statusEl.textContent = "เกิดข้อผิดพลาด: " + err.message;
        statusEl.className = "text-center text-red-500 text-sm h-4";
    } finally {
        submitButton.disabled = false;
    }
});
