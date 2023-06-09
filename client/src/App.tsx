import React, {useEffect} from 'react';
import axios from 'axios';
import {Link, Outlet, RouteObject, useParams, useRoutes} from 'react-router-dom';
import {Info} from 'line-pay-merchant/dist/line-pay-api/confirm.js';
import {Product} from 'line-pay-merchant';

const baseUrl = import.meta.env.VITE_API_HOST;

export const App = () => {
  const routes: RouteObject[] = [
    {
      path: '/',
      element: <Layout />,
      children: [
        {index: true, element: <HomePage />},
        {
          path: '/return',
          element: <ReturnPage />,
        },
        {path: '*', element: <HomePage />},
      ],
    },
  ];

  const element = useRoutes(routes);
  return <>{element}</>;
};

const Layout = () => (
  <div>
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/return">checkout</Link>
        </li>
      </ul>
    </nav>

    <hr />

    <Outlet />
  </div>
);

const HomePage = () => {
  const [hash, setHash] = React.useState('');
  const [encrypted, setEncrypted] = React.useState('');

  const [orderId, setOrderId] = React.useState('');

  const [resultContent, setResultContent] = React.useState('');

  const handleLinePayRequest = async () => {
    try {
      const response = await axios.get(`${baseUrl}/payments/line-pay/request/${orderId}`);
      const {body} = response.data;
      if (body.returnCode === '0000') {
        const {web} = body.info.paymentUrl;
        window.open(web, '_blank');
      } else {
        console.error('Error:', response.data.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleNewebPayGetHash = async () => {
    console.log('handleNewebPayGetHash');
    const response = await axios.post(`${baseUrl}/payments/neweb-pay/get-hash`);
    const {hash, encrypted} = response.data;
    setHash(hash);
    setEncrypted(encrypted);
  };

  const handleNewebPay = async () => {
    const result = await axios.post(`${baseUrl}/payments/neweb-pay/payment`, {
      hash,
      encrypted,
    });
    console.log(result);
    const resultData = result.data; // 獲取回應的 HTML 內容
    console.log(resultData);

    setResultContent(resultData);
  };

  const handleChangeOrderId = () => {
    axios.post(`${baseUrl}/payments/change-id/`, {
      orderId,
    });
  };

  const handleGeneratorOrderId = () => {
    const uuid = crypto.randomUUID();
    setOrderId(uuid);
  };

  return (
    <>
      <header>
        <title>Demo site</title>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC"
          crossOrigin="anonymous"
        />
        <script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>
      </header>
      <section className="container py-4">
        <div id="app" className="flex flex-col justify-center p-5 gap-4 mx-auto">
          <button
            type="button"
            className="px-4 py-2 text-2xl text-center text-white bg-green-600 border-0 rounded cursor-pointer hover:bg-green-700"
            id="payButton"
            onClick={handleLinePayRequest}
          >
            LINE PAY REQUEST
          </button>
        </div>

        <form
          className="flex flex-col gap-4"
          id="neweb-form"
          action="https://ccore.newebpay.com/MPG/mpg_gateway"
          method="post"
        >
          <div className="form-group">
            <label htmlFor="exampleInputEmail1">Email address</label>
            <input
              type="email"
              className="form-control"
              id="exampleInputEmail1"
              placeholder="Email"
            />
          </div>
          <div className="form-group card-number-group">
            <label htmlFor="card-number" className="control-label">
              <span id="cardtype"></span>卡號
            </label>
            <input
              type="text"
              maxLength={16}
              className="form-control"
              id="card-number"
              placeholder="**** **** **** ****"
            />
          </div>
          <div className="form-group expiration-date-group">
            <label htmlFor="expiration-date" className="control-label">
              卡片到期日
            </label>
            <input
              type="text"
              maxLength={4}
              className="form-control"
              id="expiration-date"
              placeholder="MM / YY"
            />
          </div>
          <div className="form-group ccv-group">
            <label htmlFor="ccv" className="control-label">
              卡片後三碼
            </label>
            <input
              type="text"
              maxLength={3}
              className="form-control"
              id="ccv"
              placeholder="後三碼"
            />
          </div>
          <div className="form-group">
            <label htmlFor="amount">金額</label>
            <input type="number" className="form-control" id="amount" placeholder="金額" />
          </div>
          <div className="form-group">
            <label htmlFor="description">描述</label>
            <input type="text" className="form-control" id="description" placeholder="描述" />
          </div>
          <div className="form-group">
            <label htmlFor="hash">Hash</label>
            <input
              type="text"
              className="form-control"
              id="hash"
              readOnly
              placeholder="Hash"
              value={hash}
            />
          </div>
          <div className="form-group">
            <label htmlFor="encrypted">Encrypted</label>
            <input
              type="text"
              className="form-control"
              id="encrypted"
              readOnly
              placeholder="Encrypted"
              value={encrypted}
            />
          </div>
          <div className="flex gap-2 items-center">
            <button type="button" className="btn btn-light" onClick={handleNewebPayGetHash}>
              Get Hash
            </button>
            <button type="button" className="btn btn-light" onClick={handleNewebPay}>
              藍新
            </button>
            <a
              className="btn btn-light"
              target="_blank"
              href={`${baseUrl}/payments/ec-pay/request/${orderId}`}
            >
              綠界
            </a>
            <div className="flex-auto">
              <div className="d-flex justify-start items-center gap-4">
                <div className="flex-auto">
                  <label htmlFor="orderId">訂單編號</label>
                  <input
                    type="text"
                    id="orderId"
                    className="form-control"
                    readOnly
                    value={orderId}
                  />
                </div>
                <div className="w-1/4">
                  <h3>STEP 1</h3>
                  <button
                    type="button"
                    className="btn btn-primary w-100"
                    onClick={handleGeneratorOrderId}
                  >
                    生成Order ID
                  </button>
                </div>
                <div className="w-1/4">
                  <h3>STEP 2</h3>
                  <button
                    type="button"
                    className="btn btn-secondary w-100"
                    onClick={handleChangeOrderId}
                  >
                    更改Order ID
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </section>
      <div dangerouslySetInnerHTML={{__html: resultContent}} />
    </>
  );
};

interface ConfirmPackage {
  id: string;
  name: string;
  price: number;
  quantity: number;
  products: Product[];
}

const ReturnPage = () => {
  const {transactionId, orderId} = useParams<string>();

  const [result, setResult] = React.useState<Info>();

  useEffect(() => {
    console.log(transactionId);
    console.log(orderId);
    function fetchData() {
      if (transactionId && orderId) {
        axios
          .get(
            `${baseUrl}/payments/line-pay/confirm?transactionId=${transactionId}&orderId=${orderId}`
          )
          .then((response) => {
            const {body} = response.data;
            if (body.returnCode === '0000') {
              setResult(body.info);
            }
          });
      }
    }
    fetchData();

    return () => {
      setResult(undefined);
    };
  }, [transactionId, orderId]);

  return (
    <div className="container">
      <h2>付款完成</h2>

      <p>訂單編號：{orderId}</p>
      <h3>交易紀錄</h3>
      <ul>
        <li>交易方式：{result?.payInfo[0].method}</li>
        <li>交易金額：{result?.payInfo[0].amount}</li>
        {result?.packages.map((packageItem) => {
          const confirmPackage = packageItem as unknown as ConfirmPackage;
          return (
            <li key={confirmPackage.id}>
              <h4>訂單編號：{confirmPackage.id}</h4>
              <ul>
                {confirmPackage.products.map((productItem) => (
                  <React.Fragment key={productItem.id}>
                    <li>產品名稱：{productItem.name}</li>
                    <li>
                      <img src={productItem.imageUrl} alt={productItem.name} />
                    </li>
                    <li>產品價格：{productItem.price}</li>
                    <li>產品數量：{productItem.quantity}</li>
                  </React.Fragment>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>

      <Link to="/">back to the Home</Link>
    </div>
  );
};

export default App;
