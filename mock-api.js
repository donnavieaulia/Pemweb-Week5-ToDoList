(function () {
  let mode = "normal"; // "normal" | "lambat" | "offline"
  let nextId = 3;
  let db = [
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

  window.__API = { setMode: (m) => (mode = m) };

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const json = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });

  const realFetch = window.fetch;
  window.fetch = async (url, opts = {}) => {
    if (!String(url).startsWith("/api/")) return realFetch(url, opts);

    await wait(mode === "lambat" ? 1500 : 50);
    if (mode === "offline") throw new TypeError("Failed to fetch");

    const method = (opts.method || "GET").toUpperCase();

    if (String(url) === "/api/matkul") {
      return json(["Pemrograman Web", "Basis Data", "Jaringan Komputer"]);
    }

    const m = String(url).match(/^\/api\/tugas(?:\/(\d+))?$/);
    if (!m) return json({ message: "Endpoint tidak ditemukan" }, 404);
    const id = m[1] ? Number(m[1]) : null;

    if (method === "GET" && !id) return json(db);

    if (method === "POST") {
      const body = JSON.parse(opts.body);
      if (!body.judul || body.judul.trim().length < 3) {
        return json({ message: "Judul minimal 3 karakter" }, 400);
      }
      if (!body.deadline) {
        return json({ message: "Deadline wajib diisi" }, 400);
      }
      const baru = { id: nextId++, selesai: false, ...body };
      db.push(baru);
      return json(baru, 201);
    }

    const tugas = db.find((t) => t.id === id);
    if (!tugas) return json({ message: "Tugas tidak ditemukan" }, 404);

    if (method === "PATCH") {
      Object.assign(tugas, JSON.parse(opts.body));
      return json(tugas);
    }
    if (method === "DELETE") {
      db = db.filter((t) => t.id !== id);
      return json({ success: true, deletedId: id });
    }

    return json({ message: "Method tidak diizinkan" }, 405);
  };
})();
