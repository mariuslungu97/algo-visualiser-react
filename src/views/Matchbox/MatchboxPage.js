import React, { useState, useEffect, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faCog,
  faStepBackward,
  faStepForward,
  faRedoAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

import { bubbleSort, insertionSort, quickSort, mergeSort } from "../../sorting";
import useStoredState from "../../hooks/useStoredState";

import useWindowDimensions from "../../hooks/useWindowDimensions";

import Canvas from "../../components/Canvas";
import ColorModal from "../../components/ColorModal";
import Matchbox from "../../Matchbox";

import Container from "react-bootstrap/Container";
import Dropdown from "react-bootstrap/Dropdown";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const delayBy = (timeout) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });

const matchboxColors = {
  highlighted: "#563d7c",
  compared: "#e8ff38",
  swapped: "#00d900",
  base: "#a300b5",
  key: "#ed0000",
};

const availableSortingAlgorithms = ["bubble", "insertion", "merge", "quick"];
const matchSizes = ["s", "m", "l"];

const defaultSortingAlgorithm = availableSortingAlgorithms[0];
const defaultAnimationSpeed = 3;
const defaultMatchSize = matchSizes[1];
const defaultColors = matchboxColors;

function MatchboxPage() {
  const [canvasEl, setCanvasEl] = useState(null);
  // visualisation and matchbox params
  const [colors, setColors] = useStoredState(defaultColors, "colors");
  const [animationSpeed, setAnimationSpeed] = useStoredState(
    defaultAnimationSpeed,
    "animationSpeed"
  );
  const [matchSize, setMatchSize] = useStoredState(
    defaultMatchSize,
    "matchSize"
  );
  const [sortingAlgo, setSortingAlgo] = useStoredState(
    defaultSortingAlgorithm,
    "sortingAlgo"
  );
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);
  const [visualisationStep, setVisualisationStep] = useState(0);
  // modals
  const [showColorModal, setShowColorModal] = useState(false);
  const [showMatchsizeModal, setShowMatchsizeModal] = useState(false);
  // nav and window size used to calculate canvas size
  const navbarRef = useRef(null);
  const windowDimensions = useWindowDimensions();
  const [canvasDimensions, setCanvasDimensions] = useState(null);
  // matchbox class instance
  const [matchBox, setMatchBox] = useState(null);

  const handleMatchsizeModal = (show) => setShowMatchsizeModal(show);
  const handleColorModal = (show) => setShowColorModal(show);
  const handleColorChange = (id, newColor) =>
    setColors((prevColors) => {
      return {
        ...prevColors,
        [id]: newColor,
      };
    });
  const incrementVisualisationStep = () =>
    setVisualisationStep((vStep) => vStep + 1);

  const onCanvasMouseMove = useCallback(
    (e) => {
      const { offsetX, offsetY } = e;
      const matchesIds = matchBox.getMatchIds();
      const matchesPositions = matchBox.getMatchPositions();

      for (let i = 0; i < matchesPositions.length; i++) {
        const matchBoundingRect = matchesPositions[i];
        const { top, left, bottom, right } = matchBoundingRect;
        if (
          offsetX >= left &&
          offsetX <= right &&
          offsetY >= top &&
          offsetY <= bottom
        ) {
          // console.log(matchesIds[i]);
        }
      }
    },
    [matchBox]
  );

  // calculate canvas dimensions
  useEffect(() => {
    if (!isAnimationPlaying) {
      const { width: windowWidth, height: windowHeight } = windowDimensions;
      const { height: navbarHeight } =
        navbarRef.current.getBoundingClientRect();
      const [newCanvasWidth, newCanvasHeight] = [
        windowWidth,
        windowHeight - navbarHeight,
      ];
      if (
        canvasDimensions?.width !== newCanvasWidth ||
        canvasDimensions?.height !== newCanvasHeight
      ) {
        setCanvasDimensions({
          width: newCanvasWidth,
          height: newCanvasHeight,
        });
      }
    }
  }, [windowDimensions, isAnimationPlaying, canvasDimensions]);

  // init matchbox class instance
  useEffect(() => {
    if (canvasDimensions) {
      const mBox = new Matchbox(
        canvasDimensions.width,
        canvasDimensions.height,
        matchSize,
        matchboxColors["base"]
      );
      setMatchBox(mBox);
      setVisualisationStep(0);
    }
  }, [canvasDimensions, matchSize]);

  // set new base color for matches
  useEffect(() => {
    if (matchBox && matchBox.getBaseColor() !== colors["base"])
      matchBox.setBaseColor(colors["base"]);
  }, [colors, matchBox]);

  useEffect(() => {
    if (canvasDimensions) {
      const canvasEl = (
        <Canvas
          width={canvasDimensions.width}
          height={canvasDimensions.height}
          drawable={matchBox}
          eventHandlers={[["mousemove", onCanvasMouseMove]]}
        />
      );
      setCanvasEl(canvasEl);
    }
  }, [canvasDimensions, matchBox, onCanvasMouseMove]);

  const visualiseAlgo = async (
    type,
    matchBox,
    vStep,
    incrementVStep,
    colors,
    animationSpeed
  ) => {
    const matchValues = matchBox.getMatchValues();
    const matchIds = matchBox.getMatchIds();
    let visualisationSteps = [];

    if (type === "bubble")
      visualisationSteps = bubbleSort(matchValues, matchIds);
    else if (type === "insertion")
      visualisationSteps = insertionSort(matchValues, matchIds);
    else if (type === "quick")
      quickSort(
        matchValues,
        matchIds,
        visualisationSteps,
        0,
        matchValues.length - 1
      );
    else if (type === "merge")
      mergeSort(
        matchValues,
        matchIds,
        visualisationSteps,
        0,
        matchValues.length
      );
    else return;

    visualisationSteps = visualisationSteps.slice(vStep);
    try {
      for (const step of visualisationSteps) {
        const { highlighted, compared, swapped, merged } = step;
        const baseIds = matchIds.filter(
          (id) => highlighted.findIndex((hId) => hId === id) === -1
        );
        const highlightStylingPromises = highlighted.map((id) =>
          matchBox.styleMatch(id, colors["highlighted"], 1)
        );
        const baseStylingPromises = baseIds.map((id) =>
          matchBox.styleMatch(id, colors["base"], 0.65)
        );
        await Promise.all(highlightStylingPromises);
        await Promise.all(baseStylingPromises);
        const comparedStylingPromises = compared.map((id) =>
          matchBox.styleMatch(id, colors["compared"], 1)
        );
        await Promise.all(comparedStylingPromises);
        await delayBy(2500 / animationSpeed);
        // bubble and insertion sort
        if (swapped) {
          await matchBox.animateSwap(
            compared[0],
            compared[1],
            colors["swapped"],
            animationSpeed
          );
        }
        if (merged && compared) {
          // merge sort
          const oldPositions = {};
          compared.forEach((cId) => {
            const oldMatch = matchBox.getMatch(cId);
            if (!oldPositions.hasOwnProperty(cId))
              oldPositions[cId] = [oldMatch.getPosX(), oldMatch.getPosY()];
          });

          for (let i = 0; i < merged.length; i++) {
            const mergedMatch = matchBox.getMatch(merged[i]);
            mergedMatch.setPosX(oldPositions[compared[i]][0]);
            mergedMatch.setPosY(oldPositions[compared[i]][1]);
          }
        }
        incrementVStep();
      }
      const baseStylingPromises = matchIds.map((id) =>
        matchBox.styleMatch(id, colors["base"], 0.65)
      );
      await Promise.all(baseStylingPromises);
      return true;
    } catch (e) {
      console.log(e);
      throw e;
    }
  };

  const playPauseHandler = async (e) => {
    e.preventDefault();
    let vStep = visualisationStep;

    if (!isAnimationPlaying) {
      // play animation
      setIsAnimationPlaying(true);

      if (matchBox.hasSchedulers()) {
        await matchBox.initPastSchedulers();
        vStep++;
        incrementVisualisationStep();
      }

      await visualiseAlgo(
        sortingAlgo,
        matchBox,
        vStep,
        incrementVisualisationStep,
        colors,
        animationSpeed
      );

      setIsAnimationPlaying(false);
    } else {
      matchBox.clearMatchSchedulers();
      setIsAnimationPlaying(false);
    }
  };

  const resetHandler = (e) => {
    e.preventDefault();
    const mBox = new Matchbox(
      canvasDimensions.width,
      canvasDimensions.height,
      matchSize,
      colors["base"]
    );
    setMatchBox(mBox);
    setIsAnimationPlaying(false);
    setVisualisationStep(0);
  };

  return (
    <Container fluid>
      <Modal
        show={showMatchsizeModal}
        onHide={() => handleMatchsizeModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Match Size</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {matchSizes.map((mSize, idx) => {
            let label, checked;
            if (mSize === "s") label = "Small Match";
            else if (mSize === "m") label = "Medium Match";
            else if (mSize === "l") label = "Large Match";

            checked = matchSize === mSize ? true : false;
            return (
              <Form.Check
                key={idx}
                value={mSize}
                label={label}
                type="radio"
                checked={checked}
                onChange={(e) => setMatchSize(e.target.value)}
              />
            );
          })}
        </Modal.Body>
      </Modal>
      <ColorModal
        title="Matchbox Colors"
        colors={Object.entries(colors).map((entry) => entry[1])}
        colorLabels={Object.entries(colors).map(
          (entry) =>
            `${capitalizeFirstLetter(entry[0])} Match ${
              entry[0] === "key" ? "(Insertion Sort)" : ""
            }`
        )}
        colorIds={Object.entries(colors).map((entry) => entry[0])}
        showModal={showColorModal}
        handleClose={() => handleColorModal(false)}
        setColor={handleColorChange}
      />
      <Row>
        <Navbar ref={navbarRef} bg="dark" variant="dark" className="py-3">
          <Container fluid>
            <Navbar.Brand>Sorting Visualiser</Navbar.Brand>
            {/*Control Panel Inputs*/}
            <Row style={{ width: "30%" }}>
              <Col md={12} lg={6} className="my-auto p-2">
                <Form.Select
                  size="sm"
                  value={sortingAlgo}
                  onChange={(e) => setSortingAlgo(e.target.value)}
                >
                  {availableSortingAlgorithms.map((sAlgo, idx) => (
                    <option value={sAlgo} key={idx}>
                      {`${capitalizeFirstLetter(sAlgo)} Sort`}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={12} lg={6} className="my-auto p-2">
                <Form.Label className="d-inline text-light">
                  Animation Speed
                </Form.Label>
                <Form.Range
                  min={1}
                  max={10}
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(e.target.value)}
                  className="d-inline-block"
                />
              </Col>
            </Row>
            {/*Control Panel Buttons (Play, Pause, Step Backwards...)*/}
            <Row>
              <Col>
                <Button size="sm" variant="secondary">
                  <FontAwesomeIcon icon={faStepBackward} />
                </Button>
              </Col>
              <Col>
                <Button size="sm" variant="success" onClick={playPauseHandler}>
                  <FontAwesomeIcon
                    icon={isAnimationPlaying ? faPause : faPlay}
                  />
                </Button>
              </Col>
              <Col>
                <Button size="sm" variant="secondary">
                  <FontAwesomeIcon icon={faStepForward} />
                </Button>
              </Col>
              <Col className="mx-3">
                <Button size="sm" variant="secondary" onClick={resetHandler}>
                  <FontAwesomeIcon icon={faRedoAlt} />
                </Button>
              </Col>
            </Row>
            {/*Control Panel Reset Button*/}
            <Dropdown align="end">
              <Dropdown.Toggle
                id="more-settings-dropdown"
                variant="outline-light"
              >
                <FontAwesomeIcon icon={faCog} />
              </Dropdown.Toggle>
              <Dropdown.Menu variant="dark">
                <Dropdown.Item onClick={() => handleColorModal(true)}>
                  Highlight Colors
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleMatchsizeModal(true)}>
                  Match Size
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/">
                  Back To Menu
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Container>
        </Navbar>
      </Row>
      <Row>{canvasEl}</Row>
    </Container>
  );
}

export default MatchboxPage;
