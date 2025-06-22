import React, { useContext, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { signIn } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Bars } from 'react-loader-spinner'; // Import the Bars loader component
import { LayoutContext } from '../../layout/context/layoutcontext';

function LoginPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const callbackUrl = router.query?.callbackUrl ?? '/';
    const [dataLogin, setDataLogin] = useState({ email: '', password: '' });
    const [err, setErr] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [selectedLogin, setSelectedLogin] = useState({ name: 'owner', code: 'user' });
    const [loading, setLoading] = useState(false); // Add loading state
    const { layoutConfig } = useContext(LayoutContext);

    const onInputChange = (val, key) => {
        setDataLogin((prev) => ({ ...prev, [key]: val }));
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            onHandleSubmit();
        }
    };

    const onHandleSubmit = async () => {
        setSubmitted(true);
        setLoading(true); // Start loading
        try {
            if (dataLogin.email && dataLogin.password) {
                // console.log(dataLogin);
                const login = await signIn('credentials', { email: dataLogin.email, password: dataLogin.password, aslogin: selectedLogin.code, redirect: false });
                if (login?.error) {
                    if (login?.error.includes('reason:')) {
                        setErr('Error Network');
                    } else if (login.error === 'otp') {
                        // Handle OTP`
                    } else {
                        setErr(login.error);
                    }
                } else {
                    router.push(callbackUrl);
                }
            }
        } catch (error) {
            setErr('Error Network');
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        <div className="relative" style={{ height: '100vh', overflow: 'hidden' }}>
            <div
                className="grid"
                style={{
                    backgroundImage: 'linear-gradient(to right, #D9EDBF, #0A6847 )',
                    paddingLeft: '10%',
                    paddingRight: '10%',
                    height: '150vh',
                    position: 'relative'
                }}
            >
                {loading && (
                    <div className="loading-indicator" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.7)', zIndex: 1000 }}>
                        <Bars height="80" width="80" color="#2C7865" ariaLabel="bars-loading" visible={true} />
                    </div>
                )}
                <div className="col-12">
                    <div className="grid" style={{ height: '90vh', paddingTop: '15vh', overflow: 'hidden' }}>
                        <div
                            className="col-12 mb-2 lg:col-4 border-round-md lg:border-round-left-md lg:border-noround-right"
                            style={{
                                borderTopLeftRadius: '5px',
                                borderBottomLeftRadius: '5px',
                                backgroundColor: '#0A6847',
                                // backgroundImage: 'linear-gradient(to right, #1E5128, #055E68)',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <div className="p-fluid" style={{ flex: 1 }}>
                                <div style={{ textAlign: 'center', marginBottom: '3vh', marginTop: '5vh' }} className="px-2">
                                    <img src={`/layout/images/kasir.godong.id.png`} alt="logo sections" style={{ maxWidth: '100%' }} className="h-4rem md:h-5rem" />
                                </div>
                                {/* <div className="text-center" style={{ marginTop: '5vh', marginBottom: '4vh', color: 'white' }}></div> */}
                                <div className="flex align-items-center justify-content-center">
                                    <div style={{ width: '90%' }}>
                                        {!!err && (
                                            <div className="text-center" style={{ color: '#F4A261' }}>
                                                {err}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="col-12 md:px-5 px-4 lex align-items-center justify-content-">
                                    <div>
                                        <div className="field p-inputtext-lg">
                                            <label htmlFor="email" style={{ color: 'white' }}>
                                                Email
                                            </label>
                                            <InputText id="email" style={{ width: '100%', borderRadius: '6px' }} onChange={(e) => onInputChange(e.target.value, 'email')} className={submitted && !dataLogin.email ? 'p-invalid' : ''} type="text" />
                                        </div>
                                        <div className="field p-inputtext-lg">
                                            <label htmlFor="password" style={{ color: 'white' }}>
                                                Password
                                            </label>
                                            <Password
                                                id="password"
                                                onChange={(e) => onInputChange(e.target.value, 'password')}
                                                className={`${submitted && !dataLogin.password ? 'p-invalid' : ''} login-pass`}
                                                toggleMask
                                                feedback={false}
                                                onKeyDown={handleKeyDown}
                                            />
                                        </div>
                                        <div className="p-button p-component mt-5 rounded align-items-center justify-content-center" onClick={onHandleSubmit}>
                                            <span>Login</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* <div style={{ textAlign: 'center', marginBottom: '3vh' }}>
                                <img src={`/layout/images/kasir.godong.id.png`} alt="footer sections" height="60vh" className="" />
                            </div> */}
                            <div style={{ textAlign: 'center', marginBottom: '2vh' }}>
                                <label htmlFor="" style={{ color: '#eee' }}>
                                    © www.godong.id 2024 all right reserved
                                </label>
                            </div>
                        </div>
                        <div
                            className="col-12 mb-2 lg:col-8 relative border-round-top-sm"
                            style={{
                                borderTopRightRadius: '5px',
                                borderBottomRightRadius: '5px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundImage: `url(/layout/images/${layoutConfig.colorScheme === 'light' ? 'hero_login2' : 'hero_login2'}.jpg)`,
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
