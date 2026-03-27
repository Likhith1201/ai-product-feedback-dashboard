import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  //  State for our input form
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFeedback = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/feedback/all');
      setFeedbackList(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  //  Function to handle sending the message
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSubmitting(true);
    try {
      // Send the message to our FastAPI backend
      await axios.post('http://127.0.0.1:8000/api/feedback/', {
        message: newMessage
      });
      
      // Clear the input box and fetch the updated list from the database!
      setNewMessage('');
      fetchFeedback(); 
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit. Is your Python backend running?");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Product Feedback Dashboard</h1>
          <p className="text-gray-500 mt-2">Real-time user feedback analyzed and categorized by AI.</p>
        </div>

        {/*  The Submission Form */}
        <form onSubmit={handleSubmit} className="mb-10 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type sample user feedback here (e.g., 'I love the new dark mode!')" 
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300 transition-colors whitespace-nowrap"
          >
            {isSubmitting ? 'AI Analyzing...' : 'Submit Feedback'}
          </button>
        </form>

        {/* Loading State */}
        {loading ? (
          <p className="text-gray-500">Loading AI Insights...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Loop through all feedback and create a card for each */}
            {feedbackList.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                
                <div>
                  {/* Badges */}
                  <div className="flex gap-2 mb-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      item.urgency === 'High' ? 'bg-red-100 text-red-700' : 
                      item.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-green-100 text-green-700'
                    }`}>
                      {item.urgency} Urgency
                    </span>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {item.category}
                    </span>
                  </div>

                  {/* Raw Message */}
                  <p className="text-gray-800 text-sm mb-4">"{item.raw_message}"</p>
                </div>

                {/* Sentiment Footer */}
                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                  <span className="text-xs text-gray-400">ID: #{item.id}</span>
                  <span className={`text-sm font-medium ${
                    item.sentiment === 'Negative' ? 'text-red-600' : 
                    item.sentiment === 'Positive' ? 'text-green-600' : 
                    'text-gray-600'
                  }`}>
                    {item.sentiment} Sentiment
                  </span>
                </div>

              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  )
}

export default App