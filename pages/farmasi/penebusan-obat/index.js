"use client";

import { useEffect, useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import dayjs from "dayjs";
import { Axios } from "../../../lib/Axios";

export default function PenebusanObatPage() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedResep, setSelectedResep] = useState(null);
    const [dialogVisible, setDialogVisible] = useState(false);
    const toast = useRef(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await Axios.get("/penebusan-obat");
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

    const lihatResep = async (resepId) => {
        try {
            const res = await Axios.get(`/resep-obat/${resepId}`);
            setSelectedResep(res.data.data);
            setDialogVisible(true);
        } catch (err) {
            toast.current.show({
                severity: "error",
                summary: "Gagal Ambil Resep",
                detail: err?.response?.data?.message || err.message,
            });
        }
    };

    const tandaiLunas = async () => {
        try {
            await Axios.post(`/penebusan-obat/lunas/${selectedResep.resep_id}`);
            toast.current.show({ severity: "success", summary: "Sukses", detail: "Status diubah menjadi lunas" });
            setDialogVisible(false);
            fetchData(); // refresh tabel
        } catch (err) {
            toast.current.show({
                severity: "error",
                summary: "Gagal Update",
                detail: err?.response?.data?.message || err.message,
            });
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const actionTemplate = (row) => (
        <Button
            label="Lihat Resep"
            icon="pi pi-eye"
            severity="warning"
            onClick={() => lihatResep(row.resep_id)}
        />
    );

    const statusObatTemplate = (row) => (
        <span className={`px-2 py-1 text-white rounded ${row.status_obat === 'Lunas' ? 'bg-blue-500' : 'bg-gray-500'}`}>
            {row.status_obat}
        </span>
    );

    return (
        <div className="card max-w-5xl mx-auto">
            <Toast ref={toast} />
            <h2 className="text-2xl mb-3">Daftar Penebusan Obat</h2>

            <DataTable value={rows} loading={loading} stripedRows responsiveLayout="scroll">
                <Column field="tanggal_periksa" header="Tanggal Periksa" body={(row) => dayjs(row.tanggal_periksa).format("DD-MM-YYYY")} />
                <Column field="no_rm" header="No. RM" />
                <Column field="nama_pasien" header="Nama Pasien" />
                <Column field="keluhan" header="Keluhan" />
                <Column header="Status Obat" body={statusObatTemplate} />
                <Column header="Aksi" body={actionTemplate} />
            </DataTable>

            <Dialog
                header="Detail Resep Obat"
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                style={{ width: "800px" }}
                modal
                footer={
                    <div className="flex justify-end gap-2">
                        
                        <Button
                            label="Tandai Lunas"
                            icon="pi pi-check"
                            className="p-button-success"
                            onClick={tandaiLunas}
                        />
                    </div>
                }
            >
                {selectedResep ? (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                                <p><strong>Nama Pasien:</strong> {selectedResep.nama}</p>
                                <p><strong>Keluhan:</strong> {selectedResep.keluhan}</p>
                                <p><strong>Diagnosa:</strong> {selectedResep.diagnosa_nama}</p>
                                <p><strong>MCU:</strong> {selectedResep.tindakan}</p>
                            </div>
                            <div>
                                <p><strong>No. RM:</strong> {selectedResep.no_rm}</p>
                                <p><strong>Tanggal:</strong> {dayjs(selectedResep.tgl_reservasi).format("DD-MM-YYYY HH:mm")}</p>
                                <p><strong>Tensi:</strong> {selectedResep.tensi}</p>
                            </div>
                        </div>

                        <hr />

                        <h4 className="font-semibold mb-2">Resep Obat</h4>

                        {Array.isArray(selectedResep.resep) && selectedResep.resep.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full border border-collapse text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="border px-3 py-2">No</th>
                                            <th className="border px-3 py-2">Nama Obat</th>
                                            <th className="border px-3 py-2">Dosis</th>
                                            <th className="border px-3 py-2">Frekuensi (x/hari)</th>
                                            <th className="border px-3 py-2 text-right">Harga</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedResep.resep.map((item, index) => (
                                            <tr key={index}>
                                                <td className="border px-3 py-1 text-center">{index + 1}</td>
                                                <td className="border px-3 py-1">{item.nama_obat}</td>
                                                <td className="border px-3 py-1">{item.dosis}</td>
                                                <td className="border px-3 py-1">{item.frekuensi}</td>
                                                <td className="border px-3 py-1 text-right">Rp{parseFloat(item.harga_jual || 0).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <p className="text-right font-bold mt-3">
                                    Total: Rp{selectedResep.resep.reduce((acc, i) => acc + parseFloat(i.harga_jual || 0), 0).toLocaleString()}
                                </p>
                            </div>
                        ) : (
                            <p>Tidak ada data resep obat.</p>
                        )}
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </Dialog>
        </div>
    );
}
