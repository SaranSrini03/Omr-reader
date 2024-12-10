"use client"
import { useState } from 'react';

export default function Home() {
  const [files, setFiles] = useState([null, null]); // Store two files in an array
  const [mismatchResult, setMismatchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFileChange = (event, index) => {
    const updatedFiles = [...files];
    updatedFiles[index] = event.target.files[0]; // Update the file in the corresponding index
    setFiles(updatedFiles);
  };

  const handleCompare = async () => {
    if (!files[0] || !files[1]) {
      alert('Please upload exactly two images');
      return;
    }

    setLoading(true);
    setIsModalOpen(true); // Open modal when comparison starts

    const formData = new FormData();
    formData.append('files', files[0]);
    formData.append('files', files[1]);

    try {
      // Simulate longer comparison with a timeout to extend the loader duration
      setTimeout(async () => {
        const response = await fetch('/api/compareOMR', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.error) {
          alert('Error processing images');
        } else if (data.mismatches) {
          setMismatchResult(`Number of mismatches: ${data.mismatches.length}`);
        } else {
          setMismatchResult(data.message);
        }

        setLoading(false); // Hide loader after the result is obtained
      }, 3000); // 3 seconds delay before showing result (adjust as necessary)
    } catch (error) {
      alert('Error communicating with the server');
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          OMR Image Comparison
        </h1>
        
        <div className="mb-4">
          <label htmlFor="answerKey" className="block text-sm font-semibold text-gray-700">
            Upload Answer Key Image:
          </label>
          <input
            id="answerKey"
            type="file"
            onChange={(e) => handleFileChange(e, 0)}
            accept="image/*"
            className="mt-2 block w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="userSheet" className="block text-sm font-semibold text-black">
            Upload User Sheet Image:
          </label>
          <input
            id="userSheet"
            type="file"
            onChange={(e) => handleFileChange(e, 1)}
            accept="image/*"
            className="mt-2 block w-full px-4 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={handleCompare}
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg text-black font-semibold ${
            loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
          } focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300`}
        >
          {loading ? 'Comparing...' : 'Compare'}
        </button>

        {files[0] && files[1] && (
          <div className="mt-4 text-center text-gray-600">
            <p><strong>Answer Key Image:</strong> {files[0].name}</p>
            <p><strong>User Sheet Image:</strong> {files[1].name}</p>
          </div>
        )}
      </div>

      {/* Modal with result */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            {loading ? (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 border-solid"></div>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800">Comparison Result</h2>
                <p className="mt-4 text-lg text-gray-600">{mismatchResult}</p>
                <button
                  onClick={closeModal}
                  className="mt-6 w-full py-2 px-4 rounded-lg text-black bg-indigo-600 hover:bg-indigo-700"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
