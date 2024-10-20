import { LayoutProvider } from '@/components/LayoutProvider';
import { store } from '@/controller/store';
import "@/styles/app.css";
import withTheme from '@/theme';
import 'antd/dist/reset.css';
import type { AppProps } from 'next/app';
import Router from "next/router";
import NProgress from "nprogress";
import { useEffect, useState } from 'react';
import { Provider } from "react-redux";
import { init, Web3OnboardProvider } from "@web3-onboard/react";
import { onboardConfig } from "@/utils/connectWallet";

Router.events.on("routeChangeStart", (url) => {
    NProgress.start()
})

Router.events.on("routeChangeComplete", (url) => {
    NProgress.done()
})

Router.events.on("routeChangeError", (url) => {
    NProgress.done()
})

const wen3Onboard = init({
	connect: {
		autoConnectAllPreviousWallet: true,
	},
	...onboardConfig,
});
export default function MyApp({ Component, pageProps }: AppProps) {

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (typeof window !== 'undefined') {
        window.onload = () => {
            document.getElementById('holderStyle')!.remove();
        };
    }

    return (
        <Web3OnboardProvider web3Onboard={wen3Onboard}>
            <Provider store={store}>
                <style
                    id="holderStyle"
                    dangerouslySetInnerHTML={{
                        __html: `
                    *, *::before, *::after {
                        transition: none!important;
                    }
                    `,
                    }}
                />

                <div style={{ visibility: !mounted ? 'hidden' : 'visible' }}>
                    {

                        withTheme(<LayoutProvider>

                            <Component {...pageProps} />

                        </LayoutProvider>)
                    }

                </div>

            </Provider >
        </Web3OnboardProvider>

    )
}
