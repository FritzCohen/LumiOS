import { useState } from "react";
import { useUser } from "../../Providers/UserProvider";
import Button from "./Button";

interface UserInputProps {
  name: string;
  closePopup: () => void;
  verified: (valid: boolean) => Promise<boolean>;
}

const UserInput: React.FC<UserInputProps> = ({ verified, closePopup }) => {
  const [input, setInput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { currentUser } = useUser();

  const handleConfirm = async () => {
    if (input.length === 0) {
      closePopup();
      return;
    }

    if (currentUser?.password === input) {
      await verified(true);
      closePopup();
    } else {
      setError("Password is incorrect");
      await verified(false);
      setTimeout(() => setError(""), 2000);
    }
  };

  return (
    <div className="w-full h-full">
      <span>Enter your password</span>
      <p>To continue this action.</p>
      <div className="relative my-2 w-full px-5">
        {error && <span className="text-red-500">{error}</span>}
        <input
          type="password"
          onChange={(e) => setInput(e.target.value)}
          className="input-main transition-all duration-300 ease-in-out focus:outline-none focus:border-accent"
          placeholder="Enter your password"
        />
      </div>
      <Button onClick={handleConfirm}>Confirm</Button>
    </div>
  );
};

export default UserInput;