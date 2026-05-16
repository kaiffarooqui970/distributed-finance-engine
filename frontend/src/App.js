import React, { useState } from 'react';
import './App.css';

function App() {
  // === STATE 1: Authentication ===
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // === STATE 2: Calculator ===
  const [age, setAge] = useState('');
  const [savings, setSavings] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // === FUNCTION 1: Handle the Login ===
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    try {
      // Send credentials to Gateway, which forwards to Django Auth!
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password })
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Secure Token Received:", data.token);
        setIsLoggedIn(true); // This instantly unlocks the calculator!
      } else {
        setLoginError('Invalid username or password.');
      }
    } catch (error) {
      setLoginError('Server connection error.');
    }
  };

  // === FUNCTION 2: Handle the Math ===
  const calculateRetirement = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: parseInt(age),
          monthly_savings: parseFloat(savings)
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // === THE UI: Conditional Rendering ===
  
  // If they are NOT logged in, show this Security Screen:
  if (!isLoggedIn) {
    return (
      <div style={{ padding: '50px', fontFamily: 'Arial', maxWidth: '400px', margin: '0 auto' }}>
        <h2>System Login</h2>
        <p>Authenticated users only.</p>
        
        {loginError && <p style={{ color: 'red' }}>{loginError}</p>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label>Username: </label>
            <input 
              type="text" value={username} onChange={(e) => setUsername(e.target.value)} required 
              style={{ padding: '8px', width: '100%' }}
            />
          </div>
          <div>
            <label>Password: </label>
            <input 
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required 
              style={{ padding: '8px', width: '100%' }}
            />
          </div>
          <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
            Login to Django Server
          </button>
        </form>
      </div>
    );
  }

  // If they ARE logged in, show the Math Screen:
  return (
    <div style={{ padding: '50px', fontFamily: 'Arial', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Retirement Calculator</h2>
      <p style={{ color: 'green' }}>✓ Authenticated as {username}</p>

      <form onSubmit={calculateRetirement} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Current Age: </label>
          <input 
            type="number" value={age} onChange={(e) => setAge(e.target.value)} required 
            style={{ padding: '8px', width: '100%' }}
          />
        </div>
        <div>
          <label>Monthly Savings (€): </label>
          <input 
            type="number" value={savings} onChange={(e) => setSavings(e.target.value)} required 
            style={{ padding: '8px', width: '100%' }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          {loading ? 'Calculating in C++...' : 'Calculate Projection'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
          <h3>Your Results:</h3>
          <p>Years to invest: <strong>{result.years_left}</strong></p>
          <p>Total at age 67: <strong>€{result.retirement_total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></p>
        </div>
      )}
    </div>
  );
}

export default App;