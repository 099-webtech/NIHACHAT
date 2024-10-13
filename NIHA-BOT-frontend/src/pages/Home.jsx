import React from 'react';


function Home() {
  return (
    <div className="home-page-body">
    <div className="HomePageApp">
      <header className="home-page-hero-section">
        <nav className="home-page-navbar">
          <h1 className="home-page-logo"><a href='/login-signup'>Generative Niha</a></h1>
          <ul className="home-page-nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
        <div className="home-page-hero-content">
          <h2>Meet Generative Niha</h2>
          <p>Your AI companion for seamless human-robot interaction. Powered by GPT-based semantic processing.</p>
          <button className="home-page-cta-button"><a className='home-page-cta-a' href='login-signup'>Try the Chatbot</a></button>
          
        </div>
      </header>

      <section className="home-page-features-section" id="features">
        <h3>Key Features</h3>
        <div className="home-page-features-grid">
          <div className="home-page-feature-item">
            <h4>Natural Language Understanding</h4>
            <p>Generative Niha comprehends human implicit statements and responds intelligently.</p>
          </div>
          <div className="home-page-feature-item">
            <h4>Real-time Interaction</h4>
            <p>Engage with real-time conversations, adapting to your needs.</p>
          </div>
          <div className="home-page-feature-item">
            <h4>AI-Powered Insights</h4>
            <p>Leverage AI to understand human context and enhance cognitive understanding.</p>
          </div>
        </div>

      </section>
      
      <section className="home-page-about-section" id="about">
  <div className="home-page-about-image">
    <img src="/static/images/niha.jpg" alt="Generative Niha Chatbot" />
  </div>
  <div className="home-page-about-content">
    <h3>About the Chatbot</h3>
    <p>Generative Niha is an advanced chatbot designed for human-robot interactions. Using cutting-edge GPT models, it processes language in a way that allows for deep contextual understanding.</p>
    <p>It seamlessly interprets implicit human statements and enhances communication between humans and robots, offering a natural and engaging interaction experience. Whether in education, healthcare, or customer service, Generative Niha bridges the gap between technology and human needs.</p>
  </div>
</section>


      <footer className="home-page-footer-section" id="contact">
        <div></div>
        <h4>Get in Touch</h4>
        <p>If you're interested in integrating Generative Niha, contact us!</p>
        <button className="home-page-contact-button">Contact Us</button>
      </footer>
    </div>
    </div>
  );
}

export default Home;