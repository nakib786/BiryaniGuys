import React from 'react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="container-custom py-20 text-center">
      <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl mb-8">Page Not Found</h2>
      <p className="text-lg mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <a href="/" className="btn btn-primary">
        Go Back Home
      </a>
    </div>
  );
};

export default NotFoundPage; 