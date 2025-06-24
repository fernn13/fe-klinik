import React, { useContext, useEffect, useState } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { decrypt, decrypter } from '../utilities/encrypt';
// import { RoleContext } from './context/rolecontext';

const AppMenu = () => {
    // const router = useRouter();
    // const { layoutConfig } = useContext(LayoutContext);
    // const { data: session, status } = useSession();
    // const [models, setModels] = useState([]);

    // let model = [];
    // model = session?.user?.menu;
    // let arr = [];
    // if (status == 'authenticated') {
    // } else if (status == 'unauthenticated') {
    //   // router.push('/login');
    // }


    // return (
    //     <MenuProvider>
    //         <ul className="layout-menu">
    //             {model?.map((item, i) => {
    //                 return !item.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
    //             })}
    //         </ul>
    //     </MenuProvider>
    // );

    const { layoutConfig } = useContext(LayoutContext);
    //const contextPath = getConfig().publicRuntimeConfig.contextPath;
    const model = [
        {
            label: 'Home',
            items: [
                /** Menu */
                {
                    label: 'Dashboard',
                    icon: 'pi pi-fw pi-home',
                    to: '/'
                }
            ]
        },
        {
            label: 'Master',
            items: [
                {
                    label: 'Data Pasien',
                    icon: 'pi pi-fw pi-user',
                    to: '/master/pasien'
                },
                 {
                    label: 'Data Diagnosa',
                    icon: 'pi pi-fw pi-book',
                    to: '/master/diagnosa'
                },
                {
                    label: 'Data Obat',
                    icon: 'pi pi-fw pi-file',
                    to: '/master/obat'
                },
            ]
        },
        {
            label: 'Pendaftaran',
            items: [
                {
                    label: 'Pendaftaran Pasien',
                    icon: 'pi pi-fw pi-book',
                    to: '/pendaftaran/pendaftaran-pasien'
                },
                {
                    label: 'Reservasi Pasien',
                    icon: 'pi pi-fw pi-calendar',
                    to: '/pendaftaran/reservasi-pasien'
                }
                
            ]
        },
        {
            label: 'Pemeriksaan',
            items: [
                {
                    label: 'Antrian Pasien',
                    icon: 'pi pi-fw pi-list',
                    to: '/pemeriksaan/antrian-pasien'
                },
                {
                    label: 'Pemeriksaan Dokter',
                    icon: 'pi pi-fw pi-calendar',
                    to: '/pemeriksaan/pemeriksaan-dokter'
                },
            ]
        },
        {
            label: 'Farmasi',
            items: [
                {
                    label: 'Penebusan Obat',
                    icon: 'pi pi-fw pi-list',
                    to: '/farmasi/penebusan-obat'
                },
                {
                    label: 'Stock Obat',
                    icon: 'pi pi-fw pi-file',
                    to: '/farmasi/stock-obat'
                },
            ]
        },
        {
            label: 'Rekam Medis',
            items: [
                {
                    label: 'File Dokumen',
                    icon: 'pi pi-fw pi-file',
                    to: '/rekam-medis/file-dokumen'
                },
                {
                    label: 'Tracer Rekam Medis',
                    icon: 'pi pi-fw pi-book',
                    to: '/rekam-medis/tracer-rekam-medis'
                }
            ]
        },
        {
            label: 'Laporan/Reporting',
            items: [
                {
                    label: 'Report Pendaftaran Pasien',
                    icon: 'pi pi-fw pi-arrow-up-right',
                    to: '/laporan/report-pendaftaran-pasien'
                },
                {
                    label: 'Report Statistik Kunjungan',
                    icon: 'pi pi-fw pi-arrow-up-right',
                    to: '/laporan/report-rekam-medis'
                },
                {
                    label: 'Rekap Kunjungan',
                    icon: 'pi pi-fw pi-arrow-up-right',
                    to: '/laporan/report-rekam-medis'
                },
                {
                    label: 'Histori Semua Transaksi ',
                    icon: 'pi pi-fw pi-arrow-up-right',
                    to: '/laporan/report-rekam-medis'
                }
            ]
        },
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}

                {/* <Link href="https://www.primefaces.org/primeblocks-react" target="_blank" style={{ cursor: 'pointer' }}>
                    <img alt="Prime Blocks" className="w-full mt-3" src={`${contextPath}/layout/images/banner-primeblocks${layoutConfig.colorScheme === 'light' ? '' : '-dark'}.png`} />
                </Link> */}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
