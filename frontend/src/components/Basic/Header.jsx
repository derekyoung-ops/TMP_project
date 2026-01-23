import { Navbar, Nav, Container, Dropdown, Image, Badge, Button } from 'react-bootstrap';
import { FaBell, FaQuestionCircle, FaThLarge } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import { useLogoutMutation } from '../../slices/member/usersApiSlice';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../slices/member/authSlice';
import { BiLogIn } from "react-icons/bi";
import './Hero.css';

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Navbar 
        variant="dark" 
        expand="lg" 
        className="w-100"
        style={{ backgroundColor: '##92b9f3'}}
    >
      <Container fluid>
        <LinkContainer to="/">
          <Navbar.Brand className="d-flex align-items-center">
            <img 
              src="/final.png" 
              alt="logo" 
              height="40" 
              className="me-2" 
            />
          </Navbar.Brand>
        </LinkContainer>

        <Nav className="ms-auto align-items-center gap-3">
          {userInfo ? (
            <>
              <FaThLarge size={18} className="text-dark" />
              <FaBell size={18} className="text-dark" />
              <FaQuestionCircle size={18} className="text-dark" />

              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="dark"
                  className="primary p-0 border-0 d-flex align-items-center"
                  style={{ backgroundColor: 'transparent' }}
                >
                  <Image
                    src={userInfo.avatar || 'https://ui-avatars.com/api/?name=' + userInfo.name}
                    roundedCircle
                    height={32}
                    width={32}
                  />
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow-lg p-2" style={{ minWidth: 260 }}>
                  <h1 className="fs-5 px-2 pt-2">ACCOUNT</h1>
                  <div className="d-flex px-3 py-2 border-bottom">
                    <div className='d-flex px-2 py-1'>
                       <Image
                        src={userInfo.avatar || 'https://ui-avatars.com/api/?name=' + userInfo.name}
                        roundedCircle
                        height={42}
                        width={42}
                    /> 
                    </div>
                    <div>
                        <strong>{userInfo.name}</strong>
                        <div className="text-muted small">{userInfo.email}</div>
                    </div>
                  </div>

                  <Dropdown.Item onClick={() => navigate('/profile')}>Manage account</Dropdown.Item>

                  <Dropdown.Divider />
                  <Dropdown.Item>Profile and visibility</Dropdown.Item>
                  <Dropdown.Item>Activity</Dropdown.Item>
                  <Dropdown.Item>Cards</Dropdown.Item>
                  <Dropdown.Item>Settings</Dropdown.Item>
                  <Dropdown.Item>Theme</Dropdown.Item>

                  <Dropdown.Divider />
                  <Dropdown.Item>Create Workspace</Dropdown.Item>

                  <Dropdown.Divider />
                  <Dropdown.Item>Help</Dropdown.Item>
                  <Dropdown.Item>Shortcuts</Dropdown.Item>

                  <Dropdown.Divider />
                  <Dropdown.Item onClick={logoutHandler} className="text-danger">
                    Log out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </>
          ) : (
            <>
              <LinkContainer to='/login'>
                <Button className='login-btn'>
                  <BiLogIn className='me-1'/>
                  Login
                </Button>
              </LinkContainer>
            </>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;
