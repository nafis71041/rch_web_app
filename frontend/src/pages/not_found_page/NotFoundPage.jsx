import React from 'react';

const NotFoundPage = () => {
  return (
    <main className="page--notfound">
      <section className="section--notfound">
        <div className="notfound-content">
          <h1 className="notfound-title">404 - Page Not Found</h1>
          <p className="notfound-text">
            The page you’re looking for doesn’t exist or was moved.
          </p>
          <a href="/" className="btn btn--notfound">Go Home</a>
        </div>
      </section>
    </main>
  );
};

export default NotFoundPage;
