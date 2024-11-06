import React, { useState, useEffect } from "react";

type ToastProps = {
  message: string;
  type: "error" | "success";
  duration?: number;
  onClose?: () => void;
};

const Toast: React.FC<ToastProps> = (props: ToastProps) => {
  const { message, type = "success", duration = 3000, onClose } = props;
  const [show, setShow] = useState(true);

  useEffect(() => {
    // After the duration of showing the toast, change the local showing state to false.
    setTimeout(() => {
      setShow(false);
    }, duration);

    // After allowing the animation to play, also change the caller's show toast state to false, effectively destroying the toast
    setTimeout(() => {
      onClose ? onClose() : "";
    }, duration + 1000);

    return;
  }, [duration]);

  return (
    <div
      className={`fixed top-5 right-5 ${
        type === "success" ? "bg-green-500" : "bg-red-800"
      } text-white px-4 py-2 rounded-md shadow-md ${
        show ? "opacity-100" : "opacity-0"
      }`}
      style={{ transition: "opacity 0.3s ease-in-out" }}
    >
      {message}
    </div>
  );
};

export default Toast;
