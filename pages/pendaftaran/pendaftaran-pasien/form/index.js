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


const PendaftaranPasien = () => {
    //state
    const toast = useRef(null);
    const router = useRouter();


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
            //no_rm: '',
            nama: '',
            tempat_lahir: '',
            tgl_lahir: new Date(),
            jns_kelamin: '',
            alamat: '',
            no_tlp: '',
            pendidikan: '',
            pekerjaan: '',
            no_ktp: '',
            no_asuransi: '',
            jns_asuransi: '',
        },
        validate: (data) => {
            let errors = {};
            // Validasi nama
            if (!data.nama) {
                errors.nama = 'Nama wajib diisi';
            } else if (data.nama.length < 3) {
                errors.nama = 'Nama harus terdiri dari minimal 3 karakter';
            } else if (!/^[a-zA-Z\s]+$/.test(data.nama)) {
                errors.nama = 'Nama hanya boleh berisi huruf dan spasi';
            }

            // Validasi tempat lahir
            if (!data.tempat_lahir) {
                errors.tempat_lahir = 'Tempat wajib diisi';
            }

            // Validasi tanggal lahir
            if (!data.tgl_lahir) {
                errors.tgl_lahir = 'Tanggal wajib diisi';
            }

            // Validasi alamat
            if (!data.alamat) {
                errors.alamat = 'Alamat wajib diisi';
            }

            // Validasi no_tlp
            if (!data.no_tlp) {
                errors.no_tlp = 'Nomor HP wajib diisi';
            } else if (!/^(08|(\+62))\d{8,13}$/.test(data.no_tlp)) {
                errors.no_tlp = 'Nomor HP harus dimulai dengan 08 dan panjang 9-13 digit';
            }

            // Validasi pendidikan
            if (!data.pendidikan) {
                errors.pendidikan = 'Pendidikan wajib diisi';
            }

            // Validasi pekerjaan
            if (!data.pekerjaan) {
                errors.pekerjaan = 'Pekerjaan wajib diisi';
            }

            // Validasi no_ktp
            if (!data.no_ktp) {
                errors.no_ktp = 'No KTP wajib diisi';
            } else if (!/^\d+$/.test(data.no_ktp)) {
                errors.no_ktp = 'No KTP hanya boleh berisi angka';
            } else if (data.no_ktp.length !== 16) {
                errors.no_ktp = 'No KTP harus terdiri dari 16 digit'
            }

            // Validasi no_asuransi
            if (!data.no_asuransi) {
                errors.no_asuransi = 'No Asuransi wajib diisi';
            } else if (!/^\d+$/.test(data.no_asuransi)) {
                errors.no_asuransi = 'No Asuransi hanya boleh berisi angka';
            } else if (data.no_asuransi.length < 6) {
                errors.no_asuransi = 'No Asuransi minimal terdiri dari 6 digit';
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
        getPendaftaran();
    }, []);

    const handleSave = async (input) => {
        try {
            let endPoint;

            let body = {
                nama: input.nama,
                tempat_lahir: input.tempat_lahir,
                tgl_lahir: input.tgl_lahir,
                jns_kelamin: input.jns_kelamin,
                alamat: input.alamat,
                no_tlp: input.no_tlp,
                pendidikan: input.pendidikan,
                pekerjaan: input.pekerjaan,
                no_ktp: input.no_ktp,
                no_asuransi: input.no_asuransi,
                jns_asuransi: input.jns_asuransi
            };
            if (input.id) {
                endPoint = '/pendaftaran/update';
                body.id = input.id;
            } else {
                endPoint = '/pendaftaran/store';
            }

            console.log(body)
            // Kirim data ke server
            const vaData = await Axios.post('http://localhost:8000/api' + endPoint, body);
            let res = vaData.data;
            showSuccess(res.data?.message || 'Berhasil Menyimpan Data');
            formik.resetForm();
            getPendaftaran();

            router.push('/pendaftaran/pendaftaran-pasien');
        } catch (error) {
            console.log(error);
            const e = error?.response?.data || error;
            showError(e?.message || 'Terjadi Kesalahan');
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
                <h2 className="text-2xl">Form Pendaftaran</h2>
                <form onSubmit={formik.handleSubmit}>
                    <div className="flex flex-column gap-2 w-full mb-2">
                        <label htmlFor="no_ktp">No. KTP</label>
                        <div className="p-inputgroup">
                            <InputText
                                id="no_ktp"
                                name="no_ktp"
                                placeholder="Masukkan No. KTP"
                                value={formik.values.no_ktp}
                                onChange={(e) => {
                                    formik.setFieldValue('no_ktp', e.target.value);
                                }}
                                className={isFormFieldInvalid('no_ktp') ? 'p-invalid' : ''}
                            />
                            {isFormFieldInvalid('no_ktp') ? getFormErrorMessage('no_ktp') : ''}
                            <span className="p-inputgroup-addon">
                                <i className="pi pi-search"></i>
                            </span>
                        </div>
                    </div>
                    <div className="flex md:flex-row flex-column gap-2 w-full">
                        <div className="flex flex-column gap-2 w-full mb-2">
                            <label htmlFor="nama">Nama</label>
                            <div className="p-inputgroup">
                                <InputText
                                    id="nama"
                                    name="nama"
                                    placeholder="Masukkan Nama"
                                    value={formik.values.nama}
                                    onChange={(e) => {
                                        formik.setFieldValue('nama', e.target.value);
                                    }}
                                    className={isFormFieldInvalid('nama') ? 'p-invalid' : ''}
                                />
                            </div>
                            {isFormFieldInvalid('nama') ? getFormErrorMessage('nama') : ''}
                        </div>
                        <div className="flex flex-column gap-2 w-full mb-2">
                            <label htmlFor="jns_kelamin">Jenis Kelamin</label>
                            <div className="p-inputgroup">
                                <Dropdown
                                    id="jns_kelamin"
                                    name="jns_kelamin"
                                    placeholder="Pilih Jenis Kelamin"
                                    options={['Laki-laki', 'Perempuan']}
                                    value={formik.values.jns_kelamin}
                                    onChange={(e) => {
                                        formik.setFieldValue('jns_kelamin', e.target.value);
                                    }}
                                    className={isFormFieldInvalid('jns_kelamin') ? 'p-invalid' : ''}
                                />
                            </div>
                            {isFormFieldInvalid('jns_kelamin') ? getFormErrorMessage('jns_kelamin') : ''}
                        </div>
                    </div>
                    <div className="flex md:flex-row flex-column gap-2 w-full">
                        <div className="flex flex-column gap-2 w-full mb-2">
                            <label htmlFor="tempat_lahir">Tempat Lahir</label>
                            <div className="p-inputgroup">
                                <InputText
                                    id="tempat_lahir"
                                    name="tempat_lahir"
                                    placeholder="Masukkan Tempat Lahir"
                                    value={formik.values.tempat_lahir}
                                    onChange={(e) => {
                                        formik.setFieldValue('tempat_lahir', e.target.value);
                                    }}
                                    className={isFormFieldInvalid('tempat_lahir') ? 'p-invalid' : ''}
                                />
                            </div>
                            {isFormFieldInvalid('tempat_lahir') ? getFormErrorMessage('tempat_lahir') : ''}
                        </div>
                        <div className="flex flex-column gap-2 w-full mb-2">
                            <label htmlFor='tgl_lahir'>Tanggal Lahir</label>
                            <div className="p-inputgroup">
                                <Calendar
                                    id="tgl_lahir"
                                    placeholder="Masukkan Tanggal Lahir"
                                    value={formik.values.tgl_lahir}
                                    onChange={(e) =>
                                        formik.setFieldValue('tgl_lahir', e.value)}
                                    dateFormat="d/m/yy"
                                    showIcon
                                    className={isFormFieldInvalid('tgl_lahir') ? 'p-invalid' : ''}
                                />
                            </div>
                            {isFormFieldInvalid('tgl_lahir') ? getFormErrorMessage('tgl_lahir') : ''}
                        </div>
                    </div>
                    <div className="flex flex-column gap-2 w-full mb-2">
                        <label htmlFor="alamat">Alamat</label>
                        <div className="p-inputgroup">
                            <InputTextarea
                                id="alamat"
                                name="alamat"
                                placeholder="Masukkan Alamat"
                                value={formik.values.alamat}
                                onChange={(e) => {
                                    formik.setFieldValue('alamat', e.target.value);
                                }}
                                className={isFormFieldInvalid('alamat') ? 'p-invalid' : ''}
                            />
                        </div>
                        {isFormFieldInvalid('alamat') ? getFormErrorMessage('alamat') : ''}
                    </div>
                    <div className="flex md:flex-row flex-column gap-2 w-full">
                        <div className="flex flex-column gap-2 w-full mb-2">
                            <label htmlFor="pekerjaan">Pekerjaan</label>
                            <div className="p-inputgroup">
                                <InputText
                                    id="pekerjaan"
                                    name="pekerjaan"
                                    placeholder="Masukkan Pekerjaan"
                                    value={formik.values.pekerjaan}
                                    onChange={(e) => {
                                        formik.setFieldValue('pekerjaan', e.target.value);
                                    }}
                                    className={isFormFieldInvalid('pekerjaan') ? 'p-invalid' : ''}
                                />
                            </div>
                            {isFormFieldInvalid('pekerjaan') ? getFormErrorMessage('pekerjaan') : ''}
                        </div>
                        <div className="flex flex-column gap-2 w-full mb-2">
                            <label htmlFor='pendidikan'>Pendidikan</label>
                            <div className="p-inputgroup">
                                <InputText
                                    id="pendidikan"
                                    name="pendidikan"
                                    placeholder="Masukkan Pendidikan"
                                    value={formik.values.pendidikan}
                                    onChange={(e) => {
                                        formik.setFieldValue('pendidikan', e.target.value);
                                    }}
                                    className={isFormFieldInvalid('pendidikan') ? 'p-invalid' : ''}
                                />
                            </div>
                            {isFormFieldInvalid('pendidikan') ? getFormErrorMessage('pendidikan') : ''}
                        </div>
                    </div>
                    <div className="flex md:flex-row flex-column gap-2 w-full">
                        <div className="flex flex-column gap-2 w-full mb-2">
                            <label htmlFor='no_tlp'>No. HP</label>
                            <div className="p-inputgroup">
                                <InputText
                                    id="no_tlp"
                                    name="no_tlp"
                                    placeholder="Masukkan No. HP"
                                    value={formik.values.no_tlp}
                                    onChange={(e) => {
                                        formik.setFieldValue('no_tlp', e.target.value);
                                    }}
                                    className={isFormFieldInvalid('no_tlp') ? 'p-invalid' : ''}
                                />
                            </div>
                            {isFormFieldInvalid('no_tlp') ? getFormErrorMessage('no_tlp') : ''}
                        </div>
                        <div className="flex flex-column gap-2 w-full mb-2">
                            <label htmlFor="jns_asuransi">Jenis Asuransi</label>
                            <div className="p-inputgroup">
                                <Dropdown
                                    id="jns_asuransi"
                                    name="jns_asuransi"
                                    placeholder="Pilih Jenis Asuransi"
                                    options={['BPJS', 'Umum']}
                                    value={formik.values.jns_asuransi}
                                    onChange={(e) => {
                                        formik.setFieldValue('jns_asuransi', e.target.value);
                                    }}
                                    className={isFormFieldInvalid('jns_asuransi') ? 'p-invalid' : ''}
                                />
                            </div>
                            {isFormFieldInvalid('jns_asuransi') ? getFormErrorMessage('jns_asuransi') : ''}
                        </div>
                        <div className="flex flex-column gap-2 w-full mb-2">
                            <label htmlFor='no_asuransi'>No. Asuransi</label>
                            <div className="p-inputgroup">
                                <InputText
                                    id="no_asuransi"
                                    name="no_asuransi"
                                    placeholder="Masukkan No. Asuransi"
                                    value={formik.values.no_asuransi}
                                    onChange={(e) => {
                                        formik.setFieldValue('no_asuransi', e.target.value);
                                    }}
                                    className={isFormFieldInvalid('no_asuransi') ? 'p-invalid' : ''}
                                />
                            </div>
                            {isFormFieldInvalid('no_asuransi') ? getFormErrorMessage('no_asuransi') : ''}
                        </div>
                    </div>
                    <Button type="submit" label={dataPendaftaran.edit ? 'Update' : 'Save'} className="mt-2 mr-2" loading={dataPendaftaran.load} />
                    <Button type="button" onClick={() => router.push('/pendaftaran/pendaftaran-pasien')} className="mt-2 p-button-secondary">
                        Back
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default PendaftaranPasien;