exports.handler = async (event) => {
  const { email } = JSON.parse(event.body);
  return {
    statusCode: 200,
    body: JSON.stringify({ approved: true, email })
  };
};