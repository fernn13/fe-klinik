"use client";

import { useEffect, useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import dayjs from "dayjs";
import { Axios } from "../../../lib/Axios";

export default function PageAntrian() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  const fetchAntrian = async () => {
    setLoading(true);
    try {
      const res = await Axios.get("/antrian"); // GET /api/antrian
      console.log("DATA ANTRIAN:", res.data.data); // tambahkan ini
      setRows(res.data.data);
    } catch (e) {
      console.error("ERROR FETCH:", e);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: e.message,
      });
    } finally {
      setLoading(false);
    }
  };


  /* ───── ubah status menunggu → dipanggil → selesai ───── */
  const updateStatus = async (id, status) => {
    try {
      await Axios.patch(`/antrian/${id}`, { status }); // PATCH /api/antrian/{id}
      toast.current.show({
        severity: "success",
        summary: "Sukses",
        detail: `Status diubah ke ${status}`,
      });
      fetchAntrian(); // refresh tabel
    } catch (e) {
      toast.current.show({
        severity: "error",
        summary: "Gagal",
        detail: e.response?.data?.message || e.message,
      });
    }
  };

  useEffect(() => {
    fetchAntrian();
  }, []);

  /* ───── template tombol aksi dalam tabel ───── */
  const actionTemplate = (row) => (
    <div className="flex gap-2">
      {row.status === "menunggu" && (
        <Button
          label="Panggil"
          icon="pi pi-play"
          severity="info"
          onClick={() => updateStatus(row.id, "dipanggil")}
        />
      )}
      {row.status === "dipanggil" && (
        <Button
          label="Selesai"
          icon="pi pi-check"
          severity="success"
          onClick={() => updateStatus(row.id, "selesai")}
        />
      )}
    </div>
  );

  const renderTabelRuangan = (kodeRuangan, namaRuangan) => {
    const data = rows.filter((r) => r.ruangan === kodeRuangan);
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">{namaRuangan}</h3>
        <DataTable value={data} loading={loading} responsiveLayout="scroll" stripedRows>
          <Column field="no_antrian" header="No Antrian" />
          <Column field="nama" header="Nama Pasien" />
          <Column field="ruangan" header="Poli" />
          <Column
            field="waktu_masuk"
            header="Waktu Masuk"
            body={(row) => dayjs(row.waktu_masuk).format("DD/MM/YYYY HH:mm")}
          />
          <Column field="status" header="Status" />
          <Column header="Aksi" body={actionTemplate} style={{ minWidth: "160px" }} />
        </DataTable>
      </div>
    );
  };


  return (
    <div className="card mx-auto max-w-5xl">
      <Toast ref={toast} />
      <h2 className="text-2xl mb-6 font-bold">Antrian Pasien Hari Ini</h2>

      {renderTabelRuangan("Pemeriksaan Umum", "Pemeriksaan Umum")}
      {renderTabelRuangan("Poli Anak", "Poli Anak")}
      {renderTabelRuangan("Poli Gigi", "Poli Gigi")}

    </div>
  );
}
