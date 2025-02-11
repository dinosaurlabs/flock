import React, { useState } from "react";
import Button from "../components/Button/Button";

const CreateFlock = () => {
  //TODO: YOU WILL HAVE TO DELETE MY SHITTY CODE AND WRITE YOUR OWN
  const [flockName, setFlockName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ flockName });
  };

  return (
    <div className="flex flex-col gap-24 px-6 text-black pb-28 pt-28 bg-surface dark:bg-surface-dark dark:text-white">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Flock Name */}
        <div className="flex flex-col gap-3">
          <label className="font-sans text-base">Flock Name:</label>
          <input
            type="text"
            placeholder="Flock Name"
            value={flockName}
            onChange={(e) => setFlockName(e.target.value)}
            className="w-full p-2 font-sans border rounded-md bg-surfaceContainer dark:bg-surfaceContainer-dark border-border dark:border-border-dark"
          />
        </div>

        {/* Submit */}
        <Button type="submit" text="Create Your Flock" />
      </form>
    </div>
  );
};

export default CreateFlock;
