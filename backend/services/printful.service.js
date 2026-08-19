import axios from 'axios';

const getPrintfulClient = () => {
  const token = process.env.PRINTFUL_API_KEY;
  if (!token) {
    throw new Error('PRINTFUL_API_KEY is not configured in the environment');
  }

  return axios.create({
    baseURL: 'https://api.printful.com',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const fetchAllProducts = async () => {
  try {
    const client = getPrintfulClient();
    const response = await client.get('/store/products');
    return response.data;
  } catch (error) {
    throw new Error(`Printful API Error (Products): ${error.message}`);
  }
};

export const fetchProductById = async (id) => {
  try {
    const client = getPrintfulClient();
    const response = await client.get(`/store/products/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Printful API Error (Product ${id}): ${error.message}`);
  }
};

export const createOrder = async (orderData) => {
  try {
    const client = getPrintfulClient();
    const response = await client.post('/orders', orderData);
    return response.data;
  } catch (error) {
    throw new Error(`Printful API Error (Create Order): ${error.response?.data?.error?.message || error.message}`);
  }
};
