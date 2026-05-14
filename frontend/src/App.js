import React, { useState } from 'react';
import './App.css';

function App() {
  const [age, setAge] = useState('');
  const [savings, setSavings] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateRetirement = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send the data to your Python Gateway (which sends it to C++)
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
      console.error("Error connecting to server:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '50px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Retirement Calculator</h2>
      <p>Powered by our C++ Finance Engine</p>

      <form onSubmit={calculateRetirement} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Current Age: </label>
          <input 
            type="number" 
            value={age} 
            onChange={(e) => setAge(e.target.value)} 
            required 
            style={{ padding: '8px', width: '100%' }}
          />
        </div>
        <div>
          <label>Monthly Savings (€): </label>
          <input 
            type="number" 
            value={savings} 
            onChange={(e) => setSavings(e.target.value)} 
            required 
            style={{ padding: '8px', width: '100%' }}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Calculating...' : 'Calculate Projection'}
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