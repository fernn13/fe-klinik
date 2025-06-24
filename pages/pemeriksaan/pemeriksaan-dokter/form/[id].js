"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Axios } from "../../../../lib/Axios";


export default function FormPemeriksaan() {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({
    diagnosa: "",
    tensi: "",
    lab: [],
  });

  const [masterDiagnosa, setMasterDiagnosa] = useState([]);
  const toast = useRef(null);
  const router = useRouter();
  const { id } = router.query;
  const [labResults, setLabResults] = useState({});


  useEffect(() => {
    Axios.get("/diagnosa").then((res) => {
      setMasterDiagnosa(res.data.data);
    });
  }, []);

  useEffect(() => {
    if (!id) return; // jangan fetch dulu kalau id belum ada

    Axios.get(`/pemeriksaan/${id}`).then((res) => {
      const f = res.data.data;
      setData(f);
      setForm({
        diagnosa: f.diagnosa_id || "", // ← ubah ke diagnosa_id
        tensi: f.tensi || "",
        lab: f.tindakan ? f.tindakan.split(",").map(l => l.split(":")[0]) : [],
      });
    });
  }, [id]);

  const handleSubmit = async () => {
    try {
      // Gabungkan hasil lab (pakai '-' jika kosong)
      const labHasilGabung = form.lab.map((item) => {
        const hasil = labResults[item] || "-";
        return `${item}:${hasil}`;
      }).join(","); // contoh: Gula Darah:120,Kolesterol:-,Asam Urat:7

      await Axios.post(`/pemeriksaan/${id}`, {
        diagnosa: form.diagnosa,
        tensi: form.tensi,
        tindakan: labHasilGabung,
      });

      // Tampilkan notifikasi berhasil
      toast.current.show({
        severity: "success",
        summary: "Sukses",
        detail: "Pemeriksaan disimpan. Menuju ke form resep...",
      });

      // Redirect langsung ke form resep
      setTimeout(() => {
        router.push(`/pemeriksaan/pemeriksaan-dokter/resep/form/${id}`);
      }, 1000);

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
          optionValue="id" // ini penting: gunakan ID dari master_diagnosa
          placeholder="Pilih Diagnosa"
          className="w-full"
        />


        <span>Tensi</span>
        <InputText
          placeholder="Contoh: 120/80"
          value={form.tensi}
          onChange={(e) => setForm({ ...form, tensi: e.target.value })}
          className="w-full"
        />

        <span>Medical Check Up</span>
        <div className="flex flex-column gap-2 pl-3">
          {["Gula Darah", "Kolesterol", "Asam Urat"].map((item) => (
            <div key={item} className="flex flex-column gap-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  inputId={item}
                  value={item}
                  onChange={(e) => {
                    const selected = form.lab.includes(item)
                      ? form.lab.filter((v) => v !== item)
                      : [...form.lab, item];
                    setForm({ ...form, lab: selected });
                  }}
                  checked={form.lab.includes(item)}
                />
                <label htmlFor={item}>{item}</label>
              </div>
              {form.lab.includes(item) && (
                <InputText
                  placeholder={`Hasil ${item}`}
                  value={labResults[item] || ""}
                  onChange={(e) =>
                    setLabResults({ ...labResults, [item]: e.target.value })
                  }
                  className="ml-4 w-60"
                />
              )}
            </div>
          ))}

        </div>

        <Button label="Simpan Pemeriksaan" className="mt-3" onClick={handleSubmit} />
      </div>
    </div>
  );
}
