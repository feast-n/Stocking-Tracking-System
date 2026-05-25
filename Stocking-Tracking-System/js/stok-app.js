new Vue({
    el: '#app',
    data: {
        upbjjList: ["Jakarta", "Surabaya", "Makassar", "Padang", "Denpasar"],
        kategoriList: ["MK Wajib", "MK Pilihan", "Praktikum", "Problem-Based"],
        stok: [
            { kode: "EKMA4116", judul: "Pengantar Manajemen", kategori: "MK Wajib", upbjj: "Jakarta", lokasiRak: "R1-A3", harga: 65000, qty: 28, safety: 20, catatanHTML: "<em>Edisi 2024</em>" },
            { kode: "EKMA4115", judul: "Pengantar Akuntansi", kategori: "MK Wajib", upbjj: "Jakarta", lokasiRak: "R1-A4", harga: 60000, qty: 7, safety: 15, catatanHTML: "<strong>Cover baru</strong>" },
            { kode: "FISIP4001", judul: "Dasar Sosiologi", kategori: "MK Pilihan", upbjj: "Makassar", lokasiRak: "R2-C1", harga: 55000, qty: 0, safety: 8, catatanHTML: "Prioritaskan reorder" }
        ],
        filter: { 
            searchQuery: "", // Penambahan state untuk pencarian teks dinamis
            upbjj: "", 
            kategori: "", 
            sortBy: "judul",
            reorderOnly: false // Penambahan state untuk deteksi batas kritis
        },
        form: { 
            kode: "", judul: "", kategori: "", upbjj: "", lokasiRak: "", qty: 0, safety: 0, harga: 0, catatanHTML: "-" 
        },
        isEdit: false,
        showModal: false,
        toasts: [],
        toastCounter: 0
    },
    computed: {
        // Analitik HUD Imersif: Mengkalkulasi state array secara waktu-nyata
        metrikStok() {
            return {
                totalVarian: this.stok.length,
                menipis: this.stok.filter(item => item.qty < item.safety && item.qty > 0).length,
                kosong: this.stok.filter(item => item.qty === 0).length
            };
        },
        filteredAndSortedStok() {
            let result = this.stok;
            if (this.filter.upbjj !== "") result = result.filter(i => i.upbjj === this.filter.upbjj);
            if (this.filter.kategori !== "") result = result.filter(i => i.kategori === this.filter.kategori);
            result = result.sort((a, b) => {
                if (this.filter.sortBy === "judul") return a.judul.localeCompare(b.judul);
                if (this.filter.sortBy === "qty") return a.qty - b.qty;
                return 0;
            });
            return result;
        },
        filteredAndSortedStok() {
            let result = this.stok;
            let query = this.filter.searchQuery.toLowerCase();

            // 1. Pemilahan String Pencarian Waktu-Nyata (Kode & Judul)
            if (query !== "") {
                result = result.filter(item => 
                    item.judul.toLowerCase().includes(query) || 
                    item.kode.toLowerCase().includes(query)
                );
            }

            // 2. Pemilahan Spasial (Daerah)
            if (this.filter.upbjj !== "") {
                result = result.filter(item => item.upbjj === this.filter.upbjj);
            }
            
            // 3. Pemilahan Kategorikal
            if (this.filter.kategori !== "") {
                result = result.filter(item => item.kategori === this.filter.kategori);
            }

            // 4. Pemilahan Status Kuantitas Persediaan (Re-order Warning)
            // Memenuhi syarat (qty < safety) atau kekosongan absolut (qty = 0)
            if (this.filter.reorderOnly) {
                result = result.filter(item => item.qty < item.safety || item.qty === 0);
            }
            
            // 5. Algoritma Pengurutan (Sorting)
            result = result.sort((a, b) => {
                if (this.filter.sortBy === "judul") return a.judul.localeCompare(b.judul);
                if (this.filter.sortBy === "qty") return a.qty - b.qty;
                if (this.filter.sortBy === "harga") return a.harga - b.harga;
                return 0;
            });

            return result;
        },
        isFilterActive() {
            return this.filter.searchQuery !== "" || 
                   this.filter.upbjj !== "" || 
                   this.filter.kategori !== "" || 
                   this.filter.reorderOnly;
        },
    },
    watch: {
        'filter.upbjj'(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.filter.kategori = "";
                if (newVal !== "") this.triggerToast(`Fokus daerah dialihkan ke: ${newVal}`, "success");
            }
        }
    },
    methods: {
        resetFilter() {
            this.filter.searchQuery = "";
            this.filter.upbjj = "";
            this.filter.kategori = "";
            this.filter.sortBy = "judul";
            this.filter.reorderOnly = false;
            this.triggerToast("Parameter filter sistem dikembalikan ke pengaturan standar.", "success");
        },
        bukaModalTambah() {
            this.isEdit = false;
            this.form = { kode: "", judul: "", kategori: "MK Wajib", upbjj: "Jakarta", lokasiRak: "", qty: 0, safety: 0, harga: 0, catatanHTML: "-" };
            this.showModal = true;
        },
        editStok(kodeItem) {
            const index = this.stok.findIndex(item => item.kode === kodeItem);
            if (index !== -1) {
                this.isEdit = true;
                this.form = { ...this.stok[index] };
                this.showModal = true;
            }
        },
        tutupModal() { this.showModal = false; },
        simpanData() {
            if (this.isEdit) {
                const index = this.stok.findIndex(item => item.kode === this.form.kode);
                if (index !== -1) {
                    this.$set(this.stok, index, { ...this.form });
                    this.triggerToast("Otorisasi modifikasi persediaan berhasil.", "success");
                }
            } else {
                if (this.stok.some(item => item.kode === this.form.kode)) {
                    this.triggerToast("Kegagalan Integritas Data: Kode MK duplikat!", "error");
                    return;
                }
                this.stok.push({ ...this.form, catatanHTML: "<em>Entri Baru</em>" });
                this.triggerToast(`Modul ${this.form.kode} berhasil diregistrasi.`, "success");
            }
            this.tutupModal();
        },
        // Mekanisme antrean untuk notifikasi non-blocking (Immersive Feedback)
        triggerToast(message, type) {
            const id = this.toastCounter++;
            this.toasts.push({ id, message, type });
            setTimeout(() => {
                this.toasts = this.toasts.filter(t => t.id !== id);
            }, 3500);
        }
    }
});