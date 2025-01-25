import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import Header from './components/Header';
import Home from './pages/Home';
import ApiKeyCreation from './pages/ApiKeyCreation';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const domain = process.env.REACT_APP_AUTH0_DOMAIN;
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
  const audience = process.env.REACT_APP_AUTH0_AUDIENCE;
  if (!domain || !clientId) {
    return <div>Missing Auth0 configuration. Please check your environment variables.</div>;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      cookieDomain={window.location.hostname}
      cookieOptions={{
        sameSite: "none",
        secure: true
      }}
    >
      <Router>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/api-key-creation" 
              element={<ProtectedRoute component={ApiKeyCreation} />} 
            />
          </Routes>
        </div>
      </Router>
    </Auth0Provider>
  );
}

export default App;

