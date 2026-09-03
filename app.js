const CATS = {
  expense: ["🍜 อาหาร","🚗 เดินทาง","🛒 ของใช้","🎮 บันเทิง","💊 สุขภาพ","📦 อื่นๆ"],
  income:  ["💰 เงินเดือน","🎁 โบนัส","💵 ขายของ","📦 อื่นๆ"]
};

let type = "expense";
let cat = null;
let digits = "";

const $ = id => document.getElementById(id);

// ── แท็บสลับโหมด ──
$("tabOut").onclick = () => setType("expense");
$("tabIn").onclick  = () => setType("income");

function setType(t) {
  type = t; cat = null;
  $("tabOut").classList.toggle("on", t === "expense");
  $("tabIn").classList.toggle("on", t === "income");
  renderCats();
  checkReady();
}

// ── ปุ่มหมวดหมู่ ──
function renderCats() {
  const box = $("cats");
  box.innerHTML = "";
  CATS[type].forEach(c => {
    const b = document.createElement("button");
    b.textContent = c;
    b.onclick = () => {
      cat = c;
      [...box.children].forEach(x => x.classList.remove("on"));
      b.classList.add("on");
      checkReady();
    };
    box.appendChild(b);
  });
}

// ── ปุ่มตัวเลข ──
const KEYS = ["1","2","3","4","5","6","7","8","9","C","0","⌫"];
KEYS.forEach(k => {
  const b = document.createElement("button");
  b.textContent = k;
  b.onclick = () => {
    if (k === "C") digits = "";
    else if (k === "⌫") digits = digits.slice(0, -1);
    else if (digits.length < 7) digits += k;
    $("amount").textContent = Number(digits || 0).toLocaleString();
    checkReady();
  };
  $("pad").appendChild(b);
});

function checkReady() {
  $("saveBtn").disabled = !(cat && Number(digits) > 0);
}

// ── บันทึก ──

$("saveBtn").onclick = async () => {
  const note = $("note").value.trim();
  const { error } = await supabase.from("records").insert([{
    type, category: cat, amount: Number(digits),note: note || null
  }]);

  if (error) { $("msg").textContent = "❌ " + error.message; return; }

  $("msg").textContent = "✅ บันทึกแล้ว";
  digits = ""; cat = null;
  $("amount").textContent = "0";
  $("note").value = "";
  renderCats();
  checkReady();
  loadRecords();
  setTimeout(() => $("msg").textContent = "", 1500);
};

// ── ลบรายการ ──
async function delRecord(id) {
  await supabase.from("records").delete().eq("id", id);
  loadRecords();
}

// ── ดึงข้อมูลเก่า + คำนวณยอด ──
async function loadRecords() {
  const { data, error } = await supabase
    .from("records").select("*")
    .order("created_at", { ascending: false });

  if (error) { $("msg").textContent = "❌ " + error.message; return; }

  let inSum = 0, outSum = 0;
  const ul = $("list");
  ul.innerHTML = "";

  data.forEach(r => {
    const amt = Number(r.amount);
    r.type === "income" ? inSum += amt : outSum += amt;

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${r.category}</span>
      <span class="amt ${r.type === "income" ? "in" : "out"}">
        ${r.type === "income" ? "+" : "-"}${amt.toLocaleString()}
      </span>`;
    const del = document.createElement("button");
    del.className = "del"; del.textContent = "ลบ";
    del.onclick = () => delRecord(r.id);
    li.appendChild(del);
    ul.appendChild(li);
  });

  $("sumIn").textContent  = inSum.toLocaleString();
  $("sumOut").textContent = outSum.toLocaleString();
  $("balance").textContent = (inSum - outSum).toLocaleString() + " ฿";
}

setType("expense");
loadRecords();
