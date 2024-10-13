import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const LoginSignup = () => {
  const [action, setAction] = useState('Sign Up');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Function to handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Function to switch between login and signup
  const toggleAction = () => {
    setAction((prev) => (prev === 'Sign Up' ? 'Login' : 'Sign Up'));
    setMessage(''); // Clear any existing messages
    setFormData({ name: '', email: '', password: '' }); // Clear form data
  };

  
  
  

  // Handle sign up and login logic
  const handleSubmit = async () => {
    const url = `http://localhost:5000/api/${action === 'Sign Up' ? 'signup' : 'login'}`;
    const payload = action === 'Sign Up' ? formData : { email: formData.email, password: formData.password };
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        if (action === 'Sign Up') {
          setMessage('Account created successfully!');
          Cookies.set('userName', formData.name); // Set the user's name in a cookie on sign up
        } else {
          setMessage('Login successful!');
          Cookies.set('userName', result.name); // Set the user's name in a cookie on login
        }
        navigate('/maincontent'); // Redirect to chat page
      } else {
        setMessage(result.message || `${action} failed`);
      }
    } catch (error) {
      setMessage(`Error occurred during ${action.toLowerCase()}.`);
    }
  };
  

  return (
    <div className="loginsignup-body">
      <div className="sl_container">
        <div className="sl_header">
          <div className="sl_text">{action}</div>
          <div className="underline"></div>
        </div>

        <div className="sl_inputs">
          {action === 'Sign Up' && (
            <div className="sl_input">
              <img src="/static/images/person.png" alt="User Icon" />
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="sl_input">
            <img src="/static/images/email.png" alt="Email Icon" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="sl_input">
            <img src="/static/images/password.png" alt="Password Icon" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="login-signup-btn">
          <div className="submit-container">
            <div className="slsubmit" onClick={handleSubmit}>
              {action === 'Sign Up' ? 'SUBMIT' : 'LOGIN'}
            </div>
          </div>

          <div className="action-toggle">
            <div className="slsubmit active" onClick={toggleAction}>
              {action === 'Sign Up' ? 'MOVE TO LOGIN' : 'MOVE TO SIGN UP'}
            </div>
          </div>
        </div>

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default LoginSignup;

