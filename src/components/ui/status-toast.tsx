import { useState, forwardRef, useImperativeHandle } from "react";
import Toast from "@/components/ui/toast";

type StatusToastProps = {};

export type StatusToastRef = {
  triggerToast: (asyncFunction: () => Promise<void>) => void;
};
export type SimpleToastRef = {
  triggerSimpleToast: (message: string, toastType: "success" | "error") => void;
};

const StatusToast = forwardRef((props: StatusToastProps, ref) => {
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");

  const handleButtonClick = async (asyncFunction: () => Promise<void>) => {
    try {
      // Perform your asynchronous operation here
      await asyncFunction();

      // Show a success toast
      setShowToast(true);
      setToastType("success");
      setToastMessage("Success.");
    } catch (error) {
      // Show an error toast
      setToastType("error");
      setShowToast(true);
      // Type assertion to specify the expected error type
      if (error instanceof Error) {
        setToastMessage(error.message);
        console.error(error);
      } else {
        // Handle other types of errors
        console.error("Unexpected error:", error);
      }
    }
  };

  const handleSimplePopup = (
    message: string,
    toastType: "success" | "error"
  ): void => {
    // Show a success toast
    setShowToast(true);
    setToastType(toastType);
    setToastMessage(message);
  };

  // Expose handleButtonClick to the parent component through ref
  useImperativeHandle(ref, () => ({
    triggerToast: (asyncFunction: () => Promise<void>) =>
      handleButtonClick(asyncFunction),
    triggerSimpleToast: (message: string, toastType: "success" | "error") => {
      handleSimplePopup(message, toastType);
    },
  }));

  return (
    <div>
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
});

export default StatusToast;
