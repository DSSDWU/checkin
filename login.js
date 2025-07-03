// --- แก้ไขค่าเหล่านี้ ---
const LIFF_ID = "2007679100-KAeXEz6B";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzXnJIeHpqYt2225TzHPqUTwkfeoB6y8zLseDkbNJbgnYCeg4MbTUnyM0rm1HBz7C3y/exec";
// --------------------

document.addEventListener('DOMContentLoaded', () => {
    liff.init({ liffId: LIFF_ID })
        .catch(err => console.error(err));
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('status').innerText = "กำลังตรวจสอบ...";

    try {
        const profile = await liff.getProfile();
        const currentLineUserId = profile.userId;

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // บันทึก username ไว้ใน sessionStorage เพื่อใช้ในหน้า check-in
        sessionStorage.setItem('loggedInUser', username);

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
            window.location.href = './checkin.html';
        } else {
            throw new Error(result.message);
        }

    } catch (err) {
        console.error('Login failed:', err);
        document.getElementById('status').innerText = "ล็อกอินไม่สำเร็จ: " + err.message;
    }
});