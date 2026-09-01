const SUPABASE_URL = "https://onjvnijtotxnnecxfgvk.supabase.co";
const SUPABASE_KEY = "sb_publishable_QihvN4zm6Fwq-lso7UZH7g_fqgXnLnt";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function sendOtp() {
  const email = document.getElementById("email").value.trim();
  const msg = document.getElementById("msg");

  if (!email) {
    msg.textContent = "กรุณากรอกอีเมล";
    return;
  }

  msg.textContent = "กำลังส่ง...";

  const { error } = await sb.auth.signInWithOtp({ email });

  msg.textContent = error ? "ผิดพลาด: " + error.message : "ส่งรหัสไปที่อีเมลแล้ว ✅";
}

window.sendOtp = sendOtp;
