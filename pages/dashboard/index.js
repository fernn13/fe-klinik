"use client";

import { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { Axios } from "../../lib/Axios";
import { ProgressSpinner } from "primereact/progressspinner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

export default function DashboardPage() {
    const toast = useRef(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        total_pasien: 0,
        pasien_hari_ini: 0,
        stok_obat: [],
        pasien_baru: 0,
        pasien_lama: 0,
        kunjungan_chart: []
    });

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const res = await Axios.get("/dashboard-data");
            setData(res.data);
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

    const pieData = [
        { name: "Pasien Baru", value: data.pasien_baru },
        { name: "Pasien Lama", value: data.pasien_lama }
    ];

    const pieColors = ["#00BFFF", "#FFA500"];

    useEffect(() => {
        fetchDashboard();
    }, []);

    const cards = [
        { title: "Total Pasien", value: data.total_pasien, icon: "pi pi-users", color: "bg-blue-500" },
        { title: "Pasien Hari Ini", value: data.pasien_hari_ini, icon: "pi pi-user-plus", color: "bg-green-500" },
    ];

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Klinik</h2>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <ProgressSpinner />
                </div>
            ) : (
                <>
                    {/* Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {cards.map((item, index) => (
                            <div key={index} className={`p-4 rounded-lg shadow-md ${item.color} text-white`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm">{item.title}</p>
                                        <h3 className="text-3xl font-bold">{item.value}</h3>
                                    </div>
                                    <i className={`${item.icon} text-4xl`}></i>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pie Chart & Stok Obat Table Side-by-Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Stok Obat */}
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Stok Obat</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border border-collapse">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="border px-3 py-2 text-left text-gray-700">Kode Obat</th>
                                            <th className="border px-3 py-2 text-left text-gray-700">Nama Obat</th>
                                            <th className="border px-3 py-2 text-right text-gray-700">Stok</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(data.stok_obat) && data.stok_obat.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="border px-3 py-1">{item.kode_obat}</td>
                                                <td className="border px-3 py-1">{item.nama_obat}</td>
                                                <td className="border px-3 py-1 text-right">{item.stok}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        {/* Pie Chart */}
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Perbandingan Pasien Baru vs Lama</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                        ))}
                                    </Pie>
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Grafik Bar */}
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Grafik Kunjungan Pasien</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.kunjungan_chart}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="tanggal" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="jumlah" fill="#3182CE" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </div>
    );
}
