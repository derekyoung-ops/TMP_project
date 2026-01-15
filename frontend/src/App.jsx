import { Container } from 'react-bootstrap'
import Header from './components/Header'
import { Outlet, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  const isForgotPasswordPage = location.pathname === '/forgot-password';
  const isHomePage = location.pathname === '/';
  const hideHeader = isLoginPage || isRegisterPage || isForgotPasswordPage;

  return (
    <>
      {!hideHeader && <Header />}
      <ToastContainer />
      {hideHeader || isHomePage ? (
        <Outlet />
      ) : (
        <Container className="my-2">
          <Outlet />
        </Container>
      )}
    </>
  )
}

export default App
