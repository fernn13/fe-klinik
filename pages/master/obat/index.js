'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useFormik } from 'formik';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { FilterMatchMode } from 'primereact/api';
import * as XLSX from 'xlsx';
import { Axios } from '../../../lib/Axios';

const satuanOptions = [
    { label: 'Strip', value: 'strip' },
    { label: 'Botol', value: 'botol' },
    { label: 'Tablet', value: 'tablet' },
    { label: 'Box', value: 'box' },
];

const MasterObatPage = () => {
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

    const fetchObat = useCallback(async () => {
        setLoading(true);
        try {
            const res = await Axios.get('/obat');
            setData(res.data.data);
        } catch (err) {
            showError(err?.response?.data?.message || 'Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchObat();
    }, [fetchObat]);

    const formik = useFormik({
        initialValues: {
            id: '',
            kode_obat: '',
            nama_obat: '',
            satuan: '',
            isi: 0,
            stok: 0,
            harga_jual: 0,
            minimum_persediaan: 0
        },
        onSubmit: async (values) => {
            try {
                if (!values.id) {
                    // Generate kode_obat otomatis (dummy)
                    const lastNumber = data.length + 1;
                    values.kode_obat = 'OBT' + String(lastNumber).padStart(4, '0');
                }
                if (values.id) {
                    await Axios.put(`/obat/update`, values);
                    showSuccess('Data berhasil diperbarui');
                } else {
                    await Axios.post('/obat', values);
                    showSuccess('Data berhasil ditambahkan');
                }
                setDialogVisible(false);
                fetchObat();
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
        formik.setValues(rowData);
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
            const res = await Axios.delete(`/obat/${formik.values.id}`);
            showSuccess(res.data.message);
            setDialogVisible(false);
            setIsDelete(false);
            fetchObat();
        } catch (err) {
            showError(err?.response?.data?.message || 'Terjadi kesalahan saat menghapus');
        }
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
            <h4>Master Data Obat</h4>

            <DataTable
                value={data}
                paginator
                rows={50}
                header={header}
                globalFilterFields={['kode_obat', 'nama_obat']}
                filters={filters}
                loading={loading}
                emptyMessage="Data Kosong"
            >
                <Column field="id" header="No" />
                <Column field="kode_obat" header="Kode Obat" />
                <Column field="nama_obat" header="Nama Obat" />
                <Column field="satuan" header="Satuan" />
                <Column field="isi" header="Isi" />
                <Column field="stok" header="Stok" />
                <Column field="harga_jual" header="Harga Jual" />
                <Column field="minimum_persediaan" header="Min. Persediaan" />
                <Column header="Aksi" body={actionBodyTemplate} />
            </DataTable>

            <Dialog
                header={isDelete ? "Konfirmasi Hapus" : formik.values.id ? "Edit Obat" : "Tambah Obat"}
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                footer={isDelete ? footerDeleteTemplate : null}
                style={{ width: '35rem' }}
                modal
            >
                {isDelete ? (
                    <div className="flex align-items-center justify-content-center">
                        <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                        <span>
                            Yakin hapus obat <strong>{selectedData?.nama_obat}</strong>?
                        </span>
                    </div>
                ) : (
                    <form onSubmit={formik.handleSubmit} className="p-fluid">
                        {/* <div className="field">
                            <label htmlFor="kode_obat">Kode Obat</label>
                            <InputText id="kode_obat" name="kode_obat" value={formik.values.kode_obat} onChange={formik.handleChange} />
                        </div> */}
                        <div className="field">
                            <label htmlFor="nama_obat">Nama Obat</label>
                            <InputText id="nama_obat" name="nama_obat" value={formik.values.nama_obat} onChange={formik.handleChange} />
                        </div>
                        <div className="field">
                            <label htmlFor="satuan">Satuan</label>
                            <Dropdown id="satuan" name="satuan" options={satuanOptions} value={formik.values.satuan} onChange={(e) => formik.setFieldValue('satuan', e.value)} placeholder="Pilih satuan" />
                        </div>
                        <div className="field">
                            <label htmlFor="isi">Isi</label>
                            <InputNumber id="isi" name="isi" value={formik.values.isi} onValueChange={(e) => formik.setFieldValue('isi', e.value)} />
                        </div>
                        <div className="field">
                            <label htmlFor="stok">Stok</label>
                            <InputNumber id="stok" name="stok" value={formik.values.stok} onValueChange={(e) => formik.setFieldValue('stok', e.value)} />
                        </div>
                        <div className="field">
                            <label htmlFor="harga_jual">Harga Jual</label>
                            <InputNumber id="harga_jual" name="harga_jual" value={formik.values.harga_jual} onValueChange={(e) => formik.setFieldValue('harga_jual', e.value)} mode="currency" currency="IDR" locale="id-ID" />
                        </div>
                        <div className="field">
                            <label htmlFor="minimum_persediaan">Min. Persediaan</label>
                            <InputNumber id="minimum_persediaan" name="minimum_persediaan" value={formik.values.minimum_persediaan} onValueChange={(e) => formik.setFieldValue('minimum_persediaan', e.value)} />
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

export default MasterObatPage;
