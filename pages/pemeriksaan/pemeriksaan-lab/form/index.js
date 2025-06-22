'use client'
import { useEffect, useRef, useState } from 'react';
import { InputText } from "primereact/inputtext";
import { Button } from 'primereact/button';
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from 'primereact/inputtextarea';
import { useFormik } from 'formik';
import { Toast } from 'primereact/toast';
import { Axios } from '../../../../lib/Axios';
import { useRouter } from 'next/router';


const PemeriksaanPasien = () => {
    //state
    const toast = useRef(null);
    const router = useRouter();


    const [dataPemeriksaan, setDataPemeriksaan] = useState({
        data: [],
        load: false,
        show: false,
        edit: false,
        delete: false,

        searchVal: '',
        // filters: { global: { value: null, matchMode: FilterMatchMode.CONTAINS } }
    });

    const [dataPendaftaran, setDataPendaftaran] = useState({
        data: [],
        load: false,
        show: false,
        edit: false,
        delete: false,

        searchVal: '',
        // filters: { global: { value: null, matchMode: FilterMatchMode.CONTAINS } }
    });

    //function

    const showSuccess = (detail) => {
        toast.current.show({ severity: 'success', summary: 'Success Message', detail: detail, life: 3000 });
    };

    const showError = (detail) => {
        toast.current.show({ severity: 'error', summary: 'Error Message', detail: detail, life: 3000 });
    };


    const formik = useFormik({
        initialValues: {
            id: '',
            no_rm: '',
            tgl_reservasi: '',
            kode_kunjungan: '',
            ruangan: '',
            keluhan: '',
        },
        validate: (data) => {
            let errors = {};
            // Validasi no_rm
            if (!data.no_rm) {
                errors.no_rm = 'No. Rekam Medis wajib diisi';
            }

            // Validasi tgl_reservasi
            if (!data.tgl_reservasi) {
                errors.tgl_reservasi = 'Tanggal wajib diisi';
            }


            // Validasi ruangan
            if (!data.ruangan) {
                errors.ruangan = 'Ruangan wajib diisi';
            }

            // Validasi keluhan
            if (!data.keluhan) {
                errors.keluhan = 'Keluhan wajib diisi';
            }

            return errors;
        },
        onSubmit: (data) => {
            handleSave(data);
        }
    });

    const isFormFieldInvalid = (nama) => !!(formik.touched[nama] && formik.errors[nama]);

    const getFormErrorMessage = (nama) => {
        return isFormFieldInvalid(nama) ? <small className="p-error">{formik.errors[nama]}</small> : <small className="p-error">&nbsp;</small>;
    };

    useEffect(() => {
        getReservasi();
        getPendaftaran();

    }, []);

    const handleSave = async (input) => {
        try {
            let endPoint;

            let body = {
                no_rm: input.no_rm,
                tgl_reservasi: input.tgl_reservasi,
                ruangan: input.ruangan,
                keluhan: input.keluhan
            };
            if (input.id) {
                endPoint = '/reservasi/update';
                body.id = input.id;
            } else {
                endPoint = '/reservasi/store';
            }

            console.log(body)
            // Kirim data ke server
            const vaData = await Axios.post('http://localhost:8000/api' + endPoint, body);
            let res = vaData.data;
            showSuccess(res.data?.message || 'Berhasil Menyimpan Data');
            formik.resetForm();
            getReservasi();

            router.push('/pendaftaran/reservasi-pasien');
        } catch (error) {
            console.log(error);
            const e = error?.response?.data || error;
            showError(e?.message || 'Terjadi Kesalahan');
        }
    };

    const getReservasi = async () => {
        setDataReservasi((p) => ({ ...p, load: true }));
        try {
            // Kirim data ke server
            const vaData = await Axios.get('/reservasi/get', {});
            let res = vaData.data;
            console.log(res);
            setDataReservasi((p) => ({ ...p, data: res.data }));
            formik.resetForm();
        } catch (error) {
            console.log(error);
            const e = error?.response?.data || error;
            showError(e?.message || 'Terjadi Kesalahan');
        } finally {
            setDataReservasi((p) => ({ ...p, load: false, show: false, edit: false, delete: false }));
        }
    };

    const getPendaftaran = async () => {
        setDataPendaftaran((p) => ({ ...p, load: true }));
        try {
            // Kirim data ke server
            const vaData = await Axios.get('/pendaftaran/get', {});
            let res = vaData.data;
            console.log(res);
            setDataPendaftaran((p) => ({ ...p, data: res.data }));
            formik.resetForm();
        } catch (error) {
            console.log(error);
            const e = error?.response?.data || error;
            showError(e?.message || 'Terjadi Kesalahan');
        } finally {
            setDataPendaftaran((p) => ({ ...p, load: false, show: false, edit: false, delete: false }));
        }
    };

    return (
        <div className='card max-w-4xl mx-auto'>
            <Toast ref={toast}></Toast>
            <div className='p-2'>
                <h2 className="text-2xl">Form Reservasi</h2>
                <form onSubmit={formik.handleSubmit}>
                    
                    <div className="flex md:flex-row flex-column gap-3 w-full">
                        <div className="flex flex-column gap-2 w-full mb-2">
                            <label htmlFor="no_ktp">No. Rekam Medis</label>
                            <div className="p-inputgroup">
                                <InputText
                                    id="no_rm"
                                    name="no_rm"
                                    placeholder="Cari No. Rekam Medis"
                                    options={dataPendaftaran.data.map((item) => item.no_rm)}
                                    value={formik.values.no_rm}
                                    onChange={(e) => {
                                        formik.setFieldValue('no_rm', e.target.value);
                                    }}
                                    className={isFormFieldInvalid('no_rm') ? 'p-invalid' : ''}
                                />
                                {isFormFieldInvalid('no_ktp') ? getFormErrorMessage('no_ktp') : ''}
                                <span className="p-inputgroup-addon">
                                    <i className="pi pi-search"></i>
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-column gap-2 w-full mb-2">
                            <label htmlFor="keluhan">Nama</label>
                            <div className="p-inputgroup">
                                <InputText
                                    id="keluhan"
                                    name="keluhan"
                                    placeholder=""
                                    value={formik.values.keluhan}
                                    onChange={(e) => {
                                        formik.setFieldValue('keluhan', e.target.value);
                                    }}
                                    // className={isFormFieldInvalid('keluhan') ? 'p-invalid' : ''}
                                    disabled
                                />
                            </div>
                            {/* {isFormFieldInvalid('keluhan') ? getFormErrorMessage('keluhan') : ''} */}
                        </div>
                        <div className="flex flex-column gap-2 w-full mb-2">
                            <label htmlFor='tgl_reservasi'>Tanggal Reservasi</label>
                            <div className="p-inputgroup">
                                <Calendar
                                    id="tgl_reservasi"
                                    placeholder="Masukkan Tanggal Reservasi"
                                    value={formik.values.tgl_reservasi}
                                    onChange={(e) =>
                                        formik.setFieldValue('tgl_reservasi', e.value)}
                                    showIcon
                                    className={isFormFieldInvalid('tgl_reservasi') ? 'p-invalid' : ''}
                                />
                            </div>
                            {isFormFieldInvalid('tgl_reservasi') ? getFormErrorMessage('tgl_reservasi') : ''}
                        </div>
                    </div>
                    <div className="flex md:flex-row flex-column gap-2 w-full">
                        <div className="flex flex-column gap-2 w-full mb-2">
                            <label htmlFor="keluhan">Keluhan</label>
                            <div className="p-inputgroup">
                                <InputText
                                    id="keluhan"
                                    name="keluhan"
                                    placeholder="Masukkan Keluhan"
                                    value={formik.values.keluhan}
                                    onChange={(e) => {
                                        formik.setFieldValue('keluhan', e.target.value);
                                    }}
                                    className={isFormFieldInvalid('keluhan') ? 'p-invalid' : ''}
                                />
                            </div>
                            {isFormFieldInvalid('keluhan') ? getFormErrorMessage('keluhan') : ''}
                        </div>
                        <div className="flex flex-column gap-2 w-full mb-2">
                            <label htmlFor="ruangan">Ruangan</label>
                            <div className="p-inputgroup">
                                <Dropdown
                                    id="ruangan"
                                    name="ruangan"
                                    placeholder="Pilih Ruangan"
                                    options={['Pemeriksaan Umum', 'Poli Gigi', 'Poli Anak']}
                                    value={formik.values.ruangan}
                                    onChange={(e) => {
                                        formik.setFieldValue('ruangan', e.target.value);
                                    }}
                                    className={isFormFieldInvalid('ruangan') ? 'p-invalid' : ''}
                                />
                            </div>
                            {isFormFieldInvalid('ruangan') ? getFormErrorMessage('ruangan') : ''}
                        </div>
                    </div>
                    <Button type="submit" label={dataReservasi.edit ? 'Update' : 'Save'} className="mt-2" loading={dataReservasi.load} />
                    <Button type="button" onClick={() => router.push('/pendaftaran/reservasi-pasien')} className="mt-2 ml-2 p-button-secondary">
                        Back
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ReservasiPasien;