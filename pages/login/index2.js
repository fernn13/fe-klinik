import React, { useContext, useEffect, useRef, useState } from 'react';
import { getServerSession } from 'next-auth/next';
import { getNextAuthOptions } from '../api/auth/[...nextauth]';
import { InputText } from 'primereact/inputtext';
import { LayoutContext } from '../../layout/context/layoutcontext';
import { signIn } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';

export async function getServerSideProps(context) {
    const sessionData = await getServerSession(context.req, context.res, getNextAuthOptions(context.req, context.res));
    if (sessionData?.user) {
        return {
            redirect: {
                permanent: false,
                destination: '/'
            }
        };
    }

    return {
        props: {}
    };
}

function LoginPage() {
    const router = useRouter();
    const { error } = router.query;
    const { data: session, status } = useSession();
    // console.log(session);
    const callbackUrl = router.query?.callbackUrl ?? '/';
    let emptyData = {
        email: '',
        password: ''
    };
    const [dataLogin, setDataLogin] = useState(emptyData);
    const [err, setErr] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [selectedLogin, setSelectedLogin] = useState({
        name: 'owner',
        code: 'user'
    });
    const [loading, setLoading] = useState(false);
    const { layoutConfig } = useContext(LayoutContext);

    const optionsLogin = [
        { name: 'owner', code: 'user' },
        { name: 'staff', code: 'staff' }
    ];

    const onInputChange = (val, key) => {
        let _dataLogin = { ...dataLogin };
        _dataLogin[key] = val;
        setDataLogin(_dataLogin);
        formik.setValues(_dataLogin);
    };

    const onHandleSubmit = async () => {
        setSubmitted(true);
        setLoading(true);
        try {
            if (dataLogin.email && dataLogin.password) {
                const login = await signIn('credentials', {
                    email: dataLogin.email,
                    password: dataLogin.password,
                    aslogin: selectedLogin.code,
                    redirect: false
                });
                if (login?.error) {
                    if (login?.error.includes('reason:')) {
                        return setErr('Error Network');
                    }
                    setLoading(false);
                    setErr(login.error);
                } else {
                    setErr('');
                    router.push('/');
                }
            }
        } catch (error) {
            setLoading(false);
        }
    };

    const validationSchema = Yup.object().shape({
        email: Yup.string().email('Invalid email').required('harus diisi'),
        password: Yup.string().required('harus diisi')
    });

    const formik = useFormik({
        initialValues: dataLogin,
        validationSchema: validationSchema,
        onSubmit: onHandleSubmit
    });

    return (
        <div className="relative" style={{ height: '100vh', overflow: 'hidden' }}>
            <div
                className="grid"
                style={{
                    backgroundImage: 'linear-gradient(90deg, rgba(244,255,244,1) 0%, rgb(48, 66, 49) 100%)',
                    paddingLeft: '10%',
                    paddingRight: '10%',
                    height: '100%',
                    overflow: 'hidden'
                }}
            >
                <div className="col-12">
                    <div className="grid" style={{ height: '90vh', paddingTop: '10vh', overflow: 'hidden' }}>
                        <div
                            className="col-12 mb-2 lg:col-4 border-round-md lg:border-round-left-md lg:border-noround-right"
                            style={{
                                backgroundColor: 'white',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                backgroundColor: 'rgb(39, 69, 51)'
                            }}
                        >
                            <div className="p-fluid" style={{ flex: 1 }}>
                                <div className="text-center" style={{ marginTop: '5vh' }}>
                                    <h1 style={{ color: 'white' }}>Hotel System</h1>
                                </div>
                                <div className="flex align-items-center justify-content-center">
                                    <div style={{}}>
                                        {!!err && (
                                            <div className="text-center" style={{ color: 'white' }}>
                                                {err}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="col-12 md:px-5 px-4">
                                    <div>
                                        <form onSubmit={formik.handleSubmit}>
                                            <div className="field mb-5">
                                                <label htmlFor="email" style={{ color: 'white' }}>
                                                    Email
                                                </label>
                                                <InputText id="email" onChange={(e) => onInputChange(e.target.value, 'email')} className={submitted && !dataLogin.email && 'p-invalid'} type="text" />
                                                {formik.touched.email && formik.errors.email ? <small style={{ color: 'pink' }}>{formik.errors.email}</small> : null}
                                            </div>
                                            <div className="field mb-5" style={{ position: 'relative' }}>
                                                <label htmlFor="password" style={{ color: 'white' }}>
                                                    Password
                                                </label>
                                                {/* <InputText id="password" onChange={(e)=>onInputChange(e.target.value,"password")} className={submitted && !dataLogin.password && "p-invalid"} type="password" /> */}
                                                <Password id="password" onChange={(e) => onInputChange(e.target.value, 'password')} className={submitted && !dataLogin.password && 'p-invalid'} toggleMask feedback={false}></Password>
                                                {formik.touched.password && formik.errors.password ? <small style={{ color: 'pink' }}>{formik.errors.password}</small> : null}
                                            </div>
                                            <button
                                                disabled={loading}
                                                style={{ padding: '6px 20px', width: '100%', borderRadius: '4px', border: '1px solid rgb(65, 184, 43)', backgroundColor: 'rgb(15, 134, 35)', cursor: 'pointer', color: '#fff' }}
                                                type="submit"
                                            >
                                                {loading ? <div className="pi pi-spin pi-spinner"></div> : <div>Login</div>}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full flex justify-content-center mb-0" style={{ objectFit: 'cover', objectPosition: 'center', height: '50px' }}>
                                <img src="layout/images/2.png" height={'auto'} width={'200px'} alt="logo" style={{ marginRight: '15px' }} />
                            </div>

                            <div className="w-full flex justify-content-center mb-1" style={{ objectFit: 'cover', objectPosition: 'center', height: '50px' }}>
                                <img src="layout/images/1.png" height={'auto'} width={'200px'} alt="logo" style={{ marginRight: '15px' }} />
                            </div>

                            <div style={{ textAlign: 'center', marginBottom: '3vh' }}>
                                <label htmlFor="email" style={{ color: '#eee' }}>
                                    ©Mars {new Date().getFullYear()} all right reserved
                                </label>
                            </div>
                        </div>
                        <div
                            className="col-12 mb-2 lg:col-8 relative border-round-top-sm"
                            style={{
                                borderTopRightRadius: '7px',
                                borderBottomRightRadius: '7px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundImage: `url(/layout/images/${layoutConfig.colorScheme === 'light' ? 'hero-hotel' : 'hero-hotel'}.jpg)`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat'
                            }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

LoginPage.getLayout = function LoginPage(page) {
    return <>{page}</>;
};

export default LoginPage;
