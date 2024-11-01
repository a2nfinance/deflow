import React from "react";
import { ConfigProvider, theme } from "antd";

const { defaultAlgorithm, darkAlgorithm } = theme;

const withTheme = (node: JSX.Element) => (
    <>
      <ConfigProvider
         theme={{
            token: {
              colorPrimary: '#18c99d', //'#ff4092'
            },
            components: {
              Menu: {
                iconSize: 20,
                fontSize: 16
              },
            },
            algorithm: darkAlgorithm
          }}
      >
        <ConfigProvider
          theme={{
            token: {
              borderRadius: 16,
            },
          }}
        >
          {node}
        </ConfigProvider>
      </ConfigProvider>
    </>
  )

export default withTheme;