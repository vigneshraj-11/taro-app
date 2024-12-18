import React from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

const OnScreenKeyboard = ({
  input,
  onChange,
  onKeyPress,
  isVisible,
  inputWidth,
  position,
}) => {
  if (!isVisible) return null;

  return (
    <div
      className="onscreen-keyboard"
      style={{
        position: "absolute",
        top: position.y,
        left: position.x,
        width: inputWidth,
        zIndex: 1000,
        background: "#f0f0f0",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        padding: "10px",
        overflow: "hidden",
      }}
    >
      <Keyboard
        onChange={onChange}
        onKeyPress={onKeyPress}
        layout={{
          default: [
            "1 2 3 4 5 6 7 8 9 0",
            "q w e r t y u i o p",
            "a s d f g h j k l {bksp}",
            "z x c v b n m {enter}",
          ],
        }}
        display={{
          "{bksp}": "⌫",
          "{enter}": "Enter",
        }}
        theme="hg-theme-default"
        keyboardRef={(r) => (window.keyboard = r)}
      />
    </div>
  );
};

export default OnScreenKeyboard;
