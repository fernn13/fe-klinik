"use client";

import { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import dayjs from "dayjs";
import { Axios } from '../../../lib/Axios';
import { useRouter } from "next/navigation";

export default function PemeriksaanPasienPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await Axios.get("/pemeriksaan"); // endpoint API-nya nanti kita buat
      setRows(res.data.data);
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Gagal",
        detail: err?.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const actionTemplate = (row) => (
    <div className="flex gap-2">
      <Button
        label="Periksa"
        icon="pi pi-user-edit"
        severity="info"
        onClick={() => router.push(`/pemeriksaan/pemeriksaan-dokter/form/${row.id}`)}
      />
      <Button
        label="Resep"
        icon="pi pi-briefcase"
        severity="success"
        onClick={() => router.push(`/resep/form/${row.id}`)}
      />
    </div>
  );

  return (
    <div className="card max-w-5xl mx-auto">
      <Toast ref={toast} />
      <h2 className="text-2xl mb-3">Sesi Pemeriksaan Pasien</h2>

      <DataTable value={rows} loading={loading} stripedRows responsiveLayout="scroll">
        <Column field="no_rm" header="No. RM" />
        <Column
          field="tgl_reservasi"
          header="Tanggal Reservasi"
          body={(row) => dayjs(row.tgl_reservasi).format("DD/MM/YYYY HH:mm")}
        />
        <Column field="nama" header="Nama Pasien" />
        <Column field="keluhan" header="Keluhan" />
        <Column header="Aksi" body={actionTemplate} style={{ minWidth: "180px" }} />
      </DataTable>
    </div>
  );
}
