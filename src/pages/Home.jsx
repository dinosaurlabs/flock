import React from "react";
import Typography from "../components/TextStyles/Typography";
import Button from "../components/Button";
import Photo from "../components/Photo";
import calendarPhoto from "../assets/images/home-create.png";
import availablePhoto from "../assets/images/home-availability.png"
import sharePhoto from "../assets/images/home-share.png"

function Home() {
  return (
    <div className="min-h-screen text-black bg-surface dark:bg-surface-dark dark:text-white">
      {/* Hero section (Wil and Gannett) */}

      {/* How it works section (Riya and Gunnar)*/}
      
      <Typography color = "primary" textStyle = "display-lg">Create a Flock</Typography>
      <br></br>
      <Typography color = "secondary" textStyle= "body-lg">Simply select times that work and the dates<br></br>you are trying to meet and we’ll handle the<br></br>rest. It’s really that simple.</Typography>
      <br></br>
      {<Button phrase = "CREATE A FLOCK" />}
      <div style={{marginBottom: "56px"}}></div>
      {<Photo source = {calendarPhoto} alternate = "Calendar"/>}


      <div style={{marginBottom: "72px"}}></div>
      <Typography color = "primary" textStyle = "display-lg">Select Availability</Typography>
      <br></br>
      <Typography color = "secondary" textStyle= "body-lg">Add your availability with the option of<br />importing your google calendar. Don’t worry<br /><i>we don’t collect your information!</i></Typography>
      <br></br>
      {<Button phrase = "Join a Flock" />}
      <div style={{marginBottom: "56px"}}></div>
      {<Photo source = {availablePhoto} alternate = "Availability Selector"/>}


      <div style={{marginBottom: "72px"}}></div>
      <Typography color = "primary" textStyle = "display-lg">Collect and Share</Typography>
      <br></br>
      <Typography color = "secondary" textStyle= "body-lg">View the groups availability and share what<br /> time works best with the group.<br />
      <i>Now go and create your flock!</i></Typography>
      <br></br>
      {<Button phrase = "Create a Flock" />}
      <div style={{marginBottom: "56px"}}></div>
      {<Photo source = {sharePhoto} alternate = "Sharing is Caring"/>}
      
      {/* Frequently asked section (Nina and Analise)*/}
    </div>
  );

}

export default Home;
