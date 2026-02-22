import { useMutation } from '@tanstack/react-query';
import type { Feed } from '@/lib/types';

interface AddFeedData {
  title: string;
  url: string;
  siteUrl?: string;
  description?: string;
  format?: 'rss' | 'atom' | 'json';
}

interface AddFeedResponse {
  success: boolean;
  data?: Feed;
  error?: string;
}

const addFeed = async (feedData: AddFeedData): Promise<Feed> => {
  const response = await fetch('/api/feedinfo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(feedData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to add feed');
  }

  return response.json();
};

export const useAddFeed = () => {
  return useMutation({
    mutationFn: addFeed,
    onSuccess: (data) => {
      // Optional: Handle success (e.g., show toast, invalidate queries)
      console.log('Feed added successfully:', data);
    },
    onError: (error) => {
      // Optional: Handle error (e.g., show error toast)
      console.error('Error adding feed:', error.message);
    },
  });
};

/*
Conceptual UI Integration Example:

import { useAddFeed } from '@/lib/hooks/useAddFeed';
import { useState } from 'react';

const AddFeedForm = () => {
  const [formData, setFormData] = useState<AddFeedData>({
    title: '',
    url: '',
    siteUrl: '',
    description: '',
    format: 'rss',
  });

  const addFeedMutation = useAddFeed();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFeedMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Feed Title"
        required
      />
      <input
        name="url"
        value={formData.url}
        onChange={handleChange}
        placeholder="Feed URL"
        required
      />
      <input
        name="siteUrl"
        value={formData.siteUrl}
        onChange={handleChange}
        placeholder="Site URL (optional)"
      />
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description (optional)"
      />
      <select name="format" value={formData.format} onChange={handleChange}>
        <option value="rss">RSS</option>
        <option value="atom">Atom</option>
        <option value="json">JSON</option>
      </select>
      <button
        type="submit"
        disabled={addFeedMutation.isPending}
      >
        {addFeedMutation.isPending ? 'Adding...' : 'Add Feed'}
      </button>
      {addFeedMutation.isError && (
        <p>Error: {addFeedMutation.error.message}</p>
      )}
      {addFeedMutation.isSuccess && (
        <p>Feed added successfully!</p>
      )}
    </form>
  );
};
*/
