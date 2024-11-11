import React from 'react';
import './styles/home.css';
import { useNavigate } from 'react-router-dom';
import '@fontsource/dm-sans/700.css'; 
import home_banner from '../assets/trading1.png';
import service1_card from '../assets/online_shopper.png';
import service3_card from '../assets/selling.png';
import service2_card from '../assets/searching.png';
import about_image from '../assets/about.png';

const Home = () => {
  const navigate = useNavigate();
    const handleBrowse= () => {
        navigate('/browse_listings');
    };

  return (
    <div className="home-container">
      <section className="banner">
        <div className="slogan-container">
          <div className="slogan">COMPETITIVE BIDDING, UNBEATABLE REWARDS</div>
          <div className="highlight"> The #1 E-Bidding Software in the Marketplace </div>
          <button className="slogan_button"  type="button" onClick={handleBrowse}>Start Bidding Today</button>
        </div>
        <div className="banner-image">
          <img src={home_banner} alt="home_image" className="home_image" />
        </div>
      </section>
      <section className="about-container">
        <div className="img-contain">
          <img src={about_image} alt="about-image" className="about-image" />
        </div>
        <div className="about">TrustSphere 
          <div className="about-info">At TrustSphere, we believe that trust, transparency, and mutual opportunity are at the heart 
          of every great marketplace. Founded with the vision to empower both individuals and businesses, TrustSphere is an 
          E-bidding platform where buyers and sellers connect in a secure, competitive, and seamless environment. Whether 
          you are searching for the best deals or looking to unlock the highest value for your products and services, our 
          platform is built to help you succeed. <br /> <br />Inspired by the idea that fair competition drives innovation, TrustSphere 
          provides an equal opportunity space where users can engage in confidential, real-time bidding. We prioritize 
          security, privacy, and efficiency—ensuring that every bid is protected, every transaction is transparent, and 
          every opportunity is within reach. Our mission is simple: to build a marketplace where trust thrives, and 
          connections grow. Whether you're an entrepreneur scaling your business or a buyer searching for that perfect 
          product, TrustSphere makes e-bidding simple, rewarding, and safe. With unbeatable rewards, innovative bidding 
          tools, and dedicated support, we’re here to help you compete, win, and grow. <br /> <br /> Ready to get started? Become a user
          today to find and provide unique, in demand items.</div>
          </div>
          </section>

      <section className="services">
        <div className="services-label">Our Services</div>
        <div className="service-grid">
          <div className="service-box">
            <div className="service-bidding">Explore secure & confidential bidding you can trust.</div>
            <div className="service-bidding-info">Your trust and protection of information is our first priority. Browse thousands of items and 
              engage in secure, confidential bidding—where privacy meets endless opportunities.</div>
          </div>
          <div className="service-box">
            <img src={service2_card} alt="service1-image" className="service1-image" />
          </div>
          <div className="service-box">
            <div className="service-selling">Looking for something in particular? Find it here!</div>
            <div className="service-selling-info"> List the items you're searching for, set your ideal price, and let others find them for you! The perfect way to get exactly what you need, hassle-free.</div>
          </div>
          <div className="service-box">
            <img src={service1_card} alt="service1-image" className="service1-image" />
          </div>
          <div className="service-box">
            <div className="service-selling">Unlock value—maximize profit for your business.</div>
            <div className="service-selling-info">Not just browsing? Take the next step in showcasing your business. With 
              our secure platform you can attract serious buyers, maximize your profits, and enjoy a  hassle-free selling experience every step of the way.</div>
          </div>
          <div className="service-box">
            <img src={service3_card} alt="service1-image" className="service1-image" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
