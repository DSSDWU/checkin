// --- แก้ไขค่าเหล่านี้ ---
const LIFF_ID = "2007679100-KAeXEz6B";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzXnJIeHpqYt2225TzHPqUTwkfeoB6y8zLseDkbNJbgnYCeg4MbTUnyM0rm1HBz7C3y/exec";
// --------------------

document.addEventListener('DOMContentLoaded', () => {
    liff.init({ liffId: LIFF_ID })
        .then(() => {
            if (!liff.isLoggedIn()) {
                liff.login();
            }
        })
        .catch(err => console.error(err));
});

document.getElementById('regForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('status').innerText = "กำลังลงทะเบียน...";

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
             document.getElementById('status').innerText = "ลงทะเบียนสำเร็จ! กรุณากลับไปหน้าล็อกอิน";
        } else {
            throw new Error(result.message);
        }

    } catch (err) {
        console.error('Registration failed:', err);
        document.getElementById('status').innerText = "เกิดข้อผิดพลาด: " + err.message;
    }
});