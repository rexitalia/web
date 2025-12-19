/* script.js
   Sederhana: menyimpan data anggota di localStorage.
   Key: "sma_members_v1"
*/
const STORAGE_KEY = "sma_members_v1";

// contoh data awal (akan dibuat hanya jika belum ada)
const sampleMembers = [
  { id: genId(), name: "Andi Susanto", email: "andi@example.com", position: "Staff", status: "Aktif" },
  { id: genId(), name: "Siti Rahma", email: "siti@example.com", position: "Manager", status: "Aktif" }
];

function genId(){ return 'm_' + Math.random().toString(36).slice(2,9) }

function loadMembers(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleMembers));
    return sampleMembers.slice();
  }
  try {
    return JSON.parse(raw) || [];
  } catch(e){
    return [];
  }
}

function saveMembers(arr){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

/* --- Halaman anggota.html --- */
function renderMembersTable(){
  const tableBody = document.querySelector("#membersTable tbody");
  const notice = document.getElementById("emptyNotice");
  if(!tableBody) return;
  const members = loadMembers();
  tableBody.innerHTML = "";
  if(members.length === 0){
    notice.style.display = "block";
  } else {
    notice.style.display = "none";
    members.forEach((m, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i+1}</td>
        <td>${escapeHtml(m.name)}</td>
        <td>${escapeHtml(m.email||"-")}</td>
        <td>${escapeHtml(m.position||"-")}</td>
        <td>${escapeHtml(m.status||"-")}</td>
        <td>
          <button class="btn small" data-action="edit" data-id="${m.id}">Edit</button>
          <button class="btn outline small" data-action="delete" data-id="${m.id}">Hapus</button>
        </td>`;
      tableBody.appendChild(tr);
    });

    // attach events
    tableBody.querySelectorAll("button[data-action]").forEach(btn=>{
      btn.addEventListener("click", (e)=>{
        const id = e.currentTarget.getAttribute("data-id");
        const action = e.currentTarget.getAttribute("data-action");
        if(action === "edit"){
          // simpan id ke lokasi sehingga form.html dapat mengisi datanya via query param
          location.href = `form.html?edit=${id}`;
        } else if(action === "delete"){
          if(confirm("Yakin ingin menghapus anggota ini?")){
            const arr = loadMembers().filter(x=>x.id !== id);
            saveMembers(arr);
            renderMembersTable();
          }
        }
      });
    });
  }
}

/* --- Halaman form.html --- */
function initFormPage(){
  const q = new URLSearchParams(location.search);
  const editId = q.get("edit");
  const members = loadMembers();
  const form = document.getElementById("memberForm");
  if(!form) return;

  if(editId){
    const m = members.find(x=>x.id === editId);
    if(m){
      document.getElementById("memberId").value = m.id;
      document.getElementById("name").value = m.name;
      document.getElementById("email").value = m.email || "";
      document.getElementById("position").value = m.position || "";
      document.getElementById("status").value = m.status || "Aktif";
    }
  }

  form.addEventListener("submit", (ev)=>{
    ev.preventDefault();
    const id = document.getElementById("memberId").value || genId();
    const payload = {
      id,
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      position: document.getElementById("position").value.trim(),
      status: document.getElementById("status").value
    };
    let arr = loadMembers();
    const existingIndex = arr.findIndex(x=>x.id === id);
    if(existingIndex >= 0){
      arr[existingIndex] = payload;
    } else {
      arr.push(payload);
    }
    saveMembers(arr);
    // kembali ke daftar
    location.href = "anggota.html";
  });
}

/* Export CSV util */
function exportCSV(){
  const members = loadMembers();
  if(members.length === 0){ alert("Tidak ada data untuk diexport."); return; }
  const headers = ["Nama","Email","Jabatan","Status"];
  const rows = members.map(m => [m.name, m.email||"", m.position||"", m.status||""]);
  let csv = headers.join(",") + "\n";
  rows.forEach(r => {
    csv += r.map(c => `"${(c||"").replace(/"/g,'""')}"`).join(",") + "\n";
  });
  const blob = new Blob([csv], {type: "text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "anggota_export.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* escape */
function escapeHtml(s){ if(!s) return ""; return s.replace(/[&<>"']/g, (m)=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":"&#39;"}[m])) }

/* on load detect page and init accordingly */
document.addEventListener("DOMContentLoaded", ()=>{
  if(document.getElementById("membersTable")) renderMembersTable();
  if(document.getElementById("memberForm")) initFormPage();

  const expBtn = document.getElementById("exportBtn");
  if(expBtn) expBtn.addEventListener("click", exportCSV);
});
