import { useState, useEffect } from 'react';
import { Loader, ChevronDown, ChevronUp } from 'lucide-react';
import Alert from './Alert';
import { quotesAPI } from '../services/api';

export default function QuoteManagement() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedQuote, setExpandedQuote] = useState(null);
  const [stats, setStats] = useState(null);
  const [newQuote, setNewQuote] = useState({ text: '', author: '' });
  const [showForm, setShowForm] = useState(false);

  const QUOTES_PER_PAGE = 10;

  useEffect(() => {
    fetchQuotes();
    fetchStats();
  }, [currentPage]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const response = await quotesAPI.getQuotes(currentPage, QUOTES_PER_PAGE);
      setQuotes(response.data.quotes);
      setTotalPages(Math.ceil(response.data.total / QUOTES_PER_PAGE));
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Failed to load quotes',
        message: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await quotesAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleAddQuote = async () => {
    if (!newQuote.text.trim() || !newQuote.author.trim()) {
      setAlert({
        type: 'warning',
        title: 'Invalid input',
        message: 'Please fill in both quote text and author.',
      });
      return;
    }

    try {
      await quotesAPI.createQuote(newQuote.text, newQuote.author);
      setAlert({
        type: 'success',
        title: 'Quote added',
        message: 'New quote has been added successfully.',
      });
      setNewQuote({ text: '', author: '' });
      setShowForm(false);
      fetchQuotes();
      fetchStats();
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Failed to add quote',
        message: error.response?.data?.message || error.message,
      });
    }
  };

  const handleDeleteQuote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quote?')) return;

    try {
      await quotesAPI.deleteQuote(id);
      setAlert({
        type: 'success',
        title: 'Quote deleted',
        message: 'Quote has been removed successfully.',
      });
      fetchQuotes();
      fetchStats();
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Failed to delete quote',
        message: error.response?.data?.message || error.message,
      });
    }
  };

  if (loading && quotes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {alert && <Alert {...alert} onDismiss={() => setAlert(null)} />}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-600 font-medium">Total Quotes</p>
            <p className="text-3xl font-bold text-blue-900 mt-2">{stats.total || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-600 font-medium">Average Rating</p>
            <p className="text-3xl font-bold text-green-900 mt-2">{stats.averageRating?.toFixed(2) || 'N/A'}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-purple-600 font-medium">Most Rated</p>
            <p className="text-3xl font-bold text-purple-900 mt-2">{stats.mostRated || 'N/A'}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
            <p className="text-sm text-orange-600 font-medium">Tags Used</p>
            <p className="text-3xl font-bold text-orange-900 mt-2">{stats.totalTags || 0}</p>
          </div>
        </div>
      )}

      {/* Add Quote Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center justify-between text-lg font-semibold text-gray-900 hover:text-blue-600 transition"
        >
          <span>Add New Quote</span>
          {showForm ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showForm && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quote Text</label>
              <textarea
                value={newQuote.text}
                onChange={(e) => setNewQuote({ ...newQuote, text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Enter the quote text..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
              <input
                type="text"
                value={newQuote.author}
                onChange={(e) => setNewQuote({ ...newQuote, author: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Quote author..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddQuote}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Add Quote
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quotes List */}
      <div className="space-y-3">
        {quotes.map((quote) => (
          <div
            key={quote.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition"
          >
            <div
              onClick={() => setExpandedQuote(expandedQuote === quote.id ? null : quote.id)}
              className="flex items-start justify-between cursor-pointer"
            >
              <div className="flex-grow">
                <p className="text-gray-700 font-medium leading-relaxed">
                  "{quote.text.substring(0, 100)}"{quote.text.length > 100 && '...'}
                </p>
                <p className="text-sm text-gray-500 mt-1">— {quote.author}</p>
              </div>
              {expandedQuote === quote.id ? (
                <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
            </div>

            {expandedQuote === quote.id && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                <p className="text-gray-700 text-sm">{quote.text}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Rating: </span>
                    <span className="font-medium">{quote.rating || 'Not rated'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tags: </span>
                    <span className="font-medium">{quote.tags?.length || 0}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteQuote(quote.id)}
                  className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition font-medium text-sm"
                >
                  Delete Quote
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Previous
        </button>
        <span className="text-gray-600 text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Next
        </button>
      </div>
    </div>
  );
}
