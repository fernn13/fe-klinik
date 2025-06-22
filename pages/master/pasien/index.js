import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { FilterMatchMode } from 'primereact/api';
import { Axios } from '../../../lib/Axios';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';


const PendaftaranPasien = () => {
    const toast = useRef(null);
    const router = useRouter();
    const [viewMode, setViewMode] = useState('detail');


    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isDelete, setIsDelete] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    const [searchVal, setSearchVal] = useState('');

    const [detailDialogVisible, setDetailDialogVisible] = useState(false);
    const [detailData, setDetailData] = useState(null);

    const showSuccess = (detail) => {
        toast.current.show({ severity: 'success', summary: 'Success', detail, life: 3000 });
    };

    const showError = (detail) => {
        toast.current.show({ severity: 'error', summary: 'Error', detail, life: 3000 });
    };

    const getPendaftaran = useCallback(async () => {
        setLoading(true);
        try {
            const res = await Axios.get('http://localhost:8000/api/pendaftaran/get');
            setData(res.data.data);
        } catch (err) {
            console.error(err.message);
            showError(err?.response?.data?.message || 'Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    }, []);

    // const handleDelete = async () => {
    //     if (!formik.values.id) return showError('ID tidak ditemukan');
    //     try {
    //         const res = await Axios.delete(`/pendaftaran/delete?id=${formik.values.id}`);
    //         showSuccess(res.data.message);
    //         setDialogVisible(false);
    //         setIsDelete(false);
    //         getPendaftaran();
    //     } catch (err) {
    //         showError(err?.response?.data?.message || 'Terjadi kesalahan saat menghapus');
    //     }
    // };

    const formik = useFormik({
        initialValues: {
            id: '',
            no_rm: '',
            nama: '',
            tempat_lahir: '',
            tgl_lahir: '',
            jns_kelamin: '',
            alamat: '',
            no_tlp: '',
            pendidikan: '',
            pekerjaan: '',
            no_ktp: '',
            no_asuransi: '',
            jns_asuransi: ''
        },
        onSubmit: () => { }
    });

    const openEditDialog = (rowData) => {
        setIsEdit(true);
        setIsDelete(false);
        setDialogVisible(true);
        setSelectedPatient(rowData);
        formik.setValues({ ...rowData });
    };

    const openDeleteDialog = (rowData) => {
        setIsEdit(false);
        setIsDelete(true);
        setDialogVisible(true);
        setSelectedPatient(rowData);
        formik.setFieldValue('id', rowData.id);
    };

    const handleRowClick = (e) => {
        setDetailData(e.data);
        setDetailDialogVisible(true);
    };

    useEffect(() => {
        getPendaftaran();
    }, [getPendaftaran]);

    // const actionBodyTemplate = (rowData) => (
    //     <>
    //         <Button icon="pi pi-pencil" severity="success" rounded className="mr-2" onClick={() => openEditDialog(rowData)} />
    //         <Button icon="pi pi-trash" severity="danger" rounded onClick={() => openDeleteDialog(rowData)} />
    //     </>
    // );

    // const footerDeleteTemplate = (
    //     <div>
    //         <Button label="Tidak" icon="pi pi-times" onClick={() => setDialogVisible(false)} className="p-button-text" />
    //         <Button label="Ya" icon="pi pi-check" onClick={handleDelete} />
    //     </div>
    // );

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <Button label="Tambah" icon="pi pi-plus" onClick={() => router.push('/pendaftaran/pendaftaran-pasien/form')} />
            <span className="p-input-icon-left mt-2 md:mt-0">
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    placeholder="Cari..."
                    value={searchVal}
                    onInput={(e) => {
                        const val = e.target.value;
                        setSearchVal(val);
                        setFilters({ global: { value: val, matchMode: FilterMatchMode.CONTAINS } });
                    }}
                />
            </span>
        </div>
    );

    return (
        <>
            <Toast ref={toast} />
            <div className="card">
                <h4>Database Pasien</h4>
                <DataTable
                    value={data}
                    paginator
                    rows={10}
                    header={header}
                    globalFilterFields={[
                        'no_rm', 'nama', 'tgl_lahir', 'jns_kelamin', 'alamat',
                        'no_tlp', 'pendidikan', 'pekerjaan',
                        'no_ktp', 'no_asuransi', 'jns_asuransi'
                    ]}
                    filters={filters}
                    loading={loading}
                    emptyMessage="Data Kosong"
                    onRowClick={handleRowClick}
                >
                    <Column field="no_rm" header="No. RM" style={{ width: '8%' }} />
                    <Column field="nama" header="Nama" style={{ width: '15%' }} />
                    <Column
                        field="tgl_lahir"
                        header="Tanggal Lahir"
                        style={{ width: '10%' }}
                        body={(rowData) => new Date(rowData.tgl_lahir).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        })}
                    />

                    <Column field="jns_kelamin" header="Jenis Kelamin" style={{ width: '10%' }} />
                    <Column field="alamat" header="Alamat" style={{ width: '15%' }} />
                    <Column field="no_tlp" header="No. Telepon" style={{ width: '10%' }} />
                    <Column field="pendidikan" header="Pendidikan" style={{ width: '8%' }} />
                    <Column field="pekerjaan" header="Pekerjaan" style={{ width: '10%' }} />
                    <Column field="no_ktp" header="No. KTP" />
                    <Column field="no_asuransi" header="No. Asuransi" />
                    <Column field="jns_asuransi" header="Jenis Asuransi" />
                    {/* <Column header="Action" body={actionBodyTemplate} headerStyle={{ textAlign: 'center' }} /> */}
                </DataTable>
            </div>

            {/* Dialog Hapus */}
            {/* <Dialog
                header={isDelete ? "Konfirmasi Hapus" : "Edit Data"}
                visible={dialogVisible && isDelete}
                onHide={() => setDialogVisible(false)}
                footer={footerDeleteTemplate}
            >
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    <span>
                        Apakah Anda yakin ingin menghapus pasien <strong>{selectedPatient?.nama}</strong>?
                    </span>
                </div>
            </Dialog> */}

            {/* Dialog Detail */}
            <Dialog
                header="Detail Informasi Pasien"
                visible={detailDialogVisible}
                onHide={() => {
                    setDetailDialogVisible(false);
                    setViewMode('detail'); // Reset ke tampilan awal saat dialog ditutup
                }}
                style={{ width: '500px' }}
                modal
                className="p-fluid"
            >
                {viewMode === 'detail' && detailData && (
                    <Card className="px-4 py-2 bg-white border-1 border-gray-200">
                        <div className="text-sm text-gray-700 space-y-6">
                            <div>
                                <h5 className="mb-3 text-bold flex items-center gap-2 text-base font-semibold border-b pb-2">
                                    <i className="pi pi-user" /> Informasi Pribadi
                                </h5>
                                <p><span className="font-medium">Nama:</span> {detailData.nama}</p>
                                <p><span className="font-medium">No. RM:</span> {detailData.no_rm}</p>
                                <p><span className="font-medium">Tempat Lahir:</span> {detailData.tempat_lahir}</p>
                                <p><span className="font-medium">Tanggal Lahir:</span> {detailData.tgl_lahir}</p>
                                <p><span className="font-medium">Jenis Kelamin:</span> {detailData.jns_kelamin}</p>
                            </div>
                            <Divider className="my-4" />
                            <div>
                                <h5 className="my-3 text-bold flex items-center gap-2 text-base font-semibold border-b pb-2">
                                    <i className="pi pi-map-marker" /> Kontak & Alamat
                                </h5>
                                <p><span className="font-medium">Alamat:</span> {detailData.alamat}</p>
                                <p><span className="font-medium">No. Telepon:</span> {detailData.no_tlp}</p>
                            </div>
                            <Divider className="my-4" />
                            <div>
                                <h5 className="my-3 text-bold flex items-center gap-2 text-base font-semibold border-b pb-2">
                                    <i className="pi pi-briefcase" /> Pekerjaan & Pendidikan
                                </h5>
                                <p><span className="font-medium">Pendidikan:</span> {detailData.pendidikan}</p>
                                <p><span className="font-medium">Pekerjaan:</span> {detailData.pekerjaan}</p>
                            </div>
                            <Divider className="my-4" />
                            <div>
                                <h5 className="my-3 text-bold flex items-center gap-2 text-base font-semibold border-b pb-2">
                                    <i className="pi pi-id-card" /> Identitas & Asuransi
                                </h5>
                                <p><span className="font-medium">No. KTP:</span> {detailData.no_ktp}</p>
                                <p><span className="font-medium">No. Asuransi:</span> {detailData.no_asuransi}</p>
                                <p><span className="font-medium">Jenis Asuransi:</span> {detailData.jns_asuransi}</p>
                            </div>
                        </div>
                    </Card>
                )}

            </Dialog>
        </>
    );
};

export default PendaftaranPasien;