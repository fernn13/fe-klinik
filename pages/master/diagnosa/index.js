'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useFormik } from 'formik';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { FilterMatchMode } from 'primereact/api';
import * as XLSX from 'xlsx';
import { Axios } from '../../../lib/Axios';

const MasterDiagnosaPage = () => {
    const toast = useRef(null);

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isDelete, setIsDelete] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    const [searchVal, setSearchVal] = useState('');

    const showSuccess = (detail) => {
        toast.current.show({ severity: 'success', summary: 'Success', detail, life: 3000 });
    };

    const showError = (detail) => {
        toast.current.show({ severity: 'error', summary: 'Error', detail, life: 3000 });
    };

    const fetchDiagnosa = useCallback(async () => {
        setLoading(true);
        try {
            const res = await Axios.get('/diagnosa');
            setData(res.data.data);
        } catch (err) {
            showError(err?.response?.data?.message || 'Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDiagnosa();
    }, [fetchDiagnosa]);

    const formik = useFormik({
        initialValues: { id: '', kode: '', nama: '' },
        onSubmit: async (values) => {
            try {
                if (values.id) {
                    // Edit mode (update)
                    await Axios.put(`/diagnosa/update`, values);
                    showSuccess('Data berhasil diperbarui');
                } else {
                    // Tambah mode
                    await Axios.post('/diagnosa', values);
                    showSuccess('Data berhasil ditambahkan');
                }
                setDialogVisible(false);
                fetchDiagnosa();
            } catch (e) {
                showError(e.response?.data?.message || e.message);
            }
        }
    });

    const openEditDialog = (rowData) => {
        setIsEdit(true);
        setIsDelete(false);
        setDialogVisible(true);
        setSelectedData(rowData);
        formik.setValues({ id: rowData.id, kode: rowData.kode, nama: rowData.nama });
    };

    const openDeleteDialog = (rowData) => {
        setIsEdit(false);
        setIsDelete(true);
        setDialogVisible(true);
        setSelectedData(rowData);
        formik.setFieldValue('id', rowData.id);
    };

    const handleDelete = async () => {
        if (!formik.values.id) return showError('ID tidak ditemukan');
        try {
            const res = await Axios.delete(`/diagnosa/${formik.values.id}`)
            showSuccess(res.data.message);
            setDialogVisible(false);
            setIsDelete(false);
            fetchDiagnosa();
        } catch (err) {
            showError(err?.response?.data?.message || 'Terjadi kesalahan saat menghapus');
        }
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const wb = XLSX.read(evt.target.result, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const importedData = XLSX.utils.sheet_to_json(ws);

            try {
                await Axios.post('/diagnosa/import', { data: importedData });
                showSuccess('Data berhasil diimpor');
                fetchDiagnosa();
            } catch (err) {
                showError(err?.response?.data?.message || 'Gagal mengimpor data');
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleExport = () => {
        const sheet = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, sheet, 'Diagnosa');
        XLSX.writeFile(wb, 'master_diagnosa.xlsx');
    };

    const actionBodyTemplate = (rowData) => (
        <>
            <Button icon="pi pi-pencil" severity="success" rounded className="mr-2" onClick={() => openEditDialog(rowData)} />
            <Button icon="pi pi-trash" severity="danger" rounded onClick={() => openDeleteDialog(rowData)} />
        </>
    );

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <div className="flex gap-2">
                <Button label="Tambah" icon="pi pi-plus" onClick={() => {
                    formik.resetForm();
                    setIsEdit(true);
                    setIsDelete(false);
                    setDialogVisible(true);
                }} />
                <Button severity="info">

                    <label className="flex items-center gap-2 cursor-pointer">
                        <i className="pi pi-file-import" />
                        <span>Impor</span>
                        <input type="file" accept=".xlsx,.xls" hidden onChange={handleImport} />
                    </label>
                </Button>
                <Button label="Ekspor" icon="pi pi-file-excel" onClick={handleExport} />
            </div>

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

    const footerDeleteTemplate = (
        <div>
            <Button label="Tidak" icon="pi pi-times" onClick={() => setDialogVisible(false)} className="p-button-text" />
            <Button label="Ya" icon="pi pi-check" onClick={handleDelete} />
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <h4>Master Diagnosa</h4>

            <DataTable
                value={data}
                paginator
                rows={50}
                header={header}
                globalFilterFields={['kode', 'nama']}
                filters={filters}
                loading={loading}
                emptyMessage="Data Kosong"
            >
                <Column field="id" header="No" />
                <Column field="kode" header="Kode Diagnosa" />
                <Column field="nama" header="Diagnosa ICD-10" />
                <Column header="Aksi" body={actionBodyTemplate} headerStyle={{ textAlign: 'center' }} />
            </DataTable>

            <Dialog
                header={isDelete ? "Konfirmasi Hapus" : formik.values.id ? "Edit Diagnosa" : "Tambah Diagnosa"}
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                footer={isDelete ? footerDeleteTemplate : null}
                style={{ width: '30rem' }}
                modal
            >
                {isDelete ? (
                    <div className="flex align-items-center justify-content-center">
                        <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                        <span>
                            Apakah Anda yakin ingin menghapus diagnosa <strong>{selectedData?.nama}</strong>?
                        </span>
                    </div>
                ) : (
                    <form onSubmit={formik.handleSubmit} className="p-fluid">
                        <div className="field">
                            <label htmlFor="kode">Kode Diagnosa</label>
                            <InputText id="kode" name="kode" value={formik.values.kode} onChange={formik.handleChange} />
                        </div>
                        <div className="field">
                            <label htmlFor="nama">Nama Diagnosa</label>
                            <InputText id="nama" name="nama" value={formik.values.nama} onChange={formik.handleChange} />
                        </div>
                        <Button
                            label={formik.values.id ? 'Perbarui' : 'Tambah'}
                            type="submit"
                            className="mt-2"
                        />
                    </form>
                )}
            </Dialog>

        </div>
    );
};

export default MasterDiagnosaPage;
