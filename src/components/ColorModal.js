import React, { useCallback } from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

function ColorModal({
  title,
  colors,
  colorLabels,
  colorIds,
  showModal,
  handleClose,
  setColor,
}) {
  const onColorChange = useCallback(
    (e) => {
      const { id, value } = e.target;
      setColor(id, value);
    },
    [setColor]
  );

  const colorDivs = colors.map((color, idx) => (
    <Form.Group className="mb-3" key={colorIds[idx]}>
      <Row>
        <Col>
          <Form.Label htmlFor={colorIds[idx]}>{colorLabels[idx]}</Form.Label>
        </Col>
        <Col>
          <Form.Control
            type="color"
            id={colorIds[idx]}
            defaultValue={color}
            title="Choose your color"
            onChange={onColorChange}
          />
        </Col>
      </Row>
    </Form.Group>
  ));

  return (
    <Modal show={showModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>{colorDivs}</Form>
      </Modal.Body>
    </Modal>
  );
}

export default ColorModal;
