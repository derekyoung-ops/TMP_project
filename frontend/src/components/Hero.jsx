import { Container, Card, Button } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

const Hero = () => {
    return (
        <div className="py-5">
            <Container className="d-flex justify-content-center">
                <Card className="p-5 d-flex flex-column align-items-center hero-card bg-light w-75">
                    <h1 className="mb-4">Welcome to Euguen_Team</h1>
                    <p className="mb-4 text-center">
                        Manage your team projects efficiently with Euguen_Team.
                        Collaborate, track progress, and achieve your goals together.
                    </p>
                    <div className="d-flex">
                        <LinkContainer to='/login'>
                            <Button variant="primary" className="me-3">Get Started</Button>
                        </LinkContainer>
                        <LinkContainer to='/about'>
                            <Button variant="outline-secondary" size="ms">Learn More</Button>
                        </LinkContainer>
                    </div>
                </Card>
            </Container>
        </div>
    );
};

export default Hero;