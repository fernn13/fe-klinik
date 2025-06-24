"use client";

import { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import dayjs from "dayjs";
import { Axios } from "../../../lib/Axios";
import { useRouter } from "next/navigation";

function CetakResepContent({ data }) {
  return (
    <div style={{ padding: 10, fontFamily: "Arial" }}>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
        <div>
          <p><strong>Nama Pasien:</strong> {data.nama}</p>
          <p><strong>Keluhan:</strong> {data.keluhan}</p>
          <p><strong>Diagnosa:</strong> {data.diagnosa_nama}</p>
          <p><strong>MCU:</strong> {data.tindakan}</p>
        </div>
        <div>
          <p><strong>No. RM:</strong> {data.no_rm}</p>
          <p><strong>Tanggal:</strong> {dayjs(data.tgl_reservasi).format("DD-MM-YYYY HH:mm")}</p>
          <p><strong>Tensi:</strong> {data.tensi}</p>
        </div>
      </div>

      <hr style={{ margin: "20px 0" }} />
      <h4>Resep Obat:</h4>

      {Array.isArray(data.resep) && data.resep.length > 0 ? (
        <table width="100%" border="1" cellPadding="5" cellSpacing="0" style={{ fontSize: 14 }}>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Obat</th>
              <th>Dosis</th>
              <th>Aturan Pakai (x/hari)</th>
            </tr>
          </thead>
          <tbody>
            {data.resep.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.nama_obat}</td>
                <td>{item.dosis}</td>
                <td>{item.aturan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Tidak ada resep obat.</p>
      )}

      <div style={{ marginTop: 20, display: 'flex', gap: '10px' }}>
        <button onClick={() => window.print()}>Cetak</button>
        <button onClick={data.onClose}>Tutup</button>
      </div>


      <style jsx>{`
        @media print {
          button {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default function PemeriksaanPasienPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedResep, setSelectedResep] = useState(null);
  const [loadingResep, setLoadingResep] = useState(false);
  const [resepDialogVisible, setResepDialogVisible] = useState(false);

  const toast = useRef(null);
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await Axios.get("/pemeriksaan");
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

  const fetchResep = async (id) => {
    setLoadingResep(true);
    try {
      const res = await Axios.get(`/pemeriksaan/${id}`);
      setSelectedResep(res.data.data);
      setResepDialogVisible(true);
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Gagal Ambil Resep",
        detail: err?.response?.data?.message || err.message,
      });
    } finally {
      setLoadingResep(false);
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
        onClick={() => router.push(`/pemeriksaan/pemeriksaan-dokter/resep/form/${row.id}`)}
      />
      <Button
        label="Lihat Resep"
        icon="pi pi-eye"
        severity="help"
        onClick={() => fetchResep(row.id)}
      />
    </div>
  );

  return (
    <div className="card max-w-5xl mx-auto">
      <Toast ref={toast} />
      <h2 className="text-2xl mb-3">Sesi Pemeriksaan Pasien</h2>

      <DataTable
        value={rows}
        loading={loading}
        stripedRows
        responsiveLayout="scroll"
      >
        <Column field="no_rm" header="No. RM" />
        <Column
          field="tgl_reservasi"
          header="Tanggal Reservasi"
          body={(row) => dayjs(row.tgl_reservasi).format("DD/MM/YYYY HH:mm")}
        />
        <Column field="nama" header="Nama Pasien" />
        <Column field="keluhan" header="Keluhan" />
        <Column
          header="Rekam Medis"
          body={(row) => (
            <Button
              label="Lihat"
              icon="pi pi-eye"
              severity="warning"
              onClick={() => router.push(`/pemeriksaan/rekam-medis/${row.id}`)}
            />
          )}
        />
        <Column header="Aksi" body={actionTemplate} style={{ minWidth: "220px" }} />
      </DataTable>

      <Dialog
        visible={resepDialogVisible}
        onHide={() => setResepDialogVisible(false)}
        closable={false}
        style={{ width: "800px" }}
        modal
      >
        {loadingResep ? (
          <p>Loading resep...</p>
        ) : selectedResep ? (
          <CetakResepContent data={{ ...selectedResep, onClose: () => setResepDialogVisible(false) }} />

        ) : (
          <p>Data resep tidak tersedia.</p>
        )}
      </Dialog>
    </div>
  );
}
