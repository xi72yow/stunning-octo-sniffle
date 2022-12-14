import {
  ActionIcon,
  AppShell,
  Button,
  ColorPicker,
  Group,
  Modal,
} from "@mantine/core";
import { IconColorPicker, IconPalette, IconTrash } from "@tabler/icons";
import React, { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { DropzoneButton } from "../dropzone";
import StripeCreatorToolbar from ".//stripeCreatorToolbar";
import { useHotkeys } from "@mantine/hooks";
import { prepare } from "@react-three/fiber/dist/declarations/src/core/renderer";
import { showNotification } from "@mantine/notifications";
import { reScale } from "screenchaser-core";

interface BaseStripeInputProps {
  form: any;
  path: string;
  defaultValue: any;
  singleFrame?: boolean;
}

function LED(props) {
  const mesh = useRef();
  const [color, setColor] = useState(props.defaultColor);

  useEffect(() => {
    props.setFrames((prev) => {
      prev[props.activeFrame - 1][props.index] = color;
      return prev;
    });
  }, [color]);

  useEffect(() => {
    setColor(props.frames[props.activeFrame - 1][props.index]);
  }, [props.changeColor]);

  const [hovered, setHover] = useState(false);
  // Subscribe this component to the render-loop, rotate the mesh every frame
  //useFrame((state, delta) => (mesh.current.rotation.x += 0.01));
  // Return view, these are regular three.js elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={mesh}
      position={props.position}
      scale={hovered ? 1.2 : 1}
      onClick={
        (e) => {
          setColor(props.color);
        } /* props.color */
      }
      onPointerOver={(e) => {
        if (e.ctrlKey) {
          setColor(props.color);
        }
        setHover(true);
      }}
      onPointerOut={(event) => setHover(false)}
    >
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial color={hovered ? props.color : color} />
    </mesh>
  );
}

//test hexcolor string
function isHexColor(str) {
  return str.match(/^#[0-9A-F]{6}$/i) !== null;
}

function prepareStripe(defaultValue, neoPixelCount) {
  let preparedStripe = [...defaultValue];
  const reScaledStripe = reScale(preparedStripe, neoPixelCount, false);
  if (reScaledStripe.length > 0)
    return reScale(preparedStripe, neoPixelCount, false);
  else return preparedStripe;
}

export default function StripeCreator({
  form,
  path,
  defaultValue,
  singleFrame = true,
}: BaseStripeInputProps) {
  const [activeFrame, setActiveFrame] = useState(1);
  const [frames, setFrames] = useState(
    defaultValue.map((frame) => {
      return prepareStripe(frame, form.values.device.neoPixelCount);
    })
  );

  useEffect(() => {
    setFrames(
      defaultValue.map((frame) => {
        return prepareStripe(frame, form.values.device.neoPixelCount);
      })
    );
  }, [defaultValue]);

  useEffect(() => {
    setFrames((prev) => {
      return prev.map((frame, index) => {
        return prepareStripe(frame, form.values.device.neoPixelCount);
      });
    });
    setChangeColorEvent((prev) => !prev);
    handleSave();
  }, [form.values.device.neoPixelCount]);

  useEffect(() => {
    setChangeColorEvent((prev) => !prev);
  }, [activeFrame]);

  const [open, setOpen] = useState(false);
  const [color, setColor] = useState("#9B03FF");
  const [changeColorEvent, setChangeColorEvent] = useState(false);

  const [swatches, setSwatches] = useState(form.values.globals.swatches);

  useEffect(() => {
    form.setFieldValue("globals.swatches", swatches);
  }, [swatches]);

  const [cameraPosX, setCameraPosX] = useState(0);
  const [cameraPosZ, setCameraPosZ] = useState(5);

  useHotkeys([
    ["A", () => setCameraPosX(cameraPosX + 1)],
    ["D", () => setCameraPosX(cameraPosX - 1)],
    ["W", () => cameraPosZ > 4 && setCameraPosZ(cameraPosZ - 1)],
    ["S", () => cameraPosZ < 30 && setCameraPosZ(cameraPosZ + 1)],
    [
      "Q",
      () => !singleFrame && activeFrame > 1 && setActiveFrame(activeFrame - 1),
    ],
    [
      "E",
      () =>
        !singleFrame &&
        activeFrame < frames.length &&
        setActiveFrame(activeFrame + 1),
    ],
    /*  ["ctrl+S", () => handleSave()], */
  ]);

  function handleClose() {
    setOpen(false);
  }

  function handleSave() {
    if (singleFrame) form.setFieldValue(path, frames[activeFrame - 1]);
    else form.setFieldValue(path, frames);
    /*     showNotification({
      title: "Stripe Creator Notification",
      message: "Your work has been saved!",
      color: "teal",
      icon: <IconPalette />,
    }); */
  }

  return (
    <React.Fragment>
      <Modal
        centered
        size={"xl"}
        opened={open}
        onClose={() => {
          handleSave();
          handleClose();
        }}
        title="Stripe Creator"
      >
        <Group
          position="center"
          sx={{
            border: "1px solid lightgrey",
            borderRadius: "1rem",
            height: 80,
          }}
        >
          <Canvas frameloop="demand">
            {/* @ts-ignore */}
            <PerspectiveCamera
              makeDefault
              position={[cameraPosX, 0, cameraPosZ]}
            />
            <ambientLight intensity={0.5} color={"#ffffff"} />
            <directionalLight color="red" position={[0, 0, 5]} />
            {frames[activeFrame - 1].map((defaultColor, i) => (
              <LED
                key={i + form.values.device.neoPixelCount + "led"}
                index={i}
                changeColor={changeColorEvent}
                position={[i * 1.2, 0, 0]}
                color={color}
                defaultColor={defaultColor}
                activeFrame={activeFrame}
                frames={frames}
                setFrames={setFrames}
              />
            ))}
          </Canvas>
        </Group>
        <StripeCreatorToolbar
          path={path}
          form={form}
          swatches={swatches}
          setSwatches={setSwatches}
          color={color}
          setColor={setColor}
          setChangeColorEvent={setChangeColorEvent}
          setActiveFrame={setActiveFrame}
          activeFrame={activeFrame}
          frames={frames}
          setFrames={setFrames}
          singleFrame={singleFrame}
        ></StripeCreatorToolbar>
      </Modal>
      <ActionIcon
        onClick={() => {
          setOpen(true);
        }}
      >
        <IconPalette size={18} stroke={1.5} />
      </ActionIcon>
    </React.Fragment>
  );
}
