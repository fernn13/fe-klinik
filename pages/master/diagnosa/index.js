"use client";

import { useEffect, useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Axios } from '../../../lib/Axios';

export default function MasterDiagnosaPage() {
  const toast = useRef(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ id: null, kode: "", nama: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await Axios.get("/diagnosa");
      setRows(res.data.data);
    } catch (e) {
      toast.current.show({
        severity: "error",
        summary: "Gagal",
        detail: e.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await Axios.post("/diagnosa", form);
      toast.current.show({
        severity: "success",
        summary: "Sukses",
        detail: "Diagnosa disimpan",
      });
      setShowForm(false);
      setForm({ id: null, kode: "", nama: "" });
      fetchData();
    } catch (e) {
      toast.current.show({
        severity: "error",
        summary: "Gagal",
        detail: e.response?.data?.message || e.message,
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await Axios.delete(`/diagnosa/${id}`);
      toast.current.show({
        severity: "success",
        summary: "Sukses",
        detail: "Diagnosa dihapus",
      });
      fetchData();
    } catch (e) {
      toast.current.show({
        severity: "error",
        summary: "Gagal",
        detail: e.response?.data?.message || e.message,
      });
    }
  };

  const actionTemplate = (row) => (
    <div className="flex gap-2">
       <Button icon="pi pi-pencil" severity="success" rounded className="mr-2" onClick={() => openEditDialog(rowData)} />
      <Button icon="pi pi-trash" severity="danger" rounded onClick={() => openDeleteDialog(rowData)} />
    </div>
  );

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="card max-w-4xl mx-auto">
      <Toast ref={toast} />
      <h2 className="text-2xl mb-4">Data Diagnosa</h2>

      <Button
        label="Tambah Diagnosa"
        icon="pi pi-plus"
        className="mb-3"
        onClick={() => {
          setForm({ id: null, kode: "", nama: "" });
          setShowForm(true);
        }}
      />

      <DataTable value={rows} loading={loading} stripedRows responsiveLayout="scroll">
        <Column field="kode" header="Kode Diagnosa" />
        <Column field="nama" header="Nama Diagnosa" />
        <Column header="Aksi" body={actionTemplate} style={{ width: "140px" }} />
      </DataTable>

      {/* Dialog Form */}
      <Dialog
        header={form.id ? "Edit Diagnosa" : "Tambah Diagnosa"}
        visible={showForm}
        style={{ width: "30rem" }}
        onHide={() => setShowForm(false)}
        modal
      >
        <div className="flex flex-column gap-3">
          <div>
            <label>Kode Diagnosa</label>
            <InputText
              value={form.kode}
              onChange={(e) => setForm({ ...form, kode: e.target.value })}
              className="w-full"
            />
          </div>
          <div>
            <label>Nama Diagnosa</label>
            <InputText
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              className="w-full"
            />
          </div>
          <Button label="Simpan" onClick={handleSave} />
        </div>
      </Dialog>
    </div>
  );
}
