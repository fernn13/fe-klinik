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

const ReservasiPasien = () => {
  const toast = useRef(null);
  const router = useRouter();

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

  const showSuccess = (detail) => {
    toast.current.show({ severity: 'success', summary: 'Success', detail, life: 3000 });
  };

  const showError = (detail) => {
    toast.current.show({ severity: 'error', summary: 'Error', detail, life: 3000 });
  };

  const getReservasi = useCallback(async () => {
    setLoading(true);
    try {
      const res = await Axios.get('http://localhost:8000/api/reservasi/get');
      // console.log(res)
      setData(res.data.data);
    } catch (err) {
      console.error(err.message)
      showError(err?.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async () => {
    if (!formik.values.id) return showError('ID tidak ditemukan');
    try {
      const res = await Axios.delete(`/reservasi/delete?id=${formik.values.id}`);
      showSuccess(res.data.message);
      setDialogVisible(false);
      setIsDelete(false);
      getReservasi();
    } catch (err) {
      showError(err?.response?.data?.message || 'Terjadi kesalahan saat menghapus');
    }
  };

  const formik = useFormik({
    initialValues: {
      id: '',
      no_rm: '',
      tgl_reservasi: '',
      kode_kunjungan: '',
      ruangan: '',
      keluhan: ''
    },
    onSubmit: () => { }
  });

  const openEditDialog = (rowData) => {
    setIsEdit(true);
    setIsDelete(false);
    setDialogVisible(true);
    setSelectedPatient(rowData);
    formik.setValues({
      id: rowData.id,
      no_rm: rowData.no_rm,
      tgl_reservasi: rowData.tgl_reservasi,
      kode_kunjungan: rowData.kode_kunjungan,
      ruangan: rowData.ruangan,
      keluhan: rowData.keluhan
    });
  };

  const openDeleteDialog = (rowData) => {
    setIsEdit(false);
    setIsDelete(true);
    setDialogVisible(true);
    setSelectedPatient(rowData);
    formik.setFieldValue('id', rowData.id);
  };

  useEffect(() => {
    getReservasi();
  }, [getReservasi]);

  const actionBodyTemplate = (rowData) => (
    <>
      <Button icon="pi pi-pencil" severity="success" rounded className="mr-2" onClick={() => openEditDialog(rowData)} />
      <Button icon="pi pi-trash" severity="danger" rounded onClick={() => openDeleteDialog(rowData)} />
    </>
  );

  const footerDeleteTemplate = (
    <div>
      <Button label="Tidak" icon="pi pi-times" onClick={() => setDialogVisible(false)} className="p-button-text" />
      <Button label="Ya" icon="pi pi-check" onClick={handleDelete} />
    </div>
  );

  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <Button label="Tambah" icon="pi pi-plus" onClick={() => router.push('/pendaftaran/reservasi-pasien/form')} />
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
        <h4>Reservasi Pasien</h4>
        <DataTable
          value={data}
          paginator
          rows={10}
          header={header}
          globalFilterFields={[
            'no_rm', 'tgl_reservasi'
          ]}
          filters={filters}
          loading={loading}
          emptyMessage="Data Kosong"
        >
          <Column field="no_rm" header="No. RM"/>
          <Column field="tgl_reservasi" header="Tanggal Reservasi"/>
          <Column field="kode_kunjungan" header="Kode Kunjungan"/>
          <Column field="keluhan" header="Keluhan"/>
          <Column field="ruangan" header="Ruangan"/>
          <Column header="Action" body={actionBodyTemplate} headerStyle={{ textAlign: 'center' }} />
        </DataTable>
      </div>

      <Dialog
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
      </Dialog>
    </>
  );
};

export default ReservasiPasien;
