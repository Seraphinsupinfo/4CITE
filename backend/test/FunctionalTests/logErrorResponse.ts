export const logErrorResponse = async (req) => {
  try {
    return await req;
  } catch (error) {
    console.log('Test failed with error:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Body:', error.response.body);
    } else {
      console.log(error);
    }
    throw error;
  }
};