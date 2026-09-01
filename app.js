const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const msg = document.getElementById("msg");
const list = document.getElementById("list");

// โหลดข้อมูลทั้งหมด
async function loadItems() {
  const { data, error } = await sb
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    msg.textContent = "โหลดไม่สำเร็จ: " + error.message;
    return;
  }

  list.innerHTML = data
    .map(i => `<li>${i.name} — ${i.note ?? ""}
      <button type="button" onclick="delItem(${i.id})">ลบ</button></li>`)
    .join("");
}

// เพิ่มข้อมูล
async function addItem() {
  const name = document.getElementById("name").value.trim();
  const note = document.getElementById("note").value.trim();

  if (!name) {
    msg.textContent = "กรุณากรอกชื่อ";
    return;
  }

  const { error } = await sb.from("items").insert({ name, note });

  if (error) {
    msg.textContent = "บันทึกไม่สำเร็จ: " + error.message;
    return;
  }

  document.getElementById("name").value = "";
  document.getElementById("note").value = "";
  msg.textContent = "บันทึกแล้ว ✅";
  loadItems();
}

// ลบข้อมูล
async function delItem(id) {
  const { error } = await sb.from("items").delete().eq("id", id);
  if (error) {
    msg.textContent = "ลบไม่สำเร็จ: " + error.message;
    return;
  }
  loadItems();
}

window.addItem = addItem;
window.delItem = delItem;

loadItems();
