document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("memberForm");
  if (!form) return;

  const memberIdInput = document.getElementById("memberId");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const positionInput = document.getElementById("position");
  const statusInput = document.getElementById("status");

  // Ambil data dari localStorage
  let members = JSON.parse(localStorage.getItem("members")) || [];

  // MODE EDIT (jika ada parameter id di URL)
  const params = new URLSearchParams(window.location.search);
  const editId = params.get("id");

  if (editId !== null) {
    const member = members.find(m => m.id == editId);
    if (member) {
      memberIdInput.value = member.id;
      nameInput.value = member.name;
      emailInput.value = member.email;
      positionInput.value = member.position;
      statusInput.value = member.status;
    }
  }

  // SIMPAN DATA
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const data = {
      id: memberIdInput.value
        ? Number(memberIdInput.value)
        : Date.now(),
      name: nameInput.value,
      email: emailInput.value,
      position: positionInput.value,
      status: statusInput.value
    };

    if (memberIdInput.value) {
      // UPDATE DATA
      members = members.map(m => (m.id == data.id ? data : m));
    } else {
      // TAMBAH DATA BARU
      members.push(data);
    }

    localStorage.setItem("members", JSON.stringify(members));

    alert("Data anggota berhasil disimpan!");
    window.location.href = "anggota.html";
  });
});
