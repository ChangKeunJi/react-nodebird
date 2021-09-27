// _app.js 보다 위에 있는 공통으로 적용되는 파일
import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";
import { ServerStyleSheet } from "styled-components";

export default class MyDocument extends Document {
  // document 와 _app 에서만 쓰이는 특수 SSR 메서드
  static async getInitialProps(ctx) {
    // styled component 적용 시키기
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html>
        <Head />
        <body>
          <script src="https://polyfill.io/v3/polyfill.min.js?features=default%2Ces2015%2Ces2016%2Ces2017%2Ces2018%2Ces2019" />
          <Main />
          {/* 폴리필 */}
          <NextScript />
        </body>
      </Html>
    );
  }
}
/* < 기본 세팅 > : _app.js 를 감싸며 모든 파일에 공통으로 적용된다.
import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {

  // :document 와 _app 에서만 사용하는 특수 SSR 메서드
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return {
      ...initialProps,
    };
  }
  render() {
    return (
      <Html>
        <Head />
        <body>
        <Main />
        <NextScript />
        </body>
      </Html>
    );
  }
}
*/
