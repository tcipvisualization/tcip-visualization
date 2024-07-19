import './App.css'
import {AppShell, MantineProvider, Title} from "@mantine/core";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";
import IdentityManager from "@arcgis/core/identity/IdentityManager";
import {useEffect, useState} from "react";
import Credential from "@arcgis/core/identity/Credential";
import '@mantine/core/styles.css';
import {useDisclosure} from "@mantine/hooks";
import Content from "./Content.tsx";
import styles from "./App.module.scss";
import {FaInfo, FaMap} from "react-icons/fa";
import {BsClipboard2DataFill} from "react-icons/bs";


const oAuthInfo = new OAuthInfo({
    portalUrl: "https://gis.tetoncountywy.gov/portal",
    appId: "Pg1qpsp5HDxkUuQR",
    popup: false
});
IdentityManager.registerOAuthInfos([oAuthInfo]);


function App() {
    const [signedIn, setSignedIn] = useState(false);
    useEffect(() => {
        const signIn = async () => {
            let credential: Credential | null = null;
            try {
                credential = await IdentityManager.checkSignInStatus(oAuthInfo.portalUrl + "/sharing")
            } catch (err) { /* empty */
            }

            while (!credential) {
                try {
                    credential = await IdentityManager.getCredential(oAuthInfo.portalUrl + "/sharing");
                } catch (err) {
                    console.error(err);
                }
            }

            setSignedIn(true);
        }
        signIn().then();
    }, []);

    const [opened] = useDisclosure();

    return (
        <MantineProvider>
            {
                signedIn &&
                <AppShell navbar={{
                    width: 200,
                    breakpoint: 'sm',
                    collapsed: {mobile: !opened},
                }}>
                    <AppShell.Navbar p="md" className={styles.navbar}>
                        <Title order={3}>
                            Navigation
                        </Title>

                        <hr className={styles.divider}/>
                        <div className={styles.navLinks}>
                            <a className={styles.navItem} href="#map">
                                <FaMap className={styles.navIcon} size={30}/>
                                Map
                            </a>
                            <a className={styles.navItem} href="#analysis">
                                <BsClipboard2DataFill className={styles.navIcon} size={30}/>
                                Analysis
                            </a>
                            <a className={styles.navItem} href="#about">
                                <FaInfo className={styles.navIcon} size={30}/>
                                About
                            </a>
                        </div>
                    </AppShell.Navbar>


                    <AppShell.Main>
                        <Content/>
                    </AppShell.Main>
                </AppShell>
            }
        </MantineProvider>
    )
}

export default App
