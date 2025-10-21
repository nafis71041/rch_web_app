import React from 'react';

const NotFoundPage = () => {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f6f8fa'
  };

  return (
      <div style={containerStyle}>
        <h2>404 - Page Not Found</h2>
        <p>The page you’re looking for doesn’t exist or was moved.</p>
      </div>
  );
};

export default NotFoundPage;