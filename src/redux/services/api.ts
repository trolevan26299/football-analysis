// Hàm tiện ích để xử lý response và lỗi
export const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Lỗi ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

// Tạo một wrapper cho fetch API cho các yêu cầu cơ bản
export const fetchWithCache = async (url: string, options: RequestInit = {}) => {
  // Lấy thời gian cache từ localStorage nếu có
  const cacheKey = `cache_${url}`;
  const cacheTime = `cache_time_${url}`;
  const cachedData = localStorage.getItem(cacheKey);
  const cachedTime = localStorage.getItem(cacheTime);
  
  // Thiết lập thời gian cache mặc định là 5 phút (300000ms)
  const CACHE_DURATION = 5 * 60 * 1000;
  
  // Kiểm tra xem dữ liệu cache có còn hiệu lực không
  if (cachedData && cachedTime) {
    const now = Date.now();
    const timestamp = parseInt(cachedTime, 10);
    
    // Nếu cache còn hiệu lực, trả về dữ liệu cache
    if (now - timestamp < CACHE_DURATION) {
      return JSON.parse(cachedData);
    }
  }
  
  // Nếu không có cache hoặc cache đã hết hạn, thực hiện fetch mới
  try {
    const response = await fetch(url, options);
    const data = await handleResponse(response);
    
    // Lưu kết quả vào cache
    localStorage.setItem(cacheKey, JSON.stringify(data));
    localStorage.setItem(cacheTime, Date.now().toString());
    
    return data;
  } catch (error) {
    // Nếu fetch mới thất bại nhưng có cache cũ, vẫn trả về cache cũ
    if (cachedData) {
      console.warn('Fetching failed, returning stale cache for:', url);
      return JSON.parse(cachedData);
    }
    throw error;
  }
};

// Type cho các tham số
type QueryParams = Record<string, string | number | boolean | undefined | null>;

// API service cho matches
export const fetchMatches = async (params: QueryParams = {}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  
  return fetchWithCache(`/api/matches?${queryParams.toString()}`);
};

export const fetchMatchDetail = async (id: string) => {
  return fetchWithCache(`/api/matches/${id}`);
};

// API service cho articles
export const fetchArticles = async (params: QueryParams = {}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  
  return fetchWithCache(`/api/articles?${queryParams.toString()}`);
};

export const fetchArticleDetail = async (id: string) => {
  return fetchWithCache(`/api/articles/${id}`);
};

// API service cho leagues
export const fetchLeagues = async (params: QueryParams = {}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  
  return fetchWithCache(`/api/leagues?${queryParams.toString()}`);
};

export const fetchLeagueDetail = async (id: string) => {
  return fetchWithCache(`/api/leagues/${id}`);
};

// API service cho users
export const fetchUsers = async () => {
  return fetchWithCache('/api/users');
};

export const fetchUserDetail = async (id: string) => {
  return fetchWithCache(`/api/users/${id}`);
};

// API service cho dashboard
export const fetchDashboardData = async () => {
  return fetchWithCache('/api/dashboard');
};

// Các hàm POST, PUT, DELETE không sử dụng cache
export const createItem = async <T>(endpoint: string, data: T) => {
  const response = await fetch(`/api/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  return handleResponse(response);
};

export const updateItem = async <T>(endpoint: string, id: string, data: T) => {
  const response = await fetch(`/api/${endpoint}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  // Sau khi update thì xóa cache
  invalidateCache(`/api/${endpoint}/${id}`);
  invalidateCache(`/api/${endpoint}`);
  
  return handleResponse(response);
};

export const deleteItem = async (endpoint: string, id: string) => {
  const response = await fetch(`/api/${endpoint}/${id}`, {
    method: 'DELETE',
  });
  
  // Sau khi delete thì xóa cache
  invalidateCache(`/api/${endpoint}/${id}`);
  invalidateCache(`/api/${endpoint}`);
  
  return handleResponse(response);
};

// Hàm để xóa cache cho một URL cụ thể
export const invalidateCache = (url: string) => {
  const cacheKey = `cache_${url}`;
  const cacheTime = `cache_time_${url}`;
  
  localStorage.removeItem(cacheKey);
  localStorage.removeItem(cacheTime);
  
  // Xóa tất cả cache liên quan đến URL này
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('cache_') && key.includes(url.split('?')[0])) {
      localStorage.removeItem(key);
      
      // Xóa cả timestamp cache
      const timeKey = key.replace('cache_', 'cache_time_');
      localStorage.removeItem(timeKey);
    }
  });
}; 