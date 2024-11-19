import React from "react";
import Typography from "../components/TextStyles/Typography";
import Dropdown from "../components/Dropdown/Dropdown";


function Home() {
  return (
    <div className="min-h-screen text-black bg-surface dark:bg-surface-dark dark:text-white">
      {/* Hero section (Wil and Gannett) */}

      {/* How it works section (Riya and Gunnar)*/}

      {/* Frequently asked section (Nina and Analise)*/}
      {/* <Typography textStyle={"display-lg"} color={"primary"}>
        Frequently Asked
      </Typography >
      <Typography textStyle={"title-sm"} color={"onSurface"}>
        How do I create a meeting?
      </Typography>
      <Typography textStyle={"title-sm"} color={"onSurface"}>
        Where do I get a join code?
      </Typography>
      <Typography textStyle={"title-sm"} color={"onSurface"}>
        How many meetings can I make per day?
      </Typography> */} 
      
       <Typography textStyle={"display-lg"} color={"primary"}>
          Frequently Asked
       </Typography>
       <p style = {{ marginBottom: '24px', marginTop: '24px'}}><Dropdown title="How do I create a meeting?" content="Will Answer Later" /></p>
       <div className="custom-divider"></div>
       <p style = {{ marginTop: '24px'}}><Dropdown title="Where do I get a join code?" content="Will Answer Later" /></p>
       <div className="custom-divider"></div>
       <p style = {{ marginTop: '24px'}}><Dropdown title="How many meetings can I make per day?" content="Will Answer Later" /></p>
      
    </div>
  );
}



export default Home;
