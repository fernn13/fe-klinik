"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { InputTextarea } from "primereact/inputtextarea";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Axios } from '../../../../lib/Axios';
import { Dropdown } from "primereact/dropdown";

export default function FormPemeriksaan() {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({
    diagnosa: "",
    tindakan: "",
    catatan: "",
  });
  const toast = useRef(null);
  const router = useRouter();
  const { id } = router.query;
  const [masterDiagnosa, setMasterDiagnosa] = useState([]);

  useEffect(() => {
    Axios.get("/diagnosa").then((res) => {
      setMasterDiagnosa(res.data.data);
    });
  }, []);

  useEffect(() => {
    if (id) {
      Axios.get(`/pemeriksaan/${id}`).then((res) => {
        setData(res.data.data);
        setForm({
          diagnosa: res.data.data.diagnosa || "",
          tindakan: res.data.data.tindakan || "",
          catatan: res.data.data.catatan || "",
        });
      });
    }
  }, [id]);

  const handleSubmit = async () => {
    try {
      await Axios.post(`/pemeriksaan/${id}`, form);
      toast.current.show({
        severity: "success",
        summary: "Sukses",
        detail: "Pemeriksaan disimpan",
      });
      setTimeout(() => router.push("/pemeriksaan"), 1000);
    } catch (e) {
      toast.current.show({
        severity: "error",
        summary: "Gagal",
        detail: e.response?.data?.message || e.message,
      });
    }
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div className="card max-w-4xl mx-auto">
      <Toast ref={toast} />
      <h2 className="text-2xl mb-3">Form Pemeriksaan</h2>

      <div className="mb-3">
        <p><strong>No. RM:</strong> {data.no_rm}</p>
        <p><strong>Nama:</strong> {data.nama}</p>
        <p><strong>Tgl Reservasi:</strong> {data.tgl_reservasi}</p>
        <p><strong>Keluhan:</strong> {data.keluhan}</p>
      </div>

      <div className="flex flex-column gap-3">
        <span>Diagnosa</span>
        <Dropdown
          value={form.diagnosa}
          onChange={(e) => setForm({ ...form, diagnosa: e.value })}
          options={masterDiagnosa}
          optionLabel="nama"
          optionValue="nama"
          placeholder="Pilih Diagnosa"
          className="w-full"
        />

        <span>Tindakan</span>
        <InputTextarea
          rows={2}
          value={form.tindakan}
          onChange={(e) => setForm({ ...form, tindakan: e.target.value })}
          className="w-full"
        />

        <span>Catatan</span>
        <InputTextarea
          rows={2}
          value={form.catatan}
          onChange={(e) => setForm({ ...form, catatan: e.target.value })}
          className="w-full"
        />

        <Button label="Simpan Pemeriksaan" className="mt-3" onClick={handleSubmit} />
      </div>
    </div>
  );
}
