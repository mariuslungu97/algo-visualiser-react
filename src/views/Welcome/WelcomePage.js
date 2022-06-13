import React from "react";
import { Link } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";

function WelcomePage() {
  return (
    <Container fluid className="bg-dark h-100">
      <Row className="w-75 h-100 mx-auto">
        <Card className="my-auto mw-100 py-4 px-3" bg="light" text="dark">
          <Card.Title>Algorithm Visualiser</Card.Title>
          <Card.Body className="px-0">
            <div className="d-grid gap-3">
              <Button
                variant="outline-primary"
                size="lg"
                as={Link}
                to="/matchbox"
              >
                Sorting Visualiser
              </Button>
              <Button variant="outline-primary" size="lg" as={Link} to="/maze">
                Path Finding Visualiser
              </Button>
              <Button variant="outline-primary" size="lg" as={Link} to="/graph">
                Graph-related Algos Visualiser
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Row>
    </Container>
  );
}

export default WelcomePage;
