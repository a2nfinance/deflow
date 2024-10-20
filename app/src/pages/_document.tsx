import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang='en'>
            <Head>
                <meta name="title" content="Gamma Flow" />
                <meta name="description" content="Gamma Flow"/>
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <title>GammaFlow - Tools for experimenting and testing AI models on the Theta Cloud</title>
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/nprogress/0.2.0/nprogress.min.css"
                />
                <meta property="og:url" content="https://gammaflow.a2n.finance/"></meta>
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}