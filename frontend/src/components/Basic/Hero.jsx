import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import "./Hero.css";

const Hero = () => {
  return (
    <div className="hero-section w-100">
      {/* <div className="hero-overlay" /> */}
      <div className="main_page">
        <Row>
          <Col lg={2} md={2}></Col>
          <Col lg={8} md={8}>
            <Row>
              <h1 className="team-spirit mb-3">Build Better Our Teams </h1>
            </Row>
            <p className="mb-4">
              Eugene provides all the features needed to plan, execute, and review modern work. <br />Strengthen team cohesion with clear goals, transparent priorities, and a focus on continuous improvement.
            </p>
            <Row className="mb-4">
              <Col xs={12} className="mb-3">
                <h2 className="team-strategy mb-3">Our strategy</h2>
                <Row>
                  <Col>
                    <Card className="strategy-card clarity-card">
                      <Card.Header>Clarity</Card.Header>
                      <Card.Body>
                        <Card.Text>
                          Everyone knows what matters this week, this sprint, and this quarter.
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col>
                    <Card className="strategy-card ownership-card">
                      <Card.Header>Ownership</Card.Header>
                      <Card.Body>
                        <Card.Text>
                          Tasks are clearly assigned, with progress visible to the whole team.
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col>
                    <Card className="strategy-card rhythm-card">
                      <Card.Header>Rhythm</Card.Header>
                      <Card.Body>
                        <Card.Text>
                          Stand-ups, reviews, and retrospectives built into your everyday workflow.
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
          <Col lg={2} md={2}></Col>
        </Row>
        <Row>
          <Col md={2}></Col>
          <Col md={8}>
            <Card className="shadow-md border-0 hero-card-glass">
              <Card.Header>
                <h2 className="team-role mb-3">How Euguen Supports Team Members </h2>
              </Card.Header>
              <Card.Body>
                <ul className="mb-3 text-muted middle ps-3">
                  <li>Track projects, tasks, and ownership in a single view.</li>
                  <li>Use team dashboards to surface risks and bottlenecks.</li>
                  <li>Keep discussions, decisions, and documents together.</li>
                  <li>Celebrate milestones and recognize great work.</li>
                </ul>
              </Card.Body>
              <Card.Footer>
                <p className="mb-0 text-muted middle">
                  <span className="pointer-icon">👉</span> Start on this page any time:{" "}
                  <span className="click-text">Click</span> the{" "}
                  <span className="logo-highlight">Euguen logo</span> in the header or auth
                  screens to return to your team overview.
                </p>
              </Card.Footer>
            </Card>
          </Col>
          <Col md={2}></Col>
        </Row>
      </div>
    </div>
  );
};

export default Hero;