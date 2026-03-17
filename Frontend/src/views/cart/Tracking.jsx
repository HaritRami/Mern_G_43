import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const trackingStyles = `
  .tracking-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem 0;
    text-align: center;
    color: white;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    margin-bottom: 2rem;
  }
  .track-card {
    max-width: 700px;
    margin: 0 auto;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    background: #fff;
  }
  .track-card h2 {
    color: #2d3748;
  }
  .delivery-msg {
    background: #e6fffa;
    border-left: 4px solid #38b2ac;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    color: #2c7a7b;
    font-weight: 500;
  }
  .steps {
    list-style: none;
    padding: 0;
  }
  .steps li {
    position: relative;
    padding-left: 3rem;
    margin-bottom: 1.5rem;
    font-weight: 500;
  }
  .steps li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0.1rem;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    background: #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    color: #4a5568;
  }
  .steps li.completed::before {
    background: #667eea;
    color: white;
  }
  .steps li::after {
    content: "";
    position: absolute;
    left: 0.7rem;
    top: 1.8rem;
    width: 0.2rem;
    height: calc(100% - 1.8rem);
    background: #e2e8f0;
  }
  .steps li:last-child::after {
    display: none;
  }
  .steps li.completed::after {
    background: #667eea;
  }
`;

const Tracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        if (!savedUser || !savedUser.tokens?.accessToken) {
          toast.error('Please login to view tracking');
          navigate('/account/signin');
          return;
        }
        const authConfig = {
          headers: { Authorization: `Bearer ${savedUser.tokens.accessToken}` }
        };
        const resp = await axios.get(`http://localhost:5000/api/order/${id}`, authConfig);
        setOrder(resp.data);
      } catch (err) {
        console.error(err);
        toast.error('Unable to fetch order details');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate]);

  const computeSteps = () => {
    if (!order) return [];
    const steps = [
      { label: 'Order Placed', done: true, icon: '✔' },
      { label: 'Processing', done: true, icon: '✔' },
      { label: 'Shipped', done: false, icon: '📦' },
      { label: 'Out for Delivery', done: false, icon: '🚚' },
      { label: 'Delivered', done: false, icon: '🏁' }
    ];

    const now = new Date();
    const trackingDate = order.trackingDate ? new Date(order.trackingDate) : null;
    if (trackingDate && now >= trackingDate) {
      steps[2].done = true;
      steps[2].icon = '✔';
    }
    // assume each subsequent step is 1 day apart for demo
    if (trackingDate && now >= new Date(trackingDate.getTime() + 1*24*60*60*1000)) {
      steps[3].done = true;
      steps[3].icon = '✔';
    }
    if (trackingDate && now >= new Date(trackingDate.getTime() + 2*24*60*60*1000)) {
      steps[4].done = true;
      steps[4].icon = '✔';
    }
    return steps;
  };

  if (loading) {
    return <div className="text-center mt-5">Loading tracking information...</div>;
  }

  if (!order) return null;

  const steps = computeSteps();
  const trackingDate = order.trackingDate ? new Date(order.trackingDate) : null;
  const deliveryDate = trackingDate ? new Date(trackingDate.getTime() + 3*24*60*60*1000) : null;
  const deliveryMsg = deliveryDate
    ? `Your order will be delivered on ${deliveryDate.toLocaleDateString()}`
    : '';

  return (
    <>
      <style>{trackingStyles}</style>
      <div className="tracking-header">
        <h1>Track Your Order</h1>
      </div>
      <div className="track-card">
        <h2>Order #{order.orderId}</h2>
        <p>Status: {order.paymentStatus}</p>
        {deliveryMsg && <div className="delivery-msg">{deliveryMsg}</div>}
        <ul className="steps">
          {steps.map((s, idx) => (
            <li key={idx} className={s.done ? 'completed' : ''}>
              <span className="step-icon">{s.icon}</span> {s.label}
            </li>
          ))}
        </ul>
        <a href="/" className="btn btn-primary">Back to Home</a>
      </div>
    </>
  );
};

export default Tracking;
