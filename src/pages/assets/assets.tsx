import React, { useState, useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import numeral from 'numeral';
import { useTranslation } from 'react-i18next';
import './assets.less';
import 'antd/dist/antd.css';
import { Layout, Table, Avatar, Tabs } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  sessionState,
  marketState,
  walletAssetState,
  walletAllAssetsState,
} from '../../recoil/atom';
import { Session } from '../../models/Session';
import { getAssetBalancePrice, UserAsset } from '../../models/UserAsset';
import { getUIDynamicAmount } from '../../utils/NumberUtils';
// import { LEDGER_WALLET_TYPE, createLedgerDevice } from '../../service/LedgerService';
import { AnalyticsService } from '../../service/analytics/AnalyticsService';
// import logoCro from '../../assets/AssetLogo/cro.png';
import ReceiveDetail from './components/ReceiveDetail';
import FormSend from './components/FormSend';
// import ModalPopup from '../../components/ModalPopup/ModalPopup';

const { Header, Content, Footer } = Layout;
const { TabPane } = Tabs;

const AssetsPage = () => {
  const session: Session = useRecoilValue<Session>(sessionState);
  const userAsset = useRecoilValue(walletAssetState);
  const walletAllAssets = useRecoilValue(walletAllAssetsState);
  const marketData = useRecoilValue(marketState);
  // const [isLedger, setIsLedger] = useState(false);
  const [currentAsset, setCurrentAsset] = useState<UserAsset>();
  const [isAssetVisible, setIsAssetVisible] = useState(false);
  // const [isSendVisible, setIsSendVisible] = useState(false);
  // const [isReceiveVisible, setIsReceiveVisible] = useState(false);
  const didMountRef = useRef(false);
  const analyticsService = new AnalyticsService(session);

  const [t] = useTranslation();

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      analyticsService.logPage('Assets');
    }
  });

  const assetIcon = asset => {
    const { icon_url, symbol } = asset;

    return icon_url ? (
      <img src={icon_url} alt="cronos" className="asset-icon" />
    ) : (
      <Avatar>{symbol[0].toUpperCase()}</Avatar>
    );
  };

  const AssetColumns = [
    {
      title: 'Asset',
      // dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: record => {
        const { name, symbol } = record;

        return (
          <div className="name">
            {assetIcon(record)}
            {name} ({symbol})
          </div>
        );
      },
    },
    {
      title: 'Price',
      // dataIndex: 'price',
      key: 'price',
      render: record => (
        <>
          {marketData && marketData.price && record.mainnetSymbol === marketData.assetSymbol
            ? `${numeral(marketData.price).format('$0,0.00')} ${marketData?.currency}`
            : '$--'}
        </>
      ),
    },
    {
      title: 'Balance',
      // dataIndex: 'amount',
      key: 'amount',
      render: (record: UserAsset) => {
        return (
          <>
            {getUIDynamicAmount(record.balance, record)} {record.symbol}
          </>
        );
      },
    },
    {
      title: 'Value',
      // dataIndex: 'value',
      key: 'value',
      render: record => (
        <>
          {marketData && marketData.price && record.mainnetSymbol === marketData.assetSymbol
            ? `${numeral(getAssetBalancePrice(userAsset, marketData)).format('$0,0.00')} ${
                marketData?.currency
              }`
            : '$--'}
        </>
      ),
    },
    // {
    //   title: 'Action',
    //   key: 'action',
    //   render: record => {
    //     return <>
    //     {record.symbol}
    //     </>
    //   }
    // }
  ];

  return (
    <Layout className="site-layout">
      <Header className="site-layout-background">{t('receive.title')}</Header>
      <div className="header-description">{t('receive.description')}</div>
      <Content>
        <div className="site-layout-background assets-content">
          <div className="container">
            {isAssetVisible ? (
              <Layout className="asset-detail">
                <Content>
                  <a>
                    <div
                      className="back-button"
                      onClick={() => setIsAssetVisible(false)}
                      style={{ fontSize: '16px' }}
                    >
                      <ArrowLeftOutlined style={{ fontSize: '16px', color: '#1199fa' }} /> Back to
                      Asset List
                    </div>
                  </a>
                  <div className="title">
                    {assetIcon(currentAsset)}
                    {currentAsset?.name} ({currentAsset?.symbol})
                  </div>
                  <Tabs defaultActiveKey="1">
                    <TabPane tab="Transaction" key="1">
                      Tx
                    </TabPane>
                    <TabPane tab={t('send.title')} key="2">
                      <FormSend
                        walletAsset={currentAsset}
                        setWalletAsset={setCurrentAsset}
                        currentSession={session}
                      />
                    </TabPane>
                    <TabPane tab={t('receive.title')} key="3">
                      <ReceiveDetail currentAsset={currentAsset} session={session} />
                    </TabPane>
                  </Tabs>
                  {/* {!isSendVisible && !isReceiveVisible
                    ? <>
                      <Button onClick={() => setIsSendVisible(true)}>Send</Button>
                      <Button onClick={() => setIsReceiveVisible(true)}>Receive</Button>
                    </>
                    : <></>} */}
                  {/* <ModalPopup
                    isModalVisible={isSendVisible}
                    handleCancel={() => setIsSendVisible(false)}
                    handleOk={() => {}}
                    className="send-detail-modal"
                    footer={[]}
                    // confirmationLoading={confirmLoading}
                  >
                  <FormSend
                      walletAsset={currentAsset}
                      setWalletAsset={setCurrentAsset}
                      setIsSendVisible={setIsSendVisible}
                      setIsAssetVisible={setIsAssetVisible}
                      currentSession={session}
                    />
                  </ModalPopup>
                  <ModalPopup
                    isModalVisible={isReceiveVisible}
                    handleCancel={() => setIsReceiveVisible(false)}
                    handleOk={() => { }}
                    className="receive-detail-modal"
                    footer={[]}
                  // confirmationLoading={confirmLoading}
                  >
                    <ReceiveDetail currentAsset={currentAsset} session={session} />
                  </ModalPopup> */}
                </Content>
              </Layout>
            ) : (
              <Table
                columns={AssetColumns}
                dataSource={walletAllAssets}
                className="asset-table"
                rowKey={record => record.identifier}
                onRow={record => {
                  return {
                    onClick: () => {
                      setCurrentAsset(record);
                      setIsAssetVisible(true);
                    }, // click row
                  };
                }}
                // pagination={false}
              />
            )}
          </div>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default AssetsPage;