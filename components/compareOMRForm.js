"use client"
import { useState } from 'react';

export default function CompareOMRForm() {
  const [answerKey, setAnswerKey] = useState(null);
  const [userSheet, setUserSheet] = useState(null);
  const [mismatches, setMismatches] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create FormData to send images to backend
    const formData = new FormData();
    formData.append('files', answerKey);
    formData.append('files', userSheet);

    const response = await fetch('/api/compareOMR', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      setMismatches(result.mismatches || []);
    } else {
      alert('Error: ' + result.error);
    }
  };

  return (
    <div>
      <h1>OMR Comparison</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Answer Key: </label>
          <input
            type="file"
            onChange={(e) => setAnswerKey(e.target.files[0])}
            required
          />
        </div>
        <div>
          <label>User Sheet: </label>
          <input
            type="file"
            onChange={(e) => setUserSheet(e.target.files[0])}
            required
          />
        </div>
        <button type="submit">Compare</button>
      </form>

      {mismatches.length > 0 && (
        <div>
          <h3>Mismatches Found:</h3>
          <ul>
            {mismatches.map((position, index) => (
              <li key={index}>Row: {position.row}, Column: {position.col}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
