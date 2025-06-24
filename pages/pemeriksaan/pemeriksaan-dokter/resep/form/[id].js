"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Axios } from "../../../../../lib/Axios";

export default function FormResepObat() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const toast = useRef(null);
    const [pasien, setPasien] = useState(null);
    const [masterObat, setMasterObat] = useState([]);
    const [resepList, setResepList] = useState([
        { obat_id: "", dosis: "", frekuensi: "" },
    ]);

    useEffect(() => {
        Axios.get("/obat").then((res) => setMasterObat(res.data.data));
        if (id) {
            Axios.get(`/pemeriksaan/${id}`).then((res) => {
                setPasien(res.data.data);
            });
        }
    }, [id]);

    const handleChange = (index, field, value) => {
        const updated = [...resepList];
        updated[index][field] = value;
        setResepList(updated);
    };

    const handleAddRow = () => {
        setResepList([...resepList, { obat_id: "", dosis: "", frekuensi: "" }]);
    };

    const handleSubmit = async () => {
        try {
            await Axios.post(`/resep/${id}`, { resep: resepList });

            toast.current.show({
                severity: "success",
                summary: "Berhasil",
                detail: "Resep disimpan dan status selesai",
            });

            setTimeout(() => router.push("/pemeriksaan/pemeriksaan-dokter"), 1000);
        } catch (e) {
            toast.current.show({
                severity: "error",
                summary: "Gagal",
                detail: e.response?.data?.message || e.message,
            });
        }
    };

    if (!pasien) return <div className="text-center py-10">Memuat data pasien...</div>;

    return (
        <div className="card max-w-4xl mx-auto p-6">
            <Toast ref={toast} />
            <h2 className="text-2xl font-bold mb-5">Form Resep Obat</h2>

            <div className="text-8x4 bg-gray-50 border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <p className="mb-2"><strong>No. RM:</strong> {pasien.no_rm}</p>
                        <p className="mb-2"><strong>Nama:</strong> {pasien.nama}</p>
                        <p className="mb-2"><strong>Keluhan:</strong> {pasien.keluhan}</p>
                    </div>
                    <div>
                        <p className="mb-2"><strong>Diagnosa:</strong> {pasien.diagnosa_nama}</p>
                        <p className="mb-2"><strong>MCU:</strong> {pasien.tindakan}</p>
                        <p className="mb-2"><strong>Tensi:</strong> {pasien.tensi}</p>
                    </div>
                </div>
            </div>



            <h3 className="text-lg font-semibold mb-3">Daftar Obat</h3>

            <div className="space-y-4 mb-">
                {resepList.map((item, index) => (
                    <div key={index} className="border p-4 rounded-md bg-white shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Dropdown
                                value={item.obat_id}
                                options={masterObat}
                                onChange={(e) => handleChange(index, "obat_id", e.value)}
                                optionLabel="nama_obat"
                                optionValue="id"
                                placeholder="Pilih Obat"
                                className="w-full"
                            />
                            <InputText
                                placeholder="Dosis"
                                value={item.dosis}
                                onChange={(e) => handleChange(index, "dosis", e.target.value)}
                                className="w-full"
                            />
                            <InputText
                                placeholder="Frekuensi (misal: 3x sehari)"
                                value={item.frekuensi}
                                onChange={(e) => handleChange(index, "frekuensi", e.target.value)}
                                className="w-full"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center mb-2">
                <Button
                    label="Tambah Obat"
                    icon="pi pi-plus"
                    className="p-button-outlined"
                    onClick={handleAddRow}
                />
            </div>

            <div className="flex justify-end">
                <Button
                    label="Simpan Resep"
                    icon="pi pi-save"
                    onClick={handleSubmit}
                    className="p-button-success"
                />
            </div>
        </div>
    );
}
