import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const ComplaintContext = createContext();

export function ComplaintProvider({ children }) {
  const { currentUser } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchComplaints = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      let response;
      if (currentUser.role === 'citizen') {
        response = await api.get('/complaints/mine');
      } else if (currentUser.role === 'worker') {
        response = await api.get('/worker/assigned');
      } else {
        response = await api.get('/admin/complaints');
      }
      setComplaints(response.data);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [currentUser]);

  const createComplaint = async (formData) => {
    try {
      const response = await api.post('/complaints', formData);
      await fetchComplaints();
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit complaint'
      };
    }
  };

  const createComplaintsBatch = async (complaintsArray) => {
    try {
      const results = [];
      for (const item of complaintsArray) {
        const response = await api.post('/complaints', item);
        results.push(response.data);
      }
      await fetchComplaints();
      return { success: true, results };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Batch complaint creation failed'
      };
    }
  };

  const upvoteComplaint = async (id) => {
    try {
      await api.put(`/complaints/${id}/upvote`);
      await fetchComplaints();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Upvote failed'
      };
    }
  };

  const submitFeedback = async (id, rating, comment) => {
    try {
      await api.post(`/complaints/${id}/feedback`, { rating, comment });
      await fetchComplaints();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Feedback submission failed'
      };
    }
  };

  const assignWorker = async (id, workerId) => {
    try {
      await api.put(`/admin/complaints/${id}/assign`, { workerId });
      await fetchComplaints();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Worker assignment failed'
      };
    }
  };

  const resolveComplaint = async (id, resolvedPhoto) => {
    try {
      await api.put(`/worker/${id}/resolve`, { resolvedPhoto });
      await fetchComplaints();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to resolve task'
      };
    }
  };

  return (
    <ComplaintContext.Provider value={{
      complaints,
      loading,
      fetchComplaints,
      createComplaint,
      createComplaintsBatch,
      upvoteComplaint,
      submitFeedback,
      assignWorker,
      resolveComplaint
    }}>
      {children}
    </ComplaintContext.Provider>
  );
}

export function useComplaints() {
  return useContext(ComplaintContext);
}
