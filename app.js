// ============================
// 🔑 ตั้งค่า Supabase ของคุณตรงนี้
// ============================
const SUPABASE_URL = "https://onjvnijtotxnnecxfgvk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_QihvN4zm6Fwq-lso7UZH7g_fqgXnLnt";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================
// หน้า index.html — ส่ง OTP
// ============================
async function sendOtp() {
  const email = document.getElementById("email").value.trim();
  const msg = document.getElementById("msg");

  if (!email) {
    msg.textContent = "กรุณากรอกอีเมล";
    return;
  }

  const { error } = await supabase.auth.signInWithOtp({ email });

  if (error) {
    msg.textContent = "เกิดข้อผิดพลาด: " + error.message;
  } else {
    localStorage.setItem("pendingEmail", email);
    window.location.href = "otp.html";
  }
}

// ============================
// หน้า otp.html — ยืนยัน OTP
// ============================
async function verifyOtp() {
  const email = localStorage.getItem("pendingEmail");
  const token = document.getElementById("otpCode").value.trim();
  const msg = document.getElementById("msg");

  if (!email) {
    window.location.href = "index.html";
    return;
  }

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email"
  });

  if (error) {
    msg.textContent = "รหัสไม่ถูกต้อง: " + error.message;
  } else {
    localStorage.removeItem("pendingEmail");
    window.location.href = "app.html";
  }
}

// ============================
// หน้า app.html — ตัวโปรแกรมหลัก
// ============================
async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = "index.html";
    return null;
  }
  return session;
}

async function logout() {
  await supabase.auth.signOut();
  window.location.href = "index.html";
}

async function loadTransactions() {
  const session = await checkAuth();
  if (!session) return;

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  renderList(data);
  renderSummary(data);
}

function renderSummary(data) {
  let income = 0, expense = 0;
  data.forEach(t => {
    if (t.type === "income") income += Number(t.amount);
    else expense += Number(t.amount);
  });

  document.getElementById("totalIncome").textContent = income.toLocaleString();
  document.getElementById("totalExpense").textContent = expense.toLocaleString();
  document.getElementById("totalBalance").textContent = (income - expense).toLocaleString();
}

function renderList(data) {
  const list = document.getElementById("list");
  list.innerHTML = "";

  data.forEach(t => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `
      <div>
        <div>${t.category || "-"} ${t.note ? "· " + t.note : ""}</div>
        <div class="meta">${new Date(t.created_at).toLocaleString("th-TH")}</div>
      </div>
      <div style="display:flex; align-items:center;">
        <span class="amount ${t.type}">${t.type === "income" ? "+" : "-"}${Number(t.amount).toLocaleString()}</span>
        <span class="del" onclick="deleteTransaction('${t.id}')">ลบ</span>
      </div>
    `;
    list.appendChild(item);
  });
}

async function addTransaction() {
  const session = await checkAuth();
  if (!session) return;

  const type = document.getElementById("type").value;
  const amount = document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const note = document.getElementById("note").value;

  if (!amount || Number(amount) <= 0) {
    alert("กรุณากรอกจำนวนเงินให้ถูกต้อง");
    return;
  }

  const { error } = await supabase.from("transactions").insert({
    user_id: session.user.id,
    type,
    amount: Number(amount),
    category,
    note
  });

  if (error) {
    alert("บันทึกไม่สำเร็จ: " + error.message);
    return;
  }

  document.getElementById("amount").value = "";
  document.getElementById("category").value = "";
  document.getElementById("note").value = "";

  loadTransactions();
}

async function deleteTransaction(id) {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) {
    alert("ลบไม่สำเร็จ: " + error.message);
    return;
  }
  loadTransactions();
}

// ============================
// เรียกใช้เมื่อโหลดหน้า app.html
// ============================
if (window.location.pathname.includes("app.html")) {
  loadTransactions();
}
