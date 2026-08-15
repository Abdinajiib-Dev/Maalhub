import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, DollarSign, MessageSquare, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const InvestmentRequests = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getInvestmentRequests();
      setRequests(data);
    } catch (err) {
      setError(err.message || 'Failed to load investment requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      setActionLoading(id);
      await api.updateRequestStatus(id, status);
      // Update local state to reflect the change immediately
      setRequests(requests.map(req => req.id === id ? { ...req, status } : req));
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMessageUser = async (userId) => {
    try {
      setActionLoading('msg-' + userId);
      await api.startConversation(userId);
      // Navigate to messages tab
      navigate('../messages');
    } catch (err) {
      alert(`Failed to start conversation: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
      case 'Accepted':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Accepted</span>;
      case 'Rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Rejected</span>;
      case 'Withdrawn':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><AlertCircle className="w-3 h-3 mr-1" /> Withdrawn</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const isInvestor = profile?.role === 'investor';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Investment Requests</h1>
        <p className="text-gray-500 mt-1">
          {isInvestor 
            ? "Track and manage the investment offers you have sent to entrepreneurs." 
            : "Review and respond to incoming investment offers for your projects."}
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
          <p className="text-gray-500">Loading requests...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-100 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Requests Found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            {isInvestor 
              ? "You haven't made any investment requests yet." 
              : "You haven't received any investment requests for your projects yet."}
          </p>
          {isInvestor && (
            <Link to="/projects" className="inline-flex items-center text-primary font-medium hover:underline">
              Explore Projects
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row md:items-center p-6 gap-6 relative">
              
              {/* Primary Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    <Link to={`/projects/${request.project_id}`} className="hover:text-primary transition-colors">
                      {request.project?.project_name || 'Unknown Project'}
                    </Link>
                  </h3>
                  {getStatusBadge(request.status)}
                </div>
                
                <p className="text-sm text-gray-500 mb-4">
                  {isInvestor 
                    ? `Entrepreneur: ${request.entrepreneur?.full_name || 'Unknown'}` 
                    : `Investor: ${request.investor?.full_name || 'Unknown'}`}
                </p>

                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2 font-medium text-gray-900">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    Message:
                  </div>
                  <p className="whitespace-pre-line">{request.message}</p>
                </div>
              </div>

              {/* Amount & Actions */}
              <div className="md:w-64 flex flex-col items-start md:items-end md:text-right border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6">
                <span className="block text-gray-500 text-sm mb-1">Proposed Amount</span>
                <span className="text-3xl font-black text-gray-900 mb-6">${request.proposed_amount?.toLocaleString() || '0'}</span>

                <div className="w-full space-y-2">
                  {request.status === 'Pending' && (
                    <>
                      {isInvestor ? (
                        <button 
                          onClick={() => handleUpdateStatus(request.id, 'Withdrawn')}
                          disabled={actionLoading === request.id}
                          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                          {actionLoading === request.id ? 'Updating...' : 'Withdraw Request'}
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(request.id, 'Accepted')}
                            disabled={actionLoading === request.id || actionLoading === 'msg-' + request.investor_id}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            {actionLoading === request.id ? 'Updating...' : 'Accept Offer'}
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(request.id, 'Rejected')}
                            disabled={actionLoading === request.id || actionLoading === 'msg-' + request.investor_id}
                            className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            {actionLoading === request.id ? 'Updating...' : 'Reject Offer'}
                          </button>
                          <button 
                            onClick={() => handleMessageUser(request.investor_id)}
                            disabled={actionLoading === request.id || actionLoading === 'msg-' + request.investor_id}
                            className="w-full bg-primary hover:bg-secondary text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50 mt-2"
                          >
                            {actionLoading === 'msg-' + request.investor_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4 mr-2" />}
                            Message Investor
                          </button>
                        </>
                      )}
                    </>
                  )}
                  {request.status !== 'Pending' && (
                    <div className="w-full py-2 px-4 bg-gray-50 rounded-lg text-center text-sm font-medium text-gray-500 border border-gray-100">
                      Action Completed
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestmentRequests;
