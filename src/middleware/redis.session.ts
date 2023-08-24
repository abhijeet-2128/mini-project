import Redis from 'ioredis';

const redis = new Redis();

// Function to store a session in Redis
export const addToCartSession = async (customerId: string, productId: string, quantity: number, price: number) => {
  try {
    // Fetch the existing cart session data from Redis
    const existingSessionDataJSON = await redis.get(`session:${customerId}`);
    const existingSessionData = existingSessionDataJSON ? JSON.parse(existingSessionDataJSON) : {};

    // Update the cart session data with the new item
    if (!existingSessionData.cart) {
      existingSessionData.cart = {};
    }
    if (!existingSessionData.cart[productId]) {
      existingSessionData.cart[productId] = { quantity, price };
    } else {
      existingSessionData.cart[productId].quantity += quantity;
      existingSessionData.cart[productId].price += price;
    }

    // Store the updated session data in Redis
    await createSessionInRedis(customerId, existingSessionData);
  } catch (error) {
    console.error('Error adding items to cart session:', error);
  }
};
export const createSessionInRedis = async (customerId: string, sessionData: any) => {
    try {
      // Convert sessionData to a JSON string before storing it in Redis
      const sessionDataJSON = JSON.stringify(sessionData);

      // Store the session data in Redis with a specific key
      await redis.set(`session:${customerId}`, sessionDataJSON);
    } catch (error) {
      console.error('Error storing session in Redis:', error);
    }
  };
  
  // Function to mark session as inactive in Redis
  export const markSessionAsInactiveInRedis = async (customerId: string) => {
    try {
      await redis.del(`session:${customerId}`);
    } catch (error) {
      console.error('Error marking session as inactive in Redis:', error);
    }
  };
  