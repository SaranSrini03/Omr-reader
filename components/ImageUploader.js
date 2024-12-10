'use client'
import React, { useState } from 'react';
import Results from './Results';

export default function ImageUploader() {
  const [answerKey, setAnswerKey] = useState(null);
  const [userSheet, setUserSheet] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('answerKey', answerKey);
    formData.append('userSheet', userSheet);

    const res = await fetch('/api/processOMR', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setComparisonResult(data.comparisonResult);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">OMR Reader</h1>
      <div className="mb-4">
        <input
          type="file"
          onChange={(e) => setAnswerKey(e.target.files[0])}
          className="mb-2 block"
        />
        <input
          type="file"
          onChange={(e) => setUserSheet(e.target.files[0])}
          className="mb-2 block"
        />
      </div>
      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
      >
        Process OMR
      </button>
      <div className="mt-8">
        <Results comparisonResult={comparisonResult} />
      </div>
    </div>
  );
}
