'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
console.log("in page.tsx");

//https://tanstack.com/query/latest/docs/framework/react/quick-start
const queryClient = new QueryClient();

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_URL = NEXT_PUBLIC_API_URL || 'http://localhost:4000';


console.log("Current API URL:", API_URL);


function ScraperInterface() {
  const [url, setUrl] = useState('');
  const [question, setQuestion] = useState('');
  const [activeTaskId, setActiveTaskId] = useState<number| null>(null);

  //https://tanstack.com/query/v4/docs/framework/react/reference/useMutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(`${API_URL}/api/tasks`, { url, question });
      return res.data; 
    },
    onSuccess: (data) => {
      setActiveTaskId(data.id);
    },
  });

  //https://tanstack.com/query/latest/docs/framework/react/reference/useQuery
  //https://tanstack.com/query/v5/docs/framework/react/guides/queries
  const { data: task } = useQuery({
    queryKey: ['task', activeTaskId],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/tasks/${activeTaskId}`);
      return res.data;
    },
    enabled: !!activeTaskId,
    refetchInterval: (query) => {
    const status = query.state.data?.status;
    return (status === 'completed' || status === 'failed') ? false : 2000;
  },
  });

  return (
    <div className="main-container">
      <header className="header">
        <h1>AI Web Scraper</h1>
        <p>Enter URL and ask Gemini anything about its content.</p>
      </header>

      <section className="input-card">
        <div className="form-group">
          <label>Website URL</label>
          <input
            className="input-field"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            required
          />
        </div>
        <div className="form-group">
          <label>Question</label>
          <input
            className="input-field"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question here"
            required
          />
        </div>
        <button
          className="submit-button"
          onClick={() => submitMutation.mutate()}
     
          disabled={submitMutation.isPending || (task?.status === 'pending' || task?.status === 'processing')}
        >
          {submitMutation.isPending ? 'Queuing...' : 'Start Analysis'}
        </button>
      </section>

      {task && (
        <section className="result-card">
          <div className="status-badge-container">
            Status: <span className={`status-badge ${task.status}`}>{task.status}</span>
          </div>
          <div className="result-content">
            <h3>AI Answer:</h3>
            {task.answer ? (
              <p className="answer-text">{task.answer}</p>
            ) : (
              <p className="loading-text">Scraping site and thinking...</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}


export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <ScraperInterface />
    </QueryClientProvider>
  );
}