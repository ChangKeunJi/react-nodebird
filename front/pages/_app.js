//! 모든 page들에 공통으로 적용된다. 규칙에 의해서 반드시 _app.js로 이름을 지어야 한다.
import PropTypes from "prop-types";
import "antd/dist/antd.css";
import Head from "next/head"; // html의 head 역할을 한다.
import wrapper from "../store/configureStore";

const App = ({ Component }) => {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>Nodebird</title>
      </Head>
      <Component />
    </>
  );
};

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
};

export default wrapper.withRedux(App);
