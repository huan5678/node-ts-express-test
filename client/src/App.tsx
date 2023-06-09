import React from 'react';
import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_HOST;

export const App = () => {
  const [hash, setHash] = React.useState('');
  const [encrypted, setEncrypted] = React.useState('');


  const [orderId, setOrderId] = React.useState('550e8400-e29b-41d4-a716-446655440000');

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

  const handleChangeOrderId = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setOrderId(event.target.value);
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
            <label htmlFor="description">Hash</label>
            <input
              type="text"
              className="form-control"
              id="Hash"
              readOnly
              placeholder="Hash"
              value={hash}
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Encrypted</label>
            <input
              type="text"
              className="form-control"
              id="Encrypted"
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
            <div className="flex-auto">
              <label htmlFor="orderId">訂單編號</label>
              <div className="d-flex items-center gap-2">
                <input
                  type="text"
                  className="form-control"
                  value={orderId}
                  onChange={handleChangeOrderId}
                />
                <a
                  className="btn btn-light w-1/4"
                  target="_blank"
                  href={`${baseUrl}/payments/ec-pay/request/${orderId}`}
                >
                  綠界
                </a>
              </div>
            </div>
          </div>
        </form>
      </section>
      <div dangerouslySetInnerHTML={{__html: resultContent}} />
    </>
  );
};

export default App;
