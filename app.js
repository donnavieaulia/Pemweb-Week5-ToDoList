let tasks = [
  {
    id: 1,
    judul: "Lab 10 event delegation",
    matkul: "Pemrograman Web",
    deadline: "2026-10-08",
    selesai: false,
  },
  {
    id: 2,
    judul: "ERD sistem perpustakaan",
    matkul: "Basis Data",
    deadline: "2026-10-12",
    selesai: true,
  },
];

const list = document.querySelector("#task-list");

function render() {
  list.innerHTML = ""; // hanya mengosongkan list, tidak memasukkan data user
  tasks.forEach((t) => {
    const li = document.createElement("li");
    li.dataset.id = t.id;
    if (t.selesai) li.classList.add("done");

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = t.selesai;

    const info = document.createElement("div");
    info.className = "info";
    const judul = document.createElement("span");
    judul.className = "judul";
    judul.textContent = t.judul; // textContent, bukan innerHTML
    const meta = document.createElement("small");
    meta.textContent = `${t.matkul} · deadline ${t.deadline}`;
    info.append(judul, meta);

    const btn = document.createElement("button");
    btn.className = "hapus";
    btn.textContent = "✕";
    btn.setAttribute("aria-label", "Hapus tugas");

    li.append(cb, info, btn);
    list.append(li);
  });
}

render();
