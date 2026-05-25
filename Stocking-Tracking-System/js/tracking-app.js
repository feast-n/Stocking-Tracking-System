new Vue({
    el: '#app',
    data: {
        pengirimanList: [
            { kode: "REG", nama: "Reguler (3-5 hari)" },
            { kode: "EXP", nama: "Ekspres (1-2 hari)" },
            { kode: "PBX", nama: "Drop-off Loker Pintar (PopBox/SmartLocker)" }
        ],
        paketList: [
            { kode: "PAKET-UT-001", nama: "PAKET IPS Dasar", isi: ["EKMA4116", "EKMA4115"], harga: 120000 },
            { kode: "PAKET-UT-002", nama: "PAKET IPA Dasar", isi: ["BIOL4201", "FISIP4001"], harga: 140000 }
        ],
        // Dummy data awal berorientasi format logistik
        daftarDO: [
            {
                noDO: "DO2025-001",
                nim: "041234567",
                nama: "Rina Wulandari",
                status: "Dalam Perjalanan",
                ekspedisi: "Reguler (3-5 hari)",
                paketKode: "PAKET-UT-001",
                tanggalKirim: "2025-08-25",
                totalHarga: 120000,
                perjalanan: [
                    { waktu: "2025-08-25 10:12:20", keterangan: "Sistem: Penerimaan manifes di Loket TANGSEL." },
                    { waktu: "2025-08-25 14:07:56", keterangan: "Fasilitas Sortir: Tiba di Hub Logistik JAKSEL." },
                    { waktu: "2025-08-26 08:44:01", keterangan: "Kurir: Diteruskan ke Kantor Tujuan Distribusi." }
                ]
            }
        ],
        form: { nim: "", nama: "", ekspedisi: "", paketKode: "", tanggalKirim: "" }
    },
    computed: {
        // Ekstraksi sekuensial DO berbasis panjang array yang dinamis
        generatedDoNumber() {
            let year = new Date().getFullYear();
            let sequence = this.daftarDO.length + 1;
            let formattedSeq = String(sequence).padStart(3, '0');
            return `DO${year}-${formattedSeq}`;
        },
        detailPaketTerpilih() {
            if (!this.form.paketKode) return null;
            return this.paketList.find(p => p.kode === this.form.paketKode);
        }
    },
    created() {
        // Pre-populasi form dengan data temporal lokal untuk mereduksi friksi entri data
        let today = new Date();
        this.form.tanggalKirim = today.toISOString().split('T')[0];
    },
    methods: {
        submitDO() {
            let now = new Date();
            let timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;
            
            let newDO = {
                noDO: this.generatedDoNumber,
                nim: this.form.nim,
                nama: this.form.nama,
                status: "Dikemas", // State inisial
                ekspedisi: this.form.ekspedisi,
                paketKode: this.form.paketKode,
                tanggalKirim: this.form.tanggalKirim,
                totalHarga: this.detailPaketTerpilih.harga,
                // Inisiasi timeline kronologis pertama saat DO terdaftar
                perjalanan: [
                    { waktu: timestamp, keterangan: "Sistem Logistik: Delivery Order berhasil diotorisasi dan modul sedang dikemas." }
                ]
            };
            
            // Reaktivitas penambahan objek ke ujung depan array agar muncul paling atas
            this.daftarDO.unshift(newDO);
            
            // Restorasi form (State persisten untuk tanggalKirim)
            this.form.nim = "";
            this.form.nama = "";
            this.form.ekspedisi = "";
            this.form.paketKode = "";
            
            // Umpan balik via alert (dapat disubstitusi dengan Toast notification system pada iterasi lanjutan)
            alert(`Sistem Otorisasi: Dokumen ${newDO.noDO} telah diterbitkan ke terminal logistik.`);
        }
    }
});