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

const form = document.querySelector("#task-form");
const inputJudul = document.querySelector("#judul");
const inputMatkul = document.querySelector("#matkul");
const inputDeadline = document.querySelector("#deadline");
const errorEl = document.querySelector("#error");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const judul = inputJudul.value.trim();
  const deadline = inputDeadline.value;

  if (judul.length < 3) {
    errorEl.textContent = "Judul minimal 3 karakter.";
    return;
  }
  if (!deadline) {
    errorEl.textContent = "Deadline wajib diisi.";
    return;
  }

  errorEl.textContent = "";
  tasks.push({
    id: Date.now(),
    judul,
    matkul: inputMatkul.value,
    deadline,
    selesai: false,
  });
  form.reset();
  render();
});

list.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;
  const id = Number(li.dataset.id);

  if (e.target.closest(".hapus")) {
    tasks = tasks.filter((t) => t.id !== id);
  } else if (e.target.matches("input[type='checkbox']")) {
    const task = tasks.find((t) => t.id === id);
    task.selesai = e.target.checked;
  } else {
    return;
  }
  render();
});

document.querySelector("#filters").addEventListener("click", (e) => {
  const btn = e.target.closest(".filter");
  if (!btn) return;
  filterAktif = btn.dataset.filter;
  document
    .querySelectorAll(".filter")
    .forEach((b) => b.classList.toggle("on", b === btn));
  render();
});

render();
