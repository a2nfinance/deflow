import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang='en'>
            <Head>
                <meta name="title" content="DeFlow" />
                <meta name="description" content="Computation graph for decentralized Ocean nodes."/>
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <title>DeFlow - Computation graph for decentralized Ocean nodes.</title>
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/nprogress/0.2.0/nprogress.min.css"
                />
                <meta property="og:url" content="https://deflow.a2n.finance/"></meta>
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}