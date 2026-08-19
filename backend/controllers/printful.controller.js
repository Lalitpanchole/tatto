import * as printfulService from '../services/printful.service.js';

export const fetchProducts = async (req, res) => {
  try {
    const data = await printfulService.fetchAllProducts();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Fetch Printful Products Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const fetchProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await printfulService.fetchProductById(id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(`Fetch Printful Product ${req.params.id} Error:`, error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPrintfulOrder = async (req, res) => {
  try {
    const { sync_variant_id, recipient, items } = req.body;
    
    // Construct the order data according to Printful API requirements
    // Either items array or single sync_variant_id can be passed for flexibility
    const orderData = {
      recipient,
      items: items || [
        {
          sync_variant_id,
          quantity: 1
        }
      ]
    };

    const data = await printfulService.createOrder(orderData);
    
    // In a real database scenario, you would save data.result.id (Order ID) 
    // and data.result.status to the database here.

    res.status(200).json({ 
      success: true, 
      orderId: data.result.id, 
      trackingInfo: data.result.shipments || null,
      details: data.result
    });
  } catch (error) {
    console.error('Create Printful Order Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
