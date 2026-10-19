import apiClient from './BaseClient.js';

export const CallAgent = async (
  user_input = String,
  max_results = Number,
  search_depth = String
) => {
  const response = await apiClient.post('/agent/asks', {
    user_query: user_input,
    max_results: max_results,
    search_dept: search_depth,
  });
  if (response.status == 200) {
    return response.data;
  }
};
