import React, { useCallback } from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import { Input, Menu, Row, Col } from "antd";
import styled, { createGlobalStyle } from "styled-components";
import { useSelector } from "react-redux";
import Router from "next/router";

import useInput from "../hooks/useInput";
import LoginForm from "./LoginForm";
import UserProfile from "./UserProfile";

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
  // 화면에 그릴수 있는 모든 것이 node 타입
};

// 좌우 스크롤바 없애주기 위해서
const Global = createGlobalStyle`
  .ant-row {
    margin-right:0 !important;
    margin-left:0 !important
  }

  .ant-col:first-child {
    padding-left:0 !important
  }

  .ant-col:last-child {
    padding-right:0 !important
  }
`;

const SearchInput = styled(Input.Search)`
  vertical-align: middle;
`;

function AppLayout({ children }) {
  // state 값을 가져온다.
  // isLoggedIn의 값이 변하면 리렌더링 된다.
  const [searchInput, onChangeSearchInput] = useInput("");
  const { me } = useSelector((state) => state.user);

  const onSearch = useCallback(() => {
    // 코드로 주소를 옮길 때는 Router 사용
    Router.push(`/hashtag/${searchInput}`);
  }, [searchInput]);

  return (
    <div>
      <Global />
      <Menu mode="horizontal">
        <Menu.Item key="menu1">
          <Link href="/">
            <a>노드버드</a>
          </Link>
        </Menu.Item>
        <Menu.Item key="menu2">
          <Link href="/profile">
            <a>프로필</a>
          </Link>
        </Menu.Item>
        <Menu.Item key="menu3">
          <SearchInput
            enterButton
            value={searchInput}
            onChange={onChangeSearchInput}
            onSearch={onSearch}
            /* onSerach => Antd 고유 callback */
          />
        </Menu.Item>
        <Menu.Item>
          <Link href="/signup">
            <a>회원가입</a>
          </Link>
        </Menu.Item>
      </Menu>
      <Row gutter={8}>
        <Col xs={24} md={6}>
          {me ? <UserProfile /> : <LoginForm />}
        </Col>
        <Col xs={24} md={12}>
          {children}
        </Col>
        <Col xs={24} md={6}>
          <a
            href="https://changkeun-devlog.tistory.com/"
            target="_blank"
            rel="noreferrer noopener" // 보안상 이유
          >
            Made by Changki
          </a>
        </Col>
      </Row>
    </div>
  );
}

export default AppLayout;
