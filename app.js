async function api(url, options = {}) {
  const res = await fetch(url, {
    headers: options.body ? { "Content-Type": "application/json" } : {},
    ...options,
  });

  // fetch hanya reject saat jaringan gagal, jadi status HTTP harus dicek sendiri
  if (!res.ok) {
    let pesan = `Terjadi kesalahan (${res.status})`;
    try {
      const data = await res.json();
      pesan = data.message || data.error || pesan;
    } catch {}
    throw new Error(pesan);
  }

  if (res.status === 204) return null; // DELETE tidak mengembalikan isi
  return res.json();
}

let tasks = [];
let filterAktif = "semua";
let status = "loading"; // "loading" | "ready"

const list = document.querySelector("#task-list");
const counter = document.querySelector("#counter");
const emptyMsg = document.querySelector("#empty");
const form = document.querySelector("#task-form");
const inputJudul = document.querySelector("#judul");
const inputMatkul = document.querySelector("#matkul");
const inputDeadline = document.querySelector("#deadline");
const errorEl = document.querySelector("#error");
const statusEl = document.querySelector("#status");
const statusText = document.querySelector("#status-text");
const submitBtn = document.querySelector("#tambah");

function render() {
  statusEl.hidden = status === "ready";
  statusText.textContent = "Memuat tugas…";
  list.innerHTML = "";
  if (status !== "ready") {
    counter.textContent = "";
    emptyMsg.hidden = true;
    return;
  }

  const urut = [...tasks].sort((a, b) => a.deadline.localeCompare(b.deadline));
  const tampil = urut.filter((t) =>
    filterAktif === "aktif"
      ? !t.selesai
      : filterAktif === "selesai"
        ? t.selesai
        : true,
  );

  tampil.forEach((t) => {
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

  counter.textContent = `${tasks.filter((t) => !t.selesai).length} tugas aktif`;
  emptyMsg.hidden = tampil.length > 0;
}

async function muatTugas() {
  status = "loading";
  render();
  const data = await api("/api/tugas");
  tasks = Array.isArray(data) ? data : data.data; // sesuaikan dengan bentuk respons Mock API
  status = "ready";
  render();
}

form.addEventListener("submit", async (e) => {
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
  submitBtn.disabled = true;
  submitBtn.textContent = "Menyimpan…";

  try {
    const baru = await api("/api/tugas", {
      method: "POST",
      body: JSON.stringify({ judul, matkul: inputMatkul.value, deadline }),
    });
    tasks.push(baru);
    form.reset();
  } catch (err) {
    errorEl.textContent = err.message; // pesan error dari server (400)
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Tambah";
  }
  render();
});

list.addEventListener("click", async (e) => {
  const li = e.target.closest("li");
  if (!li) return;
  const id = li.dataset.id; // string

  if (e.target.closest(".hapus")) {
    await api(`/api/tugas/${id}`, { method: "DELETE" });
    tasks = tasks.filter((t) => String(t.id) !== id);
  } else if (e.target.matches("input[type='checkbox']")) {
    const diperbarui = await api(`/api/tugas/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ selesai: e.target.checked }),
    });
    tasks = tasks.map((t) => (String(t.id) === id ? diperbarui : t));
  } else {
    return;
  }
  render(); // state diperbarui dari respons server
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

muatTugas(); // dipanggil paling bawah, setelah semua variabel dan listener siap
