import Redis from 'ioredis';

const redis = new Redis();

// Function to store a session in Redis
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
  