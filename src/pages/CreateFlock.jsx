import React, { useState } from "react";
import Button from "../components/Button/Button";
import Dropdown from "../components/Dropdown/Dropdown";

const CreateFlock = () => {
  //TODO: YOU WILL HAVE TO DELETE MY SHITTY CODE AND WRITE YOUR OWN
  const [flockName, setFlockName] = useState("");
  const [allowAnonymous, setAllowAnonymous] = useState(false);
  const [hourAvailability, setHourAvailability] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  
  const handleSubmitFlockName = (e) => {
    e.preventDefault();
    console.log({ flockName, startTime, endTime, allowAnonymous, hourAvailability });
  }; 
  return (
    <div className="w-full min-h-screen flex gap-24 px-6 text-black pb-28 pt-28 bg-surface dark:bg-surface-dark dark:text-white">
      <form onSubmit={handleSubmitFlockName} className="space-y-4">
        {/* Flock Name */}
        <div className="flex:1 flex-col gap-3">
          <label className="font-sans text-base">Flock Name:</label>
          <input
            type="text"
            placeholder="Flock Name"
            value={flockName}
            onChange={(e) => setFlockName(e.target.value)}
            className="w-full p-2 font-sans border rounded-md bg-surfaceContainer dark:bg-surfaceContainer-dark border-border dark:border-border-dark"
          />
          {/*Allow Anonymous Attendees*/}
          <div className="flex gap-3">
                  <label className="flex gap-3 text-secondary">
                    <input type="checkbox" 
                    checked={allowAnonymous}
                    onChange={() => setAllowAnonymous(!allowAnonymous)}
                    className="p-2 font-sans border rounded-md bg-surfaceContainer dark:bg-surfaceContainer-dark border-border dark:border-border-dark w-5 h-5"
                    />
                    Allow anonymous attendees
                  </label>
                </div>
        </div>
        {/* Submit */}
        <Button type="submit" text="Create Your Flock" />
      </form>

      <div>
        <form>
          {/*Times that Work*/}
          <div className="flex:1 flex-col gap-3">
            <label className="font-sans text-base">Times that work:</label>
              <div className="flex gap-3">
                <select 
                  name="Start Time"
                  className="w-full p-2 font-sans border rounded-md bg-surfaceContainer dark:bg-surfaceContainer-dark border-border dark:border-border-dark"
                >
                  <option value="" selected disabled>Start Time</option>
                  <option value="Option 1">This is an option</option>
                </select>
                <select 
                  name="End Time"
                  className="w-full p-2 font-sans border rounded-md bg-surfaceContainer dark:bg-surfaceContainer-dark border-border dark:border-border-dark"
                >
                  <option value="" selected disabled>End Time</option>
                  <option value="Option 1">This is an option</option>
                </select>
              </div>
                {/*24 hour availability*/}
                <div className="flex gap-3">
                  <label className="flex gap-3 text-secondary">
                    <input type="checkbox" 
                    checked={hourAvailability}
                    onChange={() => setHourAvailability(!hourAvailability)}
                    className="p-2 font-sans border:rounded-full bg-surfaceContainer dark:bg-surfaceContainer-dark border-border dark:border-border-dark w-5 h-5"
                    />
                    24 Hour Availability
                  </label>
                </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFlock;
