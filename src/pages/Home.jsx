import React from "react";
import Typography from "../components/TextStyles/Typography";
import Dropdown from "../components/Dropdown/Dropdown";


function Home() {
  return (
    <div className="min-h-screen text-black bg-surface dark:bg-surface-dark dark:text-white">
      {/* Hero section (Wil and Gannett) */}

      {/* How it works section (Riya and Gunnar)*/}

      {/* Frequently asked section (Nina and Analise)*/}
      <div className="whole-page">
       <Typography textStyle={"display-lg"} color={"primary"}>
          <div className="mr-24 ml-24 mt-5 mb-5">Frequently Asked</div>
       </Typography>
       <p><Dropdown title="How do I create a meeting?" content="Will Answer Later" /></p>
       <div className="custom-divider"></div>
       <p><Dropdown title="Where do I get a join code?" content="Will Answer Later" /></p>
       <div className="custom-divider"></div>
       <p><Dropdown title="How many meetings can I make per day?" content="Will Answer Later" /></p>
      </div>
    </div>
  );
}



export default Home;
